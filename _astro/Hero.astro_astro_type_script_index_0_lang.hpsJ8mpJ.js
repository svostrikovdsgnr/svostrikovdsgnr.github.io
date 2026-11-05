var e={views:9,lens:6,depth:[.022,.012,.003,-.012],focus:[.5,.56],idleMs:3e3,tiltX:9,tiltY:12},t=[`/hero/base.webp`,`/hero/orig.webp`,`/hero/sky.jpg`,`/hero/masks.png`],n=`attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`,r=`precision highp float;
uniform sampler2D tBase,tOrig,tSky,tMask;
uniform vec2 res, focus; uniform float dpr, aspect, view, vy, lens, views, time, still;
uniform vec4 depth;
vec2 cover(vec2 uv){ float sa=res.x/res.y; vec2 s=vec2(1.); if(sa>aspect) s.y=aspect/sa; else s.x=sa/aspect; s*=.92;
  return clamp(focus,s*.5,1.-s*.5)+(uv-.5)*s; }
vec3 scene(vec2 uv, float s){
  vec2 o = vec2(s, vy*.35);
  vec2 u0=cover(uv+o*depth.x), u1=cover(uv+o*depth.y), u2=cover(uv+o*depth.z), u3=cover(uv+o*depth.w);
  vec3 c = texture2D(tSky, vec2(u0.x, min(u0.y*.5,.12))).rgb;
  c = mix(c, texture2D(tBase,u1).rgb, texture2D(tMask,u1).r);
  c = mix(c, texture2D(tBase,u2).rgb, texture2D(tMask,u2).g);
  c = mix(c, texture2D(tOrig,u3).rgb, texture2D(tMask,u3).b);
  return c;
}
float hash(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}
void main(){
  vec2 fc=gl_FragCoord.xy; vec2 uv=vec2(fc.x/res.x,1.-fc.y/res.y);
  float L=lens*dpr, fx=fract(fc.x/L), li=floor(fc.x/L);
  vec2 suv=uv; // без пересэмплирования внутри линзы – нет «лесенки»
  float v=(view*.5+.5)*(views-1.)+(fx-.5)*.25*(1.-still);
  float v0=clamp(floor(v),0.,views-1.), v1=min(v0+1.,views-1.);
  float t=smoothstep(.15,.85,fract(v));
  vec3 col=mix(scene(suv,v0/(views-1.)*2.-1.), scene(suv,v1/(views-1.)*2.-1.), t);
  float ridge=cos((fx-.5)*3.14159); col*=.965+.035*ridge;
  float hl=.5+view*.45; float spec=pow(max(0.,1.-abs(fx-hl)*4.),4.);
  float band=uv.x*.9+uv.y*.45-(view*.6+.65); float glare=exp(-band*band*18.);
  vec3 iris=.5+.5*cos(6.2831*(uv.x*1.6+view*.5+vec3(0.,.33,.67)));
  col+=spec*.06+glare*(.07+.07*iris)*(1.-still*.6);
  col+=(hash(fc+time)-.5)*.03;
  float vig=smoothstep(1.3,.4,length((uv-.5)*vec2(1.05,1.25)));
  gl_FragColor=vec4(col*mix(.8,1.,vig),1.);
}`;function i(i){let a=i.querySelector(`canvas`),o=a.getContext(`webgl`,{antialias:!1,powerPreference:`low-power`});if(!o)return;let s=matchMedia(`(prefers-reduced-motion: reduce)`).matches,c=0,l=0,u=-1e9,d=0,f=0,p=!0,m=0,h={},g=(e,t)=>{let n=i.getBoundingClientRect();c=(e-n.left)/n.width*2-1,l=(t-n.top)/n.height*2-1,u=performance.now()};i.addEventListener(`pointermove`,e=>g(e.clientX,e.clientY)),i.addEventListener(`touchmove`,e=>g(e.touches[0].clientX,e.touches[0].clientY),{passive:!0});let _=!1,v=null,y=t=>{if(t.gamma==null||t.beta==null)return;let n=(screen.orientation?.angle??0)%180==0,r=n?t.gamma:t.beta,i=n?t.beta:t.gamma;v===null&&(v=i),v+=(i-v)*.005,c=Math.max(-1,Math.min(1,r/e.tiltX)),l=Math.max(-1,Math.min(1,(i-v)/e.tiltY)),u=performance.now(),_=!0},b=()=>addEventListener(`deviceorientation`,y);if(matchMedia(`(hover: none) and (pointer: coarse)`).matches&&`DeviceOrientationEvent`in window){let e=DeviceOrientationEvent;if(typeof e.requestPermission==`function`){let t=i.querySelector(`.tilt-hint`);t&&(t.hidden=!1);let n=()=>{e.requestPermission().then(e=>{document.removeEventListener(`click`,n),t?.classList.add(`is-hidden`),e===`granted`&&b()}).catch(()=>{})};document.addEventListener(`click`,n)}else b()}let x=(e,t)=>{let n=o.createShader(e);if(o.shaderSource(n,t),o.compileShader(n),!o.getShaderParameter(n,o.COMPILE_STATUS))throw Error(o.getShaderInfoLog(n)||`shader`);return n},S=e=>new Promise((t,n)=>{let r=new Image;r.decoding=`async`,r.onload=()=>t(r),r.onerror=n,r.src=e}),C=t=>{if(m=0,!p)return;let n=Math.min(1.5,devicePixelRatio||1),r=Math.round(i.clientWidth*n),g=Math.round(i.clientHeight*n);(a.width!==r||a.height!==g)&&(a.width=r,a.height=g,o.viewport(0,0,r,g));let v=c,y=l;t-u>(_?1e9:e.idleMs)&&(v=Math.sin(t/2400)*.85,y=Math.sin(t/3700)*.3),s&&(v=0,y=0);let b=_?.22:.08;d+=(v-d)*b,f+=(y-f)*b,o.uniform2f(h.res,r,g),o.uniform1f(h.dpr,n),o.uniform1f(h.view,d),o.uniform1f(h.vy,f),o.uniform1f(h.time,t*.001%100),o.drawArrays(o.TRIANGLES,0,3),s||(m=requestAnimationFrame(C))};(async()=>{let a=o.createProgram();o.attachShader(a,x(o.VERTEX_SHADER,n)),o.attachShader(a,x(o.FRAGMENT_SHADER,r)),o.linkProgram(a),o.useProgram(a),o.bindBuffer(o.ARRAY_BUFFER,o.createBuffer()),o.bufferData(o.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),o.STATIC_DRAW);let c=o.getAttribLocation(a,`p`);o.enableVertexAttribArray(c),o.vertexAttribPointer(c,2,o.FLOAT,!1,0,0),`tBase tOrig tSky tMask res focus dpr aspect view vy lens views time still depth`.split(` `).forEach(e=>h[e]=o.getUniformLocation(a,e));let l=await Promise.all(t.map(S));l.forEach((e,t)=>{let n=o.createTexture();o.activeTexture(o.TEXTURE0+t),o.bindTexture(o.TEXTURE_2D,n),o.texImage2D(o.TEXTURE_2D,0,o.RGB,o.RGB,o.UNSIGNED_BYTE,e),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MIN_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_MAG_FILTER,o.LINEAR),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_S,o.CLAMP_TO_EDGE),o.texParameteri(o.TEXTURE_2D,o.TEXTURE_WRAP_T,o.CLAMP_TO_EDGE)}),[`tBase`,`tOrig`,`tSky`,`tMask`].forEach((e,t)=>o.uniform1i(h[e],t)),o.uniform1f(h.aspect,l[0].naturalWidth/l[0].naturalHeight),o.uniform2f(h.focus,e.focus[0],e.focus[1]),o.uniform4f(h.depth,e.depth[0],e.depth[1],e.depth[2],e.depth[3]),o.uniform1f(h.views,e.views),o.uniform1f(h.lens,e.lens),o.uniform1f(h.still,+!!s),i.classList.add(`is-gl`),new IntersectionObserver(([e])=>{p=e.isIntersecting,p&&!m&&(m=requestAnimationFrame(C))}).observe(i),m=requestAnimationFrame(C)})().catch(e=>console.warn(`stereo-vario disabled:`,e))}var a=document.querySelector(`.hero`);a&&i(a);var o=[...document.querySelectorAll(`.hero__nav [data-spy]`)],s=o.map(e=>document.getElementById(e.dataset.spy)).filter(Boolean),c=()=>{let e=innerHeight*.4,t=``;s.forEach(n=>{let r=n.getBoundingClientRect();r.top<=e&&r.bottom>e&&(t=n.id)}),o.forEach(e=>e.classList.toggle(`is-active`,e.dataset.spy===t))};addEventListener(`scroll`,()=>requestAnimationFrame(c),{passive:!0}),c();