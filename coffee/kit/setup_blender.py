"""Run in Blender's Scripting workspace. Imports the sibling GLB into a NEW scene.
Blender is not available in the authoring environment; verify this script locally.
"""
import bpy, math
from pathlib import Path
from mathutils import Vector
source = globals().get('__file__')
if not source and getattr(bpy.context.space_data,'text',None):
    source = bpy.context.space_data.text.filepath
if not source:
    raise RuntimeError('Open this saved script in the Blender Text Editor before running.')
folder=Path(bpy.path.abspath(source)).resolve().parent
scene=bpy.data.scenes.new('NewGameStudio Coffee')
bpy.context.window.scene=scene
bpy.ops.import_scene.gltf(filepath=str(folder/'workshop-mug.glb'))
scene.render.fps=30;scene.frame_start=1;scene.frame_end=120
coffee=next(o for o in scene.objects if o.name.startswith('Coffee'))
# Discover the local cylinder axis after the importer's coordinate conversion.
coords=[v.co for v in coffee.data.vertices]
axis=max(range(3),key=lambda i:max(v[i] for v in coords)-min(v[i] for v in coords))
for frame,level in [(1,1),(20,1),(30,2/3),(50,2/3),(60,1/3),(80,1/3),(90,.001),(110,.001),(120,1)]:
    coffee.scale[axis]=level
    coffee.keyframe_insert(data_path='scale',frame=frame)
for o in scene.objects:
    if o.name.startswith('Steam_'):
        base=o.location.copy()
        for frame in range(1,121,5):
            o.location=base+Vector((.035*math.sin(frame*.13),0,.07*math.sin(frame*.09)))
            o.keyframe_insert(data_path='location',frame=frame)
        for frame,scale in [(1,1),(80,1),(90,0),(110,0),(120,1)]:
            o.scale=(scale,)*3;o.keyframe_insert(data_path='scale',frame=frame)
world=bpy.data.worlds.new('Navy Workshop');scene.world=world;world.use_nodes=True
world.node_tree.nodes['Background'].inputs[0].default_value=(.025,.04,.08,1)
world.node_tree.nodes['Background'].inputs[1].default_value=.4
for name,loc,power,color,size in [('Warm key',(3,-4,5),450,(1,.66,.38),4),('Cyan fill',(-3,0,3),260,(.35,.9,1),3)]:
    data=bpy.data.lights.new(name,'AREA');data.energy=power;data.color=color;data.shape='DISK';data.size=size
    obj=bpy.data.objects.new(name,data);scene.collection.objects.link(obj);obj.location=loc
    obj.rotation_euler=(Vector((0,0,.7))-obj.location).to_track_quat('-Z','Y').to_euler()
data=bpy.data.cameras.new('Coffee Camera');cam=bpy.data.objects.new('Coffee Camera',data);scene.collection.objects.link(cam)
cam.location=(3,-4,3);cam.rotation_euler=(Vector((0,0,1))-cam.location).to_track_quat('-Z','Y').to_euler()
data.type='ORTHO';data.ortho_scale=3.7;scene.camera=cam
scene.render.resolution_x=900;scene.render.resolution_y=900;scene.render.resolution_percentage=100
scene.render.film_transparent=True;scene.frame_set(1)
output=folder/'workshop-mug.blend';n=1
while output.exists():output=folder/f'workshop-mug-{n}.blend';n+=1
bpy.ops.wm.save_as_mainfile(filepath=str(output))
print('Saved',output)
