/* =========================================================
   SUPER DIVESH BROS. — game logic & interactions
   ========================================================= */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } },
  };

  /* ---------------- DATA (from resume) ---------------- */
  const SKILLS = [
    { name: "LANGUAGES", icon: "🔥", items: ["Python", "Go", "TypeScript", "JavaScript", "SQL"] },
    { name: "GENAI & LLMS", icon: "🍄", items: ["LangChain", "LangGraph", "LlamaIndex", "Advanced RAG", "Corrective RAG", "Self-RAG", "Agents", "Tool-calling", "Prompt Eng.", "Guardrails", "OpenAI API", "Anthropic API", "Hugging Face", "vLLM", "Ollama", "TGI"] },
    { name: "AI PLATFORM & GATEWAY", icon: "⭐", items: ["Model Routing", "Rate Limiting", "Prompt Registry", "Model Registry", "Agent Registry", "MCP Registry", "Observability", "Usage Tracking"] },
    { name: "BACKEND & DESIGN", icon: "🔧", items: ["FastAPI", "NestJS", "Node.js", "Express", "gRPC", "Protobuf", "REST / OpenAPI", "Factory Pattern", "System Design", "API Design"] },
    { name: "DATA", icon: "🗄️", items: ["MongoDB", "Elasticsearch", "ChromaDB", "Pinecone", "Apache Spark", "AWS Athena", "Kafka", "Redis"] },
    { name: "PLATFORM & SECURITY", icon: "☁️", items: ["Docker", "Kubernetes", "AWS", "GCP", "Azure", "Snyk", "Trivy", "Git"] },
    { name: "AI-FIRST TOOLING", icon: "🤖", items: ["Cursor", "Claude Skills", "MCP", "Agent Mode", "Custom Rules & Hooks"] },
  ];

  const STAGES_SE = [
    { t: "AUDIT LOGGING PLATFORM", tech: "GO · KAFKA · ELASTICSEARCH", d: "Architected a <strong>multithreaded, low-resource Go system</strong> (Logs Service + Logs Consumer) processing <strong>billions</strong> of audit, webhook and publish logs. Shipped multi-Kafka-topic support in the SDK, fixed the legacy Mongo→Elasticsearch query translation layer and added a direct ES query path. Onboarded <strong>6 products</strong>; primary point of contact for production RCAs." },
    { t: "CONTENT OPS ANALYTICS", tech: "MONGODB · ELASTICSEARCH", d: "Designed a <strong>full-scan analytics system</strong> across multi-cluster MongoDB and Elasticsearch where legacy data lacked reliable timestamps. Accurately counts <strong>67 operation types</strong> across 100K+ entries and millions of daily publishes per org — powering Content Life Cycle, Workflow Health and Team Adoption." },
    { t: "ANALYTICS API", tech: "API DESIGN", d: "Built customer-facing Analytics APIs behind dashboards aggregating <strong>2B+ monthly API calls</strong>. Reconciled legacy output inconsistencies while preserving API conventions and improving error handling. I own its ongoing evolution and reliability." },
    { t: "FEATURE ADOPTION", tech: "NESTJS · FACTORY PATTERN", d: "Built a <strong>Factory-pattern NestJS service</strong> end-to-end, unifying audit trails, metered events, MongoDB and analytics into one customer usage view. Shipped as both an <strong>npm package</strong> and a <strong>micro-frontend</strong> for cross-team reuse." },
    { t: "ATHENA EXPORT", tech: "SQL · AWS ATHENA", d: "Paginated, SQL-backed export retrieving <strong>10,000+ records</strong>, with a precheck that catches row-limit failures before a job ever runs." },
    { t: "WEBHOOKS", tech: "API DESIGN", d: "Extended a trigger → executor → retry pipeline with <strong>75+ new scope-and-action combinations</strong> as new CMS features launched — without breaking existing flows." },
    { t: "PLATFORM RELIABILITY", tech: "DOCKER · SNYK · TRIVY", d: "Led a <strong>security hardening sweep across 10 services</strong>: Node.js → v24, Go → v1.24, non-root Alpine multi-stage images, zlib/OpenSSL CVE remediation, and Snyk/Trivy in the dev loop." },
    { t: "AI-FIRST ENGINEERING", tech: "CURSOR · CLAUDE · MCP", d: "Integrated <strong>Cursor</strong> (custom rules, hooks, Agent Mode) and <strong>Claude Skills / MCP</strong> into daily development to speed up implementation, refactoring and test generation." },
  ];
  const STAGES_INTERN = [
    { t: "CRM AUDIT-LOG MODULE", tech: "FULL-STACK", d: "Built the Customer Plan Management Tool's internal audit-log module <strong>from scratch</strong> — filtering, pagination, date ranges — establishing patterns reused across later admin surfaces." },
    { t: "MAIL & ROLLOUT UI", tech: "FRONTEND", d: "Delivered mail templates / logs and the <strong>rollout feature UI</strong>." },
    { t: "TECH-EVENT WEBSITE", tech: "CONTENTSTACK CMS", d: "Built a tech-event website using <strong>Contentstack as the headless CMS</strong>." },
  ];

  /* ---------------- AUDIO (Web Audio chiptune) ---------------- */
  let actx = null;
  let soundOn = store.get("sdb-sound", true);
  const soundBtn = $("#soundBtn");
  const paintSound = () => { soundBtn.textContent = soundOn ? "♪ ON" : "♪ OFF"; };
  paintSound();
  soundBtn.addEventListener("click", () => { soundOn = !soundOn; store.set("sdb-sound", soundOn); paintSound(); if (soundOn) sfx.coin(); });

  function tone(freq, start, dur, type = "square", vol = 0.06, slideTo) {
    if (!soundOn) return;
    try {
      actx = actx || new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t0 = actx.currentTime + start;
      const o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t0);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t0 + dur);
      g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      o.connect(g).connect(actx.destination); o.start(t0); o.stop(t0 + dur + 0.02);
    } catch { /* audio unavailable */ }
  }
  const seq = (notes, step = 0.1, type) => notes.forEach((f, i) => f && tone(f, i * step, step * 0.95, type));
  const sfx = {
    coin: () => { tone(988, 0, 0.08); tone(1319, 0.08, 0.35); },
    jump: () => tone(260, 0, 0.18, "square", 0.05, 720),
    stomp: () => tone(420, 0, 0.12, "square", 0.06, 110),
    bump: () => tone(140, 0, 0.08, "triangle", 0.12),
    die: () => seq([494, 698, 0, 698, 698, 659, 587, 523], 0.12),
    oneup: () => seq([659, 784, 1319, 1047, 1175, 1568], 0.09),
    pipe: () => { tone(330, 0, 0.12, "square", 0.05, 160); tone(330, 0.15, 0.12, "square", 0.05, 160); tone(330, 0.3, 0.12, "square", 0.05, 160); },
    flag: () => seq([392, 523, 659, 784, 1047, 1319, 1568, 0, 1319, 0, 1568], 0.09),
    star: () => seq([1047, 1047, 1047, 0, 784, 1047, 0, 1175, 1319], 0.08),
    start: () => seq([659, 659, 0, 659, 0, 523, 659, 0, 784], 0.1),
  };

  /* ---------------- HUD ---------------- */
  let score = 0, coins = 0;
  const scoreEl = $("#score"), coinsEl = $("#coins");
  function addScore(n) { score += n; scoreEl.textContent = String(score).padStart(6, "0"); }
  function addCoin(n = 1) {
    coins += n;
    if (coins >= 100) { coins -= 100; toast("100 COINS! 1-UP!"); sfx.oneup(); }
    coinsEl.textContent = String(coins).padStart(2, "0");
  }
  let time = 400;
  const timeEl = $("#time");
  setInterval(() => {
    time = time <= 0 ? 400 : time - 1;
    timeEl.textContent = String(time).padStart(3, "0");
    if (time === 100) toast("HURRY UP! (JUST KIDDING — TAKE YOUR TIME)");
  }, 1000);

  let toastTimer;
  function toast(msg, ms = 2200) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("show");
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.remove("show"), ms);
  }
  function floatText(text, x, y) {
    const s = document.createElement("span"); s.className = "float-score"; s.textContent = text;
    s.style.left = x + "px"; s.style.top = y + "px"; s.style.position = "fixed";
    document.body.appendChild(s); setTimeout(() => s.remove(), 900);
  }

  /* ---------------- Theme (day / night) ---------------- */
  const themeBtn = $("#themeBtn");
  const prefersDark = window.matchMedia && matchMedia("(prefers-color-scheme: dark)").matches;
  let night = store.get("sdb-night", prefersDark);
  const paintTheme = () => { document.documentElement.classList.toggle("night", night); themeBtn.textContent = night ? "☀" : "☾"; };
  paintTheme();
  themeBtn.addEventListener("click", () => { night = !night; store.set("sdb-night", night); paintTheme(); sfx.pipe(); });

  /* ---------------- Pixel sprites ---------------- */
  const PAL = { R: "#e52521", S: "#fcb888", H: "#6b3a12", O: "#2038ec", Y: "#f8d800", K: "#000", W: "#fff", G: "#43b047", g: "#1e6b21", B: "#8b4513", C: "#f8b800", c: "#b06a00" };
  const HERO_A = [
    "...RRRRR....",
    "..RRRRRRRRR.",
    "..HHHSSKS...",
    ".HSHSSSKSSS.",
    ".HSHHSSSKSSS",
    ".HHSSSSKKKK.",
    "...SSSSSSS..",
    "..RRORRR....",
    ".RRRORRORRR.",
    "RRRROOOORRRR",
    "SSROYOOYORSS",
    "SSSOOOOOOSSS",
    "SSOOOOOOOOSS",
    "..OOO..OOO..",
    ".HHH....HHH.",
    "HHHH....HHHH",
  ];
  const HERO_B = HERO_A.slice(0, 12).concat([
    "..OOOOOOOO..",
    "...OOO.OOO..",
    "..HHH..HHHH.",
    "..HHHH......",
  ]);
  const BUG = [
    "..K......K..",
    "...K....K...",
    "...GGGGGG...",
    "..GGGGGGGG..",
    ".GGWWGGWWGG.",
    ".GGWKGGKWGG.",
    "GGGGGGGGGGGG",
    "GgGgGgGgGgGg",
    "gGGGGGGGGGGg",
    ".gggggggggg.",
    ".K.K....K.K.",
    "K..K....K..K",
  ];
  const COIN = [
    "..CCCC..",
    ".CCYYCC.",
    "CCYCCcCC",
    "CCYCCcCC",
    "CCYCCcCC",
    "CCYCCcCC",
    ".CCccCC.",
    "..CCCC..",
  ];
  function sprite(map, scale = 3) {
    const c = document.createElement("canvas");
    c.width = map[0].length * scale; c.height = map.length * scale;
    const x = c.getContext("2d");
    map.forEach((row, j) => [...row].forEach((ch, i) => { if (PAL[ch]) { x.fillStyle = PAL[ch]; x.fillRect(i * scale, j * scale, scale, scale); } }));
    return c;
  }
  const SPR = { a: sprite(HERO_A), b: sprite(HERO_B), bug: sprite(BUG), coin: sprite(COIN) };

  // avatar in About dialog
  const av = $("#avatar");
  if (av) { const ctx = av.getContext("2d"); ctx.imageSmoothingEnabled = false; ctx.drawImage(sprite(HERO_A, 4), 0, 0); }

  /* ---------------- Scroll walker ---------------- */
  const walker = $("#walkerImg");
  const walkA = sprite(HERO_A, 2).toDataURL(), walkB = sprite(HERO_B, 2).toDataURL();
  walker.src = walkA;
  let lastY = scrollY, frame = 0, walkIdle;
  const warp = $("#warpPipe");
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    walker.style.left = (12 + p * (innerWidth - 72)) + "px";
    walker.classList.toggle("flip", scrollY < lastY);
    if (Math.abs(scrollY - lastY) > 6) { frame ^= 1; walker.src = frame ? walkB : walkA; }
    clearTimeout(walkIdle); walkIdle = setTimeout(() => { walker.src = walkA; }, 150);
    lastY = scrollY;
    warp.classList.toggle("show", scrollY > innerHeight * 0.8);
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
  warp.addEventListener("click", () => { sfx.pipe(); scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------------- World tracker ---------------- */
  const worldEl = $("#world");
  const navLinks = $$(".world-nav a");
  const levelObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      const w = e.target.dataset.world;
      worldEl.textContent = w;
      navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  $$(".level").forEach((s) => levelObs.observe(s));
  const heroObs = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { worldEl.textContent = "1-1"; navLinks.forEach((a) => a.classList.remove("active")); }
  }), { rootMargin: "-45% 0px -50% 0px" });
  heroObs.observe($("#top"));
  $(".hero-actions .btn-red").addEventListener("click", () => sfx.start());

  /* ---------------- Skills: ? blocks ---------------- */
  const groupsEl = $("#skillGroups");
  let total = 0, found = 0;
  SKILLS.forEach((g) => {
    const box = document.createElement("div");
    box.className = "skill-group reveal";
    box.innerHTML = `<h3><i>${g.icon}</i>${g.name}</h3><div class="blocks"></div>`;
    const blocks = $(".blocks", box);
    g.items.forEach((skill) => {
      total++;
      const w = document.createElement("div");
      w.className = "qblock-wrap";
      const abbr = skill.replace(/[^A-Za-z0-9]/g, "").slice(0, 2);
      w.innerHTML = `<button class="qblock" aria-label="Reveal skill: ${skill}">?<span class="sk-ico">${abbr}</span></button><span class="qlabel">${skill}</span>`;
      const b = $("button", w);
      b.addEventListener("click", (ev) => hitBlock(w, b, ev));
      blocks.appendChild(w);
    });
    groupsEl.appendChild(box);
  });
  $("#blockTotal").textContent = total;
  function hitBlock(w, b, ev, silent) {
    if (b.classList.contains("hit")) { if (!silent) sfx.bump(); return; }
    b.classList.add("hit"); w.classList.add("found");
    found++; $("#blockCounter").textContent = found;
    if (!silent) {
      const c = document.createElement("span"); c.className = "coin-pop"; w.appendChild(c); setTimeout(() => c.remove(), 700);
      const r = b.getBoundingClientRect();
      floatText("200", r.left + 10, r.top - 30);
      sfx.coin();
    }
    addScore(200); addCoin();
    if (found === total) { setTimeout(() => { toast("ALL SKILLS FOUND! 1-UP ★"); sfx.oneup(); fireworks(10); }, 300); }
  }
  $("#revealAll").addEventListener("click", () => {
    $$(".qblock-wrap").forEach((w) => hitBlock(w, $("button", w), null, true));
    sfx.coin();
  });

  /* ---------------- Experience stages ---------------- */
  function renderStages(el, list, prefix) {
    list.forEach((s, i) => {
      const a = document.createElement("div");
      a.className = "stage reveal";
      a.innerHTML = `<div class="stage-pipe">${prefix}-${i + 1}</div>
        <div class="stage-card"><h4>${s.t}</h4><span class="tech">${s.tech}</span><p>${s.d}</p></div>`;
      a.addEventListener("mouseenter", () => tone(520 + i * 40, 0, 0.05, "square", 0.025));
      el.appendChild(a);
    });
  }
  renderStages($("#stagesSE"), STAGES_SE, "W2");
  renderStages($("#stagesIntern"), STAGES_INTERN, "W1");

  /* ---------------- Reveal + counters ---------------- */
  $$(".dialog, .powerups, .project, .bonus-card, .pipeline-wrap").forEach((el) => el.classList.add("reveal"));
  const revObs = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("in"); revObs.unobserve(e.target); }
  }), { threshold: 0.12 });
  $$(".reveal").forEach((el) => revObs.observe(el));

  const cntObs = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    cntObs.unobserve(e.target);
    const el = e.target, target = parseFloat(el.dataset.count), dec = +(el.dataset.decimals || 0), suf = el.dataset.suffix || "";
    const t0 = performance.now(), dur = 1300;
    const step = (now) => {
      const k = Math.min(1, (now - t0) / dur), v = target * (1 - Math.pow(1 - k, 3));
      el.textContent = (dec ? v.toFixed(dec) : Math.round(v).toLocaleString("en-US")) + suf;
      if (k < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }), { threshold: 0.6 });
  $$("[data-count]").forEach((el) => cntObs.observe(el));

  /* ---------------- Flag / fireworks ---------------- */
  function fireworks(n = 6) {
    const fx = $("#fx"), colors = ["#e52521", "#f8b800", "#43b047", "#049cd8", "#fff"];
    for (let k = 0; k < n; k++) {
      setTimeout(() => {
        const cx = innerWidth * (0.15 + Math.random() * 0.7), cy = innerHeight * (0.2 + Math.random() * 0.35);
        for (let i = 0; i < 16; i++) {
          const p = document.createElement("span"), a = (i / 16) * Math.PI * 2, d = 60 + Math.random() * 50;
          p.className = "firework"; p.style.left = cx + "px"; p.style.top = cy + "px";
          p.style.background = colors[(k + i) % colors.length];
          p.style.setProperty("--dx", Math.cos(a) * d + "px"); p.style.setProperty("--dy", Math.sin(a) * d + "px");
          fx.appendChild(p); setTimeout(() => p.remove(), 1000);
        }
        tone(180 + Math.random() * 120, 0, 0.25, "sawtooth", 0.03, 60);
      }, k * 260);
    }
  }
  const flagBtn = $("#flagBtn");
  flagBtn.addEventListener("click", () => {
    const scene = $(".flag-scene");
    if (scene.classList.contains("done")) { scene.classList.remove("done"); flagBtn.textContent = "⚑ GRAB THE FLAG"; return; }
    scene.classList.add("done"); sfx.flag(); addScore(5000);
    flagBtn.textContent = "↺ RESET FLAG";
    setTimeout(() => { fireworks(6); toast("COURSE CLEAR! +5000"); }, 1200);
  });

  /* ---------------- Konami code: star power ---------------- */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
  let kIdx = 0;
  addEventListener("keydown", (e) => {
    const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
    kIdx = key === KONAMI[kIdx] ? kIdx + 1 : (key === KONAMI[0] ? 1 : 0);
    if (kIdx === KONAMI.length) {
      kIdx = 0; document.body.classList.add("starpower"); sfx.star(); toast("★ STAR POWER! +30 LIVES ★", 3000); fireworks(8); addScore(10000);
      setTimeout(() => document.body.classList.remove("starpower"), 8000);
    }
  });

  /* ---------------- Mini-game ---------------- */
  const cv = $("#game"), g = cv.getContext("2d");
  const H = 240, GROUND = 196;
  let W = 600, dpr = 1;
  function sizeCanvas() {
    dpr = Math.min(2, devicePixelRatio || 1);
    W = Math.max(280, cv.clientWidth);
    cv.width = W * dpr; cv.height = H * dpr;
    g.setTransform(dpr, 0, 0, dpr, 0, 0); g.imageSmoothingEnabled = false;
  }
  sizeCanvas(); addEventListener("resize", sizeCanvas);

  let state = "ready", hi = store.get("sdb-hi", 0), gs, tick = 0;
  $("#hiScore").textContent = hi;
  const P = { x: 56, y: GROUND - 48, w: 36, h: 48, vy: 0, onGround: true };
  let bugs = [], gcoins = [], clouds = [], spawnIn = 60, coinIn = 40, speed = 4, groundOff = 0;
  function reset() {
    P.y = GROUND - P.h; P.vy = 0; P.onGround = true;
    bugs = []; gcoins = []; spawnIn = 70; coinIn = 40; speed = 4; gs = 0; tick = 0;
    clouds = [0, 1, 2].map((i) => ({ x: 80 + i * 220, y: 30 + (i % 2) * 30 }));
  }
  reset();
  function jump() {
    if (state === "ready") { state = "run"; sfx.start(); }
    if (state === "over") { reset(); state = "run"; return; }
    if (P.onGround) { P.vy = -13.5; P.onGround = false; sfx.jump(); }
  }
  let heroVisible = true;
  new IntersectionObserver((e) => { heroVisible = e[0].isIntersecting; }, { threshold: 0.4 }).observe(cv);
  addEventListener("keydown", (e) => {
    if (!heroVisible) return;
    if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
      if (e.target.closest && e.target.closest("button, a, input, textarea")) return;
      e.preventDefault(); jump();
    }
  });
  cv.addEventListener("pointerdown", (e) => { e.preventDefault(); jump(); });

  const hit = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function update() {
    tick++;
    if (state !== "run") return;
    speed = Math.min(9, 4 + gs / 1500);
    gs += 1;
    P.vy += 0.7; P.y += P.vy;
    if (P.y >= GROUND - P.h) { P.y = GROUND - P.h; P.vy = 0; P.onGround = true; }
    groundOff = (groundOff + speed) % 32;
    clouds.forEach((c) => { c.x -= speed * 0.2; if (c.x < -100) c.x = W + 40; });

    if (--spawnIn <= 0) {
      bugs.push({ x: W + 20, y: GROUND - 36, w: 36, h: 36, dead: 0 });
      spawnIn = 55 + Math.random() * 80 - Math.min(30, gs / 400);
    }
    if (--coinIn <= 0) {
      const n = 1 + Math.floor(Math.random() * 3), y = GROUND - 80 - Math.random() * 50;
      for (let i = 0; i < n; i++) gcoins.push({ x: W + 20 + i * 30, y, w: 24, h: 24 });
      coinIn = 50 + Math.random() * 70;
    }
    bugs.forEach((b) => { b.x -= b.dead ? 0 : speed + 0.8; if (b.dead) b.dead++; });
    gcoins.forEach((c) => { c.x -= speed; });

    const hb = { x: P.x + 6, y: P.y + 4, w: P.w - 12, h: P.h - 4 };
    for (const b of bugs) {
      if (b.dead || !hit(hb, b)) continue;
      if (P.vy > 0 && P.y + P.h - b.y < 20) {
        b.dead = 1; P.vy = -9; gs += 100; addScore(100); sfx.stomp();
      } else {
        state = "over"; sfx.die();
        if (Math.floor(gs / 10) > hi) { hi = Math.floor(gs / 10); store.set("sdb-hi", hi); $("#hiScore").textContent = hi; }
      }
    }
    gcoins = gcoins.filter((c) => {
      if (hit(hb, c)) { gs += 50; addScore(50); addCoin(); sfx.coin(); return false; }
      return c.x > -40;
    });
    bugs = bugs.filter((b) => b.x > -50 && b.dead < 20);
  }

  function drawCloud(x, y) {
    g.fillStyle = night ? "#39407a" : "#fff";
    g.fillRect(x, y + 10, 70, 18); g.fillRect(x + 12, y, 30, 12); g.fillRect(x + 36, y + 4, 22, 8);
  }
  function draw() {
    g.fillStyle = night ? "#10163f" : "#5c94fc"; g.fillRect(0, 0, W, H);
    clouds.forEach((c) => drawCloud(c.x, c.y));
    // hill
    g.fillStyle = "#00a800"; g.beginPath(); g.arc(W * 0.7 - (groundOff * 0.5), GROUND, 60, Math.PI, 0); g.fill();
    // ground bricks
    g.fillStyle = "#c84c0c"; g.fillRect(0, GROUND, W, H - GROUND);
    g.fillStyle = "#7a2d05";
    g.fillRect(0, GROUND, W, 3);
    for (let x = -groundOff; x < W; x += 32) { g.fillRect(x, GROUND, 3, H - GROUND); g.fillRect(x + 16, GROUND + 22, 3, H - GROUND); }
    g.fillRect(0, GROUND + 22, W, 3);
    // coins
    gcoins.forEach((c) => {
      const s = Math.abs(Math.sin((tick + c.x) / 10));
      g.drawImage(SPR.coin, c.x + 12 * (1 - s), c.y, Math.max(4, 24 * s), 24);
    });
    // bugs
    bugs.forEach((b) => {
      if (b.dead) g.drawImage(SPR.bug, b.x, b.y + 24, 36, 12);
      else g.drawImage(SPR.bug, b.x + (tick % 20 < 10 ? 0 : 1), b.y, 36, 36);
    });
    // hero
    const img = !P.onGround ? SPR.b : (state === "run" && tick % 12 < 6 ? SPR.b : SPR.a);
    g.drawImage(img, P.x, P.y, P.w, P.h);

    g.fillStyle = "#fff"; g.font = "10px 'Press Start 2P', monospace"; g.textAlign = "right";
    g.fillText(String(Math.floor(gs / 10)).padStart(5, "0"), W - 12, 22);
    g.textAlign = "center";
    if (state === "ready") {
      g.fillStyle = "rgba(0,0,0,.55)"; g.fillRect(W / 2 - 150, 70, 300, 60);
      g.fillStyle = "#fff"; g.font = "12px 'Press Start 2P', monospace"; g.fillText("PRESS SPACE / TAP", W / 2, 98);
      g.fillStyle = "#f8b800"; g.font = "8px 'Press Start 2P', monospace"; g.fillText("STOMP BUGS · SHIP FEATURES", W / 2, 118);
    } else if (state === "over") {
      g.fillStyle = "rgba(0,0,0,.7)"; g.fillRect(W / 2 - 150, 64, 300, 76);
      g.fillStyle = "#e52521"; g.font = "14px 'Press Start 2P', monospace"; g.fillText("GAME OVER", W / 2, 92);
      g.fillStyle = "#fff"; g.font = "8px 'Press Start 2P', monospace"; g.fillText("A BUG GOT TO PROD! TAP TO RETRY", W / 2, 116);
    }
  }
  let last = 0, acc = 0;
  function loop(now) {
    acc += Math.min(100, now - (last || now)); last = now;
    while (acc >= 16.67) { update(); acc -= 16.67; }
    draw();
    requestAnimationFrame(loop);
  }
  (document.fonts ? document.fonts.ready : Promise.resolve()).then(() => requestAnimationFrame(loop));

  console.log("%cSUPER DIVESH BROS.", "font:bold 20px monospace;color:#e52521;text-shadow:2px 2px 0 #f8b800");
  console.log("%cHey, fellow engineer! Let's talk: diveshkumarchordia@gmail.com", "font:14px monospace");
})();
