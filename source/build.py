import base64, os
D=os.path.dirname(os.path.abspath(__file__))
t=open(os.path.join(D,'template.html'),encoding='utf-8').read()
js='\n'.join(open(os.path.join(D,'src',f),encoding='utf-8').read() for f in ['data.js','art.js','art2.js','world.js','music.js','audio.js','game.js','quests.js','render.js','ui.js','main.js'])
b=lambda p: base64.b64encode(open(p,'rb').read()).decode()
title=[l for l in open(os.path.join(D,'src','data.js'),encoding='utf-8') if 'storeName' in l][0].split('"')[1]
out=t.replace('__PS2P__',b(os.path.join(D,'fonts','ps2p.woff2'))).replace('__VT323__',b(os.path.join(D,'fonts','vt323.woff2'))).replace('__JS__',js).replace('__TITLE__',title.replace("'",'\u2019'))
open(os.path.join(D,'dist.html'),'w',encoding='utf-8',newline='\n').write(out); print(len(out))
