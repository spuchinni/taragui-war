# Convierte los personajes de Quaternius (formato libGDX .g3dj) a un JSON compacto para el juego:
# pose de reposo ya "skineada" en metros (y arriba, mirando +z), 2 huesos por vértice, color por parte, esqueleto reducido.
import json, sys, math, base64, struct, glob, os
import numpy as np
KEEP=['Hips','Spine','Spine1','Spine2','Neck','Head','LeftShoulder','LeftArm','LeftForeArm','LeftHand','RightShoulder','RightArm','RightForeArm','RightHand',
      'LeftUpLeg','LeftLeg','LeftFoot','LeftToeBase','RightUpLeg','RightLeg','RightFoot','RightToeBase']
def qmat(q):
    x,y,z,w=q; return np.array([[1-2*(y*y+z*z),2*(x*y-z*w),2*(x*z+y*w)],[2*(x*y+z*w),1-2*(x*x+z*z),2*(y*z-x*w)],[2*(x*z-y*w),2*(y*z+x*w),1-2*(x*x+y*y)]])
def trs(n):
    t=n.get('translation',[0,0,0])[:3]; r=n.get('rotation',[0,0,0,1]); s=n.get('scale',[1,1,1])[:3]
    M=np.eye(4); M[:3,:3]=qmat(r)@np.diag(s); M[:3,3]=t; return M
