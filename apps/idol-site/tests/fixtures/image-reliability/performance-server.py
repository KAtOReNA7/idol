"""Local-only identical SVG fixture; no product data, proxy, telemetry or saving."""
import argparse,json,time,threading
from pathlib import Path
from urllib.parse import urlsplit,parse_qs
from http.server import SimpleHTTPRequestHandler,ThreadingHTTPServer
p=argparse.ArgumentParser();p.add_argument('directory',type=Path);p.add_argument('--port',type=int,default=8316);a=p.parse_args()
state={'requests':[],'failures':{}};lock=threading.Lock()
class Handler(SimpleHTTPRequestHandler):
 def __init__(self,*args,**kwargs):super().__init__(*args,directory=str(a.directory.resolve()),**kwargs)
 def do_GET(self):
  u=urlsplit(self.path);q=parse_qs(u.query)
  if u.path=='/__reset':
   with lock:state['requests']=[]
   return self.reply(200,b'{}','application/json','no-store')
  if u.path=='/__stats':
   with lock:payload=json.dumps({'requests':list(state['requests'])}).encode()
   return self.reply(200,payload,'application/json','no-store')
  if u.path=='/synthetic-image.svg':
   with lock:
    state['requests'].append({'path':self.path,'receivedAt':time.time()});seen=state['failures'].get(self.path,0);state['failures'][self.path]=seen+1
   time.sleep(.12)
   if q.get('mode')==['fail-once'] and seen==0:return self.reply(503,b'synthetic first-attempt failure','text/plain','no-store')
   svg=b'<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="800" height="600" fill="#7799aa"/><circle cx="400" cy="300" r="180" fill="#eff4f6"/><text x="400" y="310" text-anchor="middle" font-size="40">SYNTHETIC 800x600</text></svg>'
   return self.reply(200,svg,'image/svg+xml','public,max-age=3600' if q.get('mode')!=['fail-once'] else 'no-store')
  return super().do_GET()
 def reply(self,status,data,mime,cache):
  self.send_response(status);self.send_header('Content-Type',mime);self.send_header('Content-Length',str(len(data)));self.send_header('Cache-Control',cache);self.end_headers();self.wfile.write(data)
 def log_message(self,*args):pass
print(f'Local synthetic fixture: http://127.0.0.1:{a.port}',flush=True)
ThreadingHTTPServer(('127.0.0.1',a.port),Handler).serve_forever()
