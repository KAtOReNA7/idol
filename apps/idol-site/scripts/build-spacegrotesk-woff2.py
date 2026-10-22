#!/usr/bin/env python3
"""Build/check full Space Grotesk WOFF2 without subsetting.
Reproducible toolchain: fontTools 4.61.1 and Node 24.19.0 (built-in Brotli).
No downloads. Other Brotli versions may produce different compressed bytes.
Run from any directory: python scripts/build-spacegrotesk-woff2.py [--check]
The original TTF and OFL remain the source of truth and are never modified.
"""
import argparse
import hashlib
import io
from pathlib import Path
import subprocess
import types

from fontTools.ttLib import TTFont
import fontTools.ttLib.woff2 as codec

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / 'public/fonts/SpaceGrotesk.ttf'
TARGET = ROOT / 'public/fonts/SpaceGrotesk.woff2'
SOURCE_SHA256 = 'acad6de1fc93436f5c0f1f4137751ef04f1aea3063e7036535970ffcfbd79f72'


def brotli(data, decompress=False, mode=2):
    # Bridge fontTools' Brotli interface to the already installed Node runtime.
    # Binary stdin/stdout only: neither font data nor temporary files are persisted.
    operation = ('z.brotliDecompressSync(data)' if decompress else
                 'z.brotliCompressSync(data,{params:{[z.constants.BROTLI_PARAM_MODE]:'
                 + str(mode) + ',[z.constants.BROTLI_PARAM_QUALITY]:11}})')
    code = ("const fs=require('node:fs'),z=require('node:zlib');"
            "const data=fs.readFileSync(0);process.stdout.write(" + operation + ');')
    return subprocess.run(['node', '-e', code], input=data,
                          stdout=subprocess.PIPE, check=True).stdout


def convert(source):
    codec.brotli = types.SimpleNamespace(
        MODE_FONT=2, MODE_TEXT=1,
        compress=lambda data, mode=2: brotli(data, mode=mode),
        decompress=lambda data: brotli(data, decompress=True))
    codec.haveBrotli = True
    font = TTFont(io.BytesIO(source), recalcTimestamp=False)
    font.flavor = 'woff2'
    output = io.BytesIO()
    font.save(output)
    return output.getvalue()


def verify(source, output):
    original = TTFont(io.BytesIO(source), recalcTimestamp=False)
    decoded = TTFont(io.BytesIO(output), recalcTimestamp=False)
    expected_removed = {'DSIG'} if 'DSIG' in original else set()
    assert set(original.keys()) - set(decoded.keys()) == expected_removed
    assert not (set(decoded.keys()) - set(original.keys()))
    if 'DSIG' in original:
        assert original['DSIG'].usNumSigs == 0
    assert original.getGlyphOrder() == decoded.getGlyphOrder()
    # WOFF2 normalization sets head bit 11 and recalculates the checksum.
    for key, value in vars(original['head']).items():
        if key == 'checkSumAdjustment':
            continue
        expected = value | 0x800 if key == 'flags' else value
        assert getattr(decoded['head'], key) == expected, ('head', key)
    for tag in original.keys()[1:]:
        if tag not in {'head', 'DSIG'}:
            assert original[tag].compile(original) == decoded[tag].compile(decoded), tag
    for name in original.getGlyphOrder():
        a, b = original['glyf'][name], decoded['glyf'][name]
        assert a.getCoordinates(original['glyf']) == b.getCoordinates(decoded['glyf']), name
        assert getattr(a, 'program', None) == getattr(b, 'program', None), name
    assert len(output) < len(source)
    return len(original.getGlyphOrder())


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='verify committed bytes without writing')
    args = parser.parse_args()
    source = SOURCE.read_bytes()
    assert hashlib.sha256(source).hexdigest() == SOURCE_SHA256, 'Unexpected source font'
    output = convert(source)
    count = verify(source, output)
    if args.check:
        assert TARGET.read_bytes() == output, 'Regenerate WOFF2 with the documented toolchain'
    else:
        TARGET.write_bytes(output)
    print(f'Space Grotesk: {len(source)} -> {len(output)} bytes; {count} glyphs; all layout, hinting and variation tables preserved')
    print('WOFF2 SHA256:', hashlib.sha256(output).hexdigest())


if __name__ == '__main__':
    main()
