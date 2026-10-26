#!/usr/bin/env python3
"""Build/check full Playfair Display and DM Sans webfonts, never subset.
Toolchain: fontTools 4.61.1 and Node 24.19.0, as used by the shared converter.
Run: python scripts/build-editorial-fonts-woff2.py [--check]
Original TTF/OFL files and metadata remain unchanged. Playfair's RFN is retained
only for this functionally equivalent conversion; do not strip tables or glyphs.
OFL guidance: https://openfontlicense.org/webfonts-and-reserved-font-names/
"""
import argparse
import hashlib
import importlib.util
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location('full_font_codec', ROOT / 'scripts/build-spacegrotesk-woff2.py')
codec = importlib.util.module_from_spec(spec)
spec.loader.exec_module(codec)
FONTS = {
    'PlayfairDisplay-Variable': ('c40f2293766a503bc70cce9e512ef844a4ccb7cbcde792fe2ea31d191917d8d6',
                               '4297e9ec39f1b8157623d048fb99eab03c90e482669599e8fc662ee178994c49'),
    'DMSans-Variable': ('8cd08d97e89c24d0aa92edd2f0f4c8ee6195eee9b7c9f154865a58b02f0c1c0d',
                       '40c3837c53c103a38fbce7faaa590b76edd61a8ede14672eb1e2f7eab0e0c6a4'),
}


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--check', action='store_true', help='verify committed bytes without writing')
    args = parser.parse_args()
    for name, (source_hash, output_hash) in FONTS.items():
        source = (ROOT / 'public/fonts' / (name + '.ttf')).read_bytes()
        assert hashlib.sha256(source).hexdigest() == source_hash, name + ': unexpected source'
        output = codec.convert(source)
        glyphs = codec.verify(source, output)
        assert hashlib.sha256(output).hexdigest() == output_hash, name + ': toolchain mismatch'
        target = ROOT / 'public/fonts' / (name + '.woff2')
        if args.check:
            assert target.read_bytes() == output, name + ': regenerate WOFF2'
        else:
            target.write_bytes(output)
        print(f'{name}: {len(source)} -> {len(output)} bytes; {glyphs} glyphs; complete tables verified')


if __name__ == '__main__':
    main()
