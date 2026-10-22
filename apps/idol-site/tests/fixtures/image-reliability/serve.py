"""Local-only synthetic image transport. No business API, uploads or credentials."""
from http.server import ThreadingHTTPServer,SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit,parse_qs
import argparse,os,time
parser=argparse.ArgumentParser();parser.add_argument('directory');parser.add_argument('--port',type=int,default=4183);args=parser.parse_args()
os.chdir(Path(args.directory).resolve())
requests={}
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        url=urlsplit(self.path)
        if url.path.startswith('/image-fixture/') or url.path=='/api/media':
            requests[self.path]=requests.get(self.path,0)+1
            query=parse_qs(url.query)
            fail=('error' in url.path or (url.path.endswith('/recover.svg') and requests[self.path]==1) or (url.path=='/api/media' and not query.get('retry')))
            if 'slow' in url.path:time.sleep(1.2)
            if fail:self.send_response(503);self.send_header('Cache-Control','no-store');self.end_headers();return
            label='FIXTURE IMAGE / 600 x 400'
            body=f'<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="600" height="400" fill="#d3ddd4"/><rect x="12" y="12" width="576" height="376" fill="none" stroke="#25352a" stroke-width="6"/><text x="300" y="200" text-anchor="middle" font-family="sans-serif" font-size="24">{label}</text></svg>'.encode()
            self.send_response(200);self.send_header('Content-Type','image/svg+xml');self.send_header('Cache-Control','max-age=3600' if url.path.endswith('/good.svg') else 'no-store');self.send_header('Content-Length',str(len(body)));self.end_headers();self.wfile.write(body);return
        return super().do_GET()
    def do_POST(self):self.send_error(405,'Read-only fixture')
print(f'Image fixture: http://127.0.0.1:{args.port}/',flush=True)
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
