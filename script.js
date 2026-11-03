// Gen AI Learning Portal - standalone browser version
// Save progress locally in this browser. The AI Tutor uses a simple demo response;
// connect an AI API on a server if you need real AI answers.

const $ = (selector) => document.querySelector(selector);
const escapeHTML = (value) => String(value ?? "").replace(/[&<>"]/g, ch => ({
  "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;"
}[ch]));
const uid = () => Math.random().toString(36).slice(2, 8);
const youtube = (id) => "https://www.youtube-nocookie.com/embed/" + id;
const question = (q, options, answer) => ({ q, options: options.split("|"), answer });
const colors = [
  "#7c3aed,#a78bfa", "#ec4899,#fb7185", "#0ea5e9,#22d3ee",
  "#f59e0b,#fcd34d", "#10b981,#6ee7b7", "#8b5cf6,#ec4899",
  "#ef4444,#f59e0b", "#06b6d4,#6366f1"
];

const defaultContent = {
  courses: [
    {id:"c1", icon:"🐍", level:"Beginner", title:"Python Basics", video:youtube("rfscVS0vtbw"), description:"Variables, loops, functions.", quiz:[
      question("Which keyword defines a function in Python?","func|def|function|lambda",1),
      question("What does len([1,2,3]) return?","2|3|4|Error",1),
      question("Which is a mutable type?","tuple|str|list|int",2),
      question("Which symbol starts a comment?","//|#|--|/*",1)]},
    {id:"c2", icon:"🌐", level:"Beginner", title:"Web Development", video:youtube("qz0aGYrrlhU"), description:"HTML, CSS and JavaScript intro.", quiz:[
      question("Which tag creates a hyperlink?","<a>|<link>|<href>|<p>",0),
      question("CSS stands for?","Creative Style Sheets|Cascading Style Sheets|Computer Style Sheets|Colorful Style Sheets",1),
      question("Which tag holds the largest heading?","<h6>|<head>|<h1>|<title>",2)]},
    {id:"c3", icon:"⚡", level:"Intermediate", title:"JavaScript Full Course", video:youtube("PkZNo7MFNFg"), description:"Core JavaScript: types, functions, DOM and more.", quiz:[
      question("Which keyword declares a block-scoped variable?","var|let|dim|int",1),
      question("What does === check?","Value only|Type only|Value and type|Assignment",2),
      question("Which method adds an item to the end of an array?","push()|pop()|shift()|add()",0)]},
    {id:"c4", icon:"🗄️", level:"Beginner", title:"SQL & Databases", video:youtube("HXV3zeQKqGY"), description:"Query data with SELECT, JOIN and GROUP BY.", quiz:[
      question("Which command reads data from a table?","GET|SELECT|READ|FETCH",1),
      question("Which clause filters rows?","WHERE|ORDER BY|GROUP|LIMIT",0),
      question("JOIN is used to…","Delete rows|Combine tables|Create a DB|Sort data",1)]},
    {id:"c5", icon:"🤖", level:"Intermediate", title:"Machine Learning", video:youtube("i_LwzRVP7bg"), description:"ML concepts for everybody: models, training, evaluation.", quiz:[
      question("Learning from labelled examples is called…","Unsupervised|Supervised|Reinforcement|Random",1),
      question("Overfitting means the model…","Is too simple|Memorises training data|Has no data|Trains too fast",1),
      question("Which is a classification task?","Predicting house price|Spam or not spam|Forecasting temperature|Clustering",1)]},
    {id:"c6", icon:"✨", level:"Generative AI", title:"Intro to Large Language Models", video:youtube("zjkBMFhNj_g"), description:"How LLMs work and their limits.", quiz:[
      question("LLM stands for…","Large Language Model|Long Logic Machine|Linear Learning Method|Low-Level Memory",0),
      question("LLMs mainly learn to…","Predict the next token|Browse the web|Compile code|Store files",0),
      question('A "prompt" is…',"The model weights|Your input instructions|A database|An error",1),
      question("A hallucination is…","A fast reply|A confident but wrong answer|A bug in CSS|A GPU feature",1)]},
    {id:"c7", icon:"🧠", level:"Generative AI", title:"Neural Networks Explained", video:youtube("aircAruvnKk"), description:"Visual intuition for neurons, layers and learning.", quiz:[
      question("A neural network is made of…","Layers of neurons|Only tables|Folders|Pixels only",0),
      question("Weights in a network are…","Fixed forever|Adjusted during training|Random at test time|Images",1),
      question("Gradient descent is used to…","Minimise loss|Draw graphs|Store data|Encrypt",0)]},
    {id:"c8", icon:"🔧", level:"Beginner", title:"Git & GitHub", video:youtube("RGOj5yH7evk"), description:"Version control for solo and team projects.", quiz:[
      question("Which command saves staged changes?","git push|git commit|git add|git pull",1),
      question("Which stages files for commit?","git add|git save|git stage-all|git init",0),
      question("Which downloads a remote repo?","git clone|git copy|git fetch-all|git get",0)]}
  ],
  assignments: [
    {id:"a1", title:"Write a 1-page summary of Python loops", due:"2026-10-20", course:"c1"},
    {id:"a2", title:"Build a simple HTML profile page with a heading, list and link", due:"2026-10-22", course:"c2"},
    {id:"a3", title:"Write a JavaScript function that reverses a string and explain how it works", due:"2026-10-25", course:"c3"},
    {id:"a4", title:"Write 3 SQL queries (SELECT, WHERE, JOIN) for a students table", due:"2026-10-28", course:"c4"},
    {id:"a5", title:"Explain supervised vs unsupervised learning with one real example each", due:"2026-10-30", course:"c5"},
    {id:"a6", title:"Write 5 prompts for an LLM and note which gave the best answer and why", due:"2026-11-02", course:"c6"},
    {id:"a7", title:"Describe in your own words how a neural network learns", due:"2026-11-05", course:"c7"},
    {id:"a8", title:"List the Git commands to create a repo, commit a file and push it", due:"2026-11-08", course:"c8"}
  ],
  sessions: [
    {id:"s1", title:"Python – Week 1 class", date:"2026-10-06", open:true},
    {id:"s2", title:"Web Development – Live lab", date:"2026-10-08", open:true},
    {id:"s3", title:"Generative AI – Intro workshop", date:"2026-10-10", open:true}
  ]
};

