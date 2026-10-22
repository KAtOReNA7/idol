"""Synthetic fixture only. Native module transport delay/error, with no API proxy."""
import argparse,json,mimetypes,pathlib,time,threading
from http.server import ThreadingHTTPServer,BaseHTTPRequestHandler
from urllib.parse import urlsplit,parse_qs
parser=argparse.ArgumentParser();parser.add_argument('--directory',required=True);parser.add_argument('--port',type=int,default=4173);args=parser.parse_args()
root=pathlib.Path(args.directory).resolve();counts={};module_requests=[];lock=threading.Lock();active_case='home'
class Handler(BaseHTTPRequestHandler):
 def do_GET(self):
  global active_case
  reloaded=False
  if urlsplit(self.path).path=='/fixture-transport':
   scenario=parse_qs(urlsplit(self.path).query).get('case',[''])[0]
   with lock: body=json.dumps([dict(row) for row in module_requests if row['scenario']==scenario]).encode()
   self.send_response(200);self.send_header('Content-Type','application/json');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',len(body));self.end_headers();self.wfile.write(body);return
  parts=urlsplit(self.path).path.strip('/').split('/')
  if parts==['']: scenario=active_case;relative='index.html';reloaded=True
  elif parts[0] in ['viewer-390.html','viewer-1280.html']: scenario='viewer';relative=parts[0]
  elif len(parts)>=2 and parts[0]=='cases': scenario=parts[1];relative='/'.join(parts[2:]) or 'index.html'
  else: self.send_error(404);return
  if relative=='index.html' and not reloaded: active_case=scenario
  file=(root/relative).resolve()
  if not file.is_relative_to(root) or not file.is_file(): self.send_error(404);return
  if file.name.startswith('catalog-group-views-') and file.suffix=='.js':
   with lock:
    counts[scenario]=counts.get(scenario,0)+1;attempt=counts[scenario]
    module_requests.append({'scenario':scenario,'path':urlsplit(self.path).path,'attempt':attempt})
   if scenario=='import-error' and attempt==1: self.send_error(503,'Synthetic module transport failure');return
   if scenario in ['direct-groups','direct-detail','mixed-ids','back-pending']: time.sleep(1.5)
   if scenario=='timeout' and attempt==1: time.sleep(31)
  body=file.read_bytes()
  if relative=='index.html':
   html=body.decode().replace('<html lang="zh-CN">','<html lang="zh-CN" data-fixture-scenario="'+scenario+'" data-fixture-reloaded="'+str(reloaded).lower()+'">').replace('href="styles.css"','href="/cases/'+scenario+'/styles.css"').replace('src="fixture.js"','src="/cases/'+scenario+'/fixture.js"');body=html.encode()
  self.send_response(200);self.send_header('Content-Type',mimetypes.guess_type(file.name)[0] or 'application/octet-stream');self.send_header('Cache-Control','no-store');self.send_header('Content-Length',len(body));self.end_headers()
  try:self.wfile.write(body)
  except BrokenPipeError:pass
ThreadingHTTPServer(('127.0.0.1',args.port),Handler).serve_forever()
