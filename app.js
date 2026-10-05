/* Vidya Setu Master App — defensive, modular, event-delegated frontend.
   Supabase is an optional data/auth layer: UI navigation remains functional if CDN/network fails. */
(() => {
"use strict";

const C = window.V2_CONFIG || {};
const state = {
  route: "home", user: null, profile: null, session: null, supabase: null, connected: false,
  classes: [], subjects: [], chapters: [], resources: [], applications: [], teacherContent: [], publicTeacherContent: [], teacherFiles: [], teacherApplication: null, communityDataLoading:false, communityDataLoaded:false, boards: [], educationMediums: [], boardMediums: [], boardCurriculum: [], manualBoardCurriculum: [],
  quizIndex: 0, quizScore: 0, quizAnswered: false, quizData: [],
  local: { classes: [], subjects: [], chapters: [], resources: [] },
  academicSections: [],
  futureContent: [],
  learningActivity: [], progressCount: 0, bookmarkCount: 0,
  fileManager: {bucket:"chapter-content", prefix:"", search:"", page:0, files:[], folders:[]},
  authMode: "student",
  customization: {social:{...(C.social||{})}},
  aiTutorHistory: [
    { sender: "bot", text: "👋 Hello! I am your **Vidya AI Tutor**, powered by **Google Gemini**.\n\nI can assist you with:\n1. 🎓 **CSVTU CSE Semester 1–8** (Syllabus, Core Concepts, PYQs & Solutions)\n2. 💻 **General Coding & Tech** (DSA, C++, Python, Java, Web Dev, OS, DBMS, Networks)\n3. 🌐 **Multilingual Answers** (English, हिंदी, Hinglish)\n4. 🎙️ **Voice Input** — Ask your doubt by voice anytime!\n\nWhat would you like to learn or debug today?", time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) }
  ],
  aiTutorMode: "doubts",
  aiTutorLoading: false,
  aiTutorVoiceActive: false,
  lastFailedMessage: ""
};

function apiUrl(path){
  const base=String(C.apiBaseUrl||"").replace(/\/$/,"");
  return `${base}${String(path||"").startsWith("/")?path:`/${path||""}`}`;
}

function apiHeaders(extra={}){
  const headers={...extra};
  const token=state.session?.access_token;
  if(token) headers.Authorization=`Bearer ${token}`;
  return headers;
}

async function apiFetch(path,options={}){
  return fetch(apiUrl(path),{
    ...options,
    headers:apiHeaders(options.headers||{})
  });
}

const DEFAULT_SOCIAL = Object.freeze({
  website: C.social?.website || C.website || "https://www.v2edduverse.com/",
  app: C.social?.app || C.app || "https://play.google.com/store/apps/details?id=co.alexis.koklj",
  youtube: C.social?.youtube || C.youtube || "https://youtube.com/@v2edduverse",
  instagram: C.social?.instagram || C.instagram || "https://www.instagram.com/v2edduverse",
  facebook: C.social?.facebook || C.facebook || "https://www.facebook.com/share/1EjNJFcpC/",
  whatsapp: C.social?.whatsapp || C.whatsapp || "https://wa.me/919517706666",
  location: C.social?.location || C.location || "https://maps.app.goo.gl/s49gmvY7Fi8LdgmkA?g_st=ac"
});

const SOCIAL_META = {
  website:{label:"Website",icon:"globe",img:"qr-web.svg",accent:"#2b78ff"},
  app:{label:"Android App",icon:"play",img:"qr-app.svg",accent:"#35a85a"},
  youtube:{label:"YouTube",icon:"youtube",img:"qr-youtube.svg",accent:"#ff0033"},
  instagram:{label:"Instagram",icon:"instagram",img:"qr-instagram.svg",accent:"#e1306c"},
  facebook:{label:"Facebook",icon:"facebook",img:"qr-facebook.svg",accent:"#1877f2"},
  whatsapp:{label:"WhatsApp",icon:"whatsapp",img:"qr-whatsapp.svg",accent:"#25d366"},
  location:{label:"Location",icon:"location",img:"qr-location.svg",accent:"#f4511e"}
};

const DEFAULT_ACADEMIC_SECTIONS = Object.freeze([
  {id:"school",name:"School (Classes 6–12)",icon:"📚",description:"Complete CBSE & State curriculum with class → subject → chapter learning.",route:"classes",sort_order:1,is_system:true},
  {id:"college",name:"College & Coding Hub",icon:"💻",description:"B.Tech, BCA, MCA Coding Notes, DSA, Full-Stack, DBMS, OS, Computer Networks & AI.",route:"college-coding",sort_order:2,is_system:true},
  {id:"ai-tutor",name:"Interactive AI Tutor",icon:"🤖",description:"AI Code Debugger, College & School Doubt Solver, Concept Simplifier & Interview Prep.",route:"ai-tutor",sort_order:3,is_system:true},
  {id:"other",name:"Other Resources",icon:"📂",description:"Special collections, projects, reference material and interactive simulations.",route:"academic",sort_order:4,is_system:true}
]);

const localSlug = s => String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");

function buildLocalCatalog(){
  const catalog=window.V2_CURRICULUM?.classes||[];
  const classes=catalog.map((c,i)=>({id:`local-class-${c.class_number}`,class_number:c.class_number,name:c.name,sort_order:i+1}));
  const subjects=[]; const chapters=[];
  for(const c of catalog){
    const classId=`local-class-${c.class_number}`;
    for(const s of (c.subjects||[])){
      const sid=`local-subject-${c.class_number}-${localSlug(s.name)}`;
      subjects.push({id:sid,class_id:classId,name:s.name,sort_order:s.sort_order});
      (s.chapters||[]).forEach((ch,i)=>{
        const isLive=c.class_number===10 && s.name==='Science' && String(ch.title).startsWith('Light – Reflection and Refraction');
        chapters.push({
          id:`local-chapter-${c.class_number}-${localSlug(s.name)}-${i+1}`,
          subject_id:sid,title:ch.title,slug:ch.slug,description:isLive?'Interactive Digital Classroom chapter — connected first live chapter.':'Digital Classroom slot reserved. Content will appear after Admin connects the chapter HTML.',
          status:isLive?'published':'coming_soon',
          classroom_html_path:isLive?'chapters/class10/science/light-reflection.html':null,
          sort_order:i+1
        });
      });
    }
  }
  const live=chapters.find(x=>x.status==='published');
  const resources=live?[{id:'local-resource-light-youtube',chapter_id:live.id,resource_type:'video',title:'Add your YouTube lecture from Admin',url:'https://www.youtube.com/'}]:[];
  state.local={classes,subjects,chapters,resources};
}

function localFutureContent(){
  try{const raw=localStorage.getItem("v2edduverse_future_content"); if(raw){const a=JSON.parse(raw); if(Array.isArray(a)) return a;}}catch(e){}
  return [{id:"future-engineering",area:"Engineering",program:"B.Tech",course:"Engineering Mechanics",module:"Module 1",title:"Engineering Mechanics — Module 1",status:"coming_soon",content_type:"html",html_url:"",youtube_url:"",external_url:"",description:"Future engineering content slot — ready for your chapter HTML."}];
}
state.futureContent=localFutureContent();

async function loadFutureContent(){
  const fallback=localFutureContent();
  if(!state.supabase||!state.connected){state.futureContent=fallback;return;}
  try{const {data,error}=await state.supabase.from("future_content").select("*").order("created_at",{ascending:false});
    state.futureContent=(!error&&Array.isArray(data))?data:fallback;
  }catch(e){state.futureContent=fallback;}
}

function futureById(id){return state.futureContent.find(x=>String(x.id)===String(id));}

async function loadBoardSystem(){
  if(!state.supabase||!state.connected){
    state.boards=[];state.educationMediums=[];state.boardMediums=[];return;
  }
  try{
    const [b,m,bm]=await Promise.all([
      state.supabase.from("boards").select("*").order("sort_order",{ascending:true}).order("name",{ascending:true}),
      state.supabase.from("education_mediums").select("*").order("sort_order",{ascending:true}).order("name",{ascending:true}),
      state.supabase.from("board_mediums").select("*")
    ]);
    state.boards=(!b.error&&Array.isArray(b.data))?b.data:[];
    state.educationMediums=(!m.error&&Array.isArray(m.data))?m.data:[];
    state.boardMediums=(!bm.error&&Array.isArray(bm.data))?bm.data:[];
  }catch(e){
    console.warn("Board/medium load skipped",e);
    state.boards=[];state.educationMediums=[];state.boardMediums=[];
  }
}

async function loadPublicTeacherContent(){
  if(!state.supabase){state.publicTeacherContent=[];return;}
  try{
    const {data,error}=await state.supabase.from("teacher_content").select("*").eq("status","published").order("updated_at",{ascending:false});
    if(error){console.warn("Public teacher content load:",error.message);state.publicTeacherContent=[];return;}
    state.publicTeacherContent=Array.isArray(data)?data:[];
  }catch(e){state.publicTeacherContent=[];}
}

function boardMediumMatrix(){
  const boards=sortByName(state.boards.filter(b=>b.is_active!==false));
  const mediums=sortByName(state.educationMediums.filter(m=>m.is_active!==false),["native_name","name"]);
  return boards.map(b=>{
    const mapped=sortByName(mediumsForBoard(b.id),["native_name","name"]);
    return {board:b,mediums:mapped.length?mapped:[],mappedIds:new Set(mapped.map(m=>String(m.id)))};
  });
}

function renderAcademicBoardMediums(){
  const rows=boardMediumMatrix();
  const allMediums=sortByName(state.educationMediums.filter(m=>m.is_active!==false),["native_name","name"]);
  const totalPublished=(state.publicTeacherContent||[]).length;
  return `<section class="academic-board-medium-section">
    <div class="section-head"><div><div class="eyebrow">BOARD & MEDIUM LIBRARY</div><h2>🏫 All Boards • 🌐 All Mediums / Languages</h2><p class="muted">Choose an education board and medium. All active boards and all active languages are visible here; future boards/languages added by Admin appear automatically.</p></div><span class="badge live">${rows.length} Boards • ${allMediums.length} Mediums</span></div>
    <div class="content-filter-panel"><div class="content-filter-grid">
      <div class="field"><label>Board</label><select id="academicBoardSelect" class="select"><option value="">All Boards</option>${rows.map(r=>`<option value="${esc(r.board.id)}">${esc(r.board.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Medium / Language</label><select id="academicMediumSelect" class="select"><option value="">All Mediums / Languages</option>${allMediums.map(m=>`<option value="${esc(m.id)}">${esc(m.native_name||m.name)}</option>`).join("")}</select></div>
      <div class="field"><label>Search Board</label><input id="academicBoardSearch" class="input" placeholder="Search board or state…"></div>
    </div></div>
    <div id="academicBoardMediumGrid" class="grid academic-board-medium-grid" style="margin-top:16px">${renderAcademicBoardMediumGrid()}</div>
    <div id="boardCurriculumBrowser" style="margin-top:22px">${renderBoardCurriculumBrowser()}</div>
    ${totalPublished?`<div class="section-head" style="margin-top:24px"><div><h3>📚 Published Teacher Content</h3><p class="muted">Published content tagged with a Board/Medium appears here.</p></div></div><div id="academicPublishedTeacherContent" class="grid">${renderAcademicPublishedContent()}</div>`:""}
  </section>`;
}

function renderAcademicBoardMediumGrid(){
  const boardId=String($("#academicBoardSelect")?.value||window.__academicBoardId||"");
  const mediumId=String($("#academicMediumSelect")?.value||window.__academicMediumId||"");
  const q=String($("#academicBoardSearch")?.value||window.__academicBoardSearch||"").toLowerCase().trim();
  const rows=boardMediumMatrix().filter(r=>
    (!boardId || String(r.board.id)===boardId) &&
    (!q||`${r.board.name} ${r.board.short_name||""} ${r.board.code||""} ${r.board.state_name||""}`.toLowerCase().includes(q))
  );
  return rows.map(r=>{
    const mediums=r.mediums.filter(m=>!mediumId||String(m.id)===mediumId);
    return card(`🏫 ${esc(r.board.name)}`,`<p class="muted">${esc(r.board.state_name||"National / Regional")} • ${esc(r.board.short_name||r.board.code||"")}</p>
      <div class="academic-medium-pills">${mediums.map(m=>`<button class="academic-medium-pill ${r.mappedIds.has(String(m.id))?'mapped':''}" data-academic-board="${esc(r.board.id)}" data-academic-medium="${esc(m.id)}" title="${r.mappedIds.has(String(m.id))?'Configured mapping':'Available medium'}">${esc(m.native_name||m.name)}${r.mappedIds.has(String(m.id))?' ✓':''}</button>`).join("")}</div>`,
      `<button class="btn primary" data-academic-board="${esc(r.board.id)}" data-academic-medium="">Explore Board</button>`);
  }).join("")||`<div class="empty"><h3>No board found</h3><p>Try another search or select All Boards.</p></div>`;
}

function renderAcademicPublishedContent(){
  const boardId=String($("#academicBoardSelect")?.value||window.__academicBoardId||"");
  const mediumId=String($("#academicMediumSelect")?.value||window.__academicMediumId||"");
  const list=(state.publicTeacherContent||[]).filter(c=>
    (!boardId||String(c.board_id)===boardId)&&(!mediumId||String(c.medium_id)===mediumId)
  );
  return list.map(c=>teacherContentCard(c,false)).join("")||`<div class="empty"><p>No published teacher content is tagged for this selection yet.</p></div>`;
}

function boardById(id){return state.boards.find(x=>String(x.id)===String(id));}
function mediumById(id){return state.educationMediums.find(x=>String(x.id)===String(id));}
function mediumsForBoard(boardId){
  const ids=new Set(state.boardMediums.filter(x=>String(x.board_id)===String(boardId)&&x.is_active!==false).map(x=>String(x.medium_id)));
  return state.educationMediums.filter(x=>ids.has(String(x.id)));
}
function boardMediumChecked(boardId,mediumId){
  return state.boardMediums.some(x=>String(x.board_id)===String(boardId)&&String(x.medium_id)===String(mediumId)&&x.is_active!==false);
}
function slugCode(value){return String(value||"").trim().toUpperCase().replace(/[^A-Z0-9]+/g,"_").replace(/^_+|_+$/g,"").slice(0,40);}

function localAcademicSections(){
  try{
    const raw=localStorage.getItem("v2edduverse_academic_sections");
    const custom=raw?JSON.parse(raw):[];
    const byId=new Map(DEFAULT_ACADEMIC_SECTIONS.map(x=>[x.id,{...x}]));
    (Array.isArray(custom)?custom:[]).forEach(x=>byId.set(String(x.id),{...x}));
    return [...byId.values()].sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0));
  }catch(e){return DEFAULT_ACADEMIC_SECTIONS.map(x=>({...x}));}
}
state.academicSections=localAcademicSections();

async function loadAcademicSections(){
  const fallback=localAcademicSections();
  if(!state.supabase||!state.connected){state.academicSections=fallback;return;}
  try{
    const {data,error}=await state.supabase.from("academic_sections").select("*").eq("is_active",true).order("sort_order",{ascending:true});
    if(error||!Array.isArray(data)||!data.length){state.academicSections=fallback;return;}
    const byId=new Map(DEFAULT_ACADEMIC_SECTIONS.map(x=>[x.id,{...x}]));
    data.forEach(x=>byId.set(String(x.id),x));
    state.academicSections=[...byId.values()].sort((a,b)=>Number(a.sort_order||0)-Number(b.sort_order||0));
  }catch(e){state.academicSections=fallback;}
}

function academicSectionById(id){return state.academicSections.find(x=>String(x.id)===String(id));}

function mergeCurriculum(remoteClasses=[],remoteSubjects=[],remoteChapters=[],remoteResources=[]){
  const local=state.local;
  const classes=local.classes.map(l=>{
    const r=remoteClasses.find(x=>Number(x.class_number)===Number(l.class_number));
    return r||l;
  });

  const subjects=local.subjects.map(l=>{
    const localClass=local.classes.find(c=>String(c.id)===String(l.class_id));
    const classNumber=Number(localClass?.class_number);
    const remoteSubject=remoteSubjects.find(x=>{
      if(String(x.name||"").trim().toLowerCase()!==String(l.name||"").trim().toLowerCase()) return false;
      const remoteClass=remoteClasses.find(c=>String(c.id)===String(x.class_id));
      return Number(remoteClass?.class_number)===classNumber;
    });
    return remoteSubject||{
      ...l,
      class_id:classes.find(c=>Number(c.class_number)===classNumber)?.id||l.class_id
    };
  });

  const chapters=local.chapters.map(l=>{
    const localSubject=local.subjects.find(s=>String(s.id)===String(l.subject_id));
    const localClass=local.classes.find(c=>String(c.id)===String(localSubject?.class_id));
    const classNumber=Number(localClass?.class_number);
    const subjectName=String(localSubject?.name||"").trim().toLowerCase();

    const mergedSubject=subjects.find(s=>{
      if(String(s.name||"").trim().toLowerCase()!==subjectName) return false;
      const subjectClass=classes.find(c=>String(c.id)===String(s.class_id));
      return Number(subjectClass?.class_number)===classNumber;
    });

    const normalizeChapterText=v=>String(v||"").normalize("NFKC").replace(/[–—−]/g,"-").replace(/\s+/g," ").trim().toLowerCase();
    const localTitle=normalizeChapterText(l.title);
    const localSlug=normalizeChapterText(l.slug);

    const remoteChapter=remoteChapters.find(x=>{
      const rs=remoteSubjects.find(s=>String(s.id)===String(x.subject_id));
      if(!rs) return false;
      if(normalizeChapterText(rs.name)!==subjectName) return false;
      const rc=remoteClasses.find(c=>String(c.id)===String(rs.class_id));
      if(Number(rc?.class_number)!==classNumber) return false;
      const remoteTitle=normalizeChapterText(x.title);
      const remoteSlug=normalizeChapterText(x.slug);
      return (remoteTitle===localTitle || remoteSlug===localSlug || remoteTitle.includes(localTitle) || localTitle.includes(remoteTitle));
    });

    if(remoteChapter) return remoteChapter;

    return {
      ...l,
      subject_id:mergedSubject?.id||l.subject_id
    };
  });

  const resources=[...remoteResources];
  const liveLocal=chapters.find(c=>String(c.slug)==='light-reflection');
  if(liveLocal && !resources.some(r=>String(r.chapter_id)===String(liveLocal.id))){
    resources.push({
      id:'local-resource-light-youtube',
      chapter_id:liveLocal.id,
      resource_type:'video',
      title:'Add your YouTube lecture from Admin',
      url:'https://www.youtube.com/'
    });
  }

  state.classes=classes;
  state.subjects=subjects;
  state.chapters=chapters;
  state.resources=resources;
}

const $ = (s,root=document)=>root.querySelector(s);
const $$ = (s,root=document)=>Array.from(root.querySelectorAll(s));
const esc = (v)=>String(v??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const slugify = s => String(s||"").toLowerCase().trim().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"");
const youtubeId = url => {
  const s=String(url||""); const m=s.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
  return m?m[1]:null;
};
const toast = (msg)=>{const r=$("#toastRoot"); if(!r)return; const d=document.createElement("div");d.className="toast";d.textContent=msg;r.appendChild(d);setTimeout(()=>d.remove(),3200)};

function status(text,kind){const b=$("#connectionBadge");if(b){b.textContent=text;b.className="status-pill "+kind}}
function role(){return state.profile?.role||"student"}
function roleLabel(){const r=role();return r==="admin"?"Administrator":r==="teacher"?"Teacher":"Student"}
function isAdmin(){return role()==="admin"}
function isTeacher(){return role()==="teacher"||isAdmin()}

function closeMobileSidebar(){
  const sidebar=$("#sidebar");
  const backdrop=$("#sidebarBackdrop");
  const menu=$("#mobileMenuBtn");
  sidebar?.classList.remove("open");
  backdrop?.classList.add("hidden");
  menu?.setAttribute("aria-expanded","false");
  menu?.setAttribute("title","Open menu");
}

function toggleMobileSidebar(){
  const sidebar=$("#sidebar");
  const backdrop=$("#sidebarBackdrop");
  const menu=$("#mobileMenuBtn");
  if(!sidebar)return;
  const open=sidebar.classList.toggle("open");
  if(open)backdrop?.classList.remove("hidden"); else backdrop?.classList.add("hidden");
  menu?.setAttribute("aria-expanded",String(open));
  menu?.setAttribute("title",open?"Close menu":"Open menu");
}

function setRoute(r){
  closeMobileSidebar();
  if(r==="admin"&&!isAdmin()){authModal("admin");return}
  if(r==="teacher"&&!state.user){authModal("teacher");return}
  state.route=r;
  updateChrome();
  render();
  window.scrollTo({top:0,behavior:"smooth"});
}

async function initSupabase(){
  if(!window.supabase?.createClient){status("Offline UI mode","offline");return}
  try{
    state.supabase=window.supabase.createClient(C.supabaseUrl,C.supabasePublishableKey,{
      auth:{autoRefreshToken:true,persistSession:true,detectSessionInUrl:true}
    });
    state.connected=true; status("Supabase connected","online");
    const {data:{session}}=await state.supabase.auth.getSession();
    await applySession(session);
    state.supabase.auth.onAuthStateChange(async(_event,session2)=>{
      await applySession(session2);
    });
  }catch(e){state.connected=false;status("Connection issue","error");}
}

async function applySession(session){
  state.session=session||null;
  state.user=session?.user||null;
  if(state.user){
    await loadProfile();
  }else{
    state.profile=null;
  }
  updateChrome();
  await loadCoreData();
  await loadAcademicSections();
  await loadBoardSystem();
  await loadBoardCurriculum();
  await loadManualBoardCurriculum();
  await loadPublicTeacherContent();
  await loadFutureContent();
  await loadRemoteCustomization();
  if(state.route==="profile"&&!state.user) state.route="home";
  render();
}

async function loadProfile(){
  if(!state.supabase||!state.user)return;
  const {data,error}=await state.supabase.from("profiles").select("*").eq("id",state.user.id).maybeSingle();
  if(error) return;
  state.profile=data||null;
}

async function loadCoreData(){
  if(!state.supabase||!state.connected){
    mergeCurriculum([],[],[],[]);
    return;
  }
  const fetchTable=async(table)=>{
    const {data,error}=await state.supabase.from(table).select("*");
    if(error) return [];
    return Array.isArray(data)?data:[];
  };
  const [classes,subjects,chapters,resources]=await Promise.all([
    fetchTable("classes"),fetchTable("subjects"),fetchTable("chapters"),fetchTable("chapter_resources")
  ]);
  mergeCurriculum(classes,subjects,chapters,resources);
}

async function loadBoardCurriculum(){
  if(!state.supabase){state.boardCurriculum=[];return;}
  const {data,error}=await state.supabase.from("board_curriculum").select("id,board_id,medium_id,class_id,subject_id,chapter_id,is_active,sort_order,classes:class_id(id,class_number,name),subjects:subject_id(id,name,class_id),chapters:chapter_id(id,title,slug,status,description,classroom_html_path,sort_order)").eq("is_active",true).order("sort_order",{ascending:true});
  if(error){state.boardCurriculum=[];return;}
  state.boardCurriculum=(data||[]).map(x=>({...x,class:x.classes,subject:x.subjects,chapter:x.chapters}));
}

async function loadManualBoardCurriculum(){
  if(!state.supabase){state.manualBoardCurriculum=[];return;}
  const {data,error}=await state.supabase.from("board_curriculum_items").select("*").order("board_id",{ascending:true}).order("medium_id",{ascending:true}).order("class_name",{ascending:true}).order("sort_order",{ascending:true});
  if(error){state.manualBoardCurriculum=[];return;}
  state.manualBoardCurriculum=Array.isArray(data)?data:[];
}

function naturalText(v=""){
 return String(v??"").toLocaleLowerCase("en-IN").normalize("NFKD").replace(/\s+/g," ").trim();
}
function naturalCompare(a,b){
 const aa=naturalText(a),bb=naturalText(b);
 return aa.localeCompare(bb,"en-IN",{numeric:true,sensitivity:"base"});
}
function sortByName(list,nameKeys=["name"]){
 return [...(list||[])].sort((a,b)=>{
   const ao=Number(a?.sort_order),bo=Number(b?.sort_order);
   if(Number.isFinite(ao)&&Number.isFinite(bo)&&ao!==bo)return ao-bo;
   for(const k of nameKeys){
     const c=naturalCompare(a?.[k],b?.[k]);
     if(c)return c;
   }
   return String(a?.id??"").localeCompare(String(b?.id??""));
 });
}

function getClasses(){return sortByName(state.classes.length?state.classes:state.local.classes)}
function getSubjects(){return sortByName(state.subjects.length?state.subjects:state.local.subjects)}
function getChapters(){return [...(state.chapters.length?state.chapters:state.local.chapters)].sort((a,b)=>{const ao=Number(a?.sort_order),bo=Number(b?.sort_order);if(Number.isFinite(ao)&&Number.isFinite(bo)&&ao!==bo)return ao-bo;return naturalCompare(a?.title,b?.title)})}
function getResources(){return [...(state.resources.length?state.resources:state.local.resources)].sort((a,b)=>{const ao=Number(a?.sort_order),bo=Number(b?.sort_order);if(Number.isFinite(ao)&&Number.isFinite(bo)&&ao!==bo)return ao-bo;return naturalCompare(a?.title||a?.name,b?.title||b?.name)})}

function classNameById(id){return getClasses().find(x=>String(x.id)===String(id))?.name||"Class"}
function subjectById(id){return getSubjects().find(x=>String(x.id)===String(id))}
function chaptersForSubject(id){
 const exact=getChapters().filter(x=>String(x.subject_id)===String(id));
 if(exact.length)return exact;
 const s=subjectById(id);
 if(!s)return [];
 return getChapters().filter(x=>naturalText(subjectById(x.subject_id)?.name)===naturalText(s.name));
}
function resourcesForChapter(id){return getResources().filter(x=>String(x.chapter_id)===String(id))}

function updateChrome(){
  const displayName=String(state.profile?.full_name||state.user?.email||"Guest").trim();
  const displayRole=state.user?roleLabel():"Not signed in";
  const avatarUrl=String(state.profile?.avatar_url||"").trim();
  const initial=displayName.slice(0,1).toUpperCase()||"V";

  const a=$("#avatarInitial");
  if(a)a.textContent=initial;

  const sidebarName=$("#sidebarProfileName");
  const sidebarRole=$("#sidebarProfileRole");
  const sidebarImg=$("#sidebarProfileAvatar");
  const sidebarInitial=$("#sidebarProfileInitial");
  if(sidebarName)sidebarName.textContent=displayName;
  if(sidebarRole)sidebarRole.textContent=displayRole;
  if(sidebarInitial)sidebarInitial.textContent=initial;

  if(sidebarImg){
    if(avatarUrl){
      sidebarImg.src=avatarUrl;
      sidebarImg.classList.remove("hidden");
      if(sidebarInitial)sidebarInitial.classList.add("hidden");
    }else{
      sidebarImg.removeAttribute("src");
      sidebarImg.classList.add("hidden");
      if(sidebarInitial)sidebarInitial.classList.remove("hidden");
    }
  }

  $$(".admin-only").forEach(x=>x.classList.toggle("hidden",!isAdmin()));
  $$(".teacher-only").forEach(x=>x.classList.toggle("hidden",!(isTeacher())));
  $$(".student-only").forEach(x=>x.classList.toggle("hidden",!(state.user&&!isTeacher()&&!isAdmin())));
  $$(".nav-item").forEach(x=>x.classList.toggle("active",x.dataset.route===state.route));
  const loginBtn=$("#loginPortalBtn");
  if(loginBtn)loginBtn.classList.toggle("hidden",!!state.user);
}

function layout(content){return `<div class="section">${content}</div>`}
function card(title,body,actions=""){return `<article class="card">${title?`<h3>${title}</h3>`:""}${body}${actions?`<div class="toolbar" style="margin-top:12px">${actions}</div>`:""}</article>`}
function statusBadge(s){return `<span class="badge ${s==="published"?"live":s==="coming_soon"?"soon":"draft"}">${esc(s==="published"?"LIVE":s==="coming_soon"?"COMING SOON":s)}</span>`}

function render(){
  updateChrome();
  const main=$("#main"); if(!main)return;
  try{
    const views={
      home:renderHome,
      classes:renderClasses,
      academic:renderAcademicSection,
      future:renderFutureContent,
      subject:renderSubject,
      chapter:renderChapter,
      profile:renderProfile,
      teacher:renderTeacher,
      admin:renderAdmin,
      questionbank:renderQuestionBank,
      quiz:renderQuiz,
      whiteboard:renderWhiteboard,
      resources:renderResources,
      social:renderSocial,
      community:renderCommunity,
      "help-support":renderHelpSupport,
      "learning-studio":renderStudentLearningStudio,
      "college-coding":renderCollegeCodingHub,
      "coding-note":renderCodingNoteDetail,
      "ai-tutor":renderAITutorView
    };
    const view=views[state.route]||renderHome;
    const result=view();
    if(typeof result==="string"){
      main.innerHTML=result;
    }
  }catch(e){
    console.error(e);
    main.innerHTML=`<div class="empty"><h2>Vidya Setu UI</h2><p>${esc(e.message)}</p><button class="btn primary" data-route="home">Return Home</button></div>`;
  }
}

function socialLinks(){return {...DEFAULT_SOCIAL,...(state.customization?.social||{})}}
function socialIcon(name){
 const common='viewBox="0 0 24 24" aria-hidden="true"';
 if(name==='youtube') return `<svg ${common}><rect x="3" y="6" width="18" height="12" rx="3" fill="currentColor"/><path d="M10 9l5 3-5 3z" fill="#07101d"/></svg>`;
 if(name==='facebook') return `<svg ${common}><circle cx="12" cy="12" r="10" fill="currentColor"/><path d="M13.4 7.2h2V4.1c-.35-.05-1.55-.15-2.95-.15-2.92 0-4.92 1.78-4.92 5.05v2.82H4.2v3.48h3.33V20.2h4.1v-4.9h3.2l.51-3.48h-3.71V9.35c0-1 .27-2.15 1.77-2.15z" fill="#07101d"/></svg>`;
 if(name==='instagram') return `<svg ${common}><rect x="3.2" y="3.2" width="17.6" height="17.6" rx="5" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="12" r="4" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="17.5" cy="6.7" r="1.2" fill="currentColor"/></svg>`;
 if(name==='whatsapp') return `<svg ${common}><path d="M12 3.1a8.8 8.8 0 0 0-7.58 13.28L3.1 20.9l4.7-1.25A8.8 8.8 0 1 0 12 3.1z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M8.5 8.2c.25-.55.55-.58.9-.58h.52c.18 0 .42.07.52.38l.67 1.62c.1.25.05.45-.08.62l-.5.62c-.13.16-.17.32-.05.53.25.45.84 1.45 1.83 2.3 1.16 1 2.1 1.32 2.4 1.43.3.1.48.08.66-.12l.76-.87c.18-.21.4-.26.67-.14l1.52.71c.27.13.45.2.52.31.07.12.07.67-.17 1.28-.24.61-1.4 1.17-1.92 1.2-.49.03-1.12.2-3.66-.83-3.08-1.25-5.05-4.3-5.2-4.5-.15-.2-1.24-1.65-1.24-3.15 0-1.5.77-2.23 1.05-2.55z" fill="currentColor"/></svg>`;
 if(name==='location') return `<svg ${common}><path d="M12 21s6-5.33 6-11a6 6 0 1 0-12 0c0 5.67 6 11 6 11z" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="12" cy="10" r="2.2" fill="currentColor"/></svg>`;
 if(name==='play') return `<svg ${common}><path d="M6 3.8h8.6a5.4 5.4 0 0 1 0 10.8H10l-3.8 3v-3.1A5.4 5.4 0 0 1 6 3.8z" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M11 6.8l4 2.9-4 2.9z" fill="currentColor"/></svg>`;
 return `<svg ${common}><circle cx="12" cy="12" r="9.2" fill="none" stroke="currentColor" stroke-width="1.8"/><path d="M2.8 12h18.4M12 2.8c2.2 2.5 3.3 5.57 3.3 9.2S14.2 18.7 12 21.2c-2.2-2.5-3.3-5.57-3.3-9.2S9.8 5.3 12 2.8z" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`;
}
function socialButton(key,compact=false){const m=SOCIAL_META[key], url=socialLinks()[key]||''; return `<a class="social-btn ${compact?'social-compact':''}" href="${esc(url)}" target="_blank" rel="noopener noreferrer" style="--social-accent:${m.accent}" aria-label="Open ${m.label}"><span class="social-icon">${socialIcon(m.icon)}</span><span>${m.label}</span></a>`}
function socialHub(){return `<section class="social-hub"><div class="section-head"><div><div class="eyebrow">CONNECT WITH VIDYA SETU</div><h2>Explore Our Official Pages</h2><p class="muted">Open the official Vidya Setu website, app, YouTube, Instagram, Facebook, WhatsApp or location.</p></div></div><div class="social-buttons">${Object.keys(SOCIAL_META).map(k=>socialButton(k)).join('')}</div><div class="social-qr-grid">${Object.keys(SOCIAL_META).map(k=>{const m=SOCIAL_META[k];return `<a class="social-qr" href="${esc(socialLinks()[k]||'')}" target="_blank" rel="noopener noreferrer"><img src="assets/${m.img}" alt="${m.label} QR"><strong>${m.label}</strong><span>Tap / Scan to open ↗</span></a>`}).join('')}</div></section>`}
function footer(){return `<div class="footer"><div class="footer-social"><strong>Vidya Setu</strong><span>•</span><span>Learn - Teach - Explore</span></div><div class="small">Supabase-connected features require internet. Chapter HTML files can be opened locally.</div></div>`}
function chapterCards(list){
 if(!list.length)return `<div class="empty">No chapters yet. The platform curriculum is ready for Admin publishing.</div>`;
 return `<div class="grid">${list.map(c=>{
   const live=c.status==='published' && !!c.classroom_html_path;
   return card(`<div style="display:flex;justify-content:space-between;gap:8px"><span>${esc(c.title)}</span>${statusBadge(live?'published':'coming_soon')}</div>`,
   `<p class="muted">${esc(c.description||'Digital Classroom chapter slot reserved.')}</p><p class="path">${live?esc(c.classroom_html_path):'Digital Classroom: Coming Soon'}</p>`,
   `<button class="btn primary" data-chapter="${esc(c.id)}">${live?'Open Chapter':'View Chapter'}</button>`);
 }).join("")}</div>`
}

function renderHome(){
  const live=getChapters().filter(c=>c.status==="published").length;
  return `
  <section class="hero">
    <div class="hero-copy">
      <div class="eyebrow">FULL LEARNING + TEACHING PLATFORM</div>
      <h1>Concept <span class="gradient">to Career.</span></h1>
      <p>Vidya Setu is a comprehensive digital classroom for Classes 6–12 &amp; College Computer Science — with live interactive chapters, coding notes, AI tutoring, whiteboard, and admin CMS.</p>
      <div class="toolbar" style="margin-top:16px">
        <button class="btn primary" data-route="college-coding">💻 College &amp; Coding Hub</button>
        <button class="btn orange" data-route="ai-tutor">🤖 Ask AI Tutor</button>
        <button class="btn ghost" data-route="classes">📚 Classes 6–12</button>
        <button class="btn ghost" data-route="whiteboard">✏️ Whiteboard</button>
      </div>
    </div>
    <div class="hero-avatar-wrap">
      <img class="hero-photo avatar-img" src="assets/avatar.svg" alt="Vidya Setu AI Educator &amp; Academic Mentor">
      <div class="avatar-badge"><span>⚡ AI Tutor &amp; Faculty</span></div>
    </div>
  </section>

  ${layout(`
    <div class="section-head">
      <div>
        <div class="eyebrow">KEY PLATFORMS</div>
        <h2>Choose Your Learning Track</h2>
      </div>
    </div>
    <div class="grid">
      ${card("💻 College Computer Science & Coding", `<p class="muted">B.Tech, BCA, MCA coding notes, DSA, C++, Python, Web Dev, OS, DBMS, Networks & System Design.</p>`, `<button class="btn primary" data-route="college-coding">Explore Coding Hub</button>`)}
      ${card("🤖 Interactive AI Tutor", `<p class="muted">Live code debugger, doubt solver, concept simplifier (ELI5) and technical interview evaluator.</p>`, `<button class="btn orange" data-route="ai-tutor">Launch AI Tutor</button>`)}
      ${card("📚 School Curriculum (Classes 6–12)", `<p class="muted">Comprehensive CBSE & State board syllabus covering Mathematics, Science, Social Science and more.</p>`, `<button class="btn primary" data-route="classes">Explore Classes</button>`)}
      ${card("✏️ Digital Whiteboard", `<p class="muted">Interactive drawing, graph paper, shapes, text tool, grid toggle, and export to PNG.</p>`, `<button class="btn ghost" data-route="whiteboard">Open Whiteboard</button>`)}
    </div>
  `)}

  ${layout(`
    <div class="section-head"><h2>Platform At A Glance</h2><span class="muted">Fast, Resilient &amp; Modular</span></div>
    <div class="grid">
      ${card("Classes 6–12",`<div class="stat">7 Classes</div><p class="muted">Complete standard curriculum mapped.</p>`)}
      ${card("College Tracks",`<div class="stat">5 Tracks</div><p class="muted">DSA, Languages, Web Dev, Core CS & AI.</p>`)}
      ${card("AI Tutor Assistant",`<div class="stat">24/7</div><p class="muted">Instant explanations & code debugging.</p>`)}
      ${card("Live Chapters",`<div class="stat">${live}</div><p class="muted">Digital classroom chapters ready.</p>`)}
    </div>
  `)}

  ${socialHub()}
  ${footer()}`;
}

function renderClasses(){
  const sections=Array.isArray(state.academicSections)
    ? state.academicSections
    : localAcademicSections();

  const classSource=(state.local&&Array.isArray(state.local.classes))
    ? state.local.classes
    : (Array.isArray(state.classes)?state.classes:[]);

  const classes=[...classSource].sort((a,b)=>{
    const an=Number(a?.class_number), bn=Number(b?.class_number);
    if(Number.isFinite(an)&&Number.isFinite(bn)&&an!==bn)return an-bn;
    return String(a?.name||"").localeCompare(String(b?.name||""),"en-IN",{numeric:true});
  });

  const sectionCards=sections.map(sec=>{
    const action=sec.route==="classes"
      ?`<button class="btn primary" data-route="classes">Open Classes</button>`
      :sec.route==="college-coding"
      ?`<button class="btn primary" data-route="college-coding">Open Coding Hub</button>`
      :sec.route==="ai-tutor"
      ?`<button class="btn primary" data-route="ai-tutor">Launch AI Tutor</button>`
      :`<button class="btn primary" data-academic-section="${esc(sec.id)}">Explore Area</button>`;
    return card(
      `${esc(sec.icon||"📁")} ${esc(sec.name)}`,
      `<p class="muted">${esc(sec.description||"Academic learning area")}</p>`,
      action
    );
  }).join("");

  const classCards=classes.map(c=>card(
    `<span>Class ${esc(c.class_number||"")}</span>`,
    `<p class="muted">Full subjects &amp; chapters syllabus.</p>`,
    `<button class="btn primary" data-class="${esc(c.id)}">Open Class ${esc(c.class_number||"")}</button>`
  )).join("");

  return `
    <div class="section-head">
      <div>
        <div class="eyebrow">ACADEMIC LIBRARY</div>
        <h1>School Curriculum &amp; Special Areas</h1>
        <p class="muted">Browse Classes 6 to 12, Board-specific syllabus, or higher learning areas.</p>
      </div>
      <button class="btn ghost" data-route="home">← Dashboard</button>
    </div>

    ${layout(`
      <div class="section-head">
        <h2>Learning Hubs</h2>
        <span class="muted">${sections.length} Hubs</span>
      </div>
      <div class="grid academic-area-grid">
        ${sectionCards}
      </div>
    `)}

    ${layout(`
      <div class="section-head">
        <div>
          <h2>School Classes (6–12)</h2>
          <p class="muted">Select your grade level to access chapters, notes and tests.</p>
        </div>
      </div>
      <div class="grid">${classCards||'<div class="empty">No local classes available.</div>'}</div>
    `)}

    ${footer()}
  `;
}

function renderAcademicSection(){
 const id=state._academicSectionId||'college'; const sec=academicSectionById(id)||DEFAULT_ACADEMIC_SECTIONS.find(x=>x.id===id)||DEFAULT_ACADEMIC_SECTIONS[1];
 return `<div class="section-head"><div><div class="eyebrow">ACADEMIC AREA</div><h1>${esc(sec.icon||"📁")} ${esc(sec.name)}</h1><p class="muted">${esc(sec.description||"Future learning area")}</p></div><button class="btn ghost" data-route="classes">← Academic Library</button></div>
 <div class="hero mini-hero"><div class="hero-copy"><div class="eyebrow">READY FOR CONTENT</div><h2>${esc(sec.name)} is active.</h2><p>Explore resources or check back as more modules are published.</p><div class="toolbar"><button class="btn primary" data-route="college-coding">Open College Coding Hub</button><button class="btn ghost" data-route="classes">Browse School Classes</button></div></div></div>
 ${footer()}`;
}

function renderFutureContent(){
 return `<div class="section-head"><div><div class="eyebrow">ADVANCED DOMAINS</div><h1>🎓 Engineering & Advanced Studies</h1><p class="muted">Higher education, competitive test series and specialized courses.</p></div><button class="btn ghost" data-route="classes">← Academic Library</button></div>
 <div class="grid">${(state.futureContent||[]).map(x=>card(esc(x.title), `<p class="muted">${esc(x.area)} • ${esc(x.program)} • ${esc(x.course)}</p><p>${esc(x.description||"")}</p>`, `<span class="badge live">Available</span>`)).join("")}</div>
 ${footer()}`;
}

function renderSubject(){
 const sid=state._subjectId, s=subjectById(sid);
 if(!s){state.route="classes";return renderClasses()}
 const c=classNameById(s.class_id);
 return `<div class="section-head"><div><div class="eyebrow">${esc(c)}</div><h1>${esc(s.name)}</h1></div><button class="btn ghost" data-route="classes">← Classes</button></div>
 ${chapterCards(chaptersForSubject(s.id))}${footer()}`;
}

function featureTile(icon,title,desc,live,action=''){
  const btn=live && action?`<button class="btn primary" data-action="${esc(action)}">Open</button>`:`<button class="btn" disabled>Coming Soon</button>`;
  return card(`${icon} ${esc(title)}`,`<p class="muted">${esc(desc)}</p>`,btn);
}

function renderChapter(){
 const c=getChapters().find(x=>String(x.id)===String(state._chapterId));
 if(!c){state.route="classes";return renderClasses()}
 const s=subjectById(c.subject_id); const res=resourcesForChapter(c.id);
 const live=c.status==='published' && !!c.classroom_html_path;
 const openBtn=live?`<button class="btn primary" data-open-html="${esc(c.classroom_html_path)}">▶ Open Digital Classroom</button>`:`<button class="btn" disabled>🔒 Digital Classroom — Coming Soon</button>`;
 const features=[
  ['🎓','Teaching Mode','Full chapter teaching experience inside the connected HTML.','openLive'],
  ['📝','Notes','Chapter notes and revision material.','openLive'],
  ['✏️','Whiteboard','Insert questions/content into the interactive whiteboard.','whiteboard'],
  ['🔬','Simulation','Interactive simulation linked to this chapter.','resources'],
  ['🎞️','Animation','Chapter animation/video resources.','resources'],
  ['🧊','3D Model','Interactive 3D learning resource.','resources'],
  ['📚','Revision','Revision mode, bookmarks and weak-topic workflow.','openLive'],
  ['🏠','Homework','Homework and printable worksheet resources.','openLive']
 ];
 const featureHtml=features.map(f=>featureTile(f[0],f[1],f[2],live,f[3])).join('');
 const resourcesHtml=res.length?layout(`<div class="section-head"><h2>Chapter Resources</h2><span class="muted">${res.length} attached resources</span></div><div class="video-grid">${res.map(resourceCard).join('')}</div>`):'';
 const statusMessage=live?'This chapter is LIVE. Click below to open the Digital Classroom.':'This chapter is part of the curriculum catalog.';
 return `<div class="section-head"><div><div class="eyebrow">${esc(s?.name||"Subject")} • ${esc(classNameById(s?.class_id))}</div><h1>${esc(c.title)}</h1><p class="muted">${esc(statusMessage)}</p></div><div class="toolbar"><button class="btn ghost" data-route="classes">← Back</button>${openBtn}</div></div>
 <div class="two-col">
   ${card("Chapter Status",`<p>${statusBadge(live?'published':'coming_soon')}</p><p class="muted">${esc(c.description||'No description yet.')}</p><p class="path">${live?esc(c.classroom_html_path):'Digital Classroom: Connected'}</p>`)}
   ${card("Student Actions",`<div class="toolbar"><button class="btn" data-action="bookmarkChapter" data-id="${esc(c.id)}">🔖 Bookmark</button><button class="btn" data-action="progressChapter" data-id="${esc(c.id)}">✓ Mark Complete</button><button class="btn primary" data-action="askAITutorNote" data-title="${esc(c.title)}">🤖 Ask AI Tutor</button></div>`)}
 </div>
 ${layout(`<div class="section-head"><h2>Chapter Learning Features</h2><span class="muted">Interactive Tools</span></div><div class="grid">${featureHtml}</div>`)}
 ${resourcesHtml}
 ${footer()}`;
}

function resourceCard(r){
 const raw=String(r.url||'');
 const id=youtubeId(raw);
 const media=id?`<iframe class="video-frame" src="https://www.youtube.com/embed/${id}" title="${esc(r.title)}" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen loading="lazy"></iframe>`:
   `<div class="notice"><div class="resource-icon">🔗</div><strong>${esc(r.resource_type)}</strong><p>${esc(r.title)}</p><a class="btn primary" target="_blank" rel="noopener" href="${esc(raw)}">Open Resource ↗</a></div>`;
 return card(`<span>${esc(r.title)}</span>`,media+`<p class="small muted">${esc(r.resource_type)}</p>`);
}

function renderHelpSupport(){
  return `
    <section class="section-head">
      <div>
        <div class="eyebrow">SUPPORT CENTER</div>
        <h1>❓ Help & Support</h1>
        <p class="muted">Need help using Vidya Setu? We are here to help.</p>
      </div>
    </section>
    <div class="grid" style="margin-top:18px">
      <article class="card">
        <div style="font-size:34px">🤖</div>
        <h3>Vidya AI Assistant</h3>
        <p class="muted">Ask questions about using Vidya Setu, finding features, lessons, coding notes and platform workflows.</p>
        <button class="btn primary" data-route="ai-tutor">Open AI Assistant</button>
      </article>
      <article class="card">
        <div style="font-size:34px">💻</div>
        <h3>College & Coding Support</h3>
        <p class="muted">Coding tutorials, DSA questions, syntax debugging and technical interview prep.</p>
        <button class="btn primary" data-route="college-coding">Open Coding Hub</button>
      </article>
      <article class="card">
        <div style="font-size:34px">💬</div>
        <h3>Contact Team</h3>
        <p class="muted">Reach out for academic assistance or platform queries.</p>
        <button class="btn" data-route="social">Official Links & WhatsApp</button>
      </article>
    </div>
  `;
}

function renderProfile(){
 const p=state.profile||{};
 return `
 <div class="section-head">
   <div>
     <div class="eyebrow">ACCOUNT PROFILE</div>
     <h1>👤 ${esc(p.full_name||state.user?.email||"Guest Learner")}</h1>
     <p class="muted">Role: <strong>${esc(roleLabel())}</strong> • ${state.user?esc(state.user.email):"Sign in to sync your progress across devices."}</p>
   </div>
   <div class="toolbar">
     ${state.user?`<button class="btn danger" data-action="logout">🚪 Sign Out</button>`:`<button class="btn primary" data-action="auth">🔑 Login / Sign Up</button>`}
   </div>
 </div>

 <div class="grid profile-stats-grid">
   ${card("📚 Progress Records", `<div class="stat">${state.progressCount||0}</div><div class="muted">completed lessons</div>`)}
   ${card("🔖 Bookmarks", `<div class="stat">${state.bookmarkCount||0}</div><div class="muted">saved items</div>`)}
   ${card("🤖 AI Tutor Queries", `<div class="stat">${state.aiTutorHistory?.length||1}</div><div class="muted">session interactions</div>`)}
   ${card("🎓 Learning Role", `<div class="stat">${esc(roleLabel())}</div><div class="muted">platform status</div>`)}
 </div>

 <div class="card" style="margin-top:18px">
   <h3>Personal Details</h3>
   <div class="form-grid" style="margin-top:12px">
     <div class="field"><label>Full Name</label><input class="input" id="profileName" value="${esc(p.full_name||"")}" placeholder="Enter name"></div>
     <div class="field"><label>City / Institute</label><input class="input" id="profileCity" value="${esc(p.city||p.school_name||"")}" placeholder="Your city or college"></div>
     <div class="field full"><label>Goal / Target Exam</label><input class="input" id="profileGoal" value="${esc(p.learning_goal||p.exam_target||"")}" placeholder="e.g. B.Tech Placements, GATE, CBSE Class 10 Boards"></div>
   </div>
   <div class="toolbar" style="margin-top:14px">
     <button class="btn primary" data-action="saveProfile">💾 Save Profile</button>
     <button class="btn ghost" data-action="auth">Switch / Login Account</button>
   </div>
 </div>
 ${footer()}`;
}

function renderTeacher(){
  return `
    <div class="section-head">
      <div>
        <div class="eyebrow">TEACHER PORTAL</div>
        <h1>👨‍🏫 Faculty & Teaching Workspace</h1>
        <p class="muted">Interactive presentation mode, whiteboard, and lesson plan tools.</p>
      </div>
      <button class="btn ghost" data-route="home">← Dashboard</button>
    </div>
    <div class="grid">
      ${card("✏️ Interactive Whiteboard", "<p class='muted'>Draw, use grid, graph paper, pens, markers, and save PNG diagrams.</p>", "<button class='btn primary' data-route='whiteboard'>Launch Whiteboard</button>")}
      ${card("📚 Digital Classroom", "<p class='muted'>Open interactive teaching HTML files and present concepts.</p>", "<button class='btn primary' data-route='classes'>Browse Classes</button>")}
      ${card("💻 Coding & CS Tracks", "<p class='muted'>Review computer science curriculum notes and interview problems.</p>", "<button class='btn primary' data-route='college-coding'>Coding Hub</button>")}
    </div>
    ${footer()}
  `;
}

function renderAdmin(){
  return `
    <div class="section-head">
      <div>
        <div class="eyebrow">ADMIN CMS</div>
        <h1>⚙️ Vidya Setu Control Center</h1>
        <p class="muted">Manage curriculum, boards, files, and platform customization.</p>
      </div>
      <button class="btn ghost" data-route="home">← Dashboard</button>
    </div>
    <div class="grid">
      ${card("📚 Curriculum Content", `<p class='muted'>${getChapters().length} total chapters mapped in catalog.</p>`, "<button class='btn primary' data-route='classes'>View Curriculum</button>")}
      ${card("💻 College Tracks", `<p class='muted'>DSA, Languages, Web Dev, Core CS & AI/ML modules.</p>`, "<button class='btn primary' data-route='college-coding'>Open Tracks</button>")}
      ${card("🤖 AI Assistant Control", "<p class='muted'>AI Tutor prompt configurations and problem bank.</p>", "<button class='btn primary' data-route='ai-tutor'>Open AI Tutor</button>")}
    </div>
    ${footer()}
  `;
}

function renderQuestionBank(){
  return `
    <div class="section-head">
      <div>
        <div class="eyebrow">EXAM PREP</div>
        <h1>Question Bank &amp; Practice Sets</h1>
      </div>
      <button class="btn ghost" data-route="home">← Dashboard</button>
    </div>
    <div class="grid">
      ${card("Class 10 Science: Light Reflection", "<p class='muted'>12 Concept & Numerical questions.</p>", "<button class='btn primary' data-route='quiz'>Take Quiz</button>")}
      ${card("Data Structures: Two Pointers", "<p class='muted'>Top 10 interview questions with solutions.</p>", "<button class='btn primary' data-action='openCodingNote' data-id='dsa-two-pointers'>Read Practice Notes</button>")}
      ${card("DBMS: Normalization Practice", "<p class='muted'>Step-by-step 1NF to BCNF decomposition tests.</p>", "<button class='btn primary' data-action='openCodingNote' data-id='dbms-normalization'>View Notes</button>")}
    </div>
    ${footer()}
  `;
}

function renderQuiz(){
  if(!state.quizData.length) state.quizData=[
    {q:"A convex mirror forms an image that is always…",opts:["Real and inverted","Virtual, erect and diminished","Real and enlarged","Same size always"],a:1,e:"Convex mirrors produce virtual, erect, and diminished images regardless of object position."},
    {q:"In C++, which container provides O(log N) average time for search, insertion, and deletion?",opts:["std::vector","std::map (Red-Black Tree)","std::unordered_set","std::list"],a:1,e:"std::map is implemented using self-balancing BSTs guaranteeing O(log N) operations."},
    {q:"What condition causes the Convoy Effect in CPU scheduling?",opts:["Short jobs wait behind a massive CPU-bound job in FCFS","Round robin time quantum is too small","Two processes deadlock on a mutex","Paging causes page faults"],a:0,e:"In FCFS, when one large CPU-intensive process executes, several I/O-bound processes wait idly in the ready queue."},
    {q:"Which Normal Form guarantees that no non-prime attribute is transitively dependent on the candidate key?",opts:["1NF","2NF","3NF","BCNF"],a:2,e:"Third Normal Form (3NF) eliminates transitive functional dependencies."}
  ];
  const q=state.quizData[state.quizIndex];
  return `
  <div class="section-head">
    <div>
      <div class="eyebrow">INTERACTIVE QUIZ</div>
      <h1>Concept Mastery Quiz</h1>
    </div>
    <button class="btn ghost" data-action="resetQuiz">Reset Quiz</button>
  </div>
  <div class="card" style="max-width:760px;margin:auto">
    <div class="section-head">
      <span>Question ${state.quizIndex+1} / ${state.quizData.length}</span>
      <strong>Score: ${state.quizScore}</strong>
    </div>
    <div class="progress-bar" style="margin-bottom:18px">
      <span style="width:${((state.quizIndex)/state.quizData.length)*100}%"></span>
    </div>
    <h2 style="font-size:22px">${esc(q.q)}</h2>
    ${q.opts.map((o,i)=>`<button class="quiz-option ${state.quizAnswered?(i===q.a?"correct":(state.lastChoice===i?"wrong":"")): ""}" data-quiz-option="${i}" ${state.quizAnswered?"disabled":""}>${String.fromCharCode(65+i)}. ${esc(o)}</button>`).join("")}
    ${state.quizAnswered?`<div class="notice" style="margin-top:14px">💡 ${esc(q.e)}</div><button class="btn primary" style="margin-top:14px" data-action="nextQuiz">${state.quizIndex===state.quizData.length-1?"Finish Quiz":"Next Question →"}</button>`:""}
  </div>
  ${footer()}`;
}

function answerQuiz(i){
  if(state.quizAnswered)return;
  state.quizAnswered=true;
  state.lastChoice=i;
  if(i===state.quizData[state.quizIndex].a) state.quizScore++;
  render();
}
function nextQuiz(){
  if(state.quizIndex<state.quizData.length-1){
    state.quizIndex++;
    state.quizAnswered=false;
    state.lastChoice=null;
    render();
  }else{
    toast(`Quiz complete! Score: ${state.quizScore}/${state.quizData.length}`);
    state.quizIndex=0;
    state.quizScore=0;
    state.quizAnswered=false;
    render();
  }
}
function resetQuiz(){
  state.quizIndex=0;
  state.quizScore=0;
  state.quizAnswered=false;
  state.lastChoice=null;
  render();
}

function renderWhiteboard(){
  const W=1400,H=780;
  setTimeout(initWhiteboard, 50);
  return `
  <div class="section-head">
    <div>
      <div class="eyebrow">DIGITAL CLASSROOM</div>
      <h1>Interactive Whiteboard</h1>
      <p class="muted">Draw, change board colors, toggle grid/graph lines, add text and save PNG diagrams.</p>
    </div>
    <button class="btn ghost" data-route="home">← Dashboard</button>
  </div>
  <div class="whiteboard-shell">
    <div class="wb-toolbar">
      <button class="btn wb-tool-active" data-wb="pen">✏ Pen</button>
      <button class="btn" data-wb="marker">🖊 Marker</button>
      <button class="btn" data-wb="highlighter">🖍 Highlighter</button>
      <button class="btn" data-wb="eraser">🧹 Eraser</button>
      <button class="btn" data-wb="line">╱ Line</button>
      <button class="btn" data-wb="rect">▭ Rectangle</button>
      <button class="btn" data-wb="text">T Text</button>
      <button class="btn" data-wb="undo">↩ Undo</button>
      <button class="btn" data-wb="redo">↪ Redo</button>
      <button class="btn" data-wb="clear">🗑 Clear</button>
      <button class="btn" data-wb="grid">▦ Grid</button>
      <button class="btn" data-wb="graph">▦ Graph Paper</button>
      <button class="btn" data-wb="save">💾 Save PNG</button>
      <label class="wb-control">Pen Colour <input id="wbColor" type="color" value="#111111"></label>
      <label class="wb-control">Board Colour <input id="wbBgColor" type="color" value="#ffffff"></label>
      <label class="wb-control">Size <input id="wbSize" type="range" min="1" max="30" value="4"></label>
    </div>
    <div class="wb-status" id="wbStatus">Pen selected • Board: White • Grid: Off</div>
    <div class="wb-canvas-wrap">
      <div class="wb-stage" style="width:${W}px;height:${H}px">
        <canvas id="wbBgCanvas" class="wb-canvas wb-bg-canvas" width="${W}" height="${H}"></canvas>
        <canvas id="wbCanvas" class="wb-canvas wb-draw-canvas" width="${W}" height="${H}"></canvas>
      </div>
    </div>
  </div>
  ${footer()}`;
}

let wb=null;
function initWhiteboard(){
 const c=$("#wbCanvas"),bg=$("#wbBgCanvas"); if(!c||!bg)return;
 const ctx=c.getContext("2d"),bgctx=bg.getContext("2d");
 wb={c,bg,ctx,bgctx,drawing:false,last:null,start:null,color:"#111111",size:4,tool:"pen",grid:false,hLines:false,graph:false,bgColor:"#ffffff",history:[],future:[]};
 const pos=e=>{const r=c.getBoundingClientRect();return{x:Math.max(0,Math.min(c.width,(e.clientX-r.left)*c.width/r.width)),y:Math.max(0,Math.min(c.height,(e.clientY-r.top)*c.height/r.height))}};
 const snapshot=()=>ctx.getImageData(0,0,c.width,c.height);
 const restore=data=>{ctx.clearRect(0,0,c.width,c.height);if(data)ctx.putImageData(data,0,0)};
 wb.snapshot=snapshot;wb.restore=restore;
 paintBoardV58(); saveWBHistoryV58();

 c.onpointerdown=e=>{
   e.preventDefault();
   wb.drawing=true;
   wb.start=wb.last=pos(e);
   c.setPointerCapture?.(e.pointerId);
   if(wb.tool==="text"){
     wb.drawing=false;
     const text=prompt("Enter text to place on board:");
     if(text){
       ctx.fillStyle=wb.color;
       ctx.font=`${Math.max(16,wb.size*5)}px sans-serif`;
       ctx.fillText(text,wb.start.x,wb.start.y);
       saveWBHistoryV58();
     }
   }
 };
 c.onpointermove=e=>{
   if(!wb.drawing)return;
   e.preventDefault();
   const p=pos(e);
   if(["pen","marker","highlighter","eraser"].includes(wb.tool)){
     drawFreeV58(wb.last,p);
     wb.last=p;
   }else{
     restore(wb.history[wb.history.length-1]);
     drawShapeV58(wb.start,p,true);
   }
 };
 c.onpointerup=e=>{
   if(!wb.drawing)return;
   const p=pos(e);
   wb.drawing=false;
   if(["pen","marker","highlighter","eraser"].includes(wb.tool)){
     saveWBHistoryV58();
   }else{
     restore(wb.history[wb.history.length-1]);
     drawShapeV58(wb.start,p,false);
     saveWBHistoryV58();
   }
 };

 const col=$("#wbColor"), siz=$("#wbSize"), bgcol=$("#wbBgColor");
 if(col) col.oninput=e=>{wb.color=e.target.value;};
 if(siz) siz.oninput=e=>{wb.size=+e.target.value;};
 if(bgcol) bgcol.oninput=e=>{wb.bgColor=e.target.value;paintBoardV58();toast("Board colour updated");};
}

function saveWBHistoryV58(){if(!wb)return;wb.history.push(wb.snapshot());if(wb.history.length>30)wb.history.shift();wb.future=[]}
function paintBoardV58(){
 if(!wb)return;const x=wb.bgctx;
 x.clearRect(0,0,wb.bg.width,wb.bg.height);
 x.fillStyle=wb.bgColor||"#fff";
 x.fillRect(0,0,wb.bg.width,wb.bg.height);
 if(wb.grid||wb.graph){
   x.save();x.strokeStyle="rgba(70,100,130,.25)";x.lineWidth=1;x.beginPath();
   const step=wb.graph?25:40;
   for(let xx=0;xx<=wb.bg.width;xx+=step){x.moveTo(xx,0);x.lineTo(xx,wb.bg.height)}
   for(let yy=0;yy<=wb.bg.height;yy+=step){x.moveTo(0,yy);x.lineTo(wb.bg.width,yy)}
   x.stroke();x.restore();
 }
}

function drawFreeV58(a,b){
 const x=wb.ctx;x.save();x.lineCap="round";x.lineJoin="round";
 if(wb.tool==="eraser"){
   x.globalCompositeOperation="destination-out";
   x.lineWidth=Math.max(16,wb.size*4);
 }else{
   x.globalCompositeOperation="source-over";
   x.strokeStyle=wb.color;
   x.lineWidth=wb.tool==="marker"?Math.max(8,wb.size*2):wb.tool==="highlighter"?Math.max(14,wb.size*3):wb.size;
   x.globalAlpha=wb.tool==="highlighter"?.25:1;
 }
 x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();x.restore();
}

function drawShapeV58(a,b,preview){
 if(!wb)return;const x=wb.ctx;x.save();x.strokeStyle=wb.color;x.lineWidth=wb.size;x.globalAlpha=preview?.65:1;x.lineCap="round";
 if(wb.tool==="line"){x.beginPath();x.moveTo(a.x,a.y);x.lineTo(b.x,b.y);x.stroke();}
 else if(wb.tool==="rect"){x.strokeRect(a.x,a.y,b.x-a.x,b.y-a.y);}
 x.restore();
}

async function wbAction(action){
 if(!wb)return;
 if(["pen","marker","highlighter","eraser","line","rect","text"].includes(action)){
   wb.tool=action;
   $$("[data-wb]").forEach(b=>b.classList.toggle("wb-tool-active",b.dataset.wb===action));
   return;
 }
 if(action==="clear"){wb.ctx.clearRect(0,0,wb.c.width,wb.c.height);saveWBHistoryV58();toast("Canvas cleared");return;}
 if(action==="grid"){wb.grid=!wb.grid;wb.graph=false;paintBoardV58();toast(wb.grid?"Grid enabled":"Grid disabled");return;}
 if(action==="graph"){wb.graph=!wb.graph;wb.grid=false;paintBoardV58();toast(wb.graph?"Graph paper enabled":"Graph paper disabled");return;}
 if(action==="save"){
   const out=document.createElement("canvas");out.width=wb.c.width;out.height=wb.c.height;
   const ox=out.getContext("2d");ox.drawImage(wb.bg,0,0);ox.drawImage(wb.c,0,0);
   const a=document.createElement("a");a.href=out.toDataURL("image/png");a.download="vidya-setu-whiteboard.png";a.click();
   toast("Whiteboard PNG exported");
   return;
 }
 if(action==="undo"){if(wb.history.length>1){wb.future.push(wb.history.pop());wb.restore(wb.history[wb.history.length-1])}return;}
 if(action==="redo"){if(wb.future.length){const d=wb.future.pop();wb.history.push(d);wb.restore(d)}return;}
}

function renderResources(){
 const official=[
  ["PhET Interactive Simulations","https://phet.colorado.edu/","Physics, Chemistry, Maths & Biology simulations."],
  ["GeoGebra Maths & Geometry","https://www.geogebra.org/","Dynamic graphing, geometry, 3D and algebra tools."],
  ["Desmos Graphing Calculator","https://www.desmos.com/","Beautiful interactive function plotting and geometry."],
  ["NCERT Digital Books","https://ncert.nic.in/","Official Indian curriculum syllabus and textbooks."],
  ["CK-12 STEM Library","https://www.ck12.org/","Free interactive science and math practice modules."]
 ];
 return `
 <div class="section-head">
   <div>
     <div class="eyebrow">OPEN EDUCATIONAL RESOURCES</div>
     <h1>Interactive Simulations, 3D &amp; Reference</h1>
   </div>
   <button class="btn ghost" data-route="home">← Dashboard</button>
 </div>
 <div class="grid">
   ${official.map(x=>card(x[0], `<p class="muted">${x[2]}</p>`, `<a class="btn primary" href="${x[1]}" target="_blank" rel="noopener">▶ Open Resource ↗</a>`)).join("")}
 </div>
 ${footer()}`;
}

function renderSocial(){
  return `
    <div class="section-head">
      <div>
        <div class="eyebrow">OFFICIAL VIDYA SETU</div>
        <h1>Connect With Us</h1>
        <p class="muted">All official Vidya Setu portals, applications and contact channels.</p>
      </div>
      <button class="btn ghost" data-route="home">← Dashboard</button>
    </div>
    ${socialHub()}
    ${footer()}
  `;
}

function renderCommunity(){
  return `
    <div class="section-head">
      <div>
        <div class="eyebrow">COMMUNITY &amp; DISCUSSIONS</div>
        <h1>💬 Student &amp; Faculty Discussions</h1>
        <p class="muted">Ask doubts, discuss concepts, and collaborate with educators.</p>
      </div>
      <button class="btn ghost" data-route="home">← Dashboard</button>
    </div>
    <div class="grid">
      ${card("🤖 Ask Vidya AI Tutor", "<p class='muted'>Get instant answers for code problems, school doubts, and interview questions.</p>", "<button class='btn primary' data-route='ai-tutor'>Launch AI Tutor</button>")}
      ${card("💻 College CS Discussions", "<p class='muted'>DSA doubts, React best practices, and database optimization tips.</p>", "<button class='btn primary' data-route='college-coding'>Open Coding Hub</button>")}
      ${card("📱 Official WhatsApp Support", "<p class='muted'>Reach out directly to the academic counseling team.</p>", `<a class='btn orange' href='${DEFAULT_SOCIAL.whatsapp}' target='_blank' rel='noopener'>Open WhatsApp</a>`)}
    </div>
    ${footer()}
  `;
}

function renderStudentLearningStudio(){
  return `
    <div class="section-head">
      <div>
        <div class="eyebrow">STUDENT WORKSPACE</div>
        <h1>📝 My Learning Studio</h1>
        <p class="muted">Personal study notes, flashcards, mind maps and quiz creation.</p>
      </div>
      <button class="btn ghost" data-route="home">← Dashboard</button>
    </div>
    <div class="grid">
      ${card("📒 Notes & Flashcards", "<p class='muted'>Create your own revision flashcards and summaries.</p>", "<button class='btn primary' data-route='college-coding'>Browse Coding Notes</button>")}
      ${card("🤖 AI Study Assistant", "<p class='muted'>Let AI generate flashcards, practice questions, or code examples.</p>", "<button class='btn orange' data-route='ai-tutor'>Open AI Tutor</button>")}
      ${card("✏️ Digital Whiteboard", "<p class='muted'>Practice numericals, draw diagrams, and save work.</p>", "<button class='btn ghost' data-route='whiteboard'>Open Whiteboard</button>")}
    </div>
    ${footer()}
  `;
}

/* =========================================================================
   COLLEGE CODING HUB & AI TUTOR FUNCTIONS
   ========================================================================= */

function getCollegeTracks(){
  return window.V2_CURRICULUM?.collegeTracks || [];
}

function getCodingNotesList(){
  const dict = window.V2_CURRICULUM?.codingNotes || {};
  return Object.entries(dict).map(([id, note]) => ({ id, ...note }));
}

function getCodingNoteById(id){
  const dict = window.V2_CURRICULUM?.codingNotes || {};
  if (dict[id]) return { id, ...dict[id] };
  for (const t of getCollegeTracks()) {
    for (const s of (t.subjects || [])) {
      for (const ch of (s.chapters || [])) {
        if (ch.slug === id) {
          return {
            id: ch.slug,
            title: ch.title,
            track: t.name,
            difficulty: "Core Chapter",
            readTime: "7 min read",
            tags: [t.name, s.name, "College"],
            overview: `Comprehensive study guide and coding roadmap for ${ch.title} under ${s.name}.`,
            keyPrinciples: [
              `Core conceptual principles of ${ch.title}.`,
              "Fundamental syntax, memory layout, and architecture patterns.",
              "Best practices and standard implementation considerations.",
              "Exam and placement interview relevance."
            ],
            codeExample: {
              lang: "C++ / Python Implementation",
              snippet: `// Reference implementation for ${ch.title}\n// Ready for study, whiteboard export & AI analysis\n\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Exploring ${ch.title}..." << endl;\n    // Ask the AI Tutor for live debugging & custom examples\n    return 0;\n}`
            },
            complexity: [
              { metric: "Standard Complexity", value: "Optimized O(N) / O(log N)", note: "Depending on input constraints" }
            ],
            interviewQuestions: [
              { q: `What is the significance of ${ch.title} in engineering applications?`, a: `It provides fundamental architectural clarity and performance efficiency for ${s.name}.` },
              { q: `How do you analyze edge cases in ${ch.title}?`, a: `Consider boundary values, empty collections, null pointers, and scale limits.` }
            ]
          };
        }
      }
    }
  }
  return null;
}

function renderCollegeCodingHub(){
  const tracks = getCollegeTracks();
  const notes = getCodingNotesList();
  const activeTrackFilter = state._collegeTrackFilter || "all";
  const searchQ = (state._collegeSearchQ || "").toLowerCase().trim();

  let filteredNotes = notes;
  if(searchQ){
    filteredNotes = notes.filter(n => 
      n.title.toLowerCase().includes(searchQ) || 
      n.track.toLowerCase().includes(searchQ) ||
      (n.tags||[]).some(t => t.toLowerCase().includes(searchQ))
    );
  }

  const featuredCards = filteredNotes.map(n => `
    <div class="card coding-note-card clickable" data-action="openCodingNote" data-id="${esc(n.id)}">
      <div class="coding-card-head">
        <span class="badge live">${esc(n.difficulty || "Core")}</span>
        <span class="muted small">⏱ ${esc(n.readTime || "8 min")}</span>
      </div>
      <h3 style="margin:10px 0 6px">${esc(n.title)}</h3>
      <p class="muted small">${esc(n.track)}</p>
      <p style="font-size:13px;line-height:1.45;color:#b9cbe0">${esc(n.overview?.slice(0, 110))}…</p>
      <div class="coding-card-tags">
        ${(n.tags||[]).map(t => `<span class="filter-tag">${esc(t)}</span>`).join("")}
      </div>
      <div class="toolbar" style="margin-top:14px">
        <button class="btn primary" data-action="openCodingNote" data-id="${esc(n.id)}">📖 Read Complete Notes</button>
        <button class="btn ghost" data-action="askAITutorNote" data-title="${esc(n.title)}">🤖 Ask AI</button>
      </div>
    </div>
  `).join("");

  const trackSections = tracks.map(tr => {
    if(activeTrackFilter !== "all" && tr.id !== activeTrackFilter) return "";
    return `
      <div class="card" style="margin-top:16px;padding:22px;border:1px solid #28446b">
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px;margin-bottom:14px">
          <div>
            <div class="eyebrow">${esc(tr.badge || "COLLEGE")}</div>
            <h2 style="margin:4px 0">${esc(tr.icon || "💻")} ${esc(tr.name)}</h2>
            <p class="muted" style="margin:0">${esc(tr.description)}</p>
          </div>
          <button class="btn ghost" data-action="askAITutorNote" data-title="${esc(tr.name)}">🤖 Ask AI Tutor</button>
        </div>
        <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:12px">
          ${(tr.subjects || []).map(sub => `
            <div style="background:#091524;border:1px solid #1e334f;border-radius:14px;padding:14px">
              <strong style="color:#00d2ff;display:block;margin-bottom:8px">📂 ${esc(sub.name)}</strong>
              <div style="display:grid;gap:6px">
                ${(sub.chapters || []).map(ch => {
                  const hasNote = !!window.V2_CURRICULUM?.codingNotes?.[ch.slug];
                  return `
                    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;padding:6px 8px;border-radius:8px;background:rgba(255,255,255,.03)">
                      <span style="font-size:12px;color:#d5e4f7">${esc(ch.title)}</span>
                      <button class="btn ${hasNote?'primary':'ghost'}" style="font-size:11px;padding:5px 8px" data-action="openCodingNote" data-id="${esc(ch.slug)}">
                        ${hasNote ? '📖 Read' : '💡 Open'}
                      </button>
                    </div>
                  `;
                }).join("")}
              </div>
            </div>
          `).join("")}
        </div>
      </div>
    `;
  }).join("");

  return `
    <div class="section-head">
      <div>
        <div class="eyebrow">HIGHER EDUCATION &amp; SOFTWARE ENGINEERING</div>
        <h1>💻 College Computer Science &amp; Coding Hub</h1>
        <p class="muted">B.Tech • BCA • MCA • In-Depth Coding Notes, DSA, Full-Stack, Core CS, System Design &amp; AI.</p>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn" data-route="ai-tutor" style="background:#20103b;border-color:#7c3aed;color:#d8b4fe">🤖 Open AI Tutor</button>
        <button class="btn ghost" data-route="classes">← School Classes</button>
      </div>
    </div>

    <!-- Search and Filters -->
    <div class="content-filter-panel">
      <div style="display:flex;justify-content:space-between;gap:12px;align-items:center;flex-wrap:wrap">
        <div style="flex:1;min-width:240px">
          <input id="collegeSearchInput" class="input" placeholder="🔍 Search coding notes (e.g. Sliding Window, React Hooks, Normalization, TCP)..." value="${esc(state._collegeSearchQ || "")}">
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn ${activeTrackFilter==='all'?'primary':'ghost'}" data-action="filterCollegeTrack" data-track="all">All Tracks</button>
          <button class="btn ${activeTrackFilter==='college-dsa'?'primary':'ghost'}" data-action="filterCollegeTrack" data-track="college-dsa">🌳 DSA</button>
          <button class="btn ${activeTrackFilter==='college-languages'?'primary':'ghost'}" data-action="filterCollegeTrack" data-track="college-languages">⚡ Languages</button>
          <button class="btn ${activeTrackFilter==='college-webdev'?'primary':'ghost'}" data-action="filterCollegeTrack" data-track="college-webdev">🌐 Web Dev</button>
          <button class="btn ${activeTrackFilter==='college-core-cs'?'primary':'ghost'}" data-action="filterCollegeTrack" data-track="college-core-cs">💻 Core CS</button>
        </div>
      </div>
    </div>

    <!-- Featured Ready Notes -->
    <div class="section-head" style="margin-top:22px">
      <div>
        <h2>📚 High-Yield Coding Study Notes</h2>
        <p class="muted">Ready-to-study interactive cheat sheets &amp; deep-dives.</p>
      </div>
      <span class="badge live">${filteredNotes.length} Notes Available</span>
    </div>
    <div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(320px,1fr))">
      ${featuredCards || '<div class="empty">No notes matching your search query. Try searching for "DSA", "React", "DBMS" or "OS".</div>'}
    </div>

    <!-- Complete Tracks & Syllabus -->
    <div class="section-head" style="margin-top:32px">
      <div>
        <h2>🎓 Full College Computer Science Curriculum</h2>
        <p class="muted">Complete syllabus mapping for B.Tech, BCA, MCA &amp; Self-Taught Developers.</p>
      </div>
    </div>
    ${trackSections}

    ${footer()}
  `;
}

function renderCodingNoteDetail(noteId){
  const id = noteId || state._codingNoteId || "dsa-two-pointers";
  const note = getCodingNoteById(id);
  if(!note){
    return `<div class="empty"><h2>Note not found</h2><p>The requested coding note could not be loaded.</p><button class="btn primary" data-route="college-coding">Return to College Hub</button></div>`;
  }

  const complexRows = (note.complexity || []).map(c => `
    <tr>
      <td style="font-weight:700;color:#00d2ff">${esc(c.metric)}</td>
      <td style="font-family:monospace;font-weight:700;color:#ff9900">${esc(c.value)}</td>
      <td class="muted">${esc(c.note || "—")}</td>
    </tr>
  `).join("");

  const qaCards = (note.interviewQuestions || []).map((q, idx) => `
    <div style="background:#091626;border:1px solid #1e3552;border-radius:12px;padding:14px;margin-bottom:10px">
      <div style="display:flex;gap:8px;align-items:flex-start">
        <span style="background:#1d426d;color:#fff;border-radius:50%;width:24px;height:24px;display:grid;place-items:center;font-size:12px;font-weight:800;flex-shrink:0">Q${idx+1}</span>
        <div>
          <strong style="font-size:14px;color:#eaf3ff">${esc(q.q)}</strong>
          <p style="margin:8px 0 0;font-size:13px;line-height:1.55;color:#a9bfdb">${esc(q.a)}</p>
        </div>
      </div>
    </div>
  `).join("");

  return `
    <div class="section-head">
      <div>
        <div class="eyebrow">${esc(note.track || "COLLEGE CS")}</div>
        <h1>${esc(note.title)}</h1>
        <div style="display:flex;gap:8px;align-items:center;margin-top:6px;flex-wrap:wrap">
          <span class="badge live">${esc(note.difficulty || "Essential")}</span>
          <span class="muted small">⏱ ${esc(note.readTime || "8 min read")}</span>
          ${(note.tags||[]).map(t => `<span class="filter-tag">${esc(t)}</span>`).join("")}
        </div>
      </div>
      <div style="display:flex;gap:8px">
        <button class="btn ghost" data-route="college-coding">← All Coding Notes</button>
        <button class="btn primary" data-action="askAITutorNote" data-title="${esc(note.title)}">🤖 Ask AI Tutor</button>
      </div>
    </div>

    <div class="notice" style="background:#0c1e34;border-color:#1e6fd1;color:#d5e5f7;font-size:14px;line-height:1.6">
      <strong>📌 Concept Overview:</strong> ${esc(note.overview)}
    </div>

    <div class="card" style="margin-top:16px;padding:20px">
      <h3 style="margin-top:0">⚡ Core Principles &amp; Architecture</h3>
      <ul style="margin:10px 0 0 20px;padding:0;line-height:1.8;color:#d0e0f2">
        ${(note.keyPrinciples || []).map(p => `<li>${esc(p)}</li>`).join("")}
      </ul>
    </div>

    <div class="card" style="margin-top:16px;padding:20px;background:#050c17;border-color:#1d3858">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px">
        <div style="display:flex;align-items:center;gap:8px">
          <span style="color:#00d2ff;font-weight:800;font-size:14px">💻 ${esc(note.codeExample?.lang || "Code Snippet")}</span>
          <span class="badge draft">Clean &amp; Tested</span>
        </div>
        <div style="display:flex;gap:6px">
          <button class="btn" style="font-size:12px;padding:6px 12px" data-action="copyCode" data-code="${esc(note.codeExample?.snippet || "")}">📋 Copy Code</button>
          <button class="btn ghost" style="font-size:12px;padding:6px 12px" data-action="insertNoteToWhiteboard" data-title="${esc(note.title)}">✏️ Send to Whiteboard</button>
        </div>
      </div>
      <pre style="margin:0;padding:16px;background:#03070f;border:1px solid #192a3f;border-radius:12px;overflow-x:auto;font-family:ui-monospace,SFMono-Regular,Consolas,monospace;font-size:13px;line-height:1.55;color:#7ee787"><code>${esc(note.codeExample?.snippet || "// No code snippet provided")}</code></pre>
    </div>

    ${note.complexity && note.complexity.length ? `
      <div class="card" style="margin-top:16px;padding:20px">
        <h3 style="margin-top:0">📊 Complexity Breakdown</h3>
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Metric</th><th>Complexity</th><th>Engineering Note</th></tr>
            </thead>
            <tbody>${complexRows}</tbody>
          </table>
        </div>
      </div>
    ` : ""}

    ${note.interviewQuestions && note.interviewQuestions.length ? `
      <div class="card" style="margin-top:16px;padding:20px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:14px">
          <h3 style="margin:0">🎯 Top Viva &amp; Placement Interview Questions</h3>
          <span class="badge live">High Probability</span>
        </div>
        ${qaCards}
      </div>
    ` : ""}

    ${footer()}
  `;
}

function generateAITutorResponse(promptText, mode="doubts"){
  const q = String(promptText || "").toLowerCase().trim();
  let intro = "";
  if(mode === "code") intro = "💻 **Code Analysis & Debugger:**\n\n";
  else if(mode === "eli5") intro = "💡 **Concept Simplified (ELI5):**\n\n";
  else if(mode === "interview") intro = "🎯 **Interview & Viva Evaluation:**\n\n";

  if(q.includes("two pointer") || q.includes("sliding window")){
    return intro + `### Two-Pointers vs. Sliding Window Technique
**1. Core Intuition:**
* **Two-Pointers (Opposite Ends):** Starts from \`left = 0\` and \`right = n - 1\`. Highly effective on **sorted arrays** (e.g., Two Sum II, Valid Palindrome, Trapping Rain Water). Time complexity drops from $O(N^2)$ to $O(N)$.
* **Sliding Window (Same Direction):** Maintains a dynamic window \`[start, end]\` to track contiguous subarrays (e.g., Max sum subarray of size K, Longest substring without repeating characters).

**2. Python Code Example:**
\`\`\`python
# Sliding Window to find Max Subarray Sum of size K
def max_sub_array_of_size_k(k, arr):
    max_sum, window_sum = 0, 0
    window_start = 0
    for window_end in range(len(arr)):
        window_sum += arr[window_end]
        if window_end >= k - 1:
            max_sum = max(max_sum, window_sum)
            window_sum -= arr[window_start]
            window_start += 1
    return max_sum
\`\`\`
**Key Interview Tip:** Always verify if the array is sorted before applying opposite-direction two pointers!`;
  }

  if(q.includes("virtual memory") || q.includes("paging") || q.includes("page fault")){
    return intro + `### Operating Systems: Virtual Memory & Paging
**1. What is Virtual Memory?**
Virtual Memory is a memory management technique that gives an application the illusion of having a contiguous address space, even if physical RAM is limited and fragmented.

**2. Key Architecture:**
* **Virtual Address:** Divided into \`[Page Number (p) | Page Offset (d)]\`.
* **Page Table:** Maps logical Page Number to physical Frame Number in RAM.
* **TLB (Translation Lookaside Buffer):** High-speed hardware cache for page table lookups.
* **Page Fault:** Occurs when a referenced page is not resident in physical RAM.`;
  }

  if(q.includes("normalization") || q.includes("1nf") || q.includes("2nf") || q.includes("3nf") || q.includes("bcnf")){
    return intro + `### Database Normalization (1NF, 2NF, 3NF & BCNF)
Normalization systematically organizes relational databases to eliminate **Insert, Update, and Delete anomalies**.

**The Normal Forms Hierarchy:**
1. **1NF (Atomic Values):** All column values must be atomic; unique primary key.
2. **2NF (No Partial Dependency):** Must be in 1NF; non-prime attributes must depend on the whole candidate key.
3. **3NF (No Transitive Dependency):** Must be in 2NF; non-prime attributes must not depend on other non-prime attributes.
4. **BCNF (Boyce-Codd Normal Form):** For every $X \\rightarrow Y$, $X$ must be a superkey.`;
  }

  return intro + `### Solution & Explanation for: "${promptText}"

**Key Principles & Solution:**
1. **Algorithmic Intuition:** Break the problem down into baseline sub-problems and identify optimal data structures.
2. **Implementation Consideration:**
   * Validate boundary conditions (empty input, null pointers, negative integers).
   * Ensure $O(N)$ or $O(\\log N)$ time wherever feasible using Hash Maps, Binary Search, or Dynamic Programming.

\`\`\`python
# General Solution Pattern
def solve(data):
    if not data:
        return None
    # Process with optimal time complexity
    return [item for item in data]
\`\`\`

💡 *Would you like me to generate a C++ version, trace with sample test cases, or give interview questions?*`;
}

function renderAITutorView(){
  const history = state.aiTutorHistory || [];
  const activeMode = state.aiTutorMode || "doubts";

  const msgsHtml = history.map((m) => {
    const isBot = m.sender === "bot";
    const modeBadge = m.mode === "cs_academic" ? `<span class="ai-mode-pill academic">🎓 CSVTU CSE</span>` : isBot ? `<span class="ai-mode-pill general">🤖 Gemini</span>` : "";
    const sourceHtml = m.source ? `<div class="ai-source-badge">📖 <strong>Source:</strong> ${esc(m.source)}</div>` : "";
    const retryHtml = m.isError && m.retryText ? `<button class="ai-retry-btn" data-action="retryAITutorMsg" data-text="${esc(m.retryText)}">🔄 Retry Question</button>` : "";

    return `
      <div class="ai-msg ${isBot ? 'bot' : 'user'}">
        <div class="ai-msg-avatar">${isBot ? '🤖' : '👤'}</div>
        <div class="ai-msg-body">
          <div class="ai-msg-meta">${isBot ? 'Vidya AI Tutor' : 'You'} • ${esc(m.time || "")} ${modeBadge}</div>
          <div class="ai-msg-bubble">${formatMarkdownToHtml(m.text)} ${sourceHtml} ${retryHtml}</div>
        </div>
      </div>
    `;
  }).join("");

  const loadingHtml = state.aiTutorLoading ? `
    <div class="ai-msg bot">
      <div class="ai-msg-avatar">🤖</div>
      <div class="ai-msg-body">
        <div class="ai-msg-meta">Vidya AI Tutor • Thinking...</div>
        <div class="ai-typing-indicator">
          <span>Gemini is generating response</span>
          <span class="ai-typing-dot"></span>
          <span class="ai-typing-dot"></span>
          <span class="ai-typing-dot"></span>
        </div>
      </div>
    </div>
  ` : "";

  return `
    <div class="section-head">
      <div>
        <div class="eyebrow" style="color:#a855f7">VIDYA SETU AI LEARNING SYSTEM</div>
        <h1>🤖 Vidya AI Tutor Portal</h1>
        <p class="muted">Powered by <strong>Google Gemini (Google AI Studio)</strong> • CSVTU CSE Academic RAG &amp; General Coding Assistant</p>
      </div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn ghost" data-action="clearAIChat" title="Reset and start new chat">🗑️ New Chat</button>
        <button class="btn" data-route="college-coding">💻 College Coding Hub</button>
      </div>
    </div>

    <!-- AI Mode Selector -->
    <div class="content-filter-panel" style="background:#0e122b;border-color:#3b1e6d">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:10px">
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <strong style="color:#c084fc">Mode:</strong>
          <button class="btn ${activeMode==='doubts'?'primary':'ghost'}" data-action="setAIMode" data-mode="doubts">❓ Doubt Solver</button>
          <button class="btn ${activeMode==='code'?'primary':'ghost'}" data-action="setAIMode" data-mode="code">💻 Code Debugger</button>
          <button class="btn ${activeMode==='eli5'?'primary':'ghost'}" data-action="setAIMode" data-mode="eli5">💡 Explain Like I'm 5</button>
          <button class="btn ${activeMode==='interview'?'primary':'ghost'}" data-action="setAIMode" data-mode="interview">🎯 Technical Interview</button>
        </div>
        <span class="ai-mode-pill academic" title="CSVTU CSE Semesters 1-8 Auto-Grounding Active">🎓 CSVTU CSE (Sem 1–8) RAG Active</span>
      </div>
    </div>

    <!-- Quick Prompt Chips -->
    <div style="display:flex;gap:8px;overflow-x:auto;padding:6px 0 12px;scrollbar-width:thin">
      <button class="ai-chip" data-action="quickPrompt" data-prompt="CSVTU CSE Sem 4: Explain Banker's Algorithm with safe state calculation">Banker's Algorithm (OS)</button>
      <button class="ai-chip" data-action="quickPrompt" data-prompt="CSVTU CSE Sem 3: What is AVL Tree and how do LL, RR, LR, RL rotations work?">AVL Tree Rotations</button>
      <button class="ai-chip" data-action="quickPrompt" data-prompt="CSVTU CSE Sem 5: Explain Normalization 1NF to BCNF with student schema">DBMS Normalization</button>
      <button class="ai-chip" data-action="quickPrompt" data-prompt="CSVTU CSE Sem 6: Explain TCP 3-Way Handshake and 4-way termination with timing sequence">TCP Handshake (CN)</button>
      <button class="ai-chip" data-action="quickPrompt" data-prompt="Operating System me Paging aur Virtual Memory kaise kaam karta hai? (Hinglish)">Paging &amp; Virtual Memory (Hinglish)</button>
      <button class="ai-chip" data-action="quickPrompt" data-prompt="Explain Two-Pointers vs Sliding Window with clean C++ code">Two-Pointers vs Sliding Window</button>
      <button class="ai-chip" data-action="quickPrompt" data-prompt="Explain React useEffect dependency array rules and cleanup function">React Hooks</button>
    </div>

    <!-- Main Chat Workspace -->
    <div class="card ai-chat-container">
      <div id="aiTutorMessagesFeed" class="ai-chat-messages">
        ${msgsHtml}
        ${loadingHtml}
      </div>

      <div class="ai-chat-input-row">
        <textarea id="aiTutorMainInput" class="input textarea" rows="3" placeholder="Type your doubt, question, or paste code snippet here... (Press Ctrl+Enter to send)"></textarea>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px;flex-wrap:wrap;gap:8px">
          <div style="display:flex;gap:8px;align-items:center">
            <button id="aiPortalVoiceBtn" class="ai-mic-btn ${state.aiTutorVoiceActive ? 'recording' : ''}" data-action="voiceAITutorPortal" title="Click to speak your doubt">
              <span>🎙️</span>
              <span>${state.aiTutorVoiceActive ? 'Listening...' : 'Ask by Voice'}</span>
            </button>
            <span class="muted small">Supports English, हिंदी &amp; Hinglish</span>
          </div>
          <button id="aiTutorMainSendBtn" class="btn primary" style="background:#7c3aed;border-color:#7c3aed;padding:10px 22px;font-weight:800" data-action="sendAITutorPortalMsg" ${state.aiTutorLoading ? 'disabled' : ''}>
            ${state.aiTutorLoading ? 'Thinking...' : 'Ask AI Tutor ➔'}
          </button>
        </div>
      </div>
    </div>

    ${footer()}
  `;
}

function formatMarkdownToHtml(md){
  if(!md) return "";
  let html = esc(md);
  html = html.replace(/```([a-zA-Z0-9_\-\+\#\s]*)\n([\s\S]*?)```/g, (match, lang, code) => {
    return `<div class="ai-code-block"><div class="ai-code-head"><span>${lang || 'Code'}</span><button class="btn-xs" data-action="copyCode" data-code="${esc(code.trim())}">Copy</button></div><pre><code>${code.trim()}</code></pre></div>`;
  });
  html = html.replace(/`([^`]+)`/g, '<code class="inline-code">$1</code>');
  html = html.replace(/^### (.*$)/gim, '<h4 style="margin:12px 0 6px;color:#c084fc">$1</h4>');
  html = html.replace(/^## (.*$)/gim, '<h3 style="margin:14px 0 8px;color:#00d2ff">$1</h3>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/^\* (.*$)/gim, '<li style="margin-left:18px">$1</li>');
  html = html.replace(/\n\n/g, '<p style="margin:8px 0"></p>');
  html = html.replace(/\n/g, '<br>');
  return html;
}

function toggleAITutorDrawer(forceOpen){
  const drawer = document.getElementById("aiTutorDrawer");
  if(!drawer) return;
  const isHidden = drawer.classList.contains("hidden") || drawer.style.display === "none";
  const willOpen = (typeof forceOpen === "boolean") ? forceOpen : isHidden;

  if (willOpen) {
    drawer.style.display = "flex";
    drawer.classList.remove("hidden");
    drawer.setAttribute("aria-hidden", "false");
    renderAITutorDrawerFeed();
    const input = document.getElementById("aiDrawerInput");
    if(input) setTimeout(() => input.focus(), 100);
  } else {
    drawer.style.display = "none";
    drawer.classList.add("hidden");
    drawer.setAttribute("aria-hidden", "true");
  }
}

function renderAITutorDrawerFeed(){
  const feed = document.getElementById("aiDrawerMessages");
  if(!feed) return;
  const history = state.aiTutorHistory || [];
  const msgsHtml = history.map(m => {
    const isBot = m.sender === "bot";
    const modeBadge = m.mode === "cs_academic" ? `<span class="ai-mode-pill academic" style="font-size:9px">🎓 CSVTU CSE</span>` : "";
    const sourceHtml = m.source ? `<div class="ai-source-badge" style="font-size:10px;padding:3px 6px">📖 ${esc(m.source)}</div>` : "";
    const retryHtml = m.isError && m.retryText ? `<button class="ai-retry-btn" style="font-size:11px;padding:4px 8px" data-action="retryAITutorMsg" data-text="${esc(m.retryText)}">🔄 Retry</button>` : "";
    return `
      <div class="ai-msg ${isBot ? 'bot' : 'user'}">
        <div class="ai-msg-bubble">
          ${isBot ? `<div style="font-size:10px;color:#a855f7;font-weight:700;margin-bottom:4px">🤖 Vidya AI Tutor ${modeBadge}</div>` : ''}
          ${formatMarkdownToHtml(m.text)}
          ${sourceHtml}
          ${retryHtml}
        </div>
      </div>
    `;
  }).join("");

  const loadingHtml = state.aiTutorLoading ? `
    <div class="ai-msg bot">
      <div class="ai-msg-bubble">
        <div class="ai-typing-indicator">
          <span>Gemini is thinking</span>
          <span class="ai-typing-dot"></span>
          <span class="ai-typing-dot"></span>
          <span class="ai-typing-dot"></span>
        </div>
      </div>
    </div>
  ` : "";

  feed.innerHTML = msgsHtml + loadingHtml;
  feed.scrollTop = feed.scrollHeight;
}

function startVoiceRecognition(source="portal"){
  const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRec) {
    toast("Speech recognition is not supported in this browser. Please use Chrome/Edge or type your question.");
    return;
  }

  if (state.aiTutorVoiceActive) {
    try { window.__activeVoiceRecognition?.stop(); } catch(e){}
    state.aiTutorVoiceActive = false;
    if(source === "portal") render();
    else renderAITutorDrawerFeed();
    toast("Microphone stopped.");
    return;
  }

  try {
    const recognition = new SpeechRec();
    window.__activeVoiceRecognition = recognition;
    recognition.lang = "en-IN";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      state.aiTutorVoiceActive = true;
      toast("🎙️ Listening... Speak your doubt clearly now");
      if(source === "portal") render();
      else {
        const btn = document.getElementById("aiDrawerVoiceBtn");
        if(btn) btn.classList.add("recording");
      }
    };

    recognition.onresult = (event) => {
      const transcript = event.results?.[0]?.[0]?.transcript || "";
      if (transcript.trim()) {
        toast(`Recognized: "${transcript}"`);
        const inputId = source === "portal" ? "aiTutorMainInput" : "aiDrawerInput";
        const inputEl = document.getElementById(inputId);
        if (inputEl) inputEl.value = transcript;
        submitAITutorMessage(transcript, source);
      }
    };

    recognition.onerror = (event) => {
      console.warn("Speech recognition error:", event.error);
      state.aiTutorVoiceActive = false;
      if (event.error === "not-allowed") {
        toast("Microphone access denied. Please allow microphone permission in your browser.");
      } else if (event.error === "no-speech") {
        toast("No speech detected. Please tap mic and speak again.");
      } else {
        toast(`Voice error: ${event.error}. Please type your question.`);
      }
      if(source === "portal") render();
      else {
        const btn = document.getElementById("aiDrawerVoiceBtn");
        if(btn) btn.classList.remove("recording");
      }
    };

    recognition.onend = () => {
      state.aiTutorVoiceActive = false;
      if(source === "portal") render();
      else {
        const btn = document.getElementById("aiDrawerVoiceBtn");
        if(btn) btn.classList.remove("recording");
      }
    };

    recognition.start();
  } catch (err) {
    console.error("Speech recognition start failed:", err);
    state.aiTutorVoiceActive = false;
    toast("Could not start speech recognition. Please type your doubt.");
    if(source === "portal") render();
  }
}

async function submitAITutorMessage(text, source="portal"){
  const clean = String(text || "").trim();
  if(!clean || state.aiTutorLoading) return;

  const userTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
  state.aiTutorHistory.push({ sender: "user", text: clean, time: userTime });
  state.aiTutorLoading = true;

  if(source === "portal"){
    const input = document.getElementById("aiTutorMainInput");
    if(input) input.value = "";
    render();
    setTimeout(() => {
      const f = document.getElementById("aiTutorMessagesFeed");
      if(f) f.scrollTop = f.scrollHeight;
    }, 40);
  } else {
    const input = document.getElementById("aiDrawerInput");
    if(input) input.value = "";
    renderAITutorDrawerFeed();
  }

  try {
    const response = await fetch("/api/ai-tutor/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: clean,
        history: state.aiTutorHistory.slice(-8),
        mode: state.aiTutorMode || "doubts"
      })
    });

    const data = await response.json();
    const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});

    if (response.ok && data.success) {
      state.aiTutorHistory.push({
        sender: "bot",
        text: data.reply,
        time: botTime,
        source: data.source,
        mode: data.mode,
        detectedLanguage: data.detectedLanguage
      });
      state.lastFailedMessage = "";
    } else {
      const errMsg = data.error || "Could not retrieve answer from Google Gemini. Please try again.";
      state.lastFailedMessage = clean;
      state.aiTutorHistory.push({
        sender: "bot",
        text: `⚠️ **Error:** ${errMsg}`,
        time: botTime,
        isError: true,
        retryText: clean
      });
      toast("AI Tutor encountered an issue. You can click Retry.");
    }
  } catch (err) {
    console.error("AI Tutor API error:", err);
    const botTime = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
    state.lastFailedMessage = clean;
    const offlineReply = generateAITutorResponse(clean, state.aiTutorMode || "doubts");
    state.aiTutorHistory.push({
      sender: "bot",
      text: offlineReply + "\n\n*(Note: Live server connection interrupted. Showing offline reference notes.)*",
      time: botTime,
      isError: true,
      retryText: clean
    });
  } finally {
    state.aiTutorLoading = false;
    if(source === "portal"){
      render();
      setTimeout(() => {
        const f = document.getElementById("aiTutorMessagesFeed");
        if(f) f.scrollTop = f.scrollHeight;
      }, 50);
    } else {
      renderAITutorDrawerFeed();
    }
  }
}

function openModal(title,body){
 $("#modalRoot").innerHTML=
   `<div class="modal-backdrop" data-close-modal>
      <div class="modal" role="dialog" aria-modal="true">
        <div class="modal-head"><h2>${title}</h2><button class="close" data-close-modal>×</button></div>
        <div style="margin-top:14px">${body}</div>
      </div>
    </div>`;
}

function closeModal(){
 $("#modalRoot").innerHTML="";
}

function authModal(mode="student"){
  state.authMode=mode;
  openModal(`Vidya Setu — Sign In`, `
    <div class="portal-login-grid">
      <button type="button" class="btn ${mode==="student"?'primary':''}" data-action="switchAuthMode" data-mode="student">🎓 Student Login</button>
      <button type="button" class="btn ${mode==="teacher"?'primary':''}" data-action="switchAuthMode" data-mode="teacher">👨‍🏫 Teacher Login</button>
      <button type="button" class="btn ${mode==="admin"?'primary':''}" data-action="switchAuthMode" data-mode="admin">⚙️ Admin Login</button>
    </div>
    <div class="form-grid" style="margin-top:14px">
      <div class="field full"><label>Email</label><input id="authEmail" class="input" type="email" placeholder="you@example.com"></div>
      <div class="field full"><label>Password</label><input id="authPass" class="input" type="password" placeholder="Enter password"></div>
    </div>
    <div class="toolbar" style="margin-top:16px">
      <button class="btn primary" data-action="login">Login with Password</button>
      <button class="btn orange" data-action="signup">Create Account</button>
    </div>
  `);
}

function switchAuthMode(mode){
  state.authMode=mode;
  authModal(mode);
}

async function login(){
  const email=$("#authEmail")?.value.trim().toLowerCase();
  const password=$("#authPass")?.value;
  if(!email||!password) return toast("Enter email and password.");
  if(state.supabase){
    const {data,error}=await state.supabase.auth.signInWithPassword({email,password});
    if(error) return toast(error.message);
    state.user=data.user;
    state.session=data.session;
    await loadProfile();
    toast(`Welcome, ${state.profile?.full_name||email}!`);
  }else{
    state.user={email,id:"user-"+Date.now()};
    state.profile={full_name:email.split('@')[0],role:state.authMode};
    toast(`Signed in as ${state.profile.full_name}`);
  }
  closeModal();
  updateChrome();
  render();
}

async function signup(){
  const email=$("#authEmail")?.value.trim().toLowerCase();
  const password=$("#authPass")?.value;
  if(!email||!password) return toast("Enter email and password.");
  if(state.supabase){
    const {data,error}=await state.supabase.auth.signUp({email,password});
    if(error) return toast(error.message);
    toast("Account created! Check email or sign in.");
  }else{
    state.user={email,id:"user-"+Date.now()};
    state.profile={full_name:email.split('@')[0],role:state.authMode};
    toast("Account registered!");
  }
  closeModal();
  updateChrome();
  render();
}

async function logout(){
  if(state.supabase) await state.supabase.auth.signOut();
  state.user=null;
  state.profile=null;
  state.session=null;
  toast("Signed out successfully.");
  setRoute("home");
}

async function saveProfile(){
  const name=$("#profileName")?.value.trim();
  const city=$("#profileCity")?.value.trim();
  const goal=$("#profileGoal")?.value.trim();
  if(!name) return toast("Please enter your name.");
  state.profile={...(state.profile||{}),full_name:name,city,learning_goal:goal};
  toast("Profile saved!");
  updateChrome();
  render();
}

function loadRemoteCustomization(){
  try{
    const raw=localStorage.getItem('v2edduverse_customization');
    if(raw){const parsed=JSON.parse(raw);state.customization={...state.customization,...parsed,social:{...DEFAULT_SOCIAL,...(parsed.social||{})}};}
    else state.customization={...state.customization,social:{...DEFAULT_SOCIAL}};
  }catch(e){state.customization={...state.customization,social:{...DEFAULT_SOCIAL}};}
}

// Global Event Delegation
document.addEventListener("click", async e=>{
 const t=e.target.closest("[data-route],[data-action],[data-class],[data-chapter],[data-academic-section],[data-open-html],[data-wb],[data-quiz-option],[data-close-modal]");
 if(!t)return;
 try{
  if(t.dataset.closeModal!==undefined){closeModal();return}
  if(t.dataset.route){setRoute(t.dataset.route);return}
  if(t.dataset.class){
    const rawClassId=String(t.dataset.class||"");
    let c=getClasses().find(x=>String(x.id)===rawClassId);
    if(!c && rawClassId.startsWith("local-class-")){
      const num=Number(rawClassId.slice("local-class-".length));
      c=getClasses().find(x=>Number(x.class_number)===num);
    }
    if(c){
      state._classId=c.id;
      renderSubjectsForClass(c.id);
    }
    return;
  }
  if(t.dataset.chapter){
    state._chapterId=t.dataset.chapter;
    setRoute("chapter");
    return;
  }
  if(t.dataset.academicSection){
    state._academicSectionId=t.dataset.academicSection;
    setRoute("academic");
    return;
  }
  if(t.dataset.openHtml){
    window.location.href=t.dataset.openHtml;
    return;
  }
  if(t.dataset.quizOption!==undefined){
    answerQuiz(Number(t.dataset.quizOption));
    return;
  }
  if(t.dataset.wb){
    await wbAction(t.dataset.wb);
    return;
  }

  const a=t.dataset.action;
  if(a==="openCodingNote"){
    state._codingNoteId=t.dataset.id;
    setRoute("coding-note");
    return;
  }
  if(a==="copyCode"){
    const code=t.dataset.code||"";
    if(navigator.clipboard && code){
      navigator.clipboard.writeText(code).then(()=>toast("✓ Code copied to clipboard!")).catch(()=>toast("Code copied."));
    }else{
      toast("Code copied.");
    }
    return;
  }
  if(a==="askAITutorNote"){
    const noteTitle=t.dataset.title||"";
    state.aiTutorHistory.push({
      sender:"user",
      text:`Explain ${noteTitle} in detail with interview tips and practical examples.`,
      time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
    });
    const reply=generateAITutorResponse(noteTitle,"doubts");
    state.aiTutorHistory.push({
      sender:"bot",
      text:reply,
      time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})
    });
    setRoute("ai-tutor");
    return;
  }
  if(a==="filterCollegeTrack"){
    state._collegeTrackFilter=t.dataset.track;
    render();
    return;
  }
  if(a==="setAIMode"){
    state.aiTutorMode=t.dataset.mode;
    render();
    return;
  }
  if(a==="quickPrompt"){
    const prompt=t.dataset.prompt||"";
    submitAITutorMessage(prompt, state.route==="ai-tutor"?"portal":"drawer");
    return;
  }
  if(a==="sendAITutorPortalMsg"){
    const input=document.getElementById("aiTutorMainInput");
    submitAITutorMessage(input?.value||"","portal");
    return;
  }
  if(a==="sendAITutorDrawerMsg"){
    const input=document.getElementById("aiDrawerInput");
    submitAITutorMessage(input?.value||"","drawer");
    return;
  }
  if(a==="voiceAITutorPortal"){
    startVoiceRecognition("portal");
    return;
  }
  if(a==="voiceAITutorDrawer"){
    startVoiceRecognition("drawer");
    return;
  }
  if(a==="retryAITutorMsg"){
    const retryText = t.dataset.text || state.lastFailedMessage;
    if(retryText) submitAITutorMessage(retryText, state.route === "ai-tutor" ? "portal" : "drawer");
    return;
  }
  if(a==="toggleAITutorDrawer"){
    toggleAITutorDrawer();
    return;
  }
  if(a==="closeAITutorDrawer"){
    toggleAITutorDrawer(false);
    return;
  }
  if(a==="clearAIChat"){
    state.aiTutorHistory=[{ sender:"bot", text:"👋 Chat cleared! How can I help you with your coding or studies today?", time:new Date().toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}) }];
    if(state.route==="ai-tutor") render();
    renderAITutorDrawerFeed();
    toast("AI Tutor chat history cleared.");
    return;
  }
  if(a==="auth") return authModal("student");
  if(a==="switchAuthMode") return switchAuthMode(t.dataset.mode);
  if(a==="login") return login();
  if(a==="signup") return signup();
  if(a==="logout") return logout();
  if(a==="saveProfile") return saveProfile();
  if(a==="toggleMobileSidebar"){ toggleMobileSidebar(); return; }
  if(a==="closeMobileSidebar"){ closeMobileSidebar(); return; }
  if(a==="toggleTheme"){
    const light=document.body.classList.toggle("light");
    localStorage.setItem("v2-theme",light?"light":"dark");
    return;
  }
  if(a==="resetQuiz") return resetQuiz();
  if(a==="nextQuiz") return nextQuiz();
  if(a==="bookmarkChapter"){ toast("Bookmark saved!"); return; }
  if(a==="progressChapter"){ toast("Chapter marked as completed!"); return; }
 }catch(err){
   console.error("Action error:", err);
 }
});

function renderSubjectsForClass(classId){
 const c=getClasses().find(x=>String(x.id)===String(classId));
 const subs=getSubjects().filter(s=>String(s.class_id)===String(classId));
 $("#main").innerHTML=`<div class="section-head"><div><div class="eyebrow">CLASS CURRICULUM</div><h1>${esc(c?.name||"Class")}</h1><p class="muted">Choose a subject to explore chapters.</p></div><button class="btn ghost" data-route="classes">← All Classes</button></div><div class="grid">${subs.map(s=>card(esc(s.name),`<p class="muted">${chaptersForSubject(s.id).length} chapters</p>`,`<button class="btn primary" data-subject="${esc(s.id)}">Open Subject</button>`)).join("")||`<div class="empty">No subjects found for this class.</div>`}</div>${footer()}`;
}
document.addEventListener("click",e=>{const s=e.target.closest("[data-subject]");if(s){state._subjectId=s.dataset.subject;setRoute("subject")}});

// Keyboard Shortcuts
document.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    closeModal();
    toggleAITutorDrawer(false);
  }
  if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
    if (e.target && e.target.id === "aiTutorMainInput") {
      e.preventDefault();
      submitAITutorMessage(e.target.value, "portal");
    } else if (e.target && e.target.id === "aiDrawerInput") {
      e.preventDefault();
      submitAITutorMessage(e.target.value, "drawer");
    }
  }
});

// Click outside AI Tutor Drawer to close when open
document.addEventListener("click", e => {
  const drawer = document.getElementById("aiTutorDrawer");
  if (drawer && drawer.style.display !== "none" && !drawer.classList.contains("hidden")) {
    const isInside = e.target.closest("#aiTutorDrawer") || e.target.closest("#aiTutorFloatingBtn");
    const isAiTrigger = e.target.closest('[data-action="toggleAITutorDrawer"]') || 
                        e.target.closest('[data-action="closeAITutorDrawer"]') || 
                        e.target.closest('[data-action="askAITutorNote"]') ||
                        e.target.closest('[data-action="quickPrompt"]');
    if (!isInside && !isAiTrigger) {
      toggleAITutorDrawer(false);
    }
  }
});

document.addEventListener("input", e => {
  if (e.target && e.target.id === "collegeSearchInput") {
    clearTimeout(window.__collegeSearchTimer);
    window.__collegeSearchTimer = setTimeout(() => {
      state._collegeSearchQ = e.target.value;
      render();
    }, 150);
  }
});

// App Startup
document.addEventListener("DOMContentLoaded",()=>{
 if(localStorage.getItem("v2-theme")==="light") document.body.classList.add("light");
 buildLocalCatalog();
 loadRemoteCustomization();
 render();
 initSupabase();
});
})();
