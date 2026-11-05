# Portadas para CrazyGames desde la ilustración de Sebastián con el logo TARAWAR / STEEL FRONT (img/portada-en.jpg).
# Uso: python3 herramientas/crazygames/portadas.py → herramientas/crazygames/portadas/portada-<ancho>x<alto>.jpg
from PIL import Image, ImageFilter
import os
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
art=Image.open(os.path.join(R,'img','portada-en.jpg')).convert('RGB'); AW,AH=art.size
OUT=os.path.join(R,'herramientas','crazygames','portadas')
def crop(w,h,top=False):
    r=w/h
    if AW/AH>r: nw=int(AH*r); box=((AW-nw)//2,0,(AW-nw)//2+nw,AH)
    else: nh=int(AW/r); y=0 if top else (AH-nh)//2; box=(0,y,AW,y+nh)
    return art.crop(box).resize((w,h),Image.LANCZOS)
for w,h in [(1920,1080),(800,470),(800,800)]: crop(w,h,True).save(os.path.join(OUT,f'portada-{w}x{h}.jpg'),quality=90); print(w,h)
# vertical: la ilustración entera sobre un fondo difuminado de ella misma
w,h=800,1200; bg=crop(w,h).filter(ImageFilter.GaussianBlur(18)); bg=Image.blend(bg,Image.new('RGB',(w,h),(10,10,10)),.4)
fg=art.resize((w,int(AH*w/AW)),Image.LANCZOS); bg.paste(fg,(0,(h-fg.size[1])//2)); bg.save(os.path.join(OUT,'portada-800x1200.jpg'),quality=90); print(w,h)