def lin2srgb(c): return [round(255*min(1,max(0,v))**(1/2.2)) for v in c]
def convert(path, only=None):
    d=json.load(open(path)); meshparts={}; 
    for m in d['meshes']:
        attrs=m['attributes']; size={'POSITION':3,'NORMAL':3,'TEXCOORD0':2,'COLOR':4,'COLORPACKED':1}; st=0; off={}
        for a in attrs: off[a]=st; st+= size.get(a,2 if a.startswith('BLENDWEIGHT') else 0)
        V=np.array(m['vertices'],dtype=np.float64).reshape(-1,st)
        for p in m['parts']: meshparts[p['id']]=(V,off,p['indices'])
    mats={x['id']:lin2srgb(x.get('diffuse',[.8,.8,.8])) for x in d['materials']}
    # esqueleto
    arm=[n for n in d['nodes'] if any(c.get('id','').endswith('Hips') for c in n.get('children',[]))][0]
    bones={}; order=[]
    def walk(n,parentName,parentG):
        G=parentG@trs(n); name=n['id'].split(':')[-1]
        bones[name]={'G':G,'parent':parentName,'local':trs(n),'node':n}; order.append(name)
        for c in n.get('children',[]): walk(c,name,G)
    A=trs(arm)
    for c in arm.get('children',[]): walk(c,None,A)
    def kept(name):
        while name and name not in KEEP: name=bones[name]['parent']
        return name
    chars={}
    for n in d['nodes']:
        if 'parts' not in n: continue
        cname=n['id'].split('_')[0].replace('Formad','Formal')
        if only and cname not in only: continue
        C=chars.setdefault(cname,{'pos':[],'sk':[],'idx':[],'parts':[], 'map':{},'dd':{},'col':[]})
        for part in n['parts']:
            V,off,ind=meshparts[part['meshpartid']]; col=mats.get(part['materialid'],[200,200,200])
            BL=[(b['node'].split(':')[-1], trs(b)) for b in part.get('bones',[])]
            invB=[np.linalg.inv(M) for _,M in BL]; Gb=[bones[nm]['G'] for nm,_ in BL]
            start=len(C['idx'])
            for vi in ind:
                key=(id(V),vi)
                if key in C['map']: C['idx'].append(C['map'][key]); continue
                row=V[vi]; p=np.array([*row[off['POSITION']:off['POSITION']+3],1.0]); acc=np.zeros(4); ws=[]
                for k in range(4):
                    a='BLENDWEIGHT%d'%k
                    if a not in off: continue
                    bi,w=int(row[off[a]]),row[off[a]+1]
                    if w<=0 or bi>=len(BL): continue
                    acc+=w*(Gb[bi]@invB[bi]@p); ws.append((kept(BL[bi][0]),w))
                if not ws: acc=p; ws=[('Hips',1)]
                tot={}; 
                for nm,w in ws: tot[nm]=tot.get(nm,0)+w
                top=sorted(tot.items(),key=lambda x:-x[1])[:2]; s=sum(w for _,w in top)
                b0=KEEP.index(top[0][0]); b1=KEEP.index(top[1][0]) if len(top)>1 else b0; w0=top[0][1]/s
                pp=acc[:3]*.01; dk=(round(pp[0]*1000),round(pp[1]*1000),round(pp[2]*1000),tuple(col))
                if dk in C['dd']: C['map'][key]=C['dd'][dk]; C['idx'].append(C['dd'][dk]); continue
                C['map'][key]=C['dd'][dk]=len(C['pos']); C['pos'].append(pp.tolist()); C['sk'].append((b0,b1,round(w0*255))); C['col'].append(col); C['idx'].append(C['map'][key])
            C['parts'].append([len(C['idx'])-start,col])
    # esqueleto reducido: posición/rotación local de reposo de cada hueso conservado respecto del conservado padre, en metros
    sk=[]
    for nm in KEEP:
        if nm not in bones: sk.append(None); continue
        par=bones[nm]['parent']; 
        while par and par not in KEEP: par=bones[par]['parent']
        G=bones[nm]['G']; Gp=bones[par]['G'] if par else np.eye(4)
        L=np.linalg.inv(Gp)@G; 
        # sin escala: sacar la escala de las columnas
        R=L[:3,:3]; sc=np.linalg.norm(R,axis=0); R=R/sc; t=L[:3,3]*(.01 if par else .01)
        w=math.sqrt(max(0,1+R[0,0]+R[1,1]+R[2,2]))/2; 
        if w>1e-4: q=[(R[2,1]-R[1,2])/(4*w),(R[0,2]-R[2,0])/(4*w),(R[1,0]-R[0,1])/(4*w),w]
        else:
            i=int(np.argmax([R[0,0],R[1,1],R[2,2]])); j,k=(i+1)%3,(i+2)%3; r=math.sqrt(max(0,1+R[i,i]-R[j,j]-R[k,k])); qq=[0,0,0,0]
            qq[i]=r/2; qq[j]=(R[j,i]+R[i,j])/(2*r); qq[k]=(R[k,i]+R[i,k])/(2*r); qq[3]=(R[k,j]-R[j,k])/(2*r); q=qq
        sk.append({'p':KEEP.index(par) if par else -1,'t':[round(x,4) for x in t],'q':[round(x,5) for x in q],'gy':round(G[1,3]*.01,4)})
    out={}
    for cname,C in chars.items():
        P=np.array(C['pos']); 
        q=np.clip(np.round(P*1000),-32767,32767).astype('<i2').tobytes()
        s=np.array(C['sk'],dtype='u1').tobytes(); I=np.array(C['idx'],dtype='<u2' if len(C['pos'])<65536 else '<u4').tobytes()
        pal=sorted(set(map(tuple,C['col']))); ci=np.array([pal.index(tuple(c)) for c in C['col']],dtype='u1').tobytes()
        out[cname]={'pal':[list(c) for c in pal],'ci':base64.b64encode(ci).decode(),'n':len(C['pos']),'pos':base64.b64encode(q).decode(),'sk':base64.b64encode(s).decode(),'idx':base64.b64encode(I).decode(),'skel':sk,
          'h':round(float(P[:,1].max()-P[:,1].min()),3),'y0':round(float(P[:,1].min()),3),'zr':[round(float(P[:,2].min()),3),round(float(P[:,2].max()),3)]}
    return out
if __name__=='__main__':
    res={}; 
    want=set(os.environ.get('WANT','').split(',')) if os.environ.get('WANT') else None
    for f in sys.argv[2:]:
        pre=os.environ.get('PRE','')
        for k,v in convert(f).items():
            sx='m' if 'Men_Pack' in f else 'f'; name=sx+'_'+k
            if want is None or name in want: res[name]=v
    json.dump({'bones':KEEP,'chars':res},open(sys.argv[1],'w'),separators=(',',':'))
    for k,v in res.items(): print(k,v['n'],'verts',len(base64.b64decode(v['idx']))//6,'tris','h',v['h'],'y0',v['y0'],'z',v['zr'])
