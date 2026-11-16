import os,subprocess,sys
ids=sys.argv[2:]; out=sys.argv[1]; fs=[]
for i in ids:
    L=sorted(os.listdir(i)); fs+= [f'{i}/{L[0]}',f'{i}/{L[len(L)//2]}',f'{i}/{L[-1]}']
args=sum([['-i',f] for f in fs],[]); n=len(fs)
fl=''.join(f'[{k}:v]scale=426:240[s{k}];' for k in range(n))+''.join(f'[s{k}]' for k in range(n))+f'xstack=inputs={n}:layout='+'|'.join(f'{(k%3)*426}_{(k//3)*240}' for k in range(n))
subprocess.run(['ffmpeg','-v','error','-y',*args,'-filter_complex',fl,out],check=True)
