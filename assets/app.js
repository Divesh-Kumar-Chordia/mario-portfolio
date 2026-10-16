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
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const pad = (n, w) => String(n).padStart(w, "0");
  const once = (el, fn, threshold = 0.4) => {
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { io.disconnect(); fn(); } }, { threshold });
    io.observe(el);
  };

  /* ================= content ================= */
  const SKILLS = [
    { item: "SUPER MUSHROOM", sprite: "mushroom", kind: "Backend", skills: ["Go", "TypeScript", "JavaScript", "Python", "SQL", "NestJS", "Node.js", "Express", "gRPC", "Protobuf", "REST / OpenAPI", "System design"] },
    { item: "1-UP MUSHROOM", sprite: "oneup", kind: "Data", skills: ["Elasticsearch", "MongoDB", "Apache Spark", "Kafka", "AWS Athena", "Redis", "ILM tiers"] },
    { item: "STARMAN", sprite: "star", kind: "Platform", skills: ["Docker", "Kubernetes", "GoCD", "AWS", "GCP", "Azure", "Snyk", "Trivy", "Git"] },
    { item: "COIN", sprite: "coin", kind: "Frontend & testing", skills: ["React", "Redux", "Highcharts", "Webpack", "Vite", "Storybook", "Playwright"] },
    { item: "FIRE FLOWER", sprite: "fireflower", kind: "GenAI & RAG", skills: ["LangChain", "LangGraph", "LlamaIndex", "Advanced RAG", "Self-RAG", "Agents", "Tool calling", "Guardrails", "LLM APIs", "vLLM", "Ollama"] },
    { item: "? BLOCK", sprite: "qblock", kind: "AI-first workflow", skills: ["Claude Skills", "MCP", "Cursor", "Agent Mode", "Rules & hooks"] },
  ];

  // Each level: why the system exists, how data flows, what I built.
  const LEVELS = [
    { quest: "main", title: "AUDIT LOGGING PLATFORM", stat: "BILLIONS OF LOGS · 6 PRODUCTS",
      why: "Customers need a searchable record of every audit, webhook and publish event across Contentstack. That is billions of logs, and keeping them can't cost a fortune.",
      flow: ["PRODUCTS", "KAFKA", "LOGS CONSUMER", "ES · MONTHLY INDEX", "LOGS SERVICE · GRPC", "CUSTOMER QUERY"],
      built: "I built the Go services behind it. Logs Consumer moves events from Kafka into Elasticsearch and creates a fresh index every month. Logs Service answers queries over gRPC through an index alias, translating Mongo-style queries into Elasticsearch ones. Go worker pools with mutex-guarded shared state let both scale on very little hardware, and an ILM policy ages data from hot to warm to cold. I added multi-topic Kafka support, $exists in the translator, and a direct Elasticsearch path for queries the translator can't express.",
      tags: ["Go", "Kafka", "Elasticsearch", "gRPC"] },
    { quest: "main", title: "WEBHOOK DELIVERY", stat: "75+ NEW TRIGGER COMBINATIONS",
      why: "Customers plug Contentstack into their own systems. When content changes, their endpoint has to hear about it, even when their server is having a bad day.",
      flow: ["STACK EVENT", "TRIGGER", "EXECUTOR", "CUSTOMER URL"],
      fail: "RETRY QUEUE · 3 TRIES · FAILED STORE + NOTIFIER",
      built: "A four-stage pipeline: the trigger checks each webhook's conditions, the executor sends the event to the customer's URL, failed sends wait in a retry queue, and after three failed attempts the event is stored as failed and a notification goes out. I extended it with 75+ scope-and-action combinations as entry variants, taxonomy and locales launched, without breaking existing flows.",
      tags: ["Event-driven", "Retry queue", "API design"] },
    { quest: "main", title: "ANALYTICS PIPELINE & API", stat: "2B+ API CALLS / MONTH",
      why: "Customers want to know how their stack is used: API calls, bandwidth, status codes, cache hits and misses, devices. All of it starts as raw CDN and platform traffic.",
      flow: ["CLOUDFLARE + KAFKA", "SPARK ETL", "ELASTICSEARCH", "ANALYTICS API", "DASHBOARDS"],
      built: "I build Spark ETL pipelines that aggregate around a billion records from sources like Cloudflare and Kafka and persist them in Elasticsearch. On top sits the customer-facing Analytics API: I onboard new products and analytics domains, merge sources without changing the contract customers rely on, fixed v1/v2 output anomalies, and replaced generic failures with errors that explain what went wrong.",
      tags: ["Apache Spark", "Elasticsearch", "Kafka", "API design"] },
    { quest: "main", title: "CONTENT OPERATIONS ANALYTICS", stat: "67 OPERATION-SEQUENCE CASES",
      why: "Content teams need to see where entries get stuck in a workflow. The legacy collections can't be joined, have no reliable timestamps, and entry counts multiply across branch × content type × locale.",
      flow: ["LEGACY MONGO", "INDEXED DAILY SCAN", "COUNTS", "DASHBOARDS", "EVALUATOR"],
      built: "A low-cost daily scan that runs on Mongo indexes instead of joins. It powers Content Life Cycle, Workflow Health and Team Adoption. To prove the numbers, I built an Evaluator: it seeds realistic data, reads the dashboards through Playwright (DOM and screenshots) and compares every count with what the product rules say it should be. The analytics are validated against 67 operation-sequence cases, including orphaned-record edge cases.",
      tags: ["MongoDB", "Elasticsearch", "Playwright"] },
    { quest: "main", title: "FEATURE ADOPTION", stat: "4 SOURCES, 1 VIEW",
      why: "Customers couldn't easily see what they had bought and use, bought but haven't touched lately, or haven't bought yet.",
      flow: ["4 DATA SOURCES", "TEMPLATE SERVICE", "NPM + MICRO-FRONTEND", "USAGE VIEW"],
      built: "I owned a template-driven NestJS service end to end. It pulls business logic from audit trails, metered events, clustered MongoDB and analytics into one picture of each customer's recent activity. I fixed under-reporting for sharded orgs and shipped it as an npm package plus a micro-frontend.",
      tags: ["NestJS", "TypeScript", "MongoDB"] },
    { quest: "side", title: "RAG SYSTEMS", stat: "SELF-CORRECTING RETRIEVAL",
      why: "LLMs hallucinate when retrieval is weak. I wanted to understand retrieval from the bottom up, not just call a framework.",
      flow: ["INGEST", "CHUNK", "EMBED", "VECTOR DB", "MULTI-QUERY", "RE-RANK", "LLM", "SELF-RAG CHECK"],
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
    stomp: () => tone(420, 0, 0.12, "square", 0.05, 110),
    hurt: () => seq([494, 392, 330, 262], 0.07),
    start: () => seq([659, 659, 0, 659, 0, 523, 659, 0, 784], 0.09),
    pipe: () => [0, 0.14, 0.28].forEach((t) => tone(330, t, 0.11, "square", 0.04, 160)),
    oneup: () => seq([659, 784, 1319, 1047, 1175, 1568], 0.08),
    star: () => seq([1047, 1047, 1047, 0, 784, 1047, 0, 1175, 1319], 0.07),
    flag: () => seq([392, 523, 659, 784, 1047, 1319, 1568, 0, 1319, 0, 1568], 0.09),
    pop: () => tone(180 + Math.random() * 120, 0, 0.25, "sawtooth", 0.025, 60),
  };
  $$("[data-sfx]").forEach((el) => el.addEventListener("click", () => sfx[el.dataset.sfx]?.()));

  /* ================= day / night ================= */
  const nightBtn = $("#night");
  let night = document.documentElement.classList.contains("night");
  const paintNight = () => {
    document.documentElement.classList.toggle("night", night);
    nightBtn.textContent = night ? "DAY" : "NIGHT"; nightBtn.setAttribute("aria-pressed", night);
    $("#ghost").classList.toggle("hidden", !night);
  };
  paintNight();
  nightBtn.addEventListener("click", () => {
    night = !night; store.set("sdb-night", night); paintNight(); sfx.pipe();
    if (night) toast("SOMETHING STIRS IN THE DARK...");
  });
  // a sky full of pixel stars, shown only at night
  $(".stars").innerHTML = `<i class="absolute left-0 top-0 h-[2px] w-[2px]" style="box-shadow:${Array.from({ length: 60 }, () =>
    `${Math.round(Math.random() * 2000)}px ${Math.round(Math.random() * 520)}px 0 ${Math.random() < 0.15 ? 1 : 0}px #fff`).join(",")}"></i>`;

  /* ================= HUD, toast, effects ================= */
  let score = 0, coins = 0, top = store.get("sdb-top", 0);
  $("#top-score").textContent = pad(top, 6);
  function addScore(n) {
    score += n; $("#hud-score").textContent = pad(score, 6);
    if (score > top) { top = score; store.set("sdb-top", top); $("#top-score").textContent = pad(top, 6); }
  }
  function addCoin() {
    coins++;
    if (coins === 100) { coins = 0; sfx.oneup(); toast("100 COINS! 1-UP"); }
    $("#hud-coins").textContent = pad(coins, 2);
  }
  let time = 400;
  setInterval(() => {
    time = time > 0 ? time - 1 : 400;
    $("#hud-time").textContent = pad(time, 3);
    if (time === 100) toast("HURRY UP! (KIDDING. TAKE YOUR TIME.)");
  }, 1000);

  let toastT;
  function toast(msg, ms = 2600) {
    const t = $("#toast"); t.textContent = msg; t.classList.add("is-shown");
    clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove("is-shown"), ms);
  }
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
  function hop(el, img, base) {
    img.src = SPR(`${base}-jump`);
    el.animate([{ transform: "translateY(0)" }, { transform: "translateY(-60%)" }, { transform: "translateY(0)" }], { duration: 420, easing: "steps(7)" })
      .finished.then(() => { img.src = SPR(`${base}-idle`); });
  }
  function fireworks(n = 5) {
    if (reducedMotion) return;
    const colors = ["#E52521", "#F8B800", "#00B259", "#5C94FC", "#fff"];
    for (let k = 0; k < n; k++) setTimeout(() => {
      const cx = innerWidth * (0.15 + Math.random() * 0.7), cy = innerHeight * (0.2 + Math.random() * 0.35);
      for (let i = 0; i < 16; i++) {
        const p = document.createElement("span"), a = (i / 16) * Math.PI * 2, d = 50 + Math.random() * 50;
        p.className = "spark"; p.style.left = `${cx}px`; p.style.top = `${cy}px`;
        p.style.background = colors[(k + i) % colors.length];
        p.style.setProperty("--dx", `${Math.round(Math.cos(a) * d / 4) * 4}px`);
        p.style.setProperty("--dy", `${Math.round(Math.sin(a) * d / 4) * 4}px`);
        $("#fx").append(p); setTimeout(() => p.remove(), 950);
      }
      sfx.pop();
    }, k * 280);
  }

  // years since first production work (Jan 2024)
  const years = Math.floor((Date.now() - Date.UTC(2024, 0, 1)) / 31557600000);
  $$("[data-years]").forEach((el) => { el.textContent = pad(Math.max(1, years), 2); });

  // stat counters roll up the first time they're seen
  $$("[data-count]").forEach((el) => {
    if (reducedMotion) return;
    const target = +el.dataset.count, w = +(el.dataset.width || 0);
    const fmt = (v) => (w ? pad(v, w) : v.toLocaleString("en-US"));
    el.textContent = fmt(0);
    once(el, () => {
      const t0 = performance.now();
      const step = (now) => {
        const k = Math.min(1, (now - t0) / 1200);
        el.textContent = fmt(Math.round(target * (1 - (1 - k) ** 3)));
        if (k < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    }, 0.6);
  });

  // world indicator + active nav
  const navLinks = $$("[data-nav] a");
  const secObs = new IntersectionObserver((entries) => entries.forEach((e) => {
    if (!e.isIntersecting) return;
    $("#hud-world").textContent = e.target.dataset.world;
    navLinks.forEach((a) => a.setAttribute("aria-current", a.getAttribute("href") === `#${e.target.id}`));
  }), { rootMargin: "-45% 0px -50% 0px" });
  $$("main > section[data-world]").forEach((s) => secObs.observe(s));

  /* ================= scroll: walker, top button ================= */
  const walker = $("#walker"), toTop = $("#to-top");
  let lastY = scrollY, walkFrame = 0, walkIdle;
  function onScroll() {
    const max = document.documentElement.scrollHeight - innerHeight;
    const p = max > 0 ? Math.min(1, scrollY / max) : 0;
    const dir = scrollY < lastY ? -1 : 1;
    walker.style.transform = `translateX(${Math.round(8 + p * (innerWidth - 64))}px) scaleX(${dir})`;
    if (Math.abs(scrollY - lastY) > 4) { walkFrame ^= 1; walker.src = SPR(walkFrame ? "hero-walk1" : "hero-walk2"); }
    clearTimeout(walkIdle); walkIdle = setTimeout(() => { walker.src = SPR("hero-idle"); }, 140);
    lastY = scrollY;
    toTop.classList.toggle("is-shown", scrollY > innerHeight);
  }
  addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", onScroll);
  onScroll();
  toTop.addEventListener("click", () => sfx.pipe());

  /* ================= skills: ? blocks ================= */
  let found = 0, total = 0;
  $("#skill-groups").innerHTML = SKILLS.map((g) => `
    <article class="border-3 border-dashed border-[#3c64d8] p-5">
      <header class="flex items-center gap-4">
        <img src="${SPR(g.sprite)}" alt="" class="sprite h-8 ${g.sprite === "coin" ? "w-5" : "w-8"}" />
        <div><h3 class="font-pixel text-px-xs leading-5 text-coin">${g.item}</h3><p class="text-white/70">${g.kind}</p></div>
      </header>
      <ul class="mt-6 grid grid-cols-[repeat(auto-fill,minmax(76px,1fr))] gap-x-2 gap-y-5">
        ${g.skills.map((k) => { total++; return `
        <li class="relative flex flex-col items-center text-center" data-skill>
          <button type="button" class="qb" aria-label="Reveal skill: ${esc(k)}"><img src="${SPR("qblock")}" alt="" /></button>
          <span class="mt-2 text-[14px] leading-tight text-white/55 transition-colors [.found_&]:font-semibold [.found_&]:text-white">${esc(k)}</span>
        </li>`; }).join("")}
      </ul>
    </article>`).join("");
  $("#sk-total").textContent = total;

  function revealSkill(li, quiet) {
    if (li.classList.contains("found")) { if (!quiet) { bumpEl($(".qb", li)); sfx.bump(); } return; }
    li.classList.add("found");
    const btn = $(".qb", li);
    bumpEl(btn); setTimeout(() => { $("img", btn).src = SPR("qblock-used"); }, 110);
    found++; $("#sk-found").textContent = found;
    addCoin(); addScore(200);
    if (!quiet) {
      popCoin(li); sfx.coin();
      const r = btn.getBoundingClientRect(); popScore("200", r.left + 4, r.top - 20);
    }
    if (found === total) setTimeout(() => { toast("ALL SKILLS FOUND! 1-UP"); sfx.oneup(); fireworks(6); }, 350);
  }
  $$("[data-skill]").forEach((li) => $(".qb", li).addEventListener("click", () => revealSkill(li)));
  $("#sk-all").addEventListener("click", () => { $$("[data-skill]").forEach((li) => revealSkill(li, true)); sfx.coin(); });

  /* ================= level select ================= */
  const bullets = (text) => text.split(/(?<=\.)\s+(?=[A-Z$])/)
    .map((b) => `<li class="relative pl-5 text-ink/80 before:absolute before:left-0 before:top-[10px] before:h-2 before:w-2 before:bg-brick">${esc(b)}</li>`).join("");

  $("#levels").insertAdjacentHTML("beforeend", LEVELS.map((l, i) => {
    const main = l.quest === "main";
    return `
    <li class="level-card cursor-pointer" data-level>
      <div class="tile-brick relative h-[var(--tile)] border-3 border-b-0 border-ink">
        <span class="absolute -top-4 left-4 border-3 border-ink bg-coin px-2 py-1 font-pixel text-px-xs shadow-px-sm">1-4-${String.fromCharCode(65 + i)}</span>
      </div>
      <article class="px-card flex flex-1 flex-col p-6">
        <p class="font-pixel text-px-xs ${main ? "text-mario" : "text-luigi-dark"}">${main ? "MAIN QUEST · CONTENTSTACK" : "SIDE QUEST · PERSONAL"}</p>
        <h3 class="mt-3 font-pixel text-px-sm leading-6">${l.title}</h3>
        <dl class="mt-4 flex-1 space-y-5">
          <div><dt class="font-pixel text-px-xs text-ink/50">WHY IT EXISTS</dt><dd class="mt-1 font-medium text-ink">${esc(l.why)}</dd></div>
          <div><dt class="font-pixel text-px-xs text-ink/50">HOW IT FLOWS</dt><dd>
            <ol class="flow mt-2">${l.flow.map((f) => `<li><span>${esc(f)}</span></li>`).join("")}</ol>
            ${l.fail ? `<p class="mt-2 font-pixel text-[8px] leading-4 text-mario">ON FAILURE: ${esc(l.fail)}</p>` : ""}
          </dd></div>
          <div><dt class="sr-only">What I built</dt><dd>
            <details class="group">
              <summary class="flex cursor-pointer list-none items-center gap-3 font-pixel text-px-xs text-ink/70 hover:text-ink [&::-webkit-details-marker]:hidden">
                <img src="${SPR("qblock")}" alt="" class="h-5 w-5 group-open:hidden" /><img src="${SPR("qblock-used")}" alt="" class="hidden h-5 w-5 group-open:block" />
                <span class="group-open:hidden">WHAT I BUILT (${l.built.split(/(?<=\.)\s+(?=[A-Z$])/).length})</span><span class="hidden group-open:inline">WHAT I BUILT</span>
              </summary>
              <ul class="mt-3 space-y-2">${bullets(l.built)}</ul>
            </details>
          </dd></div>
        </dl>
        <p class="mt-5 flex items-center gap-3 border-2 border-dashed border-ink/30 px-3 py-2 font-pixel text-px-xs leading-5">
          <img src="${SPR("coin")}" alt="" class="h-[14px] w-2 shrink-0" />${l.stat}
        </p>
        <ul class="mt-5 flex flex-wrap gap-2">${l.tags.map((t) => `<li class="px-tag ${main ? "bg-coin" : "bg-luigi text-white"}">${esc(t)}</li>`).join("")}</ul>
      </article>
    </li>`;
  }).join(""));

  $$("[data-level]").forEach((card) => card.addEventListener("click", (e) => {
    if (e.target.closest("a, details") || getSelection().toString()) return;
    bumpEl(card); popCoin(card.firstElementChild); sfx.coin(); addCoin(); addScore(200);
    const r = card.getBoundingClientRect(); popScore("200", r.left + r.width / 2 - 12, r.top - 24);
  }));

  /* ================= progress: vine + course clear ================= */
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

  const climb = $("#climb"), vine = $("#vine"), checkpoints = $$(".checkpoint");
  function growVine() {
    const r = climb.getBoundingClientRect();
    const k = reducedMotion ? 1 : Math.min(1, Math.max(0, (innerHeight * 0.85 - r.top) / r.height));
    vine.style.transform = `scaleY(${k})`;
    const vineTop = r.bottom - r.height * k;
    checkpoints.forEach((c) => c.classList.toggle("is-cleared", c.getBoundingClientRect().top + 24 >= vineTop));
  }
  addEventListener("scroll", growVine, { passive: true });
  addEventListener("resize", growVine);
  growVine();

  const goal = $("#goal");
  function courseClear() {
    goal.classList.remove("is-clear"); void goal.offsetWidth; goal.classList.add("is-clear");
    sfx.flag(); addScore(5000);
    const d = reducedMotion ? 0 : 1400;
    setTimeout(() => { toast("COURSE CLEAR! +5000"); fireworks(5); }, d);
    setTimeout(() => toast("THANK YOU! BUT YOUR NEXT ENGINEER IS IN THIS CASTLE.", 3600), d + 2600);
  }
  once(goal, courseClear, 0.9);
  $("#flagpole").addEventListener("click", courseClear);

  /* ================= playfield: hero, blocks, enemies, friends ================= */
  const field = $("#field"), hero = $("#hero"), hint = $("#play-hint"), enemyLayer = $("#bugs"), ghost = $("#ghost");
  const blocks = $$("[data-block]", field).map((el) => ({ el, kind: el.dataset.block, hits: el.dataset.block === "multi" ? 8 : 1 }));

  function hitBlock(b) {
    bumpEl(b.el);
    if (b.kind === "brick" || b.hits <= 0) { sfx.bump(); return; }
    b.hits--; popCoin(b.el); sfx.coin(); addCoin(); addScore(200);
    const r = b.el.getBoundingClientRect(); popScore("200", r.left + r.width / 4, r.top - 20);
    if (b.hits === 0) setTimeout(() => { $("img", b.el).src = SPR("qblock-used"); b.el.setAttribute("aria-label", "Empty block"); }, 120);
  }
  blocks.forEach((b) => b.el.addEventListener("click", (e) => { e.stopPropagation(); hitBlock(b); }));

  // Player 2 cheers you on
  const p2 = $("#p2"), p2img = $("img", p2);
  const P2_LINES = ["PLAYER 2: RACE YOU TO THE FLAG!", "PLAYER 2: I'VE GOT THE ON-CALL PAGER.", "PLAYER 2: SHIP IT!", "PLAYER 2: MIND THE LEGACY TURTLES."];
  let p2Line = 0;
  p2.addEventListener("click", (e) => { e.stopPropagation(); hop(p2, p2img, "hero2"); sfx.jump(); toast(P2_LINES[p2Line++ % P2_LINES.length]); });
  if (!reducedMotion) setInterval(() => { if (fieldVisible && !document.hidden) hop(p2, p2img, "hero2"); }, 5200);

  // physics in tile units, so the game plays the same at 32px and 48px tiles; y grows upward from the ground
  const P = { x: 0, y: 0, vx: 0, vy: 0, w: 0.8, h: 1, ground: true, face: 1, hurt: 0 };
  const G = { x: 1, y: 4, shy: false, t: 0 };
  const keys = { left: false, right: false, jump: false, down: false };
  let warping = 0;
  let T = 48, W = 0, H = 0, rects = [], spawnX = 0, lastJump = false, walkT = 0;
  let enemies = [], nextEnemy = 1.5, fixed = 0, fieldVisible = true;

  const ENEMY = {
    bug: { frames: ["bug-1", "bug-2"], flat: "bug-flat", aspect: 14 / 16, speed: 1.6, points: 100, label: "BUG FIXED" },
    turtle: { frames: ["turtle-1", "turtle-2"], flat: "shell", aspect: 11 / 16, speed: 1.0, points: 200, label: "REFACTORED" },
  };

  function measure() {
    const fr = field.getBoundingClientRect();
    T = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tile")) || 48;
    W = fr.width / T; H = fr.height / T;
    rects = [...blocks.map((b) => b.el), ...$$("[data-solid]", field)].map((el) => {
      const r = el.getBoundingClientRect();
      return { el, x: (r.left - fr.left) / T, y: (fr.bottom - r.bottom) / T, w: r.width / T, h: r.height / T };
    });
    const pipe = rects.find((r) => r.el.hasAttribute("data-spawn"));
    spawnX = pipe ? pipe.x - 0.95 : W - 1;
  }
  function spawnHero() {
    const center = rects.find((r) => r.el.dataset.block === "multi");
    P.x = center ? center.x + (center.w - P.w) / 2 : W / 2;
    P.y = center ? center.y + center.h : 0;
    P.vx = P.vy = 0; P.ground = true;
  }
  const overlapX = (r) => P.x + P.w > r.x + 0.02 && P.x < r.x + r.w - 0.02;
  const overlapY = (r) => P.y + P.h > r.y + 0.02 && P.y < r.y + r.h - 0.02;
  const touches = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  function addEnemy(kind) {
    const def = ENEMY[kind], el = document.createElement("img");
    el.src = SPR(def.frames[0]); el.alt = "";
    el.className = "absolute left-0 top-0 z-[5] cursor-pointer select-none";
    el.style.cssText += `image-rendering:pixelated;width:var(--tile);height:calc(var(--tile)*${def.aspect})`;
    el.title = kind === "bug" ? "A bug. Stomp it!" : "Legacy code. Refactor it!";
    const en = { kind, def, el, x: spawnX, y: 0, w: 0.8, h: def.aspect * 0.9, vx: -(def.speed + Math.random() * 0.5), flat: 0, t: 0 };
    el.addEventListener("pointerdown", (e) => { e.stopPropagation(); e.preventDefault(); squash(en); });
    enemyLayer.append(el); enemies.push(en);
  }
  function squash(en) {
    if (en.flat) return;
    en.flat = 0.7; en.el.src = SPR(en.def.flat); sfx.stomp(); addScore(en.def.points);
    fixed++; $("#bugs-fixed").textContent = pad(fixed, 2);
    const r = en.el.getBoundingClientRect(); popScore(en.def.label, r.left - 8, r.top - 18);
    if (fixed === 10) { toast("10 FIXES. SHIP IT!"); fireworks(3); }
  }
  function hurtHero(fromX, kind) {
    P.hurt = 1.2; P.vx = (P.x < fromX ? -1 : 1) * 5; P.vy = 7; P.ground = false;
    hero.classList.remove("is-hurt"); void hero.offsetWidth; hero.classList.add("is-hurt");
    sfx.hurt(); toast(kind === "bug" ? "A BUG GOT TO PROD! STOMP IT FROM ABOVE" : "LEGACY CODE BIT BACK! STOMP IT FROM ABOVE");
  }

  function warp() {
    if (warping) return;
    warping = 0.7; hero.style.zIndex = "5"; sfx.pipe(); startPlaying();
    setTimeout(() => {
      $("#projects").scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth" });
      toast("WARP ZONE! WELCOME TO WORLD 1-4");
      setTimeout(() => { warping = 0; hero.style.zIndex = ""; spawnHero(); }, 600);
    }, 700);
  }
  $("[data-warp]", field).addEventListener("pointerdown", (e) => { e.stopPropagation(); warp(); });

  function step(dt) {
    if (warping) { P.y -= 1.6 * dt; P.vx = 0; return; } // sink into the pipe
    const pipe = rects.find((r) => r.el.hasAttribute("data-warp"));
    if (keys.down && P.ground && pipe && Math.abs(P.y - (pipe.y + pipe.h)) < 0.05 && P.x + P.w / 2 > pipe.x && P.x + P.w / 2 < pipe.x + pipe.w) {
      P.x = pipe.x + (pipe.w - P.w) / 2; warp(); return;
    }
    const accel = P.ground ? 40 : 24, maxV = 6;
    const dir = P.hurt > 0.9 ? 0 : (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) { P.vx += dir * accel * dt; P.face = dir; } else { P.vx *= P.ground ? 0.78 : 0.96; if (Math.abs(P.vx) < 0.05) P.vx = 0; }
    P.vx = Math.max(-maxV, Math.min(maxV, P.vx));
    P.hurt = Math.max(0, P.hurt - dt);

    if (keys.jump && !lastJump && P.ground) { P.vy = 13.5; P.ground = false; sfx.jump(); }
    if (!keys.jump && P.vy > 4 && !P.hurt) P.vy = 4; // variable jump height
    lastJump = keys.jump;
    P.vy -= (P.vy > 0 && keys.jump ? 30 : 48) * dt;

    P.x = Math.max(0, Math.min(W - P.w, P.x + P.vx * dt));
    for (const r of rects) if (overlapX(r) && overlapY(r)) { P.x = P.vx > 0 ? r.x - P.w : r.x + r.w; P.vx = 0; }

    P.y += P.vy * dt; P.ground = false;
    if (P.y <= 0) { P.y = 0; P.vy = 0; P.ground = true; }
    for (const r of rects) {
      if (!overlapX(r) || !overlapY(r)) continue;
      if (P.vy > 0) {
        P.y = r.y - P.h; P.vy = 0;
        const head = rects.filter((q) => q.el.dataset.block && overlapX(q) && Math.abs(q.y - (P.y + P.h)) < 0.05)
          .sort((a, b) => Math.abs(a.x + a.w / 2 - (P.x + P.w / 2)) - Math.abs(b.x + b.w / 2 - (P.x + P.w / 2)))[0];
        const b = head && blocks.find((k) => k.el === head.el);
        if (b) hitBlock(b);
      } else { P.y = r.y + r.h; P.vy = 0; P.ground = true; }
    }
    if (P.y > H) P.y = H;

    // bugs and legacy turtles crawl out of the pipe and walk left
    if (!reducedMotion && (nextEnemy -= dt) <= 0 && enemies.length < 3) {
      addEnemy(Math.random() < 0.3 ? "turtle" : "bug"); nextEnemy = 3 + Math.random() * 4;
    }
    const hb = { x: P.x + 0.1, y: P.y, w: P.w - 0.2, h: P.h - 0.1 };
    for (const en of enemies) {
      if (en.flat) { en.flat -= dt; continue; }
      en.x += en.vx * dt; en.t += dt;
      if (!touches(hb, en)) continue;
      if (P.vy < 0 && P.y > en.y + en.h * 0.35) { squash(en); P.vy = 9; P.ground = false; }
      else if (!P.hurt) hurtHero(en.x + en.w / 2, en.kind);
    }
    enemies = enemies.filter((en) => {
      const keep = en.x > -1.2 && (!en.flat || en.flat > 0);
      if (!keep) en.el.remove();
      return keep;
    });

    // night ghost: drifts toward you when your back is turned, hides its face when you look
    if (night) {
      G.t += dt;
      const toHero = Math.sign(P.x - G.x) || 1;
      G.shy = P.face === -toHero;
      if (!G.shy) { G.x += toHero * 1.1 * dt; G.y += (Math.min(H - 1.2, P.y + 1.5) - G.y) * 0.6 * dt; }
    }
  }

  function render(dt) {
    let frame = "hero-idle";
    if (!P.ground) frame = "hero-jump";
    else if (Math.abs(P.vx) > 0.3) { walkT += dt * Math.abs(P.vx) * 2.2; frame = Math.floor(walkT) % 2 ? "hero-walk1" : "hero-walk2"; }
    const src = SPR(frame);
    if (!hero.src.endsWith(src)) hero.src = src;
    hero.style.transform = `translate(${Math.round((P.x - (1 - P.w) / 2) * T)}px, ${Math.round((H - P.y - P.h) * T)}px) scaleX(${P.face})`;
    for (const en of enemies) {
      if (!en.flat) { const f = SPR(en.def.frames[Math.floor(en.t * 5) % 2]); if (!en.el.src.endsWith(f)) en.el.src = f; }
      en.el.style.transform = `translate(${Math.round((en.x - 0.1) * T)}px, ${Math.round((H - en.y - en.def.aspect) * T)}px)`;
    }
    if (night) {
      const g = SPR(G.shy ? "ghost-shy" : "ghost");
      if (!ghost.src.endsWith(g)) ghost.src = g;
      const bob = Math.round(Math.sin(G.t * 3) * 3);
      ghost.style.transform = `translate(${Math.round(G.x * T)}px, ${Math.round((H - G.y - 1) * T) + bob}px) scaleX(${P.x > G.x ? 1 : -1})`;
    }
  }

  function loop(now) {
    const dt = Math.min(0.033, (now - (loop.last || now)) / 1000); loop.last = now;
    if (fieldVisible) { step(dt); render(dt); }
    requestAnimationFrame(loop);
  }
  new IntersectionObserver(([e]) => { fieldVisible = e.isIntersecting; }, { threshold: 0 }).observe(field);
  ["hero-walk1", "hero-walk2", "hero-jump", "hero2-jump", "qblock-used", "bug-2", "bug-flat", "turtle-1", "turtle-2", "shell", "ghost-shy"]
    .forEach((n) => { new Image().src = SPR(n); });

  addEventListener("resize", () => { const ox = P.x / (W || 1); measure(); P.x = ox * W; enemies.forEach((en) => { en.x = Math.min(en.x, spawnX); }); });
  (document.fonts?.ready ?? Promise.resolve()).then(() => { measure(); spawnHero(); requestAnimationFrame(loop); });

  const KEYMAP = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", Space: "jump", ArrowUp: "jump", KeyW: "jump", ArrowDown: "down", KeyS: "down" };
  const startPlaying = () => hint.classList.add("hidden");
  field.addEventListener("keydown", (e) => {
    const k = KEYMAP[e.code]; if (!k) return;
    e.preventDefault(); keys[k] = true; startPlaying();
  });
  field.addEventListener("keyup", (e) => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
  field.addEventListener("blur", () => { keys.left = keys.right = keys.jump = keys.down = false; });
  field.addEventListener("pointerdown", () => field.focus({ preventScroll: true }));
  $$("[data-pad]").forEach((btn) => {
    const k = btn.dataset.pad;
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); keys[k] = true; startPlaying(); });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => btn.addEventListener(ev, () => { keys[k] = false; }));
  });

  /* ================= recruiter brief ================= */
  const brief = $("#brief");
  $("#brief-open").addEventListener("click", () => { brief.showModal(); sfx.pipe(); });
  brief.addEventListener("click", (e) => { if (e.target === brief) brief.close(); }); // click on the backdrop

  /* ================= intro card ================= */
  const root = document.documentElement;
  if (root.classList.contains("intro")) {
    const done = () => root.classList.remove("intro");
    setTimeout(done, 1100);
    $("#intro").addEventListener("click", done);
  }

  /* ================= contact ================= */
  const dialog = $("#dialog");
  if (!reducedMotion) {
    const full = dialog.dataset.text;
    dialog.textContent = "";
    once(dialog, () => {
      let i = 0;
      const t = setInterval(() => {
        dialog.textContent = full.slice(0, ++i);
        if (i % 3 === 0) tone(880, 0, 0.02, "square", 0.015);
        if (i >= full.length) clearInterval(t);
      }, 28);
    }, 0.6);
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

  /* ================= Konami code: star power ================= */
  const KONAMI = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "KeyB", "KeyA"];
  let ki = 0;
  addEventListener("keydown", (e) => {
    ki = e.code === KONAMI[ki] ? ki + 1 : e.code === KONAMI[0] ? 1 : 0;
    if (ki < KONAMI.length) return;
    ki = 0; document.body.classList.add("star-power"); sfx.star(); addScore(10000); toast("STAR POWER! +10000"); fireworks(6);
    setTimeout(() => document.body.classList.remove("star-power"), 8000);
  });

  console.log("%cSUPER DIVESH BROS.", "font:bold 16px monospace;color:#E52521");
  console.log("%cFellow engineer? Say hi: diveshkumarchordia@gmail.com", "font:13px monospace");
})();
