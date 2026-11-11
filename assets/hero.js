
(function(){
  var hdr=document.querySelector('header.site.has-img'); if(!hdr) return;
  var slides=[].slice.call(hdr.querySelectorAll('.hero-slide')), caps=[].slice.call(hdr.querySelectorAll('.cap')), dots=[].slice.call(hdr.querySelectorAll('.dot'));
  var pp=hdr.querySelector('.pp'), prevB=hdr.querySelector('.hero-arrow.prev'), nextB=hdr.querySelector('.hero-arrow.next');
  if(slides.length<2||!pp) return;
  var PAUSE=pp.innerHTML, PLAY='<svg viewBox="0 0 12 12" fill="currentColor" aria-hidden="true"><path d="M2.5 1l8 5-8 5z"/></svg>', cur=0, timer=null, playing=true, DELAY=8000;
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(n){
    n=(n+slides.length)%slides.length;
    slides[cur].classList.remove('is-active'); caps[cur].classList.remove('is-active'); dots[cur].classList.remove('is-active'); dots[cur].removeAttribute('aria-current');
    cur=n;
    slides[cur].classList.add('is-active'); caps[cur].classList.add('is-active'); dots[cur].classList.add('is-active'); dots[cur].setAttribute('aria-current','true');
  }
  function schedule(){
    clearTimeout(timer);
    if(playing&&!reduce&&!document.hidden){timer=setTimeout(function(){show(cur+1);schedule();},DELAY);}
  }
  function setPlaying(p){
    playing=p; pp.innerHTML=p?PAUSE:PLAY; pp.setAttribute('aria-label',p?'Bildwechsel anhalten':'Bildwechsel fortsetzen'); schedule();
  }
  function go(n){show(n);schedule();}
  if(prevB) prevB.addEventListener('click',function(){go(cur-1);});
  if(nextB) nextB.addEventListener('click',function(){go(cur+1);});
  dots.forEach(function(d){d.addEventListener('click',function(){go(parseInt(d.getAttribute('data-i'),10));});});
  pp.addEventListener('click',function(){setPlaying(!playing);});
  hdr.addEventListener('focusin',function(e){if(e.target.tagName==='INPUT'){clearTimeout(timer);}});
  hdr.addEventListener('focusout',function(e){if(e.target.tagName==='INPUT'){schedule();}});
  hdr.addEventListener('keydown',function(e){
    if(e.target.tagName==='INPUT') return;
    if(e.key==='ArrowLeft'){go(cur-1);}else if(e.key==='ArrowRight'){go(cur+1);}
  });
  var x0=null;
  hdr.addEventListener('touchstart',function(e){x0=e.touches[0].clientX;},{passive:true});
  hdr.addEventListener('touchend',function(e){
    if(x0===null) return; var dx=e.changedTouches[0].clientX-x0; x0=null;
    if(Math.abs(dx)>50){go(dx<0?cur+1:cur-1);}
  });
  document.addEventListener('visibilitychange',schedule);
  var m=location.hash.match(/slide=(\d+)/);
  if(m){show(parseInt(m[1],10)-1);setPlaying(false);} else if(reduce){setPlaying(false);} else {schedule();}
})();
