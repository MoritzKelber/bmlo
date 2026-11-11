
(function(){
  var box=document.getElementById('qbox'), out=document.getElementById('res'), info=document.getElementById('info');
  if(!box) return;
  var data=null;
  function norm(s){return s.normalize('NFD').replace(/[̀-ͯ]/g,'').toLowerCase().replace(/ß/g,'ss').replace(/[^a-z0-9]+/g,' ').trim();}
  function esc(s){return s.replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]});}
  function starts(h,t){return (' '+h).indexOf(' '+t)>=0;}
  function run(){
    if(!data){return;}
    var q=norm(box.value);
    if(q.length<2){out.innerHTML='';info.textContent='Bitte mindestens zwei Zeichen eingeben.';return;}
    var toks=q.split(' '), hits=[];
    for(var i=0;i<data.length;i++){
      var d=data[i], ok=true;
      for(var j=0;j<toks.length;j++){if(!starts(d[5],toks[j])){ok=false;break;}}
      if(!ok) continue;
      var s=0, inName=true;
      for(var k=0;k<toks.length;k++){if(!starts(d[7],toks[k])){inName=false;break;}}
      if(inName) s+=2;
      if(!d[6]) s+=1;
      hits.push([s,d]);
    }
    hits.sort(function(a,b){return b[0]-a[0] || (a[1][1]<b[1][1]?-1:1);});
    var n=hits.length; hits=hits.slice(0,200);
    info.textContent=n+' Treffer'+(n>200?' (die ersten 200 werden angezeigt)':'');
    out.innerHTML=hits.map(function(h){var d=h[1];
      return '<li class="'+(d[6]?'stub':'')+'"><span class="n"><a href="p/'+d[0]+'.html">'+esc(d[1])+'</a></span><span class="y">'+esc(d[2])+'</span><span class="i">'+esc([d[3],d[4]].filter(Boolean).join(' · '))+'</span></li>';}).join('');
  }
  var p=new URLSearchParams(location.search); if(p.get('q')) box.value=p.get('q');
  var load=window.__bmlo_load?window.__bmlo_load('assets/search-index.json.enc').then(JSON.parse):fetch('assets/search-index.json').then(function(r){return r.json();});
  load.then(function(d){data=d;run();});
  box.addEventListener('input',run);
  document.getElementById('qform').addEventListener('submit',function(e){e.preventDefault();run();});
})();
