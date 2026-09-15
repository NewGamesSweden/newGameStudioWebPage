/** Reference controller for a Three.js scene loaded from workshop-mug.glb.
 * Host supplies a raycast hitTest(event), visible status node and optional splash callback.
 * Call update(deltaSeconds, elapsedSeconds) from the renderer loop.
 * Donation button wiring is deliberately left to the host's real donation link.
 */
export function createCoffeeController({root, element, hitTest, status, onSplash = () => {}}) {
  const coffee = root.getObjectByName('Coffee');
  const steam = [1,2,3].map(n => root.getObjectByName(`Steam_${n}`));
  if (!coffee || steam.some(x=>!x)) throw new Error('Required mug model nodes missing');
  steam.forEach(s=>{s.material=s.material.clone();s.material.depthWrite=false;s.userData.base=s.position.clone();});
  let sips=3, level=1, down=null, velocity=0, splashCooldown=0;
  function announce(){ if(status) status.textContent=sips ? `${sips} sips left. Drag to spin; click to sip.` : 'Out of coffee. Scope remains unlimited.'; }
  function sip(){ if(sips>0){sips--;announce();} }
  function refill(){sips=3;announce();} // call ONLY from donation button; refresh recreates full state
  function start(e){
    if(e.button!==0 || !hitTest(e))return;
    down={id:e.pointerId,x:e.clientX,y:e.clientY,last:e.clientX,time:performance.now(),drag:false};
    element.setPointerCapture(e.pointerId);
  }
  function move(e){
    if(!down || e.pointerId!==down.id)return;
    if(Math.hypot(e.clientX-down.x,e.clientY-down.y)>7)down.drag=true;
    if(down.drag){
      const now=performance.now(),delta=(e.clientX-down.last)*.012;
      root.rotation.y+=delta;velocity=Math.max(-8,Math.min(8,delta/Math.max(.016,(now-down.time)/1000)));
      if(Math.abs(velocity)>3 && sips>0 && splashCooldown<=0){onSplash({root,level});splashCooldown=.6;}
      down.last=e.clientX;down.time=now;
    }
  }
  function end(e){if(!down || e.pointerId!==down.id)return;if(!down.drag)sip();down=null;}
  function cancel(){down=null;velocity=0;}
  element.addEventListener('pointerdown',start);element.addEventListener('pointermove',move);
  element.addEventListener('pointerup',end);element.addEventListener('pointercancel',cancel);
  function update(dt,time){
    dt=Math.min(dt,.05);splashCooldown-=dt;
    level+=(sips/3-level)*(1-Math.exp(-dt*9));
    coffee.visible=level>.008;coffee.scale.y=Math.max(.001,level);
    coffee.scale.x=coffee.scale.z=.94+.06*level;
    if(!down){root.rotation.y+=velocity*dt;velocity*=Math.exp(-dt*5);}
    steam.forEach((s,i)=>{
      s.visible=level>.008;
      s.position.y=s.userData.base.y+Math.sin(time*1.5+i)*.08;
      s.position.x=s.userData.base.x+Math.sin(time*1.2+i*2)*.05;
      s.material.opacity=.18*Math.min(1,level*3)*(.75+.25*Math.sin(time*2+i));
      s.rotation.y=Math.sin(time*.6+i)*.25;
    });
  }
  announce();
  return {sip,refill,update,get sips(){return sips;},dispose(){
    element.removeEventListener('pointerdown',start);element.removeEventListener('pointermove',move);
    element.removeEventListener('pointerup',end);element.removeEventListener('pointercancel',cancel);
    steam.forEach(s=>s.material.dispose());
  }};
}
