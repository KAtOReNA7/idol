export function createTransitionGate(){
  let sequence=0,current=null,dead=false;
  return {get destroyed(){return dead;},begin(){const controller=new AbortController();if(dead){controller.abort();return {signal:controller.signal,isCurrent:()=>false};}const previous=current,serial=++sequence;current=controller;previous?.abort();return {signal:controller.signal,isCurrent:()=>!dead&&!controller.signal.aborted&&current===controller&&serial===sequence};},destroy(){if(dead)return;dead=true;sequence++;const previous=current;current=null;previous?.abort();}};
}
