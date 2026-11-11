(function(){
  var B=document.body, SALT=B.getAttribute('data-salt'), ITER=parseInt(B.getAttribute('data-iter'),10), KEYNAME='bmlo_gate_key', enc=new TextEncoder();
  function fromB64(s){var bin=atob(s.trim()),a=new Uint8Array(bin.length);for(var i=0;i<bin.length;i++)a[i]=bin.charCodeAt(i);return a;}
  function toB64(a){var s='';for(var i=0;i<a.length;i++)s+=String.fromCharCode(a[i]);return btoa(s);}
  function stored(){try{return localStorage.getItem(KEYNAME)||sessionStorage.getItem(KEYNAME);}catch(e){return null;}}
  function forget(){try{localStorage.removeItem(KEYNAME);sessionStorage.removeItem(KEYNAME);}catch(e){}}
  function derive(pw){return crypto.subtle.importKey('raw',enc.encode(pw),'PBKDF2',false,['deriveBits']).then(function(base){
    return crypto.subtle.deriveBits({name:'PBKDF2',salt:fromB64(SALT),iterations:ITER,hash:'SHA-256'},base,256);}).then(function(bits){return new Uint8Array(bits);});}
  function decrypt(raw,bytes){return crypto.subtle.importKey('raw',raw,{name:'AES-GCM'},false,['decrypt']).then(function(key){
    return crypto.subtle.decrypt({name:'AES-GCM',iv:bytes.slice(0,12)},key,bytes.slice(12));}).then(function(plain){
    var ds=new DecompressionStream('deflate-raw');return new Response(new Blob([plain]).stream().pipeThrough(ds)).arrayBuffer();});}
  window.__bmlo_load=function(url){var st=stored();if(!st){return Promise.reject(new Error('nicht angemeldet'));}
    return fetch(url).then(function(r){return r.arrayBuffer();}).then(function(ab){return decrypt(fromB64(st),new Uint8Array(ab));}).then(function(b){return new TextDecoder().decode(b);});};
  function open(raw){return decrypt(raw,fromB64(document.getElementById('b').textContent)).then(function(buf){
    var html=new TextDecoder().decode(buf);document.open();document.write(html);document.close();
    if(location.hash){setTimeout(function(){var el=document.getElementById(decodeURIComponent(location.hash.slice(1)));if(el){el.scrollIntoView();}},50);}});}
  var gate=document.getElementById('gate'), msg=document.getElementById('msg'), form=document.getElementById('f');
  function show(t){gate.hidden=false;msg.textContent=t||'';var i=document.getElementById('pw');if(i){i.focus();}}
  var st=stored();
  if(st){open(fromB64(st)).catch(function(){forget();show('Bitte erneut anmelden.');});}else{show('');}
  form.addEventListener('submit',function(e){e.preventDefault();var pw=document.getElementById('pw').value;if(!pw){return;}
    msg.textContent='Wird geprüft …';
    derive(pw).then(function(raw){return open(raw).then(function(){
      var v=toB64(raw);try{if(document.getElementById('rem')&&document.getElementById('rem').checked){localStorage.setItem(KEYNAME,v);}else{sessionStorage.setItem(KEYNAME,v);}}catch(e){}
    });}).catch(function(){msg.textContent='Das Passwort stimmt nicht.';});});
})();
