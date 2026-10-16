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
    { item: "SUPER MUSHROOM", sprite: "mushroom", kind: "Backend", skills: ["Go", "TypeScript", "JavaScript", "Python", "SQL", "NestJS", "Node.js", "Express", "FastAPI", "gRPC", "Protobuf", "REST / OpenAPI", "System design"] },
    { item: "1-UP MUSHROOM", sprite: "oneup", kind: "Data", skills: ["Elasticsearch", "MongoDB", "Apache Spark", "Kafka", "AWS Athena", "Redis", "Redis Lua", "ILM tiers"] },
    { item: "STARMAN", sprite: "star", kind: "Platform", skills: ["Docker", "Kubernetes", "GoCD", "AWS", "GCP", "Azure", "Snyk", "Trivy", "Git"] },
    { item: "COIN", sprite: "coin", kind: "Frontend & testing", skills: ["React", "Redux", "Highcharts", "Highstock", "Webpack", "Vite", "Storybook", "Playwright"] },
    { item: "FIRE FLOWER", sprite: "fireflower", kind: "GenAI & RAG", skills: ["LangChain", "LangGraph", "LlamaIndex", "Advanced RAG", "Self-RAG", "Agents", "Tool calling", "Guardrails", "LLM APIs", "vLLM", "Ollama"] },
    { item: "? BLOCK", sprite: "qblock", kind: "AI-first workflow", skills: ["Claude Skills", "MCP", "Cursor", "Agent Mode", "Rules & hooks"] },
  ];

  // Each level: why the system exists, how data flows, what I built.
  const LEVELS = [
    { quest: "main", map: "audit", title: "AUDIT LOGGING PLATFORM", stat: "BILLIONS OF LOGS · 6 PRODUCTS",
      why: "Customers need a searchable record of every audit, webhook and publish event across Contentstack. That is billions of logs, and keeping them can't cost a fortune.",
      flow: ["PRODUCTS", "KAFKA", "LOGS CONSUMER", "ES · MONTHLY INDEX", "LOGS SERVICE · GRPC", "CUSTOMER QUERY"],
      built: "I built the Go services behind it. Logs Consumer moves events from Kafka into Elasticsearch and creates a fresh index every month. Logs Service answers queries over gRPC through an index alias, translating Mongo-style queries into Elasticsearch ones. Go worker pools with mutex-guarded shared state let both scale on very little hardware, and an ILM policy ages data from hot to warm to cold. I added multi-topic Kafka support, $exists in the translator, and a direct Elasticsearch path for queries the translator can't express. I onboarded 6 products end to end: ingestion, Elasticsearch index templates and the admin filter UI.",
      tags: ["Go", "Kafka", "Elasticsearch", "gRPC"] },
    { quest: "main", map: "webhooks", title: "WEBHOOK DELIVERY", stat: "75+ NEW TRIGGER COMBINATIONS",
      why: "Customers plug Contentstack into their own systems. When content changes, their endpoint has to hear about it, even when their server is having a bad day.",
      flow: ["STACK EVENT", "TRIGGER", "EXECUTOR", "CUSTOMER URL"],
      fail: "RETRY QUEUE · 3 TRIES · FAILED STORE + NOTIFIER",
      built: "A four-stage pipeline: the trigger checks each webhook's conditions, the executor sends the event to the customer's URL, failed sends wait in a retry queue, and after three failed attempts the event is stored as failed and a notification goes out. I extended it with 75+ scope-and-action combinations as entry variants, taxonomy and locales launched, without breaking existing flows.",
      tags: ["Event-driven", "Retry queue", "API design"] },
    { quest: "main", map: "analytics", title: "ANALYTICS PIPELINE & API", stat: "2B+ API CALLS / MONTH",
      why: "Customers want to know how their stack is used: API calls, bandwidth, status codes, cache hits and misses, devices. All of it starts as raw CDN and platform traffic.",
      flow: ["CLOUDFLARE + KAFKA", "SPARK ETL", "ELASTICSEARCH", "ANALYTICS API", "DASHBOARDS"],
      built: "I build Spark ETL pipelines that aggregate around a billion records from sources like Cloudflare and Kafka and persist them in Elasticsearch. On top sits the customer-facing Analytics API: I onboard new products and analytics domains, merge sources without changing the contract customers rely on, fixed v1/v2 output anomalies, and replaced generic failures with errors that explain what went wrong.",
      tags: ["Apache Spark", "Elasticsearch", "Kafka", "API design"] },
    { quest: "main", map: "contentops", title: "CONTENT OPERATIONS ANALYTICS", stat: "67 OPERATION-SEQUENCE CASES",
      why: "Content teams need to see where entries get stuck in a workflow. The legacy collections can't be joined, have no reliable timestamps, and entry counts multiply across branch × content type × locale.",
      flow: ["LEGACY MONGO", "INDEXED DAILY SCAN", "COUNTS", "DASHBOARDS", "EVALUATOR"],
      built: "A low-cost daily scan that runs on Mongo indexes instead of joins. It powers Content Life Cycle, Workflow Health and Team Adoption. To prove the numbers, I built an Evaluator: it seeds realistic data, reads the dashboards through Playwright (DOM and screenshots) and compares every count with what the product rules say it should be. The analytics are validated against 67 operation-sequence cases, including orphaned-record edge cases.",
      tags: ["MongoDB", "Elasticsearch", "Playwright"] },
    { quest: "main", map: "discovery", title: "PLATFORM DISCOVERY", stat: "17 CAPABILITIES · 3 PRODUCTION APPS",
      why: "Customers couldn't easily see what they had bought and use, bought but haven't touched lately, or haven't bought yet. The answer was scattered across many systems.",
      flow: ["ES + MONGO + AUDIT + METERING", "9 USAGE PROCESSORS", "17 CAPABILITIES", "REACT PACKAGE", "3 APPS"],
      built: "I owned it end to end across 8 repositories: a template-driven service that resolves 17 capabilities through 9 usage processors over Elasticsearch, MongoDB, audit logs and metering. Multi-cluster resolution fixed under-reporting for sharded organizations. I extracted the UI into @contentstack/platform-discovery, a versioned React package shipped in 9 releases and used by 3 production applications.",
      tags: ["NestJS", "React", "Elasticsearch", "MongoDB"] },
  ];

  const SIDE_QUESTS = [
    { title: "JEVSTREAM", sprite: "star", map: "jevstream",
      body: "Priority-based ticket routing. A FastAPI service judges each ticket's urgency and stores it in a Redis sorted set; workers claim the most urgent first through atomic Lua scripts with expiring leases, so a crashed worker's ticket goes back in the queue.",
      tags: ["Python", "FastAPI", "Redis", "Lua"], code: "https://github.com/Divesh-Kumar-Chordia/jevstream" },
    { title: "ANALYTICS AUTOMATION LAB", sprite: "oneup",
      body: "A testing lab for Contentstack analytics: a Delivery API site, 29 automation scripts covering the content lifecycle, multi-user simulation, every analytics meter dimension, and Launch URL warming.",
      tags: ["React", "Vite", "Node.js"], live: "https://top-url-website-making.vercel.app", code: "https://github.com/DiveshKumarChordia/contentstack-analytics-automation-lab" },
    { title: "LUMEN VISUAL EXPERIENCE", sprite: "fireflower",
      body: "A Contentstack Visual Builder site where a script creates the stack, environment, tokens, content types and entries in ten idempotent steps. Live Preview covers drafts, Releases and Timeline.",
      tags: ["TypeScript", "Live Preview", "GraphQL"], live: "https://lumen-rbac-demo.vercel.app", code: "https://github.com/DiveshKumarChordia/lumen-visual-experience" },
    { title: "GITPULSE", sprite: "coin",
      body: "A GitHub organization dashboard: every commit and pull request on one timeline, a contribution heatmap, filters, and code search across all of an org's repositories.",
      tags: ["JavaScript", "GitHub API", "OAuth"], live: "https://gitpulse-dashboard.vercel.app", code: "https://github.com/DiveshKumarChordia/gitpulse-dashboard" },
    { title: "RAG SYSTEMS", sprite: "mushroom", map: "rag",
      body: "A production-style RAG pipeline with LangChain and ChromaDB / Pinecone, plus a low-level lab for chunking, embeddings, RAG-Fusion, cross-encoder re-ranking and Self-RAG loops that catch low-confidence answers.",
      tags: ["Python", "LangChain", "Pinecone"] },
  ];

  const TIMELINE = [
    { status: "now", role: "SOFTWARE ENGINEER", org: "Contentstack · Bengaluru", when: "Aug 2024 – Present",
      lead: "Data and analytics platform. The flagship systems are in Project Select above; this is the rest of the job.",
      points: [
        "Authored 500+ merged pull requests and reviewed 515 across 35 repositories.",
        "Primary contact for production RCAs on the audit logging platform I built.",
        "Manage releases and triage customer issues.",
        "Wrote dev-environment scripts that simulate real customer usage patterns and generate the cases needed to cover every product capability.",
        "Principal author of cs-highcharts, the shared charting library. A log10-based tick-interval algorithm fixed a recurring axis-label bug across every chart.",
        "Delivered 3 CMS analytics dashboards end to end: metering instrumentation, Spark rollups, Elasticsearch snapshots, serving processors, React widgets and plan gating.",
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

  /* ================= system maps: pixel-art architecture diagrams ================= */
  const KINDS = {
    src: { fill: "#FCE4B0", ink: "#000", name: "Source" },
    svc: { fill: "#FFFFFF", ink: "#000", name: "Service" },
    store: { fill: "#F8B800", ink: "#000", name: "Data store" },
    queue: { fill: "#00B259", ink: "#fff", name: "Queue / workers" },
    user: { fill: "#5C94FC", ink: "#fff", name: "Customer-facing" },
    lib: { fill: "#F8A878", ink: "#000", name: "Rules / package" },
    fail: { fill: "#E52521", ink: "#fff", name: "Failure path" },
  };
  const n = (id, x, y, label, note, kind = "svc", w = 150) => ({ id, x, y, label, note, kind, w });
  const MAPS = {
    audit: { h: 330, nodes: [
      n("prod", 10, 30, "6 PRODUCTS", "audit · webhook\npublish logs", "src", 130),
      n("kafka", 190, 30, "KAFKA", "multi-topic SDK", "queue", 130),
      n("cons", 370, 30, "LOGS CONSUMER", "Go worker pool\nnew index monthly", "svc", 160),
      n("es", 580, 30, "ELASTICSEARCH", "monthly indices\nquery alias\nILM hot · warm · cold", "store", 170),
      n("ui", 10, 230, "CUSTOMERS\n+ ADMIN UI", "filter + search", "user", 130),
      n("svc", 370, 230, "LOGS SERVICE", "gRPC · mutex-guarded\nMongo → ES translator", "svc", 160),
    ], edges: [
      { from: "prod", to: "kafka", label: "events" }, { from: "kafka", to: "cons" }, { from: "cons", to: "es", label: "bulk write" },
      { from: "ui", to: "svc", label: "gRPC query" }, { from: "svc", fs: "r", to: "es", ts: "b", label: "via alias" },
    ] },
    webhooks: { h: 400, nodes: [
      n("ev", 10, 40, "STACK EVENT", "content changes", "src", 140),
      n("trig", 200, 40, "TRIGGER", "checks the webhook's\nconditions"),
      n("exec", 400, 40, "EXECUTOR", "sends the event"),
      n("url", 600, 40, "CUSTOMER URL", "their server", "user"),
      n("retry", 400, 210, "RETRY QUEUE", "tries again", "queue"),
      n("failed", 600, 210, "FAILED STORE", "after 3 failed tries", "fail"),
      n("notif", 600, 320, "NOTIFIER", "a notification\ngoes out", "fail"),
    ], edges: [
      { from: "ev", to: "trig" }, { from: "trig", to: "exec", label: "match" }, { from: "exec", to: "url", label: "deliver" },
      { from: "exec", fs: "b", fo: 35, to: "retry", ts: "t", to2: 35, label: "fails", fail: true },
      { from: "retry", fs: "t", fo: -35, to: "exec", ts: "b", to2: -35, label: "retry", dashed: true },
      { from: "retry", to: "failed", label: "3 fails", fail: true }, { from: "failed", fs: "b", to: "notif", ts: "t", fail: true },
    ] },
    analytics: { h: 330, nodes: [
      n("cf", 10, 30, "CLOUDFLARE", "CDN traffic", "src"),
      n("kf", 10, 190, "KAFKA", "platform events", "queue"),
      n("spark", 220, 105, "SPARK ETL", "~1B records"),
      n("es", 420, 105, "ELASTICSEARCH", "aggregates", "store", 150),
      n("api", 610, 105, "ANALYTICS API", "v1 / v2 · usage,\nstatus codes, cache,\ndevices", "svc", 140),
      n("dash", 610, 260, "DASHBOARDS", "2B+ calls / month", "user", 140),
    ], edges: [
      { from: "cf", to: "spark", mid: 190 }, { from: "kf", to: "spark", mid: 190 }, { from: "spark", to: "es", label: "persist" },
      { from: "es", to: "api" }, { from: "api", fs: "b", to: "dash", ts: "t" },
    ] },
    contentops: { h: 380, nodes: [
      n("mongo", 10, 40, "LEGACY MONGO", "no joins\nno reliable timestamps", "store", 160),
      n("scan", 220, 40, "DAILY SCAN", "on Mongo indexes\nlow cost"),
      n("counts", 420, 40, "STAGE COUNTS", "branch × type\n× locale"),
      n("dash", 610, 40, "3 DASHBOARDS", "life cycle · workflow\nhealth · adoption", "user", 140),
      n("seed", 10, 250, "SEEDED DATA", "realistic usage\npatterns", "src", 160),
      n("rules", 220, 250, "PRODUCT RULES", "expected values", "lib"),
      n("eval", 420, 250, "EVALUATOR", "Playwright: DOM\n+ screenshots", "queue"),
      n("verdict", 610, 250, "PASS / FAIL", "67 operation-\nsequence cases", "lib", 140),
    ], edges: [
      { from: "mongo", to: "scan" }, { from: "scan", to: "counts" }, { from: "counts", to: "dash" },
      { from: "seed", fs: "t", to: "mongo", ts: "b", label: "writes", dashed: true },
      { from: "rules", to: "eval", label: "expect" }, { from: "dash", fs: "b", to: "eval", ts: "t", label: "reads" }, { from: "eval", to: "verdict" },
    ] },
    discovery: { h: 330, nodes: [
      n("es", 10, 10, "ELASTICSEARCH", "", "store", 160),
      n("mongo", 10, 85, "MONGODB", "multi-cluster", "store", 160),
      n("audit", 10, 175, "AUDIT LOGS", "", "store", 160),
      n("meter", 10, 250, "METERING", "", "store", 160),
      n("proc", 240, 120, "9 USAGE\nPROCESSORS", "template-driven"),
      n("caps", 440, 120, "17 CAPABILITIES", "bought + used\nbought, idle\nnot bought", "lib"),
      n("pkg", 620, 40, "REACT PACKAGE", "9 releases", "svc", 130),
      n("apps", 620, 220, "3 PRODUCTION\nAPPS", "", "user", 130),
    ], edges: [
      { from: "es", to: "proc", mid: 205 }, { from: "mongo", to: "proc", mid: 205 }, { from: "audit", to: "proc", mid: 205 }, { from: "meter", to: "proc", mid: 205 },
      { from: "proc", to: "caps", label: "resolve" }, { from: "caps", to: "pkg", mid: 605 }, { from: "pkg", fs: "b", to: "apps", ts: "t", label: "used by" },
    ] },
    jevstream: { h: 400, nodes: [
      n("tk", 10, 40, "TICKET", "webhook producer", "src", 130),
      n("api", 190, 40, "FASTAPI", "POST /ingest"),
      n("judge", 190, 220, "JUDGE", "urgency 0–1\n+ department", "lib"),
      n("enq", 400, 40, "LUA ENQUEUE", "atomic write"),
      n("active", 600, 40, "ACTIVE ZSET", "score = urgency", "store"),
      n("proc", 600, 220, "PROCESSING ZSET", "lease deadline", "store"),
      n("workers", 400, 220, "WORKER POOL", "async", "queue"),
      n("done", 400, 330, "ACK / REQUEUE", "per-claim tokens"),
    ], edges: [
      { from: "tk", to: "api" }, { from: "api", fs: "b", fo: -30, to: "judge", ts: "t", to2: -30, label: "score" },
      { from: "judge", fs: "t", fo: 30, to: "api", ts: "b", to2: 30, dashed: true }, { from: "api", to: "enq" }, { from: "enq", to: "active" },
      { from: "active", fs: "b", fo: -30, to: "proc", ts: "t", to2: -30, label: "claim + lease" },
      { from: "proc", fs: "t", fo: 30, to: "active", ts: "b", to2: 30, label: "expired", dashed: true },
      { from: "proc", fs: "l", to: "workers", ts: "r", label: "handle" }, { from: "workers", fs: "b", to: "done", ts: "t" },
    ] },
    rag: { h: 330, nodes: [
      n("docs", 10, 30, "DOCUMENTS", "", "src", 130), n("chunk", 170, 30, "CHUNK", "", "svc", 130),
      n("embed", 330, 30, "EMBED", "", "svc", 130), n("vdb", 490, 30, "VECTOR DB", "Chroma / Pinecone", "store", 150),
      n("q", 10, 200, "QUESTION", "", "user", 130), n("mq", 170, 200, "MULTI-QUERY", "+ RAG-Fusion", "svc", 130),
      n("rr", 330, 200, "RE-RANK", "cross-encoder", "svc", 130), n("llm", 490, 200, "LLM", "", "queue", 110),
      n("chk", 630, 200, "SELF-RAG\nCHECK", "", "lib", 120),
    ], edges: [
      { from: "docs", to: "chunk" }, { from: "chunk", to: "embed" }, { from: "embed", to: "vdb" },
      { from: "q", to: "mq" }, { from: "mq", fs: "t", to: "vdb", ts: "b", label: "retrieve" }, { from: "mq", to: "rr" },
      { from: "rr", to: "llm" }, { from: "llm", to: "chk" },
      { from: "chk", fs: "b", to: "mq", ts: "b", mid: 310, label: "low confidence: try again", dashed: true, fail: true },
    ] },
  };

  function drawMap(spec) {
    const W = 760, F = "'Press Start 2P',monospace", B = "'Space Grotesk',sans-serif";
    const N = {};
    spec.nodes.forEach((d) => {
      const lines = d.label.split("\n"), notes = d.note ? d.note.split("\n") : [];
      N[d.id] = { ...d, lines, notes, h: 18 + lines.length * 14 + (notes.length ? 6 + notes.length * 15 : 0) };
    });
    const at = (d, side, off = 0) => ({ r: [d.x + d.w, d.y + d.h / 2 + off], l: [d.x, d.y + d.h / 2 + off], t: [d.x + d.w / 2 + off, d.y], b: [d.x + d.w / 2 + off, d.y + d.h] })[side];
    const H = (s) => s === "r" || s === "l";
    let out = "";
    for (const e of spec.edges) {
      const fs = e.fs || "r", ts = e.ts || "l", A = N[e.from], Bn = N[e.to];
      const a = at(A, fs, e.fo), b = at(Bn, ts, e.to2);
      // boxes that overlap on the cross axis get a straight arrow through the overlap
      if (H(fs) && H(ts) && e.mid == null && e.fo == null) {
        const top = Math.max(A.y, Bn.y), bot = Math.min(A.y + A.h, Bn.y + Bn.h);
        if (bot - top > 16) a[1] = b[1] = (top + bot) / 2;
      }
      let pts;
      if (H(fs) && H(ts)) { const m = e.mid ?? (a[0] + b[0]) / 2; pts = [a, [m, a[1]], [m, b[1]], b]; }
      else if (!H(fs) && !H(ts)) { const m = e.mid ?? (a[1] + b[1]) / 2; pts = [a, [a[0], m], [b[0], m], b]; }
      else pts = H(fs) ? [a, [b[0], a[1]], b] : [a, [a[0], b[1]], b];
      pts = pts.filter((p, i) => !i || p[0] !== pts[i - 1][0] || p[1] !== pts[i - 1][1]);
      pts = pts.filter((p, i) => i === 0 || i === pts.length - 1 ||
        !((pts[i - 1][0] === p[0] && p[0] === pts[i + 1][0]) || (pts[i - 1][1] === p[1] && p[1] === pts[i + 1][1]))); // merge straight runs
      const color = e.fail ? "#E52521" : "#000";
      const [px, py] = pts[pts.length - 2], [ex, ey] = b, dx = Math.sign(ex - px), dy = Math.sign(ey - py);
      const tip = [ex - dx * 2, ey - dy * 2];
      out += `<polyline points="${[...pts.slice(0, -1), [ex - dx * 9, ey - dy * 9]].map((p) => p.join(",")).join(" ")}" fill="none" stroke="${color}" stroke-width="3" ${e.dashed ? 'stroke-dasharray="6 5"' : ""}/>`;
      out += `<polygon points="${tip.join(",")} ${tip[0] - dx * 10 - dy * 6},${tip[1] - dy * 10 - dx * 6} ${tip[0] - dx * 10 + dy * 6},${tip[1] - dy * 10 + dx * 6}" fill="${color}"/>`;
      if (e.label) {
        let best = 0, bi = 0;
        for (let i = 1; i < pts.length; i++) { const L = Math.abs(pts[i][0] - pts[i - 1][0]) + Math.abs(pts[i][1] - pts[i - 1][1]); if (L > best) { best = L; bi = i; } }
        const mx = (pts[bi][0] + pts[bi - 1][0]) / 2, my = (pts[bi][1] + pts[bi - 1][1]) / 2, w = e.label.length * 7 + 10;
        if (best >= w + 24) out += `<rect x="${mx - w / 2}" y="${my - 8}" width="${w}" height="16" fill="#FFF8E7"/><text x="${mx}" y="${my + 4}" text-anchor="middle" font-family="${F}" font-size="7" fill="${color}">${esc(e.label.toUpperCase())}</text>`;
      }
    }
    for (const d of Object.values(N)) {
      const k = KINDS[d.kind];
      out += `<rect x="${d.x + 4}" y="${d.y + 4}" width="${d.w}" height="${d.h}" fill="#000"/>`;
      out += `<rect x="${d.x}" y="${d.y}" width="${d.w}" height="${d.h}" fill="${k.fill}" stroke="#000" stroke-width="3"/>`;
      if (d.kind === "store") out += `<line x1="${d.x}" y1="${d.y + 6}" x2="${d.x + d.w}" y2="${d.y + 6}" stroke="#000" stroke-width="2"/>`;
      d.lines.forEach((l, i) => { out += `<text x="${d.x + d.w / 2}" y="${d.y + 22 + i * 14}" text-anchor="middle" font-family="${F}" font-size="9" fill="${k.ink}">${esc(l)}</text>`; });
      d.notes.forEach((l, i) => { out += `<text x="${d.x + d.w / 2}" y="${d.y + 22 + d.lines.length * 14 + 4 + i * 15}" text-anchor="middle" font-family="${B}" font-size="12" fill="${k.ink}" opacity=".85">${esc(l)}</text>`; });
    }
    return `<svg viewBox="0 0 ${W} ${spec.h}" width="100%" role="img" aria-label="System map" shape-rendering="crispEdges">${out}</svg>`;
  }
  function openMap(key, title, why) {
    $("#map-title").textContent = title;
    $("#map-why").textContent = why;
    $("#map-svg").innerHTML = drawMap(MAPS[key]);
    const used = [...new Set(MAPS[key].nodes.map((d) => d.kind))];
    $("#map-legend").innerHTML = used.map((k) => `<li class="flex items-center gap-2"><span class="inline-block h-3 w-3 border-2 border-ink" style="background:${KINDS[k].fill}"></span>${KINDS[k].name}</li>`).join("")
      + `<li class="flex items-center gap-2"><span class="inline-block w-5 border-t-[3px] border-dashed border-ink"></span>Feedback / async</li>`;
    $("#map").showModal(); sfx.pipe();
  }
  const mapBtn = (key) => `<button type="button" class="px-btn mt-3 bg-sky px-3 py-2 text-px-xs text-white" data-map="${key}">
      <img src="${SPR("qblock")}" alt="" class="h-4 w-4" />View system map</button>`;

  /* ================= sound (off by default) ================= */
  let soundOn = store.get("sdb-sound", false), actx;
  const soundBtn = $("#sound");
  const paintSound = () => {
    $("[data-label]", soundBtn).textContent = soundOn ? "SOUND ON" : "SOUND OFF";
    $("[data-icon]", soundBtn).src = SPR(soundOn ? "icon-sound-on" : "icon-sound-off");
    soundBtn.setAttribute("aria-pressed", soundOn);
  };
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
    $("[data-label]", nightBtn).textContent = night ? "DAY" : "NIGHT";
    $("[data-icon]", nightBtn).src = SPR(night ? "icon-sun" : "icon-moon");
    nightBtn.setAttribute("aria-pressed", night);
  };
  paintNight();
  nightBtn.addEventListener("click", () => {
    night = !night; store.set("sdb-night", night); paintNight(); sfx.pipe();
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
    const swap = base.startsWith("hero");
    if (swap) img.src = SPR(`${base}-jump`);
    el.animate([{ translate: "0 0" }, { translate: "0 -60%" }, { translate: "0 0" }], { duration: 420, easing: "steps(7)" })
      .finished.then(() => { if (swap) img.src = SPR(`${base}-idle`); });
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

  /* ================= top button ================= */
  const toTop = $("#to-top");
  addEventListener("scroll", () => toTop.classList.toggle("is-shown", scrollY > innerHeight), { passive: true });
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
            ${l.map ? mapBtn(l.map) : ""}
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
    if (e.target.closest("a, details, button") || getSelection().toString()) return;
    bumpEl(card); popCoin(card.firstElementChild); sfx.coin(); addCoin(); addScore(200);
    const r = card.getBoundingClientRect(); popScore("200", r.left + r.width / 2 - 12, r.top - 24);
  }));

  const sideLink = (href, label, cls) => href ? `<a class="px-btn ${cls} px-3 py-2 text-px-xs" href="${href}" target="_blank" rel="noopener">${label}</a>` : "";
  $("#side-quests").innerHTML = SIDE_QUESTS.map((q) => `
    <article class="px-card flex flex-col p-6">
      <div class="flex items-center gap-3">
        <img src="${SPR(q.sprite)}" alt="" class="sprite h-8 ${q.sprite === "coin" ? "w-5" : "w-8"}" />
        <h4 class="font-pixel text-px-xs leading-5 sm:text-px-sm sm:leading-6">${q.title}</h4>
      </div>
      <p class="mt-4 flex-1 text-ink/80">${esc(q.body)}</p>
      ${q.map ? `<div>${mapBtn(q.map)}</div>` : ""}
      <ul class="mt-5 flex flex-wrap gap-2">${q.tags.map((t) => `<li class="px-tag bg-luigi text-white">${esc(t)}</li>`).join("")}</ul>
      ${q.live || q.code ? `<div class="mt-5 flex flex-wrap gap-3">${sideLink(q.live, "Play live", "bg-coin")}${sideLink(q.code, "Code", "bg-white")}</div>` : `<p class="mt-5 font-pixel text-px-xs text-ink/50">PRIVATE SAVE FILE</p>`}
    </article>`).join("");

  document.addEventListener("click", (e) => {
    const b = e.target.closest("[data-map]"); if (!b) return;
    const lv = LEVELS.find((l) => l.map === b.dataset.map), sq = SIDE_QUESTS.find((q) => q.map === b.dataset.map);
    openMap(b.dataset.map, (lv || sq).title, lv ? lv.why : sq.body);
  });
  $("#map").addEventListener("click", (e) => { if (e.target.id === "map") e.target.close(); });

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
  let goalDone = false, everPlayed = false;
  function courseClear() {
    goalDone = true;
    goal.classList.remove("is-clear"); void goal.offsetWidth; goal.classList.add("is-clear");
    sfx.flag(); addScore(5000);
    const d = reducedMotion ? 0 : 1400;
    setTimeout(() => { toast("COURSE CLEAR! +5000"); fireworks(5); }, d);
    setTimeout(() => toast("THANK YOU! BUT YOUR NEXT ENGINEER IS IN THIS CASTLE.", 3600), d + 2600);
  }
  once(goal, () => { if (!everPlayed && !goalDone) courseClear(); }, 0.9); // scroll-only visitors still get the ending
  $("#flagpole").addEventListener("click", (e) => { e.stopPropagation(); courseClear(); });

  /* =================================================================
     THE GAME: a fixed level strip along the bottom. Scrolling the page
     makes the hero run; each section's objects arrive on the floor as
     that section comes on screen, and react when the hero reaches them.
     ================================================================= */
  const TOUCH = matchMedia("(pointer: coarse)").matches;
  const runway = $("#runway"), objLayer = $("#rw-objs"), hero = $("#hero"), dino = $("#dino-follower");
  const worldLabel = $("#rw-world"), tipLabel = $("#rw-tip");
  const SECTIONS = {
    start: { name: "WORLD 1-1 · OVERWORLD", theme: "sky", tip: TOUCH ? "SCROLL TO RUN · TAP HERE TO JUMP" : "SCROLL OR → TO RUN · ↑ TO JUMP" },
    about: { name: "WORLD 1-2 · NIGHT", theme: "night", tip: "YOUR DINO SIDEKICK JOINS IN THIS WORLD" },
    skills: { name: "WORLD 1-3 · UNDERGROUND", theme: "underground", tip: "? BLOCKS REVEAL EACH SKILL GROUP" },
    projects: { name: "WORLD 1-4 · CASTLE", theme: "castle", tip: TOUCH ? "TAP A PIPE TO OPEN THAT PROJECT'S MAP" : "↓ AT A PIPE OPENS THAT PROJECT'S MAP" },
    experience: { name: "WORLD 1-5 · THE CLIMB", theme: "sky", tip: "EVERY FLAG IS A LEVEL CLEARED" },
    contact: { name: "WORLD 8-4 · MUSHROOM HOUSE", theme: "night", tip: "THE END · SAY HI BELOW" },
  };
  const H = { y: 0, vy: 0, face: 1, walkT: 0, bounces: 0 };
  let S = 32, heroX = 120, objs = [], pairs = [], shownO = null, lastScroll = scrollY, speed = 0, fixed = 0, trail = [];
  let G = { dino: false };

  const docTop = (el) => el.getBoundingClientRect().top + scrollY;
  const sprite = (name, cls = "") => { const el = Object.assign(document.createElement("img"), { src: SPR(name), alt: "" }); el.className = `rw-obj ${cls}`; return el; };
  const flash = (el) => { if (!el) return; el.classList.remove("rw-flash"); void el.offsetWidth; el.classList.add("rw-flash"); };

  /* ---------- building the level from the page ---------- */
  function build() {
    const keep = new Map(objs.map((o) => [o.key, o.done]));
    objLayer.innerHTML = ""; objs = [];
    S = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--s")) || 32;
    heroX = Math.round(Math.min(innerWidth * 0.28, 260));
    const add = (type, anchor, key, extra = {}) => anchor && objs.push({ type, anchor, key: `${type}:${key}`, ...extra });

    add("p2", $("#start h1"), 0);
    $$("#start .px-btn").forEach((b, i) => add("coin", b, `start${i}`));
    add("dino", $("#about article"), 0);
    $$("#about ul.px-panel > li").forEach((li, i) => add("coin", li, `stat${i}`));
    $$("#skill-groups > article").forEach((a, i) => add("qblock", a, i));
    $$("#levels .level-card").forEach((c, i) => { add("bug", c, i); add("pipe", c, i); });
    add("boss", $("#side-quests"), 0);
    $$("#side-quests > article").forEach((a, i) => add("coin", a, `side${i}`));
    $$("#timeline .checkpoint").forEach((li, i) => add("flag", li, i));
    add("goal", $("#goal"), 0);
    add("castle", $("#goal"), 0);
    add("host", $("#contact-form"), 0);

    // when should each object reach the hero? when its content sits ~45% down the screen
    const anchorPx = innerHeight * 0.45, maxScroll = document.documentElement.scrollHeight - innerHeight;
    objs.forEach((o, i) => { o.sy = Math.max(0, Math.min(maxScroll - 40, docTop(o.anchor) - anchorPx)); o.i = i; });
    const host = objs.find((o) => o.type === "host"); if (host) host.sy = maxScroll; // the finale: reached at the very bottom
    objs.sort((a, b) => a.sy - b.sy || a.i - b.i);
    // world positions: keep a minimum gap so objects never pile up
    const GAP = { coin: 1.2, qblock: 3, bug: 2.2, pipe: 3.2, boss: 4, flag: 3, goal: 3, castle: 4, host: 3, dino: 3, p2: 2 };
    let wx = 0, sy = -1;
    objs.forEach((o, i) => {
      if (o.sy <= sy) o.sy = sy + 24; // same row on the page: spread them out a little in scroll
      wx = i ? Math.max(wx + GAP[o.type] * S, wx + (o.sy - sy) * 0.6) : o.sy * 0.6 + 4 * S;
      o.wx = wx; sy = o.sy;
      o.done = keep.get(o.key) || false;
    });
    pairs = [[0, objs[0].wx - objs[0].sy * 0.6], ...objs.map((o) => [o.sy, o.wx])];
    pairs.push([sy + 100000, wx + 100000 * 0.6]);
    objs.forEach(makeNode);
    shownO = null;
  }
  // scroll position -> world offset (piecewise linear through every object's anchor)
  function worldAt(y) {
    for (let i = 1; i < pairs.length; i++) {
      const [y0, w0] = pairs[i - 1], [y1, w1] = pairs[i];
      if (y <= y1) return w0 + (w1 - w0) * ((y - y0) / Math.max(1, y1 - y0));
    }
    return pairs[pairs.length - 1][1];
  }

  function makeNode(o) {
    let el, w = S, h = S, lift = 0;
    switch (o.type) {
      case "coin": el = sprite("coin"); w = S * 0.45; h = S * 0.8; lift = S * 0.15; break;
      case "qblock": el = sprite(o.done ? "qblock-used" : "qblock"); lift = S * 1.8; break;
      case "bug": el = sprite(o.done ? "bug-flat" : "bug-1"); h = S * 0.875; break;
      case "boss": el = sprite(o.done ? "boss-flat" : "boss-1"); w = S * 1.7; h = S * 1.5; break;
      case "pipe": el = document.createElement("div"); el.className = "rw-obj pipe cursor-pointer"; el.style.setProperty("--tile", `${S}px`); w = S * 1.75; h = S * 1.3;
        el.title = "Open this project's system map"; el.addEventListener("click", () => enterPipe(o)); break;
      case "flag": el = document.createElement("div"); el.className = "rw-obj"; w = S * 0.6; h = S * 1.8;
        el.innerHTML = `<i class="absolute bottom-0 left-0 h-full w-[3px] bg-ink"></i><span class="rw-pennant" style="bottom:${o.done ? S * 1.25 : S * 0.1}px"></span>`; break;
      case "goal": el = document.createElement("div"); el.className = "rw-obj"; w = S * 0.6; h = S * 2.8;
        el.innerHTML = `<i class="absolute bottom-0 left-[6px] h-full w-[4px] bg-luigi-dark"></i><i class="absolute -top-1 left-[3px] h-2.5 w-2.5 rounded-full border-2 border-ink bg-luigi"></i><span class="rw-pennant" style="left:-12px;bottom:${o.done ? 2 : S * 2.2}px;border-left:0;border-right:16px solid #fff"></span>`; break;
      case "castle": el = sprite("castle"); w = h = S * 2.8; break;
      case "host": el = sprite("host"); break;
      case "dino": el = sprite("dino", o.done ? "hidden" : ""); break;
      case "p2": el = sprite("hero2-idle"); break;
    }
    Object.assign(o, { el, w, h, lift });
    el.style.width = `${w}px`; el.style.height = `${h}px`; el.style.bottom = `${S + lift}px`;
    if (o.type === "qblock" || o.type === "pipe") el.style.zIndex = "1";
    objLayer.append(el);
  }

  /* ---------- reactions ---------- */
  function jump(v = 9) { if (H.y <= 0.01) { H.vy = v * S; sfx.jump(); } }
  function heroScreen() { const r = hero.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top }; }
  function trigger(o, quiet) {
    o.done = true;
    const at = heroScreen();
    switch (o.type) {
      case "coin":
        o.el.classList.add("invisible"); if (!quiet) { sfx.coin(); popScore("200", at.x, at.y - 30); } addCoin(); addScore(200);
        flash(o.anchor.closest("li, article, .px-btn") || o.anchor); break;
      case "qblock": {
        if (!quiet) jump(8.5);
        setTimeout(() => {
          o.el.classList.remove("is-hit"); void o.el.offsetWidth; o.el.classList.add("is-hit"); o.el.src = SPR("qblock-used");
          $$("[data-skill]", o.anchor).forEach((li) => revealSkill(li, true));
          if (!quiet) { sfx.coin(); const r = o.el.getBoundingClientRect(); popScore($("h3", o.anchor)?.textContent || "SKILLS", r.left - 20, r.top - 18); }
          flash(o.anchor);
        }, quiet ? 0 : 160);
        break;
      }
      case "bug":
        if (!quiet) jump(8); o.el.src = SPR("bug-flat"); addScore(100); fixed++; $("#bugs-fixed").textContent = pad(fixed, 2);
        if (!quiet) { sfx.stomp(); popScore("BUG FIXED", at.x - 30, at.y - 30); } break;
      case "pipe": if (!quiet) jump(9); break; // hop over it; press down at it to enter
      case "boss":
        if (quiet) { o.el.src = SPR("boss-flat"); break; }
        H.bounces = 3; o.hp = 3; jump(10); toast("BOSS: PROD INCIDENT! STOMPING IT...", 2200); break;
      case "flag":
        $(".rw-pennant", o.el).style.bottom = `${S * 1.25}px`; o.el.classList.add("is-done");
        if (!quiet) { sfx.coin(); addScore(500); popScore("LEVEL CLEAR", at.x - 30, at.y - 30); }
        flash($("article", o.anchor)); break;
      case "goal":
        $(".rw-pennant", o.el).style.bottom = "2px"; if (!goalDone) courseClear(); break;
      case "dino":
        o.el.classList.add("hidden"); G.dino = true; dino.classList.remove("hidden");
        $("[data-npc=dino]")?.classList.add("invisible");
        if (!quiet) { sfx.oneup(); toast("DINO JOINED YOUR PARTY!"); } break;
      case "host": if (!quiet) { sfx.coin(); toast("HOST: THANKS FOR PLAYING! LEAVE A MESSAGE AND DIVESH WILL WRITE BACK.", 3800); } break;
      default: break;
    }
  }
  // stomp the boss three times: each landing while bouncing is a hit
  function bossLand() {
    const b = objs.find((o) => o.type === "boss"); if (!b) return;
    b.hp--; sfx.stomp(); addScore(1000);
    b.el.classList.remove("is-hit"); void b.el.offsetWidth; b.el.classList.add("is-hit");
    const r = b.el.getBoundingClientRect(); popScore(b.hp ? "HIT!" : "INCIDENT RESOLVED", r.left, r.top - 20);
    if (b.hp > 0) { H.vy = 10 * S; } else { b.el.src = SPR("boss-flat"); fireworks(4); sfx.flag(); toast("BOSS DEFEATED! +5000"); addScore(5000); }
  }
  function nearPipe() {
    return objs.find((o) => o.type === "pipe" && Math.abs(heroX + S / 2 - (o.sx + o.w / 2)) < S * 1.4);
  }
  function enterPipe(o) {
    const card = o.anchor, btn = $("[data-map]", card);
    sfx.pipe(); flash(card);
    if (btn) btn.click(); else card.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  /* ---------- input: scroll is the main control ---------- */
  const held = { left: false, right: false };
  addEventListener("keydown", (e) => {
    if (e.target.closest?.("input, textarea, dialog, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.code === "ArrowRight" || e.code === "KeyD") { held.right = true; e.preventDefault(); }
    else if (e.code === "ArrowLeft" || e.code === "KeyA") { held.left = true; e.preventDefault(); }
    else if (e.code === "ArrowUp" || e.code === "KeyW") { jump(); e.preventDefault(); }
    else if ((e.code === "ArrowDown" || e.code === "KeyS") && nearPipe()) { enterPipe(nearPipe()); e.preventDefault(); }
  });
  addEventListener("keyup", (e) => {
    if (e.code === "ArrowRight" || e.code === "KeyD") held.right = false;
    if (e.code === "ArrowLeft" || e.code === "KeyA") held.left = false;
  });
  addEventListener("blur", () => { held.left = held.right = false; });
  runway.addEventListener("pointerdown", (e) => { if (!e.target.closest("button, .pipe")) jump(); });

  const setHidden = (off) => { document.body.classList.toggle("rw-off", off); $("#rw-show").classList.toggle("hidden", !off); store.set("sdb-rw-off", off); };
  $("#rw-hide").addEventListener("click", () => setHidden(true));
  $("#rw-show").addEventListener("click", () => setHidden(false));
  setHidden(store.get("sdb-rw-off", false));

  /* ---------- loop ---------- */
  let lastSec = null;
  function frame(now) {
    const dt = Math.min(0.033, (now - (frame.last || now)) / 1000); frame.last = now;
    if (held.right || held.left) scrollBy({ top: (held.right ? 1 : -1) * 520 * dt, behavior: "instant" });
    const target = worldAt(scrollY);
    if (shownO === null) shownO = target;
    const prev = shownO;
    const jumpBig = Math.abs(target - shownO) > innerWidth * 1.5; // nav click: skip the in-between quietly
    shownO = jumpBig ? target : shownO + (target - shownO) * Math.min(1, dt * 10);
    speed = speed * 0.8 + ((shownO - prev) / Math.max(dt, 0.001)) * 0.2;
    if (Math.abs(shownO - prev) > 0.2) H.face = shownO > prev ? 1 : -1;

    // objects that reached the hero this frame
    // an object reaches the hero when the world offset passes its position
    for (const o of objs) if (!o.done && prev < o.wx && shownO >= o.wx) trigger(o, jumpBig);
    // hero vertical physics
    if (H.y > 0 || H.vy > 0) {
      H.vy -= 34 * S * dt; H.y += H.vy * dt;
      if (H.y <= 0) { H.y = 0; H.vy = 0; if (H.bounces > 0) { H.bounces--; bossLand(); } }
    }
    // draw
    const W = runway.clientWidth;
    for (const o of objs) {
      o.sx = heroX + (o.wx - shownO) - o.w / 2 + S / 2 + (o.type === "host" ? S * 2.2 : 0);
      const vis = o.sx > -o.w - 20 && o.sx < W + 20;
      o.el.style.display = vis ? "" : "none";
      if (!vis) continue;
      o.el.style.transform = `translateX(${Math.round(o.sx)}px)`;
      if (o.type === "bug" && !o.done) { const f = SPR(Math.floor(now / 220) % 2 ? "bug-1" : "bug-2"); if (!o.el.src.endsWith(f)) o.el.src = f; }
      if (o.type === "boss" && !o.el.src.endsWith("boss-flat.svg")) { const f = SPR(Math.floor(now / 260) % 2 ? "boss-1" : "boss-2"); if (!o.el.src.endsWith(f)) o.el.src = f; }
    }
    $(".rw-ground", runway).style.backgroundPositionX = `${-Math.round(shownO)}px`;

    let f = "hero-idle";
    if (H.y > 0.01) f = "hero-jump";
    else if (Math.abs(speed) > 20) { H.walkT += dt * Math.min(12, Math.abs(speed) / 40); f = Math.floor(H.walkT) % 2 ? "hero-walk1" : "hero-walk2"; }
    if (!hero.src.endsWith(SPR(f))) hero.src = SPR(f);
    hero.style.transform = `translate(${heroX}px, ${Math.round(runway.clientHeight - S - S - H.y)}px) scaleX(${H.face})`;
    trail.push({ y: H.y, face: H.face }); if (trail.length > 10) trail.shift();
    if (G.dino) {
      const t = trail[0];
      dino.style.transform = `translate(${heroX - H.face * S * 1.15}px, ${Math.round(runway.clientHeight - S - S - t.y)}px) scaleX(${t.face})`;
    }

    // which world are we in?
    const mid = scrollY + innerHeight * 0.45;
    const sec = $$("main > section").find((el) => mid >= el.offsetTop && mid < el.offsetTop + el.offsetHeight) || $("#contact");
    if (sec.id !== lastSec && SECTIONS[sec.id]) {
      lastSec = sec.id; const info = SECTIONS[sec.id];
      runway.dataset.theme = info.theme; worldLabel.textContent = info.name; tipLabel.textContent = info.tip;
    }
    const pipe = nearPipe();
    tipLabel.classList.toggle("!block", !!pipe); worldLabel.classList.toggle("max-sm:hidden", !!pipe); // phones: show the pipe hint in place of the world name
    if (pipe) tipLabel.textContent = TOUCH ? `TAP THE PIPE: ${$("h3", pipe.anchor)?.textContent || "PROJECT"}` : `↓ ENTER: ${$("h3", pipe.anchor)?.textContent || "PROJECT"}`;
    else if (lastSec && tipLabel.textContent.match(/^(↓ ENTER|TAP THE PIPE)/)) tipLabel.textContent = SECTIONS[lastSec].tip;
    requestAnimationFrame(frame);
  }
  ["hero-walk1", "hero-walk2", "hero-jump", "qblock-used", "bug-2", "bug-flat", "boss-2", "boss-flat", "dino", "castle", "host", "hero2-idle"]
    .forEach((n) => { new Image().src = SPR(n); });
  let rebuildT;
  const rebuild = () => { clearTimeout(rebuildT); rebuildT = setTimeout(build, 150); };
  new ResizeObserver(rebuild).observe(document.body);
  (document.fonts?.ready ?? Promise.resolve()).then(() => { build(); requestAnimationFrame(frame); });

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
