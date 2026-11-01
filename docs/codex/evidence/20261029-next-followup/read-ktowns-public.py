"""Read only public catalogue links exposed by the observed vendor-filter form."""
import hashlib,json,urllib.request
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin

HERE=Path(__file__).resolve().parent
class Links(HTMLParser):
    def __init__(self):super().__init__();self.links=[]
    def handle_starttag(self,tag,attrs):
        a=dict(attrs)
        if tag=='a' and '/products/' in a.get('href',''):self.links.append(a['href'])

url='https://www.ktowns.ca/collections/v-z?filter.p.vendor=WiTCHX'
raw=urllib.request.urlopen(url,timeout=20).read()
parser=Links();parser.feed(raw.decode())
result={'url':url,'sha256':hashlib.sha256(raw).hexdigest(),'productLinks':sorted({urljoin(url,u) for u in parser.links})}
(HERE/'statistics-ktowns-products.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result))
