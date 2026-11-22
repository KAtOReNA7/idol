"""Verify the original and first-display photos through the public artwork URLs of a deployed site."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
from io import BytesIO
import json
from pathlib import Path
from urllib.parse import urlsplit
from urllib.request import ProxyHandler, Request, build_opener

from PIL import Image


def check(site, output, version):
    app = Path(__file__).resolve().parents[3] / 'apps/idol-site'
    manifest = json.loads((app / 'data/kissoflife-portrait-asset-delivery.json').read_bytes())
    origin = urlsplit(site)
    if origin.scheme != 'https' or not origin.hostname or origin.path.rstrip('/') or origin.query or origin.fragment:
        raise ValueError('Pass the HTTPS origin of the deployed site.')
    anonymous = build_opener(ProxyHandler({}))

    def fetch(row):
        path = row['path']
        url = site.rstrip('/') + path
        headers = {'Accept': row['mime'], 'Accept-Encoding': 'identity', 'User-Agent': 'IdolLens-release/1.0'}
        def read(method):
            with anonymous.open(Request(url, headers=headers, method=method), timeout=25) as response:
                if response.status != 200 or response.geturl() != url:
                    raise ValueError(f'{method} {path} did not return directly from the site.')
                mime = response.headers.get_content_type()
                ref = response.headers.get('X-Idol-Original-Ref')
                if mime != row['mime'] or (row['delivery'] == 'remote' and ref != manifest['publicRef']) or (row['delivery'] == 'local' and ref is not None):
                    raise ValueError(f'{method} {path} returned {mime} with original ref {ref}.')
                return response.headers, response.read(), response.status

        _, _, head_status = read('HEAD')
        result_headers, raw, get_status = read('GET')
        expected = (app / 'public' / path.lstrip('/')).read_bytes()
        if len(raw) != row['bytes'] or raw != expected or hashlib.sha256(raw).hexdigest() != row['sha256']:
            raise ValueError(f'Published bytes differ from the approved photograph at {path}.')
        with Image.open(BytesIO(raw)) as image:
            image.load()
            width, height = image.size
        return {'path': path, 'delivery': row['delivery'], 'get': get_status, 'head': head_status,
                'mime': result_headers.get_content_type(), 'width': width, 'height': height, 'bytes': len(raw),
                'sameOrigin': True, 'exactBytes': True, 'originalRef': result_headers.get('X-Idol-Original-Ref')}

    with ThreadPoolExecutor(max_workers=4) as pool:
        rows = list(pool.map(fetch, manifest['assets']))
    proof = {'site': site, 'version': version, 'work': 'Nobody Knows', 'sourceRef': manifest['publicRef'], 'userAgent': 'IdolLens-release/1.0',
             'method': 'Anonymous HEAD and GET requests to published same-origin image paths, then full image decode and comparison with the repository originals.', 'assets': rows}
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(proof, ensure_ascii=False, indent=2) + '\n', encoding='utf-8', newline='\n')
    print(f'{len(rows)} images verified through the published site at version {version}.')


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('site')
    parser.add_argument('version', type=int)
    parser.add_argument('output', type=Path)
    args = parser.parse_args()
    check(args.site, args.output, args.version)