let content = load("portal_content", defaultContent);
let user = null, progress = {}, allProgress = load("portal_all_progress", {});
let view = "home", currentCourse = null, quizState = null, chat = [], studyTimer = null, studyStart = 0;

function load(key, fallback) {
  try { const saved = localStorage.getItem(key); return saved ? JSON.parse(saved) : structuredClone(fallback); }
  catch { return JSON.parse(JSON.stringify(fallback)); }
}
function saveContent() { localStorage.setItem("portal_content", JSON.stringify(content)); }
function saveProgress() {
  if (!user || user.role !== "student") return;
  allProgress[user.roll] = progress;
  localStorage.setItem("portal_all_progress", JSON.stringify(allProgress));
}
function blankProgress(name, roll) {
  return {name, roll, registered:[], seconds:{}, scores:{}, submissions:{}, attendance:{}};
}
function formatTime(seconds) {
  seconds = seconds | 0;
  return Math.floor(seconds/3600) + "h " + Math.floor(seconds%3600/60) + "m " + seconds%60 + "s";
}
function totalTime(p) { return Object.values(p.seconds || {}).reduce((a,b)=>a+b,0); }
function averageScore(p) {
  const scores = Object.values(p.scores || {});
  return scores.length ? Math.round(scores.reduce((sum,s)=>sum+s.score/s.total*100,0)/scores.length) : null;
}
function attendancePercent(p) {
  return content.sessions.length ? Math.round(Object.keys(p.attendance || {}).length/content.sessions.length*100) : 0;
}
function courseName(id) { return (content.courses.find(c=>c.id===id)||{}).title || ""; }
function courseColor(id) { return colors[Math.max(0,content.courses.findIndex(c=>c.id===id))%colors.length]; }
function banner(c) { return `<div class="banner" style="background:linear-gradient(135deg,${courseColor(c.id)})">${c.icon||"📘"}</div>`; }

