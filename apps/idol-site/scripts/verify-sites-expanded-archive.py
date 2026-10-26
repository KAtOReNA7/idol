#!/usr/bin/env python3
"""Read-only size gate for an official .tar.gz; never extracts or alters files.
Count the complete gzip-decoded tar stream, not only regular-file payloads.
Uses Python standard-library gzip/tarfile, including GNU/PAX header handling.
"""
import gzip
import json
from pathlib import Path
import sys
import tarfile

CAP = 256 * 1024 * 1024
MINIMUM_HEADROOM = 2 * 1024 * 1024

def measure(filename):
    archive = Path(filename).resolve()
    full_tar_bytes = 0
    with gzip.open(archive, 'rb') as stream:
        while chunk := stream.read(1024 * 1024):
            full_tar_bytes += len(chunk)
    payload_bytes = files = entries = 0
    with tarfile.open(archive, 'r|gz') as stream:
        for member in stream:
            entries += 1
            if member.isfile():
                files += 1
                payload_bytes += member.size
    return dict(archivePath=str(archive), gzipBytes=archive.stat().st_size,
                payloadBytes=payload_bytes, fullTarBytes=full_tar_bytes,
                tarOverheadBytes=full_tar_bytes-payload_bytes,
                entries=entries, regularFiles=files, serviceCapBytes=CAP,
                minimumHeadroomBytes=MINIMUM_HEADROOM,
                marginBytes=CAP-full_tar_bytes,
                withinSafetyTarget=full_tar_bytes <= CAP-MINIMUM_HEADROOM)

if __name__ == '__main__':
    if len(sys.argv) != 2:
        raise SystemExit('Usage: python3 scripts/verify-sites-expanded-archive.py /absolute/path/official.tar.gz')
    result = measure(sys.argv[1])  # Bad gzip/CRC/tar raises and fails closed.
    print(json.dumps(result, indent=2))
    if not result['withinSafetyTarget']:
        raise SystemExit('Expanded tar lacks the required 2 MiB safety margin. Do not submit this package.')
