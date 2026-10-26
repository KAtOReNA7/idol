"""Local fixture static host with artist-path fallback; no upstream requests/API."""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
from urllib.parse import urlsplit
import argparse
import os

parser=argparse.ArgumentParser()
parser.add_argument('directory')
parser.add_argument('--port',type=int,default=4173)
args=parser.parse_args()
os.chdir(Path(args.directory).resolve())
class Handler(SimpleHTTPRequestHandler):
    def do_GET(self):
        pathname=urlsplit(self.path).path
        if pathname.startswith('/artists/fixture-'):
            self.path='/index.html'
        return super().do_GET()
    def do_POST(self):
        self.send_error(405,'Fixture is read-only; no API is implemented.')
print(f'Fixture only: http://127.0.0.1:{args.port}/',flush=True)
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