function login(role) {
  const name = $("#name").value.trim(), roll = $("#roll").value.trim();
  if (role === "admin") {
    if ($("#password").value !== "admin123") return alert("Wrong admin passcode. Demo passcode: admin123");
    user = {role:"admin", name:name || "Admin"};
    view = "dash";
  } else {
    if (!name || !roll) return alert("Enter your name and roll number.");
    user = {role:"student", name, roll};
    progress = allProgress[roll] || blankProgress(name, roll);
    progress.name = name; progress.roll = roll;
    view = "home"; saveProgress();
  }
  draw();
}
function logout() { stopStudyTimer(); user=null; currentCourse=null; quizState=null; draw(); }
function stopStudyTimer() {
  if (studyTimer) clearInterval(studyTimer);
  studyTimer = null;
  if (user && user.role === "student") saveProgress();
}
function go(next) { stopStudyTimer(); currentCourse=null; view=next; draw(); }

function draw() {
  const app = $("#app");
  if (!user) {
    app.innerHTML = `<main><section class="card login"><div class="big">🤖✨</div><h2>GEN AI LEARNING PORTAL</h2>
      <p class="muted">Courses, videos, quizzes, assignments, attendance and an AI tutor — all in one place.</p>
      <input id="name" placeholder="Full name"><input id="roll" placeholder="Roll number (students)">
      <button class="btn primary" style="width:100%" onclick="login('student')">Student login</button>
      <hr style="border:0;border-top:1px solid var(--border);margin:14px 0">
      <input id="password" type="password" placeholder="Admin passcode (demo: admin123)">
      <button class="btn" style="width:100%" onclick="login('admin')">Admin login</button></section></main>`;
    return;
  }
  const student = user.role === "student";
  const tabs = student
    ? [["home","🏠 Home"],["courses","📚 Courses"],["quiz","📝 Quizzes"],["assign","📎 Assignments"],["att","✅ Attendance"],["tutor","🤖 AI Tutor"],["java","☕ Java Runner"]]
    : [["dash","📊 Performance"],["manage","➕ Manage"],["att","✅ Attendance"]];
  app.innerHTML = `<header><b>🤖 GEN AI LEARNING PORTAL</b><span>${escapeHTML(user.name)} (${user.role}) <button class="btn" onclick="logout()">Logout</button></span></header>
    <nav>${tabs.map(t=>`<button class="${view===t[0]?'on':''}" onclick="go('${t[0]}')">${t[1]}</button>`).join("")}
    <button class="btn" onclick="toggleTheme()">🌓 Theme</button></nav><main>${(views[view]||views.home)()}</main>`;
  const chatBox = $("#chat"); if (chatBox) chatBox.scrollTop = chatBox.scrollHeight;
}
function toggleTheme() {
  const root = document.documentElement;
  root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark";
}
const views = {
  home() {
    const avg=averageScore(progress), done=Object.keys(progress.submissions||{}).length;
    return `<h2>Welcome, ${escapeHTML(user.name)} 👋</h2><div class="grid stats">
      <div class="card"><div class="muted">⏱ Total study time</div><div class="stat">${formatTime(totalTime(progress))}</div></div>
      <div class="card"><div class="muted">🏆 Average quiz score</div><div class="stat">${avg===null?"—":avg+"%"}</div></div>
      <div class="card"><div class="muted">✅ Attendance</div><div class="stat">${attendancePercent(progress)}%</div></div>
      <div class="card"><div class="muted">📚 Courses enrolled</div><div class="stat">${progress.registered.length}/${content.courses.length}</div></div></div>
      <div class="card"><h3>📎 Assignments done: ${done}/${content.assignments.length}</h3><div class="bar"><i style="width:${content.assignments.length?done/content.assignments.length*100:0}%"></i></div></div>
      <div class="card"><h3>⏱ Time per course</h3>${progress.registered.length?progress.registered.map(id=>`<div>${escapeHTML((content.courses.find(c=>c.id===id)||{}).icon||"")} ${escapeHTML(courseName(id))} — <b>${formatTime(progress.seconds[id]||0)}</b></div>`).join(""):'<span class="muted">Register for a course to begin.</span>'}</div>
      <div class="card"><h3>🏅 Recent scores</h3>${Object.entries(progress.scores).map(([id,s])=>`<div>${escapeHTML(s.title)}: <b>${s.score}/${s.total}</b></div>`).join("")||'<span class="muted">No quizzes taken yet.</span>'}</div>`;
  },
  courses() {
    if (currentCourse) {
      const c=content.courses.find(x=>x.id===currentCourse); if(!c) {currentCourse=null; return this.courses();}
      const video = c.video ? `<iframe class="video-frame" src="${escapeHTML(c.video)}" title="${escapeHTML(c.title)} video" allowfullscreen></iframe>` : '<p class="muted">No video added yet.</p>';
      return `<button class="btn" onclick="go('courses')">← Back</button><div class="card"><h3>${c.icon||""} ${escapeHTML(c.title)}</h3><p class="muted">${escapeHTML(c.description)}</p>${video}
        <p class="muted">Study time: <b id="study-time">${formatTime(progress.seconds[c.id]||0)}</b></p>
        <button class="btn primary" onclick="startQuiz('${c.id}')">Practice quiz</button> <button class="btn" onclick="goTutorFor('${c.id}')">Ask AI tutor</button></div>`;
    }
    return `<h2>📚 Courses</h2><div class="grid">${content.courses.map(c=>{const registered=progress.registered.includes(c.id);return `<div class="card course-card">${banner(c)}<div class="course-body"><span class="tag">${escapeHTML(c.level||"Course")}</span><span class="tag">${c.quiz.length} quiz Qs</span><h3>${escapeHTML(c.title)}</h3><p class="muted">${escapeHTML(c.description)}</p>${registered?`<button class="btn primary" onclick="openCourse('${c.id}')">▶ Open & practice</button>`:`<button class="btn" onclick="registerCourse('${c.id}')">+ Register</button>`}</div></div>`;}).join("")}</div>`;
  },
  quiz() {
    if (quizState) {
      const q=quizState, current=q.course.quiz[q.index];
      if (!current) return `<div class="card" style="text-align:center"><div class="big">${q.score/q.course.quiz.length>=.8?"🏆":q.score/q.course.quiz.length>=.5?"👏":"💪"}</div><h3>${q.score/q.course.quiz.length>=.8?"Excellent!":q.score/q.course.quiz.length>=.5?"Good job!":"Keep practising!"}</h3><div class="stat">${q.score}/${q.course.quiz.length}</div><p>Your score has been saved in this browser.</p><button class="btn primary" onclick="quizState=null;draw()">Back to quizzes</button></div>`;
      return `<div class="card"><h3>${q.course.icon||""} ${escapeHTML(q.course.title)} — Q${q.index+1}/${q.course.quiz.length}</h3><div class="bar"><i style="width:${q.index/q.course.quiz.length*100}%"></i></div><p>${escapeHTML(current.q)}</p>${current.options.map((option,i)=>`<button class="option" style="width:100%;text-align:left;background:var(--card);color:var(--text)" onclick="answerQuiz(${i})">${escapeHTML(option)}</button>`).join("")}</div>`;
    }
    return `<h2>📝 Quizzes</h2><div class="grid">${content.courses.map(c=>`<div class="card course-card">${banner(c)}<div class="course-body"><h3>${escapeHTML(c.title)}</h3><span class="muted">${c.quiz.length} questions${progress.scores[c.id]?' · last score '+progress.scores[c.id].score+'/'+progress.scores[c.id].total:''}</span><br><br><button class="btn primary" onclick="startQuiz('${c.id}')">Start</button></div></div>`).join("")}</div>`;
  },
  assign() {
    return `<h2>📎 Assignments</h2>${content.assignments.map(a=>{const submitted=progress.submissions[a.id];return `<div class="card"><span class="tag">${escapeHTML(courseName(a.course))}</span><h3>${escapeHTML(a.title)}</h3><div class="muted">Due ${escapeHTML(a.due)}</div>${submitted?`<p>✅ Submitted:</p><p>${escapeHTML(submitted.text)}</p>`:`<textarea id="answer-${a.id}" rows="4" placeholder="Type your answer…"></textarea><button class="btn primary" onclick="submitAssignment('${a.id}')">Submit</button>`}</div>`;}).join("")||'<p class="muted">No assignments yet.</p>'}`;
  },
  att() {
    if(user.role==="admin") return `<h2>✅ Attendance</h2>${content.sessions.map(s=>{const count=Object.values(allProgress).filter(p=>p.attendance&&p.attendance[s.id]).length;return `<div class="card"><h3>${escapeHTML(s.title)}</h3><span class="muted">${escapeHTML(s.date)} · ${count} present · ${s.open?"OPEN":"closed"}</span><br><br><button class="btn" onclick="toggleSession('${s.id}')">${s.open?"Close":"Reopen"}</button></div>`;}).join("")}<div class="card"><h3>New session</h3><input id="session-title" placeholder="Session title"><button class="btn primary" onclick="newSession()">Open session</button></div>`;
    return `<h2>✅ Attendance</h2>${content.sessions.map(s=>`<div class="card"><h3>${escapeHTML(s.title)}</h3><span class="muted">${escapeHTML(s.date)}</span><br><br>${progress.attendance[s.id]?'✅ Present':s.open?`<button class="btn primary" onclick="markPresent('${s.id}')">Mark present</button>`:'<span class="muted">Closed — absent</span>'}</div>`).join("")}`;
  },
  tutor() {
    return `<h2>🤖 AI Tutor</h2><div class="card"><p class="muted">This standalone demo gives simple topic-based responses. A real AI tutor requires an API connected securely through a backend server.</p><div class="chat" id="chat">${chat.map(m=>`<div class="${m.role==="user"?"chat-user":"chat-ai"}">${escapeHTML(m.text)}</div>`).join("")||'<span class="muted">Ask about a course concept, for example: What is Python?</span>'}</div><input id="tutor-question" placeholder="Ask your tutor…" onkeydown="if(event.key==='Enter')askTutor()"><button class="btn primary" onclick="askTutor()">Send</button></div>`;
  },

  java() {
    return `<h2>☕ Java Code Runner</h2>
      <div class="card">
        <p class="muted">Write a Java program using <b>public class Main</b>, then click Run. The backend compiles it with javac and runs it with java.</p>
        <label for="java-code"><b>Java source code</b></label>
        <textarea id="java-code" class="code-editor" rows="15" spellcheck="false">public class Main {
    public static void main(String[] args) {
        System.out.println("Hello, Java!");
    }
}</textarea>
        <label for="java-input"><b>Program input (optional)</b></label>
        <textarea id="java-input" rows="3" placeholder="Enter input for Scanner here..."></textarea>
        <button class="btn primary" id="java-run-button" onclick="runJavaCode()">▶ Run Java</button>
        <div id="java-status" class="muted" role="status">Backend: http://localhost:8080</div>
        <h3>Output</h3>
        <pre id="java-output" class="java-output">Your program output will appear here.</pre>
      </div>`;
  },
  dash() {
    const list=Object.values(allProgress), scores=list.map(averageScore).filter(v=>v!==null);
    return `<h2>📊 Student performance</h2><p class="muted">Student data is stored in this browser only. It is not shared across different devices.</p><div class="grid stats"><div class="card"><div class="muted">Students</div><div class="stat">${list.length}</div></div><div class="card"><div class="muted">Avg score</div><div class="stat">${scores.length?Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)+"%":"—"}</div></div></div><div class="card table-wrap"><table><tr><th>Student</th><th>Roll</th><th>Courses</th><th>Study time</th><th>Avg score</th><th>Attendance</th><th>Assignments</th></tr>${list.map(p=>`<tr><td>${escapeHTML(p.name)}</td><td>${escapeHTML(p.roll)}</td><td>${(p.registered||[]).length}</td><td>${formatTime(totalTime(p))}</td><td>${averageScore(p)===null?"—":averageScore(p)+"%"}</td><td>${attendancePercent(p)}%</td><td>${Object.keys(p.submissions||{}).length}/${content.assignments.length}</td></tr>`).join("")||'<tr><td colspan="7" class="muted">No students yet.</td></tr>'}</table></div>`;
  },
  manage() {
    const options=content.courses.map(c=>`<option value="${c.id}">${escapeHTML(c.title)}</option>`).join("");
    return `<h2>➕ Manage content</h2>
      <div class="card"><h3>Post assignment</h3><input id="assignment-title" placeholder="Title"><input id="assignment-due" type="date"><select id="assignment-course">${options}</select><button class="btn primary" onclick="newAssignment()">Post</button></div>
      <div class="card"><h3>Add course (with video)</h3><input id="course-title" placeholder="Course title"><input id="course-description" placeholder="Description"><input id="course-icon" placeholder="Emoji icon (e.g. 🚀)"><input id="course-video" placeholder="YouTube embed URL (optional)"><button class="btn primary" onclick="newCourse()">Add course</button></div>
      <div class="card"><h3>Add quiz question</h3><select id="quiz-course">${options}</select><input id="new-question" placeholder="Question"><input id="option-0" placeholder="Option A"><input id="option-1" placeholder="Option B"><input id="option-2" placeholder="Option C"><input id="option-3" placeholder="Option D"><select id="correct-answer"><option value="0">Correct: A</option><option value="1">Correct: B</option><option value="2">Correct: C</option><option value="3">Correct: D</option></select><button class="btn primary" onclick="newQuestion()">Add question</button></div>`;
  }
};

