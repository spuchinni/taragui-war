# Portadas para CrazyGames con el nombre TaraWar (pedido de Sebastián: "Taragüí" es una marca de yerba).
# Toma la ilustración img/portada-nueva.jpg, tapa el logo dibujado (que dice TARAGUI WAR) con un velo oscuro y escribe
# "TARAWAR / STEEL FRONT" en letras de acero hechas por código. Uso: python3 herramientas/crazygames/portadas.py
from PIL import Image, ImageDraw, ImageFont, ImageFilter
import os
R=os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC=os.path.join(R,'img','portada-nueva.jpg'); OUT=os.path.join(R,'herramientas','crazygames','portadas')
FONT='/usr/share/fonts/opentype/inter/InterDisplay-Black.otf'
art=Image.open(SRC).convert('RGB'); AW,AH=art.size

def cover(im,w,h):
    r=w/h; W,H=im.size
    if W/H>r: nw=int(H*r); box=((W-nw)//2,0,(W-nw)//2+nw,H)
    else: nh=int(W/r); box=(0,0,W,nh)              # recorta abajo: el logo está arriba y se tapa igual
    return im.crop(box).resize((w,h),Image.LANCZOS)

def base_art():
    """La ilustración con el logo original borrado: esa zona se difumina mucho y se oscurece (borde suave)."""
    im=art.copy(); m=Image.new('L',im.size,0); d=ImageDraw.Draw(m)
    d.rounded_rectangle((int(AW*.17),-50,int(AW*.83),int(AH*.60)),radius=int(AW*.06),fill=255)
    m=m.filter(ImageFilter.GaussianBlur(AW*.03))
    blur=im.filter(ImageFilter.GaussianBlur(AW*.035)); blur=Image.blend(blur,Image.new('RGB',im.size,(14,12,10)),.55)
    return Image.composite(blur,im,m)

def title(img,cx,cy,size):
    """TARAWAR en acero (degradé, borde oscuro, brillo) y STEEL FRONT abajo."""
    W,H=img.size; f=ImageFont.truetype(FONT,size); f2=ImageFont.truetype(FONT,int(size*.30))
    txt='TARAWAR'; bb=f.getbbox(txt); tw=bb[2]-bb[0]; th=bb[3]-bb[1]; x=cx-tw//2-bb[0]; y=cy-th//2-bb[1]
    sh=Image.new('L',(W,H),0); ImageDraw.Draw(sh).text((x+size*.04,y+size*.06),txt,font=f,fill=200)
    img.paste((0,0,0),(0,0),sh.filter(ImageFilter.GaussianBlur(size*.05)))
    mask=Image.new('L',(W,H),0); ImageDraw.Draw(mask).text((x,y),txt,font=f,fill=255)
    grad=Image.new('RGB',(W,H)); gd=ImageDraw.Draw(grad)
    for j in range(H):
        u=(j-(cy-th/2))/max(th,1); u=min(1,max(0,u))
        c=(int(235-120*u+40*(u>.48)*(1-u)),int(235-118*u+40*(u>.48)*(1-u)),int(232-110*u+40*(u>.48)*(1-u)))
        gd.line([(0,j),(W,j)],fill=c)
    edge=mask.filter(ImageFilter.MaxFilter(max(3,int(size*.05)//2*2+1)))
    img.paste((26,22,18),(0,0),edge); img.paste(grad,(0,0),mask)
    ImageDraw.Draw(img).text((x,y),txt,font=f,fill=None,stroke_width=max(1,size//60),stroke_fill=(70,62,52))
    t2='STEEL FRONT'; b2=f2.getbbox(t2); w2=b2[2]-b2[0]; y2=y+bb[3]+int(size*.10)
    d=ImageDraw.Draw(img); d.text((cx-w2//2-b2[0],y2),t2,font=f2,fill=(232,200,120),stroke_width=max(1,size//45),stroke_fill=(20,16,12))
    # franja celeste y blanca, como el escudo del original
    bw=int(tw*.55); by=y-int(size*.30); bh=int(size*.08)
    for k,c in enumerate([(116,172,223),(245,245,245),(116,172,223)]): d.rectangle((cx-bw//2,by+k*bh,cx+bw//2,by+(k+1)*bh),fill=c)
    d.ellipse((cx-bh*.9,by+bh*1.5-bh*.9,cx+bh*.9,by+bh*1.5+bh*.9),fill=(246,180,14))
    return img

B=base_art()
for w,h,size,cy in [(1920,1080,240,.30),(800,470,100,.30),(800,1200,140,.20),(800,800,130,.28)]:
    if w/h<1:   # vertical: la ilustración entera centrada sobre un fondo difuminado y el título arriba
        bg=cover(art,w,h).filter(ImageFilter.GaussianBlur(18)); bg=Image.blend(bg,Image.new('RGB',(w,h),(10,10,10)),.45)
        fg=B.resize((w,int(AH*w/AW)),Image.LANCZOS); bg.paste(fg,(0,int(h*.30))); img=bg
    else: img=cover(B,w,h)
    img=title(img,w//2,int(h*cy),size); img.save(os.path.join(OUT,f'portada-{w}x{h}.jpg'),quality=90); print(w,h)
# fondo del menú para el paquete de CrazyGames: la ilustración entera (mismo tamaño que img/portada-nueva.jpg) con TaraWar
title(B.copy(),AW//2,int(AH*.31),int(AW*.12)).save(os.path.join(OUT,'fondo-tarawar.jpg'),quality=88); print('fondo',AW,AH)
