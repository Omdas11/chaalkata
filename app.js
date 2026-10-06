/* SA-IMD Prep — daily MCQs, practice, PYQ bank, notes. All client-side. */
const EXAM_DATE = new Date('2026-11-02T09:00:00+05:30');
const PER_SECTION_DAILY = 5;
/* Supabase backend (optional): fill these in to enable cloud saves + leaderboard.
   Leave empty for offline-only mode (progress stays in this browser). */
const SB_URL = 'https://uvtqofsjyzwfoifxsnhu.supabase.co';
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV2dHFvZnNqeXp3Zm9pZnhzbmh1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1OTIwNTcsImV4cCI6MjEwNjE2ODA1N30.PyZto65x9RXpgk4g4KJ6jzKagaOxKbVnSF9xJRkjuIg';
let MCQ = [], FLASH = [], NOTES = {};

/* ---------- utils ---------- */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
function seedFrom(str){let h=2166136261;for(let i=0;i<str.length;i++){h^=str.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
function shuffle(arr,rng){const a=arr.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a}
function todayStr(d){d=d||new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')}
function esc(s){return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;')}
const store={
  get(){try{return JSON.parse(localStorage.getItem('saimd')||'{}')}catch(e){return{}}},
  set(v){localStorage.setItem('saimd',JSON.stringify(v))}
};
const SECNAME={physics:'Physics',reasoning:'Reasoning',ga:'General Awareness'};
const PROV={original:'original options',reconstructed:'reconstructed options','verified-seed':'verified'};
const LETTERS=['A','B','C','D'];

/* ---------- header ---------- */
function renderHeader(){
  const days=Math.max(0,Math.ceil((EXAM_DATE-new Date())/86400000));
  document.getElementById('countdown').textContent='📝 '+days+' days to Paper-I';
  const s=store.get();
  document.getElementById('streak').textContent='🔥 '+(s.streak||0);
}

/* ---------- tabs ---------- */
document.getElementById('tabs').addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  document.querySelectorAll('#tabs button').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  document.querySelectorAll('#tabs button').forEach(x=>{
    document.getElementById('tab-'+x.dataset.tab).hidden=(x!==b);
  });
  if(b.dataset.tab==='ranks')renderRanks();
});

/* ---------- quiz engine ---------- */
function shuffledOptions(q,rng){
  const idx=q.options.map((_,i)=>i);
  const order=shuffle(idx,rng);
  return {options:order.map(i=>q.options[i]), answer:order.indexOf(q.answer)};
}
function runQuiz(containerId,questions,title,onDone){
  const el=document.getElementById(containerId);
  let i=0,score=0;const results=[];
  const rng=mulberry32(seedFrom(title+Date.now()));
  const qs=questions.map(q=>({...q,...shuffledOptions(q,rng)}));
  function render(){
    if(i>=qs.length){finish();return}
    const q=qs[i];
    el.innerHTML=`<div class="card"><div class="progress"><div style="width:${(i/qs.length)*100}%"></div></div>
      <div class="q-meta"><span class="tag">${esc(SECNAME[q.section]||q.section)}</span><span class="tag plain">${esc(q.topic)}</span>${q.source?`<span class="tag plain">${esc(q.source)}</span>`:''}${q.options_kind?`<span class="tag">${PROV[q.options_kind]||esc(q.options_kind)}</span>`:''}</div>
      <div class="q-text">Q${i+1} · ${esc(q.question)}</div>
      <div class="opts">${q.options.map((o,k)=>`<button class="opt" data-k="${k}"><span class="letter">${LETTERS[k]||''}</span><span>${esc(o)}</span></button>`).join('')}</div>
      <div class="explain" hidden></div>
      <button class="btn" data-next hidden>Next →</button></div>`;
    const card=el.firstElementChild;
    card.querySelectorAll('.opt').forEach(b=>b.addEventListener('click',()=>{
      card.querySelectorAll('.opt').forEach(x=>x.disabled=true);
      const k=+b.dataset.k, ok=(k===q.answer);
      if(ok){score++;b.classList.add('correct')}else{b.classList.add('wrong');card.querySelectorAll('.opt')[q.answer].classList.add('reveal-correct')}
      results.push({q,ok,picked:k});
      const ex=card.querySelector('.explain');
      ex.innerHTML='<b>'+(ok?'Correct ✓':'Not quite')+'</b> — '+esc(q.explanation||'');
      ex.hidden=false;card.querySelector('[data-next]').hidden=false;
    }));
    card.querySelector('[data-next]').addEventListener('click',()=>{i++;render()});
  }
  function finish(){
    el.innerHTML=`<div class="card center"><h3>${esc(title)}</h3><div class="score-big">${score} / ${qs.length}</div>
      <p class="small">${score===qs.length?'Perfect — flawless.':score>=qs.length*0.7?'Strong. Review the misses below.':'Review the misses below — that\'s where the marks are.'}</p>
      <button class="btn" data-retry>Retry</button></div>`+
      results.filter(r=>!r.ok).map(r=>`<div class="card"><div class="q-text">${esc(r.q.question)}</div>
        <div class="small">You picked: ${esc(r.q.options[r.picked])}</div>
        <div class="small" style="color:#1a9e50">Correct: ${esc(r.q.options[r.q.answer])}</div>
        <div class="explain">${esc(r.q.explanation||'')}</div></div>`).join('');
    el.querySelector('[data-retry]').addEventListener('click',()=>runQuiz(containerId,questions,title,onDone));
    if(onDone)onDone(score,qs.length);
  }
  render();
}

/* ---------- today ---------- */
function buildDaily(){
  const rng=mulberry32(seedFrom('daily'+todayStr()));
  let pool=[];
  ['physics','reasoning','ga'].forEach(sec=>{
    const qs=shuffle(MCQ.filter(q=>q.section===sec),rng);
    pool=pool.concat(qs.slice(0,PER_SECTION_DAILY));
  });
  return shuffle(pool,rng);
}
function renderToday(){
  const el=document.getElementById('tab-today');
  const s=store.get();const t=todayStr();
  const done=s.history&&s.history[t]&&s.history[t].done;
  const daily=buildDaily();
  const n=daily.length;
  const counts={physics:0,reasoning:0,ga:0};
  daily.forEach(q=>{if(counts[q.section]!==undefined)counts[q.section]++});
  const rows=[['physics','Physics'],['reasoning','Reasoning'],['ga','General Awareness']]
    .map(([k,l],ix)=>`<div class="sec-row"><span class="num">${ix+1}</span><span class="lbl">${l}</span><span class="cnt">${counts[k]} Qs</span></div>`).join('');
  el.innerHTML=`
    <div class="hero">
      <span class="live">● Live set</span>
      <h2>Today's MCQs</h2>
      <p class="sub">${t} · ${n} questions · answers with explanations</p>
      ${rows}
      ${done?`<p class="sub" style="margin:8px 0 0">✅ Done today — ${s.history[t].score}/${s.history[t].total}. Come back tomorrow for a fresh set.</p>`:''}
      <button class="btn" id="${done?'redo':'start'}">${done?'Redo anyway':'Start ('+n+' Qs)'}</button>
    </div>
    <div class="card"><h3>How it works</h3><p class="small">A fresh seeded set every day from the solved PYQ bank. Finish it to grow your streak 🔥. Explanations appear after each answer.</p></div>`;
  const start=()=>runQuiz('tab-today',buildDaily(),"Today's MCQs",(score,total)=>{
    const st=store.get();st.history=st.history||{};
    st.history[t]={done:true,score,total};
    let streak=0;const d=new Date();
    while(true){const ds=todayStr(d);if(st.history[ds]&&st.history[ds].done){streak++;d.setDate(d.getDate()-1)}else break}
    st.streak=streak;st.lastDone=t;store.set(st);renderHeader();
    saveAttempt({date:t,kind:'daily',score,total});
  });
  const sb=document.getElementById('start');if(sb)sb.addEventListener('click',start);
  const rd=document.getElementById('redo');if(rd)rd.addEventListener('click',start);
}

/* ---------- practice ---------- */
function renderPractice(){
  const el=document.getElementById('tab-practice');
  const secs=[...new Set(MCQ.map(q=>q.section))];
  el.innerHTML=`<div class="card"><h3>Practice by topic</h3>
    <div class="field"><label>Section</label><select id="p-sec">${secs.map(s=>`<option value="${s}">${SECNAME[s]||s}</option>`).join('')}</select></div>
    <div class="field"><label>Topic</label><select id="p-topic"></select></div>
    <button class="btn big" id="p-go">Start (10 Qs)</button></div><div id="p-quiz"></div>`;
  const secSel=el.querySelector('#p-sec'),topSel=el.querySelector('#p-topic');
  function fillTopics(){
    const topics=[...new Set(MCQ.filter(q=>q.section===secSel.value).map(q=>q.topic))].sort();
    topSel.innerHTML=topics.map(t=>`<option>${esc(t)}</option>`).join('');
  }
  secSel.addEventListener('change',fillTopics);fillTopics();
  el.querySelector('#p-go').addEventListener('click',()=>{
    const pool=MCQ.filter(q=>q.section===secSel.value&&q.topic===topSel.value);
    const rng=mulberry32(seedFrom('p'+Date.now()));
    const sec=secSel.value,topic=topSel.value;
    runQuiz('p-quiz',shuffle(pool,rng).slice(0,10),`${SECNAME[sec]} · ${topic}`,(score,total)=>{
      saveAttempt({date:todayStr(),kind:'practice',section:sec,topic,score,total});
    });
    document.getElementById('p-quiz').scrollIntoView({behavior:'smooth'});
  });
}

/* ---------- bank ---------- */
function renderBank(){
  const el=document.getElementById('tab-bank');
  const secs=['all',...new Set([...MCQ.map(q=>q.section),...FLASH.map(q=>q.section)])];
  const topics=['all',...new Set([...MCQ.map(q=>q.topic)])].sort();
  let fSec='all',fType='all';
  el.innerHTML=`<div class="card"><h3>PYQ Bank</h3>
    <div class="searchbar"><input type="text" id="b-q" placeholder="Search questions…"></div>
    <div class="chiprow" id="b-secs">${secs.map(s=>`<button class="fchip${s==='all'?' active':''}" data-v="${s}">${s==='all'?'All':(SECNAME[s]||s)}</button>`).join('')}</div>
    <div class="chiprow" id="b-types">${[['all','MCQ + Flashcards'],['mcq','MCQ only'],['flash','Flashcards only']].map(([v,l],i)=>`<button class="fchip${i===0?' active':''}" data-v="${v}">${l}</button>`).join('')}</div>
    <div class="field"><label>Topic</label><select id="b-topic">${topics.map(t=>`<option value="${t}">${t==='all'?'All topics':esc(t)}</option>`).join('')}</select></div>
    </div>
    <div id="b-list"></div><div class="center"><button class="btn secondary" id="b-more" hidden>Show more</button></div>`;
  let shown=0;const PAGE=20;
  function items(){
    const topic=el.querySelector('#b-topic').value,q=el.querySelector('#b-q').value.toLowerCase();
    let arr=[];
    if(fType!=='flash')arr=arr.concat(MCQ.map(x=>({...x,_t:'mcq'})));
    if(fType!=='mcq')arr=arr.concat(FLASH.map(x=>({...x,_t:'flash'})));
    return arr.filter(x=>(fSec==='all'||x.section===fSec)&&(topic==='all'||x.topic===topic)&&(!q||x.question.toLowerCase().includes(q)));
  }
  function draw(){
    const arr=items();const list=el.querySelector('#b-list');
    list.innerHTML=arr.slice(0,shown).map(x=>{
      if(x._t==='mcq')return `<div class="qcard"><div class="q-meta"><span class="tag">${esc(SECNAME[x.section])}</span><span class="tag plain">${esc(x.topic)}</span>${x.source?`<span class="tag plain">${esc(x.source)}</span>`:''}<span class="tag">${PROV[x.options_kind]||'official key'}</span></div>
        <div class="q-text">${esc(x.question)}</div>
        <details><summary>Show answer ▾</summary><div class="explain"><b>${esc(x.options[x.answer])}</b><br>${esc(x.explanation||'')}</div></details></div>`;
      return `<div class="flip" data-flip><div class="q-meta"><span class="tag">${esc(SECNAME[x.section])}</span><span class="tag">official key</span></div>
        <div class="q-text">${esc(x.question)}</div><div class="ans" hidden>${esc(x.answer_text)}</div><div class="hint">tap to reveal answer</div></div>`;
    }).join('')||'<div class="card">No matches.</div>';
    list.querySelectorAll('[data-flip]').forEach(f=>f.addEventListener('click',()=>{
      const a=f.querySelector('.ans');a.hidden=!a.hidden;f.querySelector('.hint').textContent=a.hidden?'tap to reveal answer':'';
    }));
    el.querySelector('#b-more').hidden=shown>=arr.length;
  }
  shown=PAGE;draw();
  el.querySelector('#b-topic').addEventListener('change',()=>{shown=PAGE;draw()});
  el.querySelector('#b-q').addEventListener('input',()=>{shown=PAGE;draw()});
  function chips(id,fn){
    el.querySelector(id).addEventListener('click',e=>{
      const b=e.target.closest('.fchip');if(!b)return;
      el.querySelectorAll(id+' .fchip').forEach(x=>x.classList.remove('active'));
      b.classList.add('active');fn(b.dataset.v);shown=PAGE;draw();
    });
  }
  chips('#b-secs',v=>fSec=v);
  chips('#b-types',v=>fType=v);
  el.querySelector('#b-more').addEventListener('click',()=>{shown+=PAGE;draw()});
}

/* ---------- notes ---------- */
function renderNotes(){
  const el=document.getElementById('tab-notes');
  const names={physics:'Physics (Paper-I + II)',reasoning:'Reasoning',ga:'General Awareness'};
  el.innerHTML=Object.keys(NOTES).map(sec=>`<div class="notes-group"><h3>${names[sec]||sec}</h3>`+
    NOTES[sec].map(n=>`<details class="note"><summary>${esc(n.topic)}${n.weight?`<span class="weight">${esc(n.weight)}</span>`:''}</summary>`+
      n.points.map(p=>`<div class="note-pt">${esc(p)}</div>`).join('')+`</details>`).join('')+`</div>`).join('');
}

/* ---------- supabase backend (optional cloud saves + leaderboard) ---------- */
let sb=null,sbUser=null,sbName=null;
const sbReady=()=>!!(sb&&sbUser);
function initBackend(){
  const el=document.getElementById('auth');
  const sc=document.createElement('script');
  sc.src='https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
  sc.onload=async()=>{
    sb=window.supabase.createClient(SB_URL,SB_KEY);
    const {data}=await sb.auth.getSession();
    setUser(data.session&&data.session.user?data.session.user:null);
    sb.auth.onAuthStateChange((_ev,s)=>setUser(s&&s.user?s.user:null));
  };
  sc.onerror=()=>{el.innerHTML='<span class="small">backend unreachable — offline mode</span>'};
  document.head.appendChild(sc);
  el.innerHTML='<span id="sb-form"><input id="sb-email" type="email" placeholder="Email for sign-in link" autocomplete="email"><span id="hc-box"></span><button class="btn secondary" id="signinbtn">Send link</button></span>';
  el.querySelector('#signinbtn').addEventListener('click',signIn);
  loadHCaptcha();
}
let hcToken=null;
function loadHCaptcha(){
  const render=()=>{
    if(!window.hcaptcha||!document.getElementById('hc-box')||document.getElementById('hc-box').dataset.done)return;
    document.getElementById('hc-box').dataset.done='1';
    window.hcaptcha.render(document.getElementById('hc-box'),{
      sitekey:'6af2681a-cac2-4d4a-85da-b79a5d5057b8',theme:'light',
      callback:t=>{hcToken=t},'expired-callback':()=>{hcToken=null},'error-callback':()=>{hcToken=null}
    });
  };
  if(window.hcaptcha){render();return}
  const s=document.createElement('script');
  s.src='https://js.hcaptcha.com/1/api.js?render=explicit';s.async=true;s.defer=true;s.onload=render;
  document.head.appendChild(s);
}
async function signIn(){
  const emEl=document.getElementById('sb-email');
  const email=(emEl&&emEl.value||'').trim();
  if(!email||email.indexOf('@')<0){alert('Enter your email address first.');return}
  if(window.hcaptcha&&!hcToken){alert('Please complete the captcha checkbox first.');return}
  const btn=document.getElementById('signinbtn');btn.disabled=true;btn.textContent='Sending…';
  const {error}=await sb.auth.signInWithOtp({email,options:{emailRedirectTo:location.href,captchaToken:hcToken||undefined}});
  btn.disabled=false;btn.textContent='Send link';
  if(error){alert('Error: '+error.message);return}
  alert('Check your email for the sign-in link, then reopen the site.');
  hcToken=null;
}
async function setUser(u){
  sbUser=u;
  const el=document.getElementById('auth');
  if(!u){
    sbName=null;
    el.innerHTML='<span id="sb-form"><input id="sb-email" type="email" placeholder="Email for sign-in link" autocomplete="email"><span id="hc-box"></span><button class="btn secondary" id="signinbtn">Send link</button></span>';
    el.querySelector('#signinbtn').addEventListener('click',signIn);
    hcToken=null;loadHCaptcha();
    return;
  }
  const {data:prof}=await sb.from('saimd_profiles').select('display_name').eq('id',u.id).single();
  let name=prof&&prof.display_name;
  if(!name){
    name=prompt('Pick a display name for the leaderboard:')||u.email.split('@')[0];
    name=name.trim().slice(0,24)||u.email.split('@')[0];
    await sb.from('saimd_profiles').upsert({id:u.id,display_name:name});
  }
  sbName=name;
  el.innerHTML='<span class="small">👤 '+esc(name)+'</span> <button class="btn secondary" id="signoutbtn">Sign out</button>';
  el.querySelector('#signoutbtn').addEventListener('click',()=>{sbName=null;sb.auth.signOut()});
  pullCloud();
}
async function saveAttempt(a){
  if(!sbReady())return;
  await sb.from('saimd_attempts').insert({
    user_id:sbUser.id,quiz_date:a.date,kind:a.kind,
    section:a.section||null,topic:a.topic||null,
    score:a.score,total:a.total,answers:a.answers||null
  });
}
async function pullCloud(){
  if(!sbReady())return;
  const {data}=await sb.from('saimd_attempts').select('quiz_date,score,total,kind').eq('user_id',sbUser.id).order('quiz_date');
  if(!data||!data.length)return;
  const st=store.get();st.history=st.history||{};
  data.forEach(r=>{if(r.kind==='daily'&&!st.history[r.quiz_date])st.history[r.quiz_date]={done:true,score:r.score,total:r.total}});
  let streak=0;const d=new Date();
  while(true){const ds=todayStr(d);if(st.history[ds]&&st.history[ds].done){streak++;d.setDate(d.getDate()-1)}else break}
  st.streak=streak;store.set(st);renderHeader();renderToday();
}
async function renderRanks(){
  const el=document.getElementById('tab-ranks');
  if(!sbReady()){
    el.innerHTML='<div class="card"><h3>Leaderboard</h3><p class="small">Sign in (top of the page) to save your progress to the cloud and appear on the leaderboard with other users.</p></div>';
    return;
  }
  el.innerHTML='<div class="card"><h3>Leaderboard</h3><p class="small">Loading…</p></div>';
  const {data,error}=await sb.rpc('saimd_leaderboard');
  el.innerHTML='<div class="card"><h3>Leaderboard</h3>'+((error||!data||!data.length)
    ?'<p class="small">No scores yet — finish a quiz to take the top spot.</p>'
    :'<ol style="padding-left:20px">'+data.map(r=>`<li style="padding:4px 0"><b>${esc(r.display_name)}</b> — ${r.total_score} pts · ${r.quizzes} quizzes</li>`).join('')+'</ol>')+'</div>';
}

/* ---------- boot ---------- */
Promise.all([
  fetch('data/mcq.json').then(r=>r.json()).catch(()=>[]),
  fetch('data/flashcards.json').then(r=>r.json()).catch(()=>[]),
  fetch('data/notes.json').then(r=>r.json()).catch(()=>({}))
]).then(([mcq,flash,notes])=>{
  MCQ=mcq.filter(q=>!q.skipped);FLASH=flash;NOTES=notes;
  renderHeader();renderToday();renderPractice();renderBank();renderNotes();
  initBackend();
});
