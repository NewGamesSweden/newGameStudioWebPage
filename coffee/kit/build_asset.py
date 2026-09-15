"""Generate a standalone glTF 2.0 binary mug. Python standard library only."""
import math,struct,json
from pathlib import Path
out=Path(__file__).parent
blob=bytearray();views=[];access=[];meshes=[];nodes=[]
materials=[{'name':n,'pbrMetallicRoughness':{'baseColorFactor':c,'metallicFactor':0,'roughnessFactor':r},**extra} for n,c,r,extra in [('Ivory',[.82,.78,.67,1],.85,{}),('Ivory shadow',[.65,.63,.57,1],.85,{}),('Cyan accent',[.08,.48,.48,1],.7,{}),('Coffee',[.075,.027,.012,1],.3,{}),('Steam',[.9,.94,1,.18],1,{'alphaMode':'BLEND','doubleSided':True})]]
def buffer(vals,typ,kind):
 while len(blob)%4:blob.append(0)
 start=len(blob);fmt='f' if typ==5126 else 'I'
 blob.extend(struct.pack('<'+fmt*len(vals),*vals));views.append({'buffer':0,'byteOffset':start,'byteLength':len(blob)-start})
 dim={'SCALAR':1,'VEC3':3}[kind];a={'bufferView':len(views)-1,'componentType':typ,'count':len(vals)//dim,'type':kind}
 if kind=='VEC3':a.update(min=[min(vals[i::3]) for i in range(3)],max=[max(vals[i::3]) for i in range(3)])
 access.append(a);return len(access)-1
def mesh(name,triangles,mat,translation=None):
 pos=[];norm=[]
 for a,b,c in triangles:
  u=[b[i]-a[i] for i in range(3)];v=[c[i]-a[i] for i in range(3)]
  n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]];l=math.sqrt(sum(x*x for x in n)) or 1
  for p in (a,b,c):pos.extend(p);norm.extend(x/l for x in n)
 meshes.append({'name':name,'primitives':[{'attributes':{'POSITION':buffer(pos,5126,'VEC3'),'NORMAL':buffer(norm,5126,'VEC3')},'material':mat}]})
 node={'name':name,'mesh':len(meshes)-1}
 if translation:node['translation']=translation
 nodes.append(node)
def ring(r,y,n=12):return [(r*math.cos(i*2*math.pi/n),y,r*math.sin(i*2*math.pi/n)) for i in range(n)]
def bridge(a,b):
 t=[]
 for i in range(len(a)):
  j=(i+1)%len(a);t.extend([(a[i],b[i],b[j]),(a[i],b[j],a[j])])
 return t
# Cross-section walks from underside up outside, across rim, and down inside.
profile=[(.001,.04),(.66,.04),(.70,.12),(.77,1.28),(.74,1.36),(.65,1.36),(.63,1.27),(.57,.19),(.001,.19)]
tris=[]
for a,b in zip(profile,profile[1:]):tris+=bridge(ring(*a),ring(*b))
mesh('Mug_Body',tris,0)
# An angular C-handle with a six-sided cross-section.
sections=[]
for i in range(9):
 a=math.radians(-112+i*224/8);cx=.82+.49*math.cos(a);cy=.72+.49*math.sin(a)
 sections.append([(cx+.13*math.cos(t)*math.cos(a),cy+.13*math.cos(t)*math.sin(a),.13*math.sin(t)) for t in [j*2*math.pi/6 for j in range(6)]])
tris=[]
for a,b in zip(sections,sections[1:]):tris+=bridge(a,b)
mesh('Mug_Handle',[(c,b,a) for a,b,c in tris],0)
# Narrow cyan low-poly band, intentionally inset below the rim.
mesh('Mug_Accent',bridge(ring(.744,1.02),ring(.748,1.08)),2)
# Coffee: origin at bottom, scale Y to lower level; shrink X/Z with level for tapered interior.
a=ring(.60,0);b=ring(.60,1.04);tris=bridge(a,b)
for i in range(12):tris.append(((0,1.04,0),b[(i+1)%12],b[i]))
mesh('Coffee',tris,3,[0,.20,0])
# Three wispy translucent polygon ribbons, separate nodes for runtime animation.
for k in range(3):
 pts=[]
 for i in range(8):
  y=i*.105;w=.04*math.sin(math.pi*(i+.2)/8)
  x=.07*math.sin(i*.8+k*2)
  pts.append(((x-w,y,0),(x+w,y,0)))
 t=[]
 for i in range(7):
  a,b=pts[i];c,d=pts[i+1];t.extend([(a,b,d),(a,d,c)])
 mesh('Steam_'+str(k+1),t,4,[(k-1)*.24,1.36,(k%2)*.12])
# Parenting keeps rotation about mug centre straightforward.
nodes.append({'name':'MugRoot','children':list(range(len(nodes)))})
g={'asset':{'version':'2.0','generator':'NewGameStudio Coffee Kit'},'scene':0,'scenes':[{'nodes':[len(nodes)-1]}],'nodes':nodes,'meshes':meshes,'materials':materials,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':access}
j=json.dumps(g,separators=(',',':')).encode();j+=b' '*((-len(j))%4);blob+=b'\0'*((-len(blob))%4)
body=struct.pack('<I4s',len(j),b'JSON')+j+struct.pack('<I4s',len(blob),b'BIN\0')+blob
(out/'workshop-mug.glb').write_bytes(struct.pack('<4sII',b'glTF',2,len(body)+12)+body)
print('GLB created:',len(body)+12,'bytes;',len(nodes),'nodes')
