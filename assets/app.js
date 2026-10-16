/* Super Divesh Bros. — interactions. No dependencies. */
(() => {
  "use strict";

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const SPR = (name) => `assets/sprites/${name}.svg`;
  const store = {
    get(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* storage unavailable */ } },
  };
  const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  /* ================= content (from resume) ================= */
  const INVENTORY = [
    { item: "SUPER MUSHROOM", sprite: "mushroom", kind: "Backend", skills: ["Go", "TypeScript", "JavaScript", "Python", "SQL", "NestJS", "Node.js", "Express", "gRPC", "Protobuf", "REST / OpenAPI", "System design"] },
    { item: "1-UP MUSHROOM", sprite: "oneup", kind: "Data", skills: ["Elasticsearch", "MongoDB", "Apache Spark", "Kafka", "AWS Athena", "Redis", "ILM (hot / warm / cold)"] },
    { item: "STARMAN", sprite: "star", kind: "Platform", skills: ["Docker", "Kubernetes", "GoCD", "AWS", "GCP", "Azure", "Snyk", "Trivy", "Git"] },
    { item: "COIN", sprite: "coin", kind: "Frontend & testing", skills: ["React", "Redux", "Highcharts", "Webpack", "Vite", "Storybook", "Playwright"] },
    { item: "FIRE FLOWER", sprite: "fireflower", kind: "GenAI & RAG", skills: ["LangChain", "LangGraph", "LlamaIndex", "Advanced RAG", "Self-RAG", "Agents", "Tool calling", "Guardrails", "OpenAI / Anthropic APIs", "vLLM", "Ollama"] },
    { item: "? BLOCK", sprite: "qblock", kind: "AI-first workflow", skills: ["Claude Skills", "MCP", "Cursor", "Agent Mode", "Custom rules & hooks"] },
  ];

  // Each level: why the system exists, what I built, and the result.
  const LEVELS = [
    { quest: "main", title: "AUDIT LOGGING PLATFORM", stat: "BILLIONS OF LOGS · 6 PRODUCTS",
      why: "Customers need a searchable record of every audit, webhook and publish event across Contentstack. That is billions of logs, and keeping them can't cost a fortune.",
      built: "I built the Go services behind it. Logs Consumer moves events from Kafka into Elasticsearch and creates a fresh index every month. Logs Service answers queries over gRPC through an index alias, translating Mongo-style queries into Elasticsearch ones. Go worker pools with mutex-guarded shared state let both scale on very little hardware, and an ILM policy ages data from hot to warm to cold. I added multi-topic Kafka support, $exists in the translator, and a direct Elasticsearch path for queries the translator can't express.",
      tags: ["Go", "Kafka", "Elasticsearch", "gRPC"] },
    { quest: "main", title: "WEBHOOK DELIVERY", stat: "75+ NEW TRIGGER COMBINATIONS",
      why: "Customers plug Contentstack into their own systems. When content changes, their endpoint has to hear about it, even when their server is having a bad day.",
      built: "A four-stage pipeline: the trigger checks each webhook's conditions, the executor sends the event to the customer's URL, failed sends wait in a retry queue, and after three failed attempts the event is stored as failed and a notification goes out. I extended it with 75+ scope-and-action combinations as entry variants, taxonomy and locales launched, without breaking existing flows.",
      tags: ["Event-driven", "Retry queue", "API design"] },
    { quest: "main", title: "ANALYTICS PIPELINE & API", stat: "2B+ API CALLS / MONTH",
      why: "Customers want to know how their stack is used: API calls, bandwidth, status codes, cache hits and misses, devices. All of it starts as raw CDN and platform traffic.",
      built: "I build Spark ETL pipelines that aggregate around a billion records from sources like Cloudflare and Kafka and persist them in Elasticsearch. On top sits the customer-facing Analytics API: I onboard new products and analytics domains, merge sources without changing the contract customers rely on, fixed v1/v2 output anomalies, and replaced generic failures with errors that explain what went wrong.",
      tags: ["Apache Spark", "Elasticsearch", "Kafka", "API design"] },
    { quest: "main", title: "CONTENT OPERATIONS ANALYTICS", stat: "67 OPERATION-SEQUENCE CASES",
      why: "Content teams need to see where entries get stuck in a workflow. The legacy collections can't be joined, have no reliable timestamps, and entry counts multiply across branch × content type × locale.",
      built: "A low-cost daily scan that runs on Mongo indexes instead of joins. It powers Content Life Cycle, Workflow Health and Team Adoption. To prove the numbers, I built an Evaluator: it seeds realistic data, reads the dashboards through Playwright (DOM and screenshots) and compares every count with what the product rules say it should be. The analytics are validated against 67 operation-sequence cases, including orphaned-record edge cases.",
      tags: ["MongoDB", "Elasticsearch", "Playwright"] },
    { quest: "main", title: "FEATURE ADOPTION", stat: "4 SOURCES, 1 VIEW",
      why: "Customers couldn't easily see what they had bought and use, bought but haven't touched lately, or haven't bought yet.",
      built: "I owned a template-driven NestJS service end to end. It pulls business logic from audit trails, metered events, clustered MongoDB and analytics into one picture of each customer's recent activity. I fixed under-reporting for sharded orgs and shipped it as an npm package plus a micro-frontend.",
      tags: ["NestJS", "TypeScript", "MongoDB"] },
    { quest: "side", title: "RAG SYSTEMS", stat: "SELF-CORRECTING RETRIEVAL",
      why: "LLMs hallucinate when retrieval is weak. I wanted to understand retrieval from the bottom up, not just call a framework.",
      built: "A production-style RAG pipeline with LangChain and ChromaDB / Pinecone, plus a low-level framework for testing chunking, embeddings and search. It layers multi-query translation, RAG-Fusion, cross-encoder re-ranking, and Self-RAG loops that catch low-confidence answers.",
      tags: ["Python", "LangChain", "ChromaDB", "Pinecone"] },
  ];

  const TIMELINE = [
    { status: "now", role: "SOFTWARE ENGINEER", org: "Contentstack · Bengaluru", when: "Aug 2024 – Present",
      lead: "Data and analytics platform. The flagship systems are in Project Select above; this is the rest of the job.",
      points: [
        "Primary contact for production RCAs on the audit logging platform I built.",
        "Manage releases and triage customer issues.",
        "Wrote dev-environment scripts that simulate real customer usage patterns and generate the cases needed to cover every product capability.",
        "Principal author of cs-highcharts, the shared charting library. A log10-based tick-interval algorithm fixed a recurring axis-label bug across every chart.",
        "Shipped two more analytics dashboards end to end.",
        "Built a paginated Athena export for 10,000+ records, with a precheck that surfaces row-limit failures before a job runs.",
        "Led a security sweep across 10 services: Node.js 24, Go 1.24, non-root images, zlib/OpenSSL CVE fixes, Snyk and Trivy in the dev loop.",
        "Use Claude Skills and MCP in my daily workflow; lately they help me build Node.js backends much faster.",
      ] },
    { status: "clear", role: "SOFTWARE ENGINEER INTERN", org: "Contentstack · Bengaluru", when: "Jan 2024 – Jul 2024",
      points: [
        "Built the audit-log module for the Customer Plan Management Tool (an internal CRM) from scratch: filtering, pagination, date ranges. Later admin surfaces reused its patterns.",
        "Delivered mail templates and logs, plus the rollout feature UI.",
        "Built a tech-event website on Contentstack as the headless CMS.",
      ] },
    { status: "clear", role: "B.E. COMPUTER SCIENCE", org: "JSS Science and Technology University (SJCE) · Mysuru", when: "2020 – 2024",
      points: ["Graduated with a CGPA of 9.05."] },
  ];

  /* ================= sound (off by default) ================= */
  let soundOn = store.get("sdb-sound", false), actx;
  const soundBtn = $("#sound");
  const paintSound = () => { soundBtn.textContent = soundOn ? "SOUND ON" : "SOUND OFF"; soundBtn.setAttribute("aria-pressed", soundOn); };
  paintSound();
  soundBtn.addEventListener("click", () => { soundOn = !soundOn; store.set("sdb-sound", soundOn); paintSound(); sfx.coin(); });

  function tone(freq, at, dur, type = "square", vol = 0.05, slideTo) {
    if (!soundOn) return;
    try {
      actx ||= new (window.AudioContext || window.webkitAudioContext)();
      if (actx.state === "suspended") actx.resume();
      const t = actx.currentTime + at, o = actx.createOscillator(), g = actx.createGain();
      o.type = type; o.frequency.setValueAtTime(freq, t);
      if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, t + dur);
      g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(actx.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch { /* no audio */ }
  }
  const seq = (notes, step) => notes.forEach((f, i) => f && tone(f, i * step, step * 0.9));
  const sfx = {
    coin: () => { tone(988, 0, 0.08); tone(1319, 0.08, 0.3); },
    jump: () => tone(250, 0, 0.16, "square", 0.04, 700),
    bump: () => tone(130, 0, 0.08, "triangle", 0.12),
    start: () => seq([659, 659, 0, 659, 0, 523, 659, 0, 784], 0.09),
    pipe: () => [0, 0.14, 0.28].forEach((t) => tone(330, t, 0.11, "square", 0.04, 160)),
    oneup: () => seq([659, 784, 1319, 1047, 1175, 1568], 0.08),
    star: () => seq([1047, 1047, 1047, 0, 784, 1047, 0, 1175, 1319], 0.07),
  };
  $$("[data-sfx]").forEach((el) => el.addEventListener("click", () => sfx[el.dataset.sfx]?.()));

  /* ================= HUD ================= */
  let score = 0, coins = 0, top = store.get("sdb-top", 0);
  const pad = (n, w) => String(n).padStart(w, "0");
  $("#top-score").textContent = pad(top, 6);
  function addScore(n) {
    score += n; $("#hud-score").textContent = pad(score, 6);
    if (score > top) { top = score; store.set("sdb-top", top); $("#top-score").textContent = pad(top, 6); }
  }
  function addCoin() {
    coins++;
    if (coins === 100) { coins = 0; sfx.oneup(); }
    $("#hud-coins").textContent = pad(coins, 2);
  }
  let time = 400;
  setInterval(() => { time = time > 0 ? time - 1 : 400; $("#hud-time").textContent = pad(time, 3); }, 1000);

  function popScore(text, x, y) {
    const s = document.createElement("span");
    s.className = "score-fx"; s.textContent = text; s.style.left = `${x}px`; s.style.top = `${y}px`;
    document.body.append(s); setTimeout(() => s.remove(), 850);
  }
  function popCoin(host) {
    const c = document.createElement("img");
    c.src = SPR("coin"); c.alt = ""; c.className = "coin-fx";
    host.append(c); setTimeout(() => c.remove(), 650);
  }
  function bumpEl(el) { el.classList.remove("is-bumped"); void el.offsetWidth; el.classList.add("is-bumped"); }

  // years since first production commit (Jan 2024)
  const years = Math.floor((Date.now() - Date.UTC(2024, 0, 1)) / 31557600000);
  $$("[data-years]").forEach((el) => { el.textContent = pad(Math.max(1, years), 2); });

  // world indicator + active nav
  const worldEl = $("#hud-world");
  const navLinks = $$("[data-nav] a");
  const secObs = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    worldEl.textContent = e.target.dataset.world;
    navLinks.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === `#${e.target.id}`));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main > section[data-world]").forEach((s) => secObs.observe(s));

  const toTop = $("#to-top");
  addEventListener("scroll", () => toTop.classList.toggle("is-shown", scrollY > innerHeight), { passive: true });
  toTop.addEventListener("click", () => sfx.pipe());

  /* ================= render content ================= */
  $("#inventory").innerHTML = INVENTORY.map((s) => `
    <article class="px-panel p-6">
      <div class="flex items-center gap-4">
        <span class="grid h-16 w-16 shrink-0 place-items-center border-2 border-white/30 bg-white/5">
          <img src="${SPR(s.sprite)}" alt="" class="sprite h-12 ${s.sprite === "coin" ? "w-7" : "w-12"}" />
        </span>
        <div><h4 class="font-pixel text-px-xs leading-5 text-coin">${s.item}</h4><p class="text-white/70">${s.kind}</p></div>
      </div>
      <ul class="mt-5 flex flex-wrap gap-2">${s.skills.map((k) => `<li class="border-2 border-white/25 px-2 py-0.5 text-[16px] leading-6 text-white/90">${esc(k)}</li>`).join("")}</ul>
    </article>`).join("");

  $("#levels").insertAdjacentHTML("beforeend", LEVELS.map((l, i) => {
    const main = l.quest === "main";
    return `
    <li class="level-card cursor-pointer" data-level>
      <div class="tile-brick relative h-[var(--tile)] border-3 border-b-0 border-ink">
        <span class="absolute -top-4 left-4 border-3 border-ink bg-coin px-2 py-1 font-pixel text-px-xs shadow-px-sm">1-3-${String.fromCharCode(65 + i)}</span>
      </div>
      <article class="px-card flex flex-1 flex-col p-6">
        <p class="font-pixel text-px-xs ${main ? "text-mario" : "text-luigi-dark"}">${main ? "MAIN QUEST · CONTENTSTACK" : "SIDE QUEST · PERSONAL"}</p>
        <h3 class="mt-3 font-pixel text-px-sm leading-6">${l.title}</h3>
        <dl class="mt-4 flex-1 space-y-4">
          <div><dt class="font-pixel text-px-xs text-ink/50">WHY IT EXISTS</dt><dd class="mt-1 font-medium text-ink">${esc(l.why)}</dd></div>
          <div><dt class="font-pixel text-px-xs text-ink/50">WHAT I BUILT</dt><dd><ul class="mt-2 space-y-2">${l.built.split(/(?<=\.)\s+(?=[A-Z$])/).map((b) => `<li class="relative pl-5 text-ink/80 before:absolute before:left-0 before:top-[10px] before:h-2 before:w-2 before:bg-brick">${esc(b)}</li>`).join("")}</ul></dd></div>
        </dl>
        <p class="mt-5 flex items-center gap-3 border-2 border-dashed border-ink/30 px-3 py-2 font-pixel text-px-xs leading-5">
          <img src="${SPR("coin")}" alt="" class="h-[14px] w-2 shrink-0" />${l.stat}
        </p>
        <ul class="mt-5 flex flex-wrap gap-2">${l.tags.map((t) => `<li class="px-tag ${main ? "bg-coin" : "bg-luigi text-white"}">${esc(t)}</li>`).join("")}</ul>
      </article>
    </li>`;
  }).join(""));

  $$("[data-level]").forEach((card) => card.addEventListener("click", (e) => {
    if (e.target.closest("a")) return;
    bumpEl(card); popCoin(card.firstElementChild); sfx.coin(); addCoin(); addScore(200);
    const r = card.getBoundingClientRect(); popScore("200", r.left + r.width / 2 - 12, r.top - 24);
  }));

  $("#timeline").innerHTML = TIMELINE.map((t, i) => `
    <li class="checkpoint relative pl-[calc(var(--tile)*1.75+16px)] md:w-1/2 md:pl-0 ${i % 2 ? "md:ml-auto md:pl-14" : "md:pr-14"}">
      <span class="checkpoint-flag top-6 left-[calc(var(--tile)*0.875+2px)] ${i % 2 ? "md:-left-[1px]" : "md:left-auto md:-right-[23px] md:[clip-path:polygon(100%_0,0_50%,100%_100%)]"}"></span>
      <article class="px-card p-6">
        <div class="flex flex-wrap items-center gap-3">
          ${t.status === "now"
            ? `<span class="inline-flex items-center gap-2 border-2 border-ink bg-coin px-2 py-1 font-pixel text-px-xs"><img src="${SPR("star")}" alt="" class="h-4 w-4" />IN PROGRESS</span>`
            : `<span class="border-2 border-ink bg-luigi px-2 py-1 font-pixel text-px-xs text-white">LEVEL CLEAR</span>`}
          <span class="font-pixel text-px-xs text-ink/60">${t.when}</span>
        </div>
        <h3 class="mt-4 font-pixel text-px-sm leading-6">${t.role}</h3>
        <p class="mt-1 text-ink/70">${t.org}</p>
        ${t.lead ? `<p class="mt-3 font-medium">${esc(t.lead)}</p>` : ""}
        <ul class="mt-4 space-y-2">${t.points.map((p) => `<li class="relative pl-6 text-ink/85 before:absolute before:left-0 before:top-[10px] before:h-2 before:w-2 before:bg-brick">${esc(p)}</li>`).join("")}</ul>
      </article>
    </li>`).join("");

  // vine grows with scroll; checkpoints flip green once the vine reaches them
  const climb = $("#climb"), vine = $("#vine"), checkpoints = $$(".checkpoint");
  function growVine() {
    const r = climb.getBoundingClientRect();
    const p = Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / r.height));
    const k = reducedMotion ? 1 : p;
    vine.style.transform = `scaleY(${k})`;
    const vineTop = r.bottom - r.height * k;
    checkpoints.forEach((c) => c.classList.toggle("is-cleared", c.getBoundingClientRect().top + 24 >= vineTop));
  }
  addEventListener("scroll", growVine, { passive: true });
  addEventListener("resize", growVine);
  growVine();

  /* ================= playfield ================= */
  const field = $("#field"), hero = $("#hero"), hint = $("#play-hint");
  const blocks = $$("[data-block]", field).map((el) => ({ el, kind: el.dataset.block, hits: el.dataset.block === "multi" ? 8 : 1 }));
  const solids = () => [...blocks.map((b) => b.el), ...$$("[data-solid]", field)];

  function hitBlock(b) {
    bumpEl(b.el);
    if (b.kind === "brick" || b.hits <= 0) { sfx.bump(); return; }
    b.hits--; popCoin(b.el); sfx.coin(); addCoin(); addScore(200);
    const r = b.el.getBoundingClientRect(); popScore("200", r.left + r.width / 4, r.top - 20);
    if (b.hits === 0) {
      setTimeout(() => { b.el.querySelector("img").src = SPR("qblock-used"); b.el.setAttribute("aria-label", "Empty block"); }, 120);
    }
  }
  blocks.forEach((b) => b.el.addEventListener("click", (e) => { e.stopPropagation(); hitBlock(b); }));

  // physics in tile units, so the game plays the same at 32px and 48px tiles
  const P = { x: 0, y: 0, vx: 0, vy: 0, w: 0.8, h: 1, ground: true, face: 1 };
  const keys = { left: false, right: false, jump: false };
  let T = 48, W = 0, H = 0, rects = [], playing = false, lastJump = false, walkT = 0;

  function measure() {
    const fr = field.getBoundingClientRect();
    T = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tile")) || 48;
    W = fr.width / T; H = fr.height / T;
    // y grows upward from the ground line
    rects = solids().map((el) => {
      const r = el.getBoundingClientRect();
      return { el, x: (r.left - fr.left) / T, y: (fr.bottom - r.bottom) / T, w: r.width / T, h: r.height / T };
    });
  }
  function spawn() {
    measure();
    const center = rects.find((r) => r.el.dataset.block === "multi");
    P.x = center ? center.x + (center.w - P.w) / 2 : W / 2;
    P.y = center ? center.y + center.h : 0;
    P.vx = P.vy = 0; P.ground = true;
  }
  const overlapX = (r) => P.x + P.w > r.x + 0.02 && P.x < r.x + r.w - 0.02;
  const overlapY = (r) => P.y + P.h > r.y + 0.02 && P.y < r.y + r.h - 0.02;

  function step(dt) {
    const accel = P.ground ? 40 : 24, maxV = 6;
    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) { P.vx += dir * accel * dt; P.face = dir; } else { P.vx *= P.ground ? 0.78 : 0.95; if (Math.abs(P.vx) < 0.05) P.vx = 0; }
    P.vx = Math.max(-maxV, Math.min(maxV, P.vx));

    if (keys.jump && !lastJump && P.ground) { P.vy = 13.5; P.ground = false; sfx.jump(); }
    if (!keys.jump && P.vy > 4) P.vy = 4; // variable jump height
    lastJump = keys.jump;
    P.vy -= (P.vy > 0 && keys.jump ? 30 : 48) * dt;

    // horizontal
    P.x += P.vx * dt;
    P.x = Math.max(0, Math.min(W - P.w, P.x));
    for (const r of rects) if (overlapX(r) && overlapY(r)) { P.x = P.vx > 0 ? r.x - P.w : r.x + r.w; P.vx = 0; }

    // vertical
    P.y += P.vy * dt; P.ground = false;
    if (P.y <= 0) { P.y = 0; P.vy = 0; P.ground = true; }
    for (const r of rects) {
      if (!overlapX(r) || !overlapY(r)) continue;
      if (P.vy > 0) {
        P.y = r.y - P.h; P.vy = 0;
        // bump the block whose centre is closest to the head
        const hitR = rects.filter((q) => q.el.dataset.block && overlapX(q) && Math.abs(q.y - (P.y + P.h)) < 0.05)
          .sort((a, b) => Math.abs(a.x + a.w / 2 - (P.x + P.w / 2)) - Math.abs(b.x + b.w / 2 - (P.x + P.w / 2)))[0];
        const b = hitR && blocks.find((k) => k.el === hitR.el);
        if (b) hitBlock(b);
      } else { P.y = r.y + r.h; P.vy = 0; P.ground = true; }
    }
    if (P.y > H) P.y = H;
  }

  function render(dt) {
    let frame = "hero-idle";
    if (!P.ground) frame = "hero-jump";
    else if (Math.abs(P.vx) > 0.3) { walkT += dt * Math.abs(P.vx) * 2.2; frame = Math.floor(walkT) % 2 ? "hero-walk1" : "hero-walk2"; }
    const src = SPR(frame);
    if (!hero.src.endsWith(src)) hero.src = src;
    const px = Math.round((P.x - (1 - P.w) / 2) * T), py = Math.round((H - P.y - P.h) * T);
    hero.style.transform = `translate(${px}px, ${py}px) scaleX(${P.face})`;
  }

  let last = 0, fieldVisible = true;
  function loop(now) {
    const dt = Math.min(0.033, (now - (last || now)) / 1000); last = now;
    if (fieldVisible) { step(dt); render(dt); }
    requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { fieldVisible = e.isIntersecting; }, { threshold: 0 }).observe(field);
  // preload frames so the first jump doesn't flicker
  ["hero-walk1", "hero-walk2", "hero-jump", "qblock-used"].forEach((n) => { new Image().src = SPR(n); });

  addEventListener("resize", () => { const ox = P.x / (W || 1); measure(); P.x = ox * W; });
  (document.fonts?.ready ?? Promise.resolve()).then(() => { spawn(); requestAnimationFrame(loop); });

  const KEYMAP = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", Space: "jump", ArrowUp: "jump", KeyW: "jump" };
  function startPlaying() { if (!playing) { playing = true; hint.remove(); } }
  field.addEventListener("keydown", (e) => {
    const k = KEYMAP[e.code]; if (!k) return;
    e.preventDefault(); keys[k] = true; startPlaying();
  });
  field.addEventListener("keyup", (e) => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
  field.addEventListener("blur", () => { keys.left = keys.right = keys.jump = false; });
  field.addEventListener("pointerdown", () => field.focus({ preventScroll: true }));

  $$("[data-pad]").forEach((btn) => {
    const k = btn.dataset.pad;
    const on = (e) => { e.preventDefault(); keys[k] = true; startPlaying(); };
    const off = () => { keys[k] = false; };
    btn.addEventListener("pointerdown", on);
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => btn.addEventListener(ev, off));
  });

  /* ================= contact ================= */
  const dialog = $("#dialog");
  if (!reducedMotion) {
    const full = dialog.dataset.text; let typed = false;
    dialog.textContent = "";
    new IntersectionObserver(([e], o) => {
      if (!e.isIntersecting || typed) return;
      typed = true; o.disconnect();
      let i = 0;
      const t = setInterval(() => { dialog.textContent = full.slice(0, ++i); if (i % 3 === 0) tone(880, 0, 0.02, "square", 0.015); if (i >= full.length) clearInterval(t); }, 28);
    }, { threshold: 0.6 }).observe(dialog);
  }

  const form = $("#contact-form"), status = $("#form-status");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const d = Object.fromEntries(new FormData(form));
    if (!d.name.trim() || !d.message.trim() || !/^\S+@\S+\.\S+$/.test(d.email)) {
      status.textContent = "FILL IN ALL THREE FIELDS FIRST"; status.className = "font-pixel text-px-xs text-mario"; sfx.bump(); return;
    }
    sfx.coin(); addCoin(); addScore(1000);
    const subject = encodeURIComponent(`Hello from ${d.name.trim()}`);
    const body = encodeURIComponent(`${d.message.trim()}\n\n— ${d.name.trim()} (${d.email.trim()})`);
    location.href = `mailto:diveshkumarchordia@gmail.com?subject=${subject}&body=${body}`;
    status.textContent = "COIN ACCEPTED · OPENING YOUR MAIL APP"; status.className = "font-pixel text-px-xs text-coin";
  });

  /* ================= Konami code ================= */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];
  let ki = 0;
  addEventListener("keydown", (e) => {
    ki = e.code === KONAMI[ki] ? ki + 1 : e.code === KONAMI[0] ? 1 : 0;
    if (ki < KONAMI.length) return;
    ki = 0; document.body.classList.add("star-power"); sfx.star(); addScore(10000);
    setTimeout(() => document.body.classList.remove("star-power"), 8000);
  });
})();
