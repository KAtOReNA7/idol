"""Capture bounded public product metadata, excluding unrelated customer reviews."""
import hashlib,json,re,urllib.request
from pathlib import Path
HERE=Path(__file__).resolve().parent
links=json.loads((HERE/'statistics-ktowns-products.json').read_text(encoding='utf-8'))['productLinks']
url=next(u for u in links if '/products/witchx-' in u)
raw=urllib.request.urlopen(url,timeout=20).read()
text=raw.decode()
products=[]
for script in re.findall(r'<script\b[^>]*type=["\']application/ld\+json["\'][^>]*>(.*?)</script>',text,re.S):
    try:value=json.loads(script)
    except ValueError:continue
    values=value if isinstance(value,list) else [value]
    for item in values:
        if item.get('@type')=='Product':
            product={k:item[k] for k in ['@type','name','brand','sku','gtin','gtin12','gtin13','offers','url'] if k in item}
            if item.get('description'):product['descriptionExcerpt']=item['description'].splitlines()[1]
            products.append(product)
result={'url':url,'http':200,'bytes':len(raw),'sha256':hashlib.sha256(raw).hexdigest(),'jsonLdProducts':products,
        'scope':'Public product metadata only; SKU/price/availability do not establish unit sales or Circle/Hanteo eligibility.'}
(HERE/'statistics-ktowns-product-readback.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
print(json.dumps(result,ensure_ascii=True))
