(() => {
  'use strict';
  const d=window.GUIDE, app=document.getElementById('app');
  const esc=x=>String(x).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icons={
    guide:'<path d="m3 5 6-2 6 2 6-2v16l-6 2-6-2-6 2zM9 3v16M15 5v16"/>',
    search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
    checklist:'<rect x="5" y="4" width="14" height="17" rx="2"/><path d="M9 4V2h6v2m-6 8 2 2 4-4"/>',
    help:'<circle cx="12" cy="12" r="9"/><path d="M12 7v6m0 3v1"/>',
    arrow:'<path d="M5 12h14m-5-5 5 5-5 5"/>',
    back:'<path d="M19 12H5m5-5-5 5 5 5"/>',
    sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5M17.5 17.5 19 19M5 19l1.5-1.5M17.5 6.5 19 5"/>',
    wave:'<path d="M2 8q3 4 6 0t6 0 6 0M2 15q3 4 6 0t6 0 6 0"/>'
  };
  const icon=n=>'<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(icons[n]||icons.guide)+'</svg>';
  const label={country:'До въезда в Таиланд',phuket:'Пхукет',pattaya:'Паттайя'};
  const scopeURL=s=>s==='country'?'#country':'#resort/'+s;
  const articleById=new Map(d.articles.map(a=>[a.id,a]));
  const key='tatakomotako.thailand.checklist.v3';
  const checkIds=new Set(d.checklist.flatMap(g=>g.items.map(i=>i[0])));
  let saved={},storageAvailable=true,toastTimer;
  try{
    const raw=localStorage.getItem(key);
    const old=raw??localStorage.getItem('tatakomotako.thailand.checklist.v2')??localStorage.getItem('tatakomotako.pattaya.checklist.v1');
    const parsed=JSON.parse(old||'{}');
    if(parsed&&typeof parsed==='object'&&!Array.isArray(parsed))for(const [id,value] of Object.entries(parsed))if(checkIds.has(id)&&value===true)saved[id]=true;
  }catch{storageAvailable=false;}
  const persist=()=>{try{localStorage.setItem(key,JSON.stringify(saved));storageAvailable=true;}catch{storageAvailable=false;}};
  const done=()=>[...checkIds].filter(id=>saved[id]===true).length;
  const materialPlural=new Intl.PluralRules('ru');
  const materialCount=n=>n+' '+({one:'материал',few:'материала',many:'материалов',other:'материала'}[materialPlural.select(n)]);
  const route=()=>{let hash=location.hash.slice(1)||'guide';const cut=hash.indexOf('?');return {path:cut<0?hash:hash.slice(0,cut),params:new URLSearchParams(cut<0?'':hash.slice(cut+1))};};
  const heading=(title,summary,eyebrow='ГИД В КАРМАНЕ')=>'<header class="page-heading"><p class="eyebrow">'+esc(eyebrow)+'</p><h1>'+esc(title)+'</h1>'+(summary?'<p class="lead">'+esc(summary)+'</p>':'')+'</header>';
  const back=(url,text)=>'<a class="back" href="'+esc(url)+'">'+icon('back')+esc(text)+'</a>';
  const navItems=[['guide','Таиланд'],['search','Поиск'],['checklist','Сборы'],['help','Помощь']];
  function nav(){
    const path=route().path;
    const current=navItems.some(n=>n[0]===path)?path:'guide';
    const html=navItems.map(([id,text])=>'<a href="#'+id+'"'+(current===id?' aria-current="page"':'')+'>'+icon(id)+'<span>'+text+'</span>'+(id==='checklist'?'<small>'+done()+'/'+checkIds.size+'</small>':'')+'</a>').join('');
    document.querySelector('.desktop-nav').innerHTML=html;
    document.querySelector('.bottom-nav').innerHTML=html;
  }
  function articleCard(a){
    return '<a class="article-preview" href="#article/'+a.id+'"><div><span class="mini-label">'+esc(label[a.scope])+'</span><h3>'+esc(a.title)+'</h3><p>'+esc(a.summary)+'</p></div>'+icon('arrow')+'</a>';
  }
  function home(){
    return '<section class="home-hero"><img src="assets/phuket-nai-harn.jpg" alt="Песчаный пляж Най Харн на юге Пхукета" width="1200" height="800" fetchpriority="high"><div class="hero-shade"></div><div class="hero-copy"><p class="eyebrow">TATAKOMOTAKO / ГИД В КАРМАНЕ</p><h1>Таиланд</h1><p>Ваше первое путешествие. <br>Всё по порядку.</p><span class="hero-tag">'+icon('sun')+' Пхукет и Паттайя</span></div><span class="photo-place">Най Харн · Пхукет</span></section>'+
      '<div class="section-heading"><div><p class="eyebrow">С ЧЕГО НАЧНЁМ?</p><h2>Выберите свой маршрут</h2></div><p>Сначала освоимся в стране. <br>Потом выберем пляжи и планы на день.</p></div>'+
      '<div class="destination-grid">'+
      '<a class="destination-card" href="#resort/phuket"><div class="card-image"><img src="assets/phuket-kata.jpg" alt="Бухта Ката на Пхукете" width="700" height="500" loading="lazy"><span>АНДАМАНСКОЕ МОРЕ</span></div><div class="card-copy"><div class="card-title"><h2>Пхукет</h2>'+icon('arrow')+'</div><p>Пляжи по побережьям, острова, смотровые и маршруты.</p><small>От Май Кхао до Най Харна</small></div></a>'+
      '<a class="destination-card" href="#resort/pattaya"><div class="card-image"><img src="assets/pattaya-bay.jpg" alt="Городская бухта Паттайи" width="700" height="500" loading="lazy"><span>СИАМСКИЙ ЗАЛИВ</span></div><div class="card-copy"><div class="card-title"><h2>Паттайя</h2>'+icon('arrow')+'</div><p>Районы, Ко Лан, красивые места, еда и городской транспорт.</p><small>Город и островной день</small></div></a>'+
      '<a class="destination-card country-card" href="#country"><div class="country-graphic" aria-hidden="true">'+icon('guide')+'<span>ПЕРЕД ПОЕЗДКОЙ</span><strong>Сначала <br>о главном.</strong></div><div class="card-copy"><div class="card-title"><h2>Что нужно знать <br>до въезда</h2>'+icon('arrow')+'</div><p>Документы, ввоз и вывоз, законы, деньги и погода по месяцам.</p><small>Общие правила Таиланда</small></div></a></div>'+
      '<div class="host-note"><span class="host-avatar">Т</span><div><p><strong>Я Таня, ваш турагент.</strong> Собрала этот гид, чтобы в путешествии было меньше вопросов и больше отдыха.</p><a href="https://t.me/Tatakomotako" target="_blank" rel="noopener noreferrer">Написать мне в Telegram ↗</a></div></div>';
  }
  function scopePage(scope){
    const common=scope==='country';
    let html=back('#guide','Таиланд')+heading(common?'Что нужно знать о стране до въезда':label[scope],common?'Давайте спокойно соберёмся: разберёмся с документами, чемоданом, деньгами и местными правилами.':scope==='phuket'?'Начнём с вашего пляжа, потом выберем острова, прогулки и места для красивого дня.':'Разберёмся, где жить, как ездить по городу, где поесть и как устроить день на Ко Лане.','ТАИЛАНД / '+(common?'ГОТОВИМСЯ К ПОЕЗДКЕ':'ВЫБИРАЕМ ВПЕЧАТЛЕНИЯ'));
    if(!common)html+='<div class="resort-banner"><img src="assets/'+(scope==='phuket'?'phuket-kata':'pattaya-bay')+'.jpg" alt="'+(scope==='phuket'?'Ката, Пхукет':'Бухта Паттайи')+'" width="1400" height="650"><span>'+icon('wave')+(scope==='phuket'?'Андаманское море · остров':'Сиамский залив · материковый город')+'</span></div>';
    html+='<div class="topic-grid">'+d.groups[scope].map(([id,title,summary],i)=>{
      const arts=d.articles.filter(a=>a.scope===scope&&a.group===id);
      const url=arts.length===1?'#article/'+arts[0].id:'#chapter/'+scope+'/'+id;
      return '<a class="topic-card" href="'+url+'"><span class="topic-number">'+String(i+1).padStart(2,'0')+'</span><h2>'+esc(title)+'</h2><p>'+esc(summary)+'</p><span class="topic-bottom">'+materialCount(arts.length)+icon('arrow')+'</span></a>';
    }).join('')+'</div>';
    return html;
  }
  function chapter(scope,group){
    const meta=d.groups[scope]?.find(x=>x[0]===group);
    if(!meta)return missing();
    return back(scopeURL(scope),label[scope])+heading(meta[1],meta[2],label[scope])+'<div class="article-list">'+d.articles.filter(a=>a.scope===scope&&a.group===group).map(articleCard).join('')+'</div>';
  }
  function article(id){
    const a=articleById.get(id);if(!a)return missing();
    const siblings=d.articles.filter(x=>x.scope===a.scope&&x.group===a.group);
    const group=d.groups[a.scope].find(x=>x[0]===a.group);
    const parent=siblings.length>1?'#chapter/'+a.scope+'/'+a.group:scopeURL(a.scope);
    const holder=document.createElement('div');holder.innerHTML=a.body;
    const titles=[...holder.querySelectorAll('h2')];
    titles.forEach((e,i)=>e.id='part-'+i);
    const toc=titles.length>2?'<nav class="article-toc" aria-label="В этой статье"><strong>В этой статье</strong>'+titles.map((e,i)=>'<button type="button" data-jump="part-'+i+'">'+esc(e.textContent)+'</button>').join('')+'</nav>':'';
    const next=siblings.filter(x=>x.id!==id);
    return back(parent,siblings.length>1?group[1]:label[a.scope])+'<div class="article-layout"><article class="reading">'+heading(a.title,a.summary,label[a.scope]+' / '+group[1])+'<div class="article-body">'+holder.innerHTML+'</div><div class="article-end"><p>Остались вопросы по вашей поездке?</p><a class="button" href="https://t.me/Tatakomotako" target="_blank" rel="noopener noreferrer">Спросить Таню ↗</a></div></article><aside class="article-aside">'+toc+'<div class="aside-context"><span class="mini-label">'+esc(label[a.scope])+'</span><a href="'+scopeURL(a.scope)+'">Все темы раздела '+icon('arrow')+'</a></div></aside></div>'+(next.length?'<section class="related"><h2>Дальше в этой главе</h2>'+next.map(articleCard).join('')+'</section>':'');
  }
  const normalize=s=>s.toLocaleLowerCase('ru').replace(/ё/g,'е').replace(/денег|деньг(?:ами|ах|ам|и)?/g,'деньг');
  const textIndex=d.articles.map(a=>{let e=document.createElement('div');e.innerHTML=a.body;return {a,text:normalize(a.title+' '+a.summary+' '+a.keywords+' '+label[a.scope]+' '+e.textContent)};});
  function search(q){
    const stop=new Set(['и','в','во','на','с','со','из','к','как','какой','какие','какая','что','где','для','сколько','стоит','это','ли','можно','мне']);
    let terms=normalize(q).match(/[\p{L}\d]+/gu)||[];
    terms=terms.filter(t=>!stop.has(t)).map(t=>t.length>5?t.slice(0,-2):t);
    if(!terms.length)return [];
    const matches=textIndex.map(x=>({a:x.a,score:terms.reduce((n,t)=>n+(x.text.includes(t)?1:0)+(normalize(x.a.title).includes(t)?3:0)+(normalize(x.a.keywords).includes(t)?2:0),0),hits:terms.filter(t=>x.text.includes(t)).length}));
    const exact=matches.filter(x=>x.hits===terms.length);
    return (exact.length?exact:matches.filter(x=>x.hits>0)).sort((a,b)=>b.score-a.score).map(x=>x.a);
  }
  function searchPage(){
    const q=route().params.get('q')?.slice(0,200)||'';
    return heading('Найти в гиде','Например: «вейп», «обмен денег», «Ката» или «такси Паттайя».')+'<form class="search-form" role="search"><label for="guide-search">Ваш вопрос или тема</label><div>'+icon('search')+'<input id="guide-search" type="search" placeholder="Что хотите узнать?" maxlength="200" autocomplete="off" value="'+esc(q)+'"><button type="button" data-clear aria-label="Очистить поиск">×</button></div></form><p class="search-count" id="search-status" role="status" aria-live="polite"></p><div id="search-results" class="article-list"></div>';
  }
  function updateResults(q){
    const target=document.getElementById('search-results');if(!target)return;
    const results=search(q);document.getElementById('search-status').textContent=q.trim()?'Найдено материалов: '+results.length:'Можно искать по всему Таиланду, Пхукету и Паттайе.';
    target.innerHTML=!q.trim()?'<div class="search-suggestions">'+['Ввоз и вывоз','Законы','Обмен денег','Погода','Такси','Ко Лан'].map(q=>'<button type="button" data-query="'+esc(q)+'">'+esc(q)+'</button>').join('')+'</div>':results.length?results.map(articleCard).join(''):'<div class="empty"><h2>Попробуйте короче</h2><p>Укажите название места или одну тему, например «лекарства» или «Пхукет».</p><a href="https://t.me/Tatakomotako" target="_blank" rel="noopener noreferrer">Спросить Таню ↗</a></div>';
  }
  function checklist(){
    return heading('Спокойные сборы','Отмечайте готовое. Список сохраняется в этом браузере.')+'<div class="check-progress"><strong id="progress-text">'+done()+' из '+checkIds.size+' готово</strong><progress id="check-progress" max="'+checkIds.size+'" value="'+done()+'">'+done()+'</progress></div><p id="storage-notice" class="storage-notice"'+(storageAvailable?' hidden':'')+'>Браузер не сохраняет отметки между открытиями. В этой вкладке список продолжит работать.</p>'+d.checklist.map(g=>'<section class="check-group"><h2>'+esc(g.title)+'</h2>'+g.items.map(([id,t])=>'<label class="check-row"><input type="checkbox" data-check="'+id+'"'+(saved[id]?' checked':'')+'><span>'+esc(t)+'</span></label>').join('')+'</section>').join('')+'<button class="button secondary" type="button" data-reset>Снять все отметки</button>';
  }
  function updateChecks(){
    for(const el of app.querySelectorAll('[data-check]'))el.checked=!!saved[el.dataset.check];
    const t=document.getElementById('progress-text');if(t)t.textContent=done()+' из '+checkIds.size+' готово';
    const progress=document.getElementById('check-progress');if(progress)progress.value=done();
    const notice=document.getElementById('storage-notice');if(notice)notice.hidden=storageAvailable;
    nav();
  }
  function help(){
    return heading('Помощь рядом','При угрозе жизни звоните в экстренную службу сразу.')+
      '<div class="help-grid">'+[['1669','Скорая помощь','Медицинская экстренная ситуация'],['191','Полиция','Угроза безопасности и происшествия'],['1155','Туристическая полиция','Помощь туристам, общение и происшествия']].map(([tel,title,sub])=>'<a href="tel:'+tel+'" class="help-card"><span>'+esc(title)+'</span><strong>'+tel+'</strong><p>'+esc(sub)+'</p><small>Позвонить '+icon('arrow')+'</small></a>').join('')+'</div>'+
      '<div class="reading help-reading"><h2>Что сказать оператору</h2><ol><li>Где вы: название отеля, улица, ориентир или точка на карте.</li><li>Что произошло, сколько людей нуждаются в помощи, есть ли угроза жизни.</li><li>Ваш номер телефона для обратной связи. При необходимости попросите персонал отеля помочь с переводом.</li></ol><h2>Если нужна медицинская помощь</h2><p>Свяжитесь с ассистансом из вашего страхового полиса. Он подскажет клинику и порядок оплаты. В экстренной ситуации сначала вызывайте помощь, затем уведомляйте страховщика. Сохраняйте чеки и документы.</p><h2>Если потерян паспорт</h2><p>Обратитесь в полицию для фиксации утраты и свяжитесь с консульством вашей страны. Для российского гражданина порядок возвращения определит российское консульское учреждение. Копия паспорта и фотография штампа помогут восстановить сведения, но не заменят проездной документ.</p><h2>Если потерялся ребёнок</h2><p>Сразу обратитесь к персоналу площадки или отеля и полиции, покажите актуальную фотографию, сообщите одежду и последнее место, где видели ребёнка. Один из сопровождающих должен оставаться в согласованной точке.</p><div class="host-note"><span class="host-avatar">Т</span><div><p>С вопросами по туру, трансферу и отелю — пишите мне.</p><a href="https://t.me/Tatakomotako" target="_blank" rel="noopener noreferrer">Таня · Tatakomotako ↗</a></div></div></div>';
  }
  function missing(){return heading('Этот раздел не найден','Откройте главную и выберите нужную тему.')+'<a class="button" href="#guide">К Таиланду</a>';}
  function render(scroll=false){
    const {path}=route();const [kind,a,b]=path.split('/');
    if(kind==='guide')app.innerHTML=home();
    else if(kind==='country')app.innerHTML=scopePage('country');
    else if(kind==='resort'&&['phuket','pattaya'].includes(a))app.innerHTML=scopePage(a);
    else if(kind==='chapter')app.innerHTML=chapter(a,b);
    else if(kind==='article')app.innerHTML=article(a);
    else if(kind==='search'){app.innerHTML=searchPage();updateResults(document.getElementById('guide-search').value);}
    else if(kind==='checklist')app.innerHTML=checklist();
    else if(kind==='help')app.innerHTML=help();
    else app.innerHTML=missing();
    nav();document.title=(app.querySelector('h1')?.textContent||'Таиланд')+' · Tatakomotako';
    if(scroll){window.scrollTo({top:0,behavior:'instant'});document.getElementById('main').focus({preventScroll:true});}
  }
  app.addEventListener('input',e=>{
    if(e.target.id!=='guide-search')return;
    const q=e.target.value.slice(0,200);updateResults(q);
    history.replaceState(null,'','#search'+(q?'?q='+encodeURIComponent(q):''));
  });
  app.addEventListener('submit',e=>{if(e.target.matches('.search-form'))e.preventDefault();});
  app.addEventListener('change',e=>{const id=e.target.dataset.check;if(!checkIds.has(id))return;saved[id]=e.target.checked;persist();updateChecks();});
  app.addEventListener('click',e=>{
    const jump=e.target.closest('[data-jump]');if(jump){document.getElementById(jump.dataset.jump)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});return;}
    const query=e.target.closest('[data-query]');const clear=e.target.closest('[data-clear]');
    if(query||clear){const input=document.getElementById('guide-search');input.value=query?.dataset.query||'';input.dispatchEvent(new Event('input',{bubbles:true}));input.focus();return;}
    if(e.target.closest('[data-reset]')){const dialog=document.getElementById('reset-dialog');dialog.returnValue='cancel';if(typeof dialog.showModal==='function')dialog.showModal();else if(confirm('Снять все отметки в чек-листе?'))reset();}
  });
  function reset(){saved={};persist();updateChecks();const t=document.getElementById('toast');t.textContent='Отметки сняты';t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),2500);}
  document.getElementById('reset-dialog').addEventListener('close',e=>{if(e.target.returnValue==='reset')reset();});
  window.addEventListener('hashchange',()=>render(true));
  render();
  // Optional browser integration. All ordinary browser functionality is independent of it.
  const context=document.modelContext||navigator.modelContext;
  if(context?.registerTool){
    const controller=new AbortController();
    const tools=[
      {name:'search_travel_guide',title:'Найти в гиде',description:'Search the Thailand guide without changing state.',inputSchema:{type:'object',properties:{query:{type:'string',maxLength:200}},required:['query'],additionalProperties:false},annotations:{readOnlyHint:true},execute(input){if(typeof input?.query!=='string'||input.query.length>200)throw Error('Expected query up to 200 characters');return search(input.query).map(a=>({id:a.id,title:a.title,summary:a.summary,scope:a.scope}));}},
      {name:'get_travel_checklist',title:'Прочитать чек-лист',description:'Read this browser checklist.',inputSchema:{type:'object',properties:{},additionalProperties:false},annotations:{readOnlyHint:true},execute(){return {done:done(),total:checkIds.size,items:d.checklist.flatMap(g=>g.items.map(([id,text])=>({id,text,checked:!!saved[id]})))};}},
      {name:'set_travel_checklist_items',title:'Изменить отметки',description:'Set specified checklist items in this browser. Does not submit documents or book travel.',inputSchema:{type:'object',properties:{items:{type:'array',minItems:1,maxItems:20,items:{type:'object',properties:{id:{type:'string'},checked:{type:'boolean'}},required:['id','checked'],additionalProperties:false}}},required:['items'],additionalProperties:false},execute(input){if(!Array.isArray(input?.items)||input.items.length<1||input.items.length>20)throw Error('Expected 1–20 items');const seen=new Set();for(const x of input.items){if(!checkIds.has(x.id)||typeof x.checked!=='boolean'||seen.has(x.id))throw Error('Invalid checklist item');seen.add(x.id);}for(const x of input.items)saved[x.id]=x.checked;persist();history.replaceState(null,'','#checklist');render(true);return {done:done(),total:checkIds.size,persisted:storageAvailable};}}
    ];
    for(const tool of tools)try{Promise.resolve(context.registerTool(tool,{signal:controller.signal})).catch(()=>{});}catch{}
    window.addEventListener('pagehide',()=>controller.abort(),{once:true});
  }
})();