function registerCourse(id) {
  if (!progress.registered.includes(id)) progress.registered.push(id);
  saveProgress(); draw();
}
function openCourse(id) {
  stopStudyTimer(); currentCourse=id; view="courses";
  studyStart=Date.now();
  studyTimer=setInterval(()=>{
    if(document.hidden) return;
    progress.seconds[id]=(progress.seconds[id]||0)+1;
    const el=$("#study-time"); if(el) el.textContent=formatTime(progress.seconds[id]);
    if(progress.seconds[id]%10===0) saveProgress();
  },1000);
  draw();
}
function startQuiz(id) {
  stopStudyTimer(); view="quiz";
  const course=content.courses.find(c=>c.id===id);
  if(!course || !course.quiz.length) { quizState=null; draw(); return alert("No quiz questions are available for this course yet."); }
  quizState={course,index:0,score:0}; draw();
}
function answerQuiz(choice) {
  const q=quizState, item=q.course.quiz[q.index];
  if(item.answer===choice) q.score++;
  q.index++;
  if(q.index>=q.course.quiz.length) {
    progress.scores[q.course.id]={score:q.score,total:q.course.quiz.length,title:q.course.title,at:Date.now()};
    saveProgress();
  }
  draw();
}
function submitAssignment(id) {
  const field=$("#answer-"+id), text=field.value.trim();
  if(!text) return alert("Please type your answer before submitting.");
  progress.submissions[id]={text,at:Date.now()}; saveProgress(); draw();
}
function markPresent(id) { progress.attendance[id]=true; saveProgress(); draw(); }
function toggleSession(id) {
  const session=content.sessions.find(s=>s.id===id); session.open=!session.open; saveContent(); draw();
}
function newSession() {
  const title=$("#session-title").value.trim(); if(!title) return alert("Enter a session title.");
  content.sessions.push({id:uid(),title,date:new Date().toISOString().slice(0,10),open:true});
  saveContent(); draw();
}
function newAssignment() {
  const title=$("#assignment-title").value.trim(); if(!title) return alert("Enter an assignment title.");
  content.assignments.push({id:uid(),title,due:$("#assignment-due").value||"—",course:$("#assignment-course").value});
  saveContent(); draw(); alert("Assignment posted.");
}
function newCourse() {
  const title=$("#course-title").value.trim(); if(!title) return alert("Enter a course title.");
  const url=$("#course-video").value.trim();
  content.courses.push({id:uid(),icon:$("#course-icon").value.trim()||"📘",level:"Course",title,description:$("#course-description").value.trim(),video:normalizeVideo(url),quiz:[]});
  saveContent(); draw();
}
function normalizeVideo(url) {
  if(!url) return "";
  const match=url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? youtube(match[1]) : url;
}
function newQuestion() {
  const course=content.courses.find(c=>c.id===$("#quiz-course").value);
  const q=$("#new-question").value.trim(), options=[0,1,2,3].map(i=>$("#option-"+i).value.trim());
  if(!q||options.some(v=>!v)) return alert("Fill in the question and all four options.");
  course.quiz.push({q,options,answer:Number($("#correct-answer").value)});
  saveContent(); draw(); alert("Question added.");
}
function goTutorFor(id) {
  stopStudyTimer(); currentCourse=null; view="tutor";
  chat.push({role:"user",text:"Give me a short overview of "+courseName(id)+" and two practice questions."});
  chat.push({role:"assistant",text:tutorReply("Give me a short overview of "+courseName(id))});
  draw();
}
function tutorReply(prompt) {
  const p=prompt.toLowerCase();
  const course=content.courses.find(c=>p.includes(c.title.toLowerCase()));
  if(course) return `${course.title}: ${course.description}\n\nStudy suggestion: review the main concepts, write a small example, and test yourself with the course quiz.\n\nPractice questions:\n1. What is one important concept in ${course.title}?\n2. Give one practical use of ${course.title}.\n\nNote: this is a demo response, not a live AI-generated answer.`;
  if(p.includes("python")) return "Python is a beginner-friendly programming language. It supports variables, conditions, loops, functions, and many libraries.\n\nExample:\nfor i in range(3):\n    print(i)\n\nThis prints 0, 1, and 2.";
  if(p.includes("html")||p.includes("css")||p.includes("javascript")) return "Web development commonly uses HTML for page structure, CSS for styling, and JavaScript for interactivity. Try changing one small part of a page and refresh it to see the result.";
  if(p.includes("sql")||p.includes("database")) return "SQL is used to work with relational databases. For example, SELECT name FROM student; retrieves the name column from the student table.";
  if(p.includes("machine learning")||p.includes("ai")) return "Artificial intelligence is a broad field for systems performing tasks that usually require human intelligence. Machine learning is a part of AI where models learn patterns from data.";
  return "I can help with Python, web development, JavaScript, SQL, machine learning, generative AI, neural networks, and Git. Ask a question about one of these topics. This offline demo does not connect to a real AI service.";
}
function askTutor() {
  const field=$("#tutor-question"), prompt=field.value.trim(); if(!prompt) return;
  chat.push({role:"user",text:prompt},{role:"assistant",text:tutorReply(prompt)});
  draw();
}

async function runJavaCode() {
  const code = $("#java-code")?.value || "";
  const input = $("#java-input")?.value || "";
  const output = $("#java-output");
  const status = $("#java-status");
  const button = $("#java-run-button");
  if (!code.trim()) return alert("Enter Java code first.");
  if (button) button.disabled = true;
  if (status) status.textContent = "Compiling and running...";
  if (output) output.textContent = "";
  try {
    const response = await fetch("http://localhost:8080/api/java/execute", {
      method: "POST",
      headers: {"Content-Type":"application/json"},
      body: JSON.stringify({sourceCode:code, input})
    });
    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Java execution failed.");
    if (output) output.textContent = result.output || "(No output)";
    if (status) status.textContent = result.success
      ? "Execution completed."
      : "Compilation or execution failed.";
  } catch (error) {
    if (status) status.textContent = "Could not connect to Java backend.";
    if (output) output.textContent = error.message +
      "\\n\\nStart the Spring Boot backend and make sure JDK is installed.";
  } finally {
    if (button) button.disabled = false;
  }
}

window.addEventListener("beforeunload", stopStudyTimer);
draw();
