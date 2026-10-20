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
    { item: "SUPER MUSHROOM", sprite: "mushroom", kind: "Backend", skills: ["Go", "TypeScript", "JavaScript", "Python", "Java", "C++", "SQL", "NestJS", "Node.js", "Express", "FastAPI", "gRPC", "Protobuf", "REST / OpenAPI", "System design"] },
    { item: "1-UP MUSHROOM", sprite: "oneup", kind: "Data", skills: ["Elasticsearch", "MongoDB", "Apache Spark", "Kafka", "AWS Athena", "Redis", "Redis Lua", "ILM tiers"] },
    { item: "STARMAN", sprite: "star", kind: "Platform", skills: ["Docker", "Kubernetes", "GoCD", "AWS", "GCP", "Azure", "Snyk", "Trivy", "Git"] },
    { item: "COIN", sprite: "coin", kind: "Frontend & testing", skills: ["React", "Redux", "Highcharts", "Highstock", "Webpack", "Vite", "Storybook", "Playwright"] },
    { item: "FIRE FLOWER", sprite: "fireflower", kind: "GenAI & RAG", skills: ["LangChain", "LangGraph", "LlamaIndex", "Advanced RAG", "Self-RAG", "Hybrid search", "Rerankers", "Agents", "Tool calling", "Guardrails", "LLM evals", "Prompt registry", "LLM APIs", "vLLM", "Ollama"] },
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
      why: "Content teams need to see where entries get stuck in a workflow, and who they are stuck with. The legacy core product allows only single-level joins, has no reliable timestamps, and entry counts multiply across branch × content type × locale.",
      flow: ["LEGACY MONGO", "INDEXED DAILY SCAN", "COUNTS", "DASHBOARDS", "EVALUATOR"],
      built: "A low-cost daily scan that runs on Mongo indexes instead of deep joins. It powers three surfaces: Content Life Cycle (created → ready to publish → published), Workflow Health (where content is stuck and with whom) and Team Adoption (active vs inactive users, work velocity and project metrics). To prove the numbers, I built an Evaluator: it seeds realistic data, reads the dashboards through Playwright (DOM and screenshots) and compares every count with what the product rules say it should be. The analytics are validated against 67 operation-sequence cases, including orphaned-record edge cases.",
      tags: ["MongoDB", "Elasticsearch", "Playwright"] },
    { quest: "main", map: "discovery", title: "PLATFORM DISCOVERY", stat: "17 CAPABILITIES · 3 PRODUCTION APPS",
      why: "Customers couldn't easily see what they had bought and use, bought but haven't touched lately, or haven't bought yet. The answer was scattered across many systems.",
      flow: ["ES + MONGO + AUDIT + METERING", "9 USAGE PROCESSORS", "17 CAPABILITIES", "REACT PACKAGE", "3 APPS"],
      built: "I owned it end to end across 8 repositories: a template-driven service that resolves 17 capabilities through 9 usage processors over Elasticsearch, MongoDB, audit logs and metering. Multi-cluster resolution fixed under-reporting for sharded organizations. I extracted the UI into @contentstack/platform-discovery, a versioned React package shipped in 9 releases and used by 3 production applications.",
      tags: ["NestJS", "React", "Elasticsearch", "MongoDB"] },
  ];

  const SIDE_QUESTS = [
    { title: "LOCALAI FORGE", sprite: "fireflower", map: "localai",
      body: "A private, fully local RAG and agent platform on Ollama, built as a glass box: hybrid retrieval with reranking, a semantic cache, per-sentence grounding checks, guarded LangGraph agents, eval-gated prompt rollback, tracing and PII redaction. Retrieval hit@1 0.977; 95.7% pass on a 47-question golden set; LLM judge calibrated to κ 0.80.",
      tags: ["Python", "FastAPI", "LangGraph", "Ollama", "Chroma"], code: "https://github.com/Divesh-Kumar-Chordia/localai-forge" },
    { title: "JEVSTREAM", sprite: "star", map: "jevstream",
      body: "Priority-based ticket routing. A FastAPI service judges each ticket's urgency and stores it in a Redis sorted set; workers claim the most urgent first through atomic Lua scripts with expiring leases, so a crashed worker's ticket goes back in the queue.",
      tags: ["Python", "FastAPI", "Redis", "Lua"], code: "https://github.com/Divesh-Kumar-Chordia/jevstream" },
    { title: "ANALYTICS AUTOMATION LAB", sprite: "oneup", map: "automation-lab",
      body: "A testing lab for Contentstack analytics: a Delivery API site, 29 automation scripts covering the content lifecycle, multi-user simulation, every analytics meter dimension, and Launch URL warming.",
      tags: ["React", "Vite", "Node.js"], live: "https://top-url-website-making.vercel.app", code: "https://github.com/DiveshKumarChordia/contentstack-analytics-automation-lab" },
    { title: "LUMEN VISUAL EXPERIENCE", sprite: "fireflower",
      body: "A Contentstack Visual Builder site where a script creates the stack, environment, tokens, content types and entries in ten idempotent steps. Live Preview covers drafts, Releases and Timeline.",
      tags: ["TypeScript", "Live Preview", "GraphQL"], live: "https://lumen-rbac-demo.vercel.app", code: "https://github.com/DiveshKumarChordia/lumen-visual-experience" },
    { title: "GITPULSE", sprite: "coin", map: "gitpulse",
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
        "Run release cycles and ceremonies for the analytics line, triage customer issues, and have anchored the team's daily standup for over a year.",
        "Wrote scripts that simulate real customer usage patterns to auto-generate test cases, cutting manual test-environment setup.",
        "Principal author of cs-highcharts, the shared charting library behind the analytics dashboards: new chart types and features, plus a log10-based tick-interval algorithm that ended duplicate axis labels under auto-scaling.",
        "Build reusable UI widgets and components for the core analytics dashboards, and drive front-end redesigns that make the data easier to read.",
        "Delivered 3 CMS analytics dashboards end to end: metering instrumentation, Spark rollups, Elasticsearch snapshots, serving processors, React widgets and plan gating.",
        "Built a paginated Athena export for 10,000+ records, with a precheck that surfaces row-limit failures before a job runs.",
        "Led a security sweep across 10 services: Node.js 24, Go 1.24, Alpine 3.23 multi-stage non-root images, zlib/OpenSSL CVE fixes, and Snyk + Trivy scans that catch vulnerabilities before merge.",
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
    localai: { h: 420, nodes: [
      n("q", 10, 30, "QUESTION", "", "user", 120),
      n("pii", 160, 30, "PII REDACT", "reversible", "svc", 130),
      n("cache", 320, 30, "SEMANTIC CACHE", "grounded only", "store", 150),
      n("retr", 500, 30, "HYBRID SEARCH", "dense + BM25 · RRF", "svc", 160),
      n("rerank", 600, 190, "RERANK", "cross-encoder", "svc", 150),
      n("route", 410, 190, "ROUTE", "3B or 8B model", "lib", 150),
      n("gen", 210, 190, "GENERATE", "Llama · Ollama · SSE", "queue", 160),
      n("ground", 10, 190, "GROUNDING", "per-sentence check", "lib", 160),
      n("ans", 10, 330, "ANSWER", "with citations", "user", 160),
      n("evals", 410, 330, "TRACES + EVALS", "47 golden Qs · 95.7%", "store", 170),
    ], edges: [
      { from: "q", to: "pii" }, { from: "pii", to: "cache" }, { from: "cache", to: "retr", label: "miss" },
      { from: "retr", fs: "b", to: "rerank", ts: "t" }, { from: "rerank", fs: "l", to: "route", ts: "r" },
      { from: "route", fs: "l", to: "gen", ts: "r" }, { from: "gen", fs: "l", to: "ground", ts: "r" },
      { from: "ground", fs: "b", to: "ans", ts: "t" }, { from: "gen", fs: "b", to: "evals", ts: "l", label: "trace", dashed: true },
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
  const DIAGRAMS = {
    "automation-lab": { src: "assets/diagrams/automation-lab.png", alt: "Architecture of the Analytics Automation Lab: lifecycle automation scripts call the Contentstack CMA, meter events flow through Kafka, Mongo and Elasticsearch into analytics dashboards, and a run dashboard renders meter coverage" },
    gitpulse: { src: "assets/diagrams/gitpulse.png", alt: "Architecture of GitPulse: OAuth login, an activity dashboard, code exploration and team analytics views, all fed by GitHub API fetchers" },
  };
  function openMap(key, title, why) {
    $("#map-title").textContent = title;
    $("#map-why").textContent = why;
    const pic = DIAGRAMS[key];
    if (pic) {
      $("#map-svg").innerHTML = `<img src="${pic.src}" alt="${esc(pic.alt)}" class="h-auto w-full" style="image-rendering:auto" />`;
      $("#map-legend").innerHTML = `<li>Architecture diagram generated from the repository with GitDiagram.</li>`;
      $("#map").showModal(); sfx.pipe(); return;
    }
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
     THE GAME: every section is a stage. One hero travels between them
     through pipes, and follows you when you scroll.
     ================================================================= */
  const TOUCH = matchMedia("(pointer: coarse)").matches;
  const kbd = (k) => `<kbd>${k}</kbd>`;
  const hero = $("#hero"), ghost = $("#ghost");
  const coach = $("#coach"), pointer = $("#pointer");
  const follower = Object.assign(document.createElement("img"), { src: SPR("dino"), alt: "" });
  follower.className = "sprite absolute left-0 top-0 z-[19] hidden h-[var(--tile)] w-[var(--tile)]";
  const padEl = $("#pad");

  const ENEMY = {
    bug: { frames: ["bug-1", "bug-2"], flat: "bug-flat", aspect: 14 / 16, speed: 1.6, points: 100, label: "BUG FIXED" },
    turtle: { frames: ["turtle-1", "turtle-2"], flat: "shell", aspect: 11 / 16, speed: 1.0, points: 200, label: "REFACTORED" },
  };
  const pipeHint = (n) => TOUCH ? `TAP THE PIPE TO GO TO WORLD ${n}` : `STAND ON THE PIPE + ${kbd("↓")}<br>TO WARP TO WORLD ${n}`;

  // per-stage scripts: each step shows until its condition is met
  const SCRIPTS = {
    "1-1": (st) => [
      { text: TOUCH ? "TAP ME TO PLAY!" : "CLICK ME TO PLAY!", until: () => G.started },
      { text: TOUCH ? "TAP WHERE TO RUN.<br>TAP HIGH TO JUMP." : `${kbd("←")}${kbd("→")} RUN · ${kbd("SPACE")} JUMP<br>OR JUST CLICK WHERE TO GO`, until: () => V.moved, after: 6 },
      { text: "JUMP INTO A ? BLOCK<br>FROM BELOW", target: () => st.blocks.find((b) => b.kind !== "brick" && b.hits > 0)?.el, until: () => V.blockCoins > 0 },
      { text: "BUGS! STOMP ONE<br>FROM ABOVE", target: () => V.enemies.find((en) => !en.flat)?.el, until: () => V.stomps > 0 },
      { text: pipeHint(st.nextName), target: () => st.out },
    ],
    "1-2": (st) => [
      { text: "WORLD 1-2 · NIGHT<br>A DINO IS WAITING. WALK INTO IT!", target: () => $("[data-npc=dino]", st.el), until: () => G.dino },
      { text: `DINO JOINED! DOUBLE JUMP UNLOCKED.<br>${pipeHint(st.nextName)}`, target: () => st.out },
    ],
    "1-3": (st) => [
      { text: "WORLD 1-3 · UNDERGROUND<br>GRAB EVERY COIN!", target: () => st.coins.find((c) => !c.got)?.el, until: () => st.coins.every((c) => c.got) },
      { text: `ALL COINS! ${pipeHint(st.nextName)}`, target: () => st.out },
    ],
    "1-4": (st) => [
      { text: "WORLD 1-4 · BOSS FIGHT<br>A PROD INCIDENT! STOMP IT 3 TIMES", target: () => V.boss?.el, until: () => G.bossDown },
      { text: `INCIDENT RESOLVED!<br>${pipeHint(st.nextName)}`, target: () => st.out },
    ],
    "1-5": (st) => [
      { text: "WORLD 1-5 · THE GOAL<br>RUN TO THE FLAGPOLE!", target: () => $("#flagpole"), until: () => goalDone },
      { text: "ENTER THE CASTLE!", target: () => $("[data-door]", st.el) },
    ],
    "8-4": (st) => [
      { text: "WORLD 8-4 · MUSHROOM HOUSE<br>SAY HI TO THE HOST", target: () => $("[data-npc=host]", st.el), until: () => V.host },
      { text: "THE END. THANKS FOR PLAYING!<br>LEAVE A MESSAGE BELOW", ttl: 6 },
    ],
  };

  // global progress (G) and per-visit state (V)
  const G = { started: false, dino: false, bossDown: false };
  let V = {};
  const P = { x: 0, y: 0, vx: 0, vy: 0, w: 0.8, h: 1, ground: true, face: 1, hurt: 0, jumps: 0 };
  const keys = { left: false, right: false, jump: false, down: false };
  let T = 48, W = 0, H = 0, rects = [], lastJump = false, walkT = 0, warping = 0, emerging = 0;
  let target = null, tapJump = 0, fixed = 0, active = null, trail = [];

  const stages = $$("[data-stage]").map((el, i, all) => ({
    el, name: el.dataset.stage, index: i,
    kinds: (el.dataset.enemies || "").split(",").filter(Boolean),
    blocks: $$("[data-block]", el).map((b) => ({ el: b, kind: b.dataset.block, hits: b.dataset.block === "multi" ? 8 : 1 })),
    coins: $$("[data-coin]", el).map((c) => ({ el: c, got: false })),
    out: $("[data-pipe=out]", el), in: $("[data-pipe=in]", el),
    layer: Object.assign(document.createElement("div"), { className: "contents" }),
  }));
  stages.forEach((st, i) => { st.next = stages[i + 1]; st.nextName = st.next?.name; st.el.append(st.layer); });

  function measure() {
    if (!active) return;
    const fr = active.el.getBoundingClientRect();
    T = parseFloat(getComputedStyle(document.documentElement).getPropertyValue("--tile")) || 48;
    W = fr.width / T; H = fr.height / T;
    const box = (el) => { const r = el.getBoundingClientRect(); return { el, x: (r.left - fr.left) / T, y: (fr.bottom - r.bottom) / T, w: r.width / T, h: r.height / T }; };
    rects = $$("[data-solid], [data-block]", active.el).filter((el) => el.offsetParent).map(box);
    active.coins.forEach((c) => Object.assign(c, box(c.el), { el: c.el, got: c.got }));
    V.npcs = $$("[data-npc]", active.el).filter((el) => !el.classList.contains("hidden")).map(box);
    V.goal = $("[data-goal]", active.el) && box($("[data-goal]", active.el));
    V.door = $("[data-door]", active.el) && { ...box($("[data-door]", active.el)), h: 3 }; // tall trigger: jumping past still counts
    V.outBox = active.out && box(active.out);
    V.inBox = active.in && box(active.in);
  }

  function enterStage(st) {
    if (active === st) return;
    const wasFocused = active && document.activeElement === active.el;
    // tidy the stage we are leaving
    if (active) { V.enemies?.forEach((en) => en.el.remove()); V.boss?.el.remove(); }
    active = st;
    V = { enemies: [], nextEnemy: 1.5, moved: false, blockCoins: 0, stomps: 0, host: false, step: 0, stepT: 0, boss: null };
    [hero, follower, ghost, coach, pointer].forEach((el) => st.el.append(el));
    measure();
    if (V.inBox) { // pop out of the entry pipe
      P.x = V.inBox.x + (V.inBox.w - P.w) / 2; P.y = V.inBox.y + V.inBox.h - P.h; emerging = 0.55;
      hero.style.zIndex = "5"; sfx.pipe();
    } else {
      const c = rects.find((r) => r.el.dataset.block === "multi");
      P.x = c ? c.x + (c.w - P.w) / 2 : 1; P.y = c ? c.y + c.h : 0;
    }
    P.vx = P.vy = 0; P.ground = true; P.face = 1; target = null; warping = 0; trail = [];
    follower.classList.toggle("hidden", !G.dino);
    if (st.el.dataset.boss != null && !G.bossDown) spawnBoss();
    if (wasFocused) st.el.focus({ preventScroll: true });
    V.script = SCRIPTS[st.name]?.(st) || [];
    showStep();
    render(0); // draw in place right away, even before the next frame
  }

  /* ---------- coach ---------- */
  function showStep() {
    while (V.step < V.script.length && V.script[V.step].until?.()) V.step++;
    const sc = V.script[V.step];
    if (!sc) { coach.classList.remove("is-shown"); pointer.classList.add("hidden"); return; }
    coach.innerHTML = sc.text; coach.classList.add("is-shown"); V.stepT = 0;
  }
  function placeCoach(dt) {
    const sc = V.script[V.step];
    if (!sc) { coach.classList.remove("is-shown"); pointer.classList.add("hidden"); return; }
    V.stepT += dt;
    if (sc.until?.() || (sc.after && V.stepT > sc.after)) { V.step++; showStep(); return; }
    if (sc.ttl && V.stepT > sc.ttl) { V.step = V.script.length; showStep(); return; }
    const fw = active.el.clientWidth, cw = coach.offsetWidth, ch = coach.offsetHeight;
    const hx = (P.x + P.w / 2) * T, hy = (H - P.y - P.h) * T;
    const left = Math.max(4, Math.min(fw - cw - 4, hx - cw / 2));
    coach.style.transform = `translate(${Math.round(left)}px, ${Math.round(hy - ch - 14)}px)`;
    coach.style.setProperty("--tail", `${Math.round(hx - left)}px`);
    const tgt = sc.target?.();
    if (tgt && tgt.offsetParent) {
      const fr = active.el.getBoundingClientRect(), r = tgt.getBoundingClientRect();
      pointer.style.translate = `${Math.round(r.left - fr.left + r.width / 2 - 10)}px ${Math.round(r.top - fr.top - 22)}px`; // transform is taken by the bob animation
      pointer.classList.remove("hidden");
    } else pointer.classList.add("hidden");
  }

  /* ---------- blocks, coins, enemies, boss ---------- */
  function hitBlock(b) {
    bumpEl(b.el);
    if (b.kind === "brick" || b.hits <= 0) { sfx.bump(); return; }
    b.hits--; popCoin(b.el); sfx.coin(); addCoin(); addScore(200); V.blockCoins++;
    const r = b.el.getBoundingClientRect(); popScore("200", r.left + r.width / 4, r.top - 20);
    if (b.hits === 0) setTimeout(() => { $("img", b.el).src = SPR("qblock-used"); b.el.setAttribute("aria-label", "Empty block"); }, 120);
  }
  stages.forEach((st) => st.blocks.forEach((b) => b.el.addEventListener("click", (e) => { e.stopPropagation(); hitBlock(b); })));

  function addEnemy(kind) {
    const def = ENEMY[kind], el = document.createElement("img");
    el.src = SPR(def.frames[0]); el.alt = ""; el.dataset.enemy = kind;
    el.className = "absolute left-0 top-0 z-[5] cursor-pointer select-none";
    el.style.cssText += `image-rendering:pixelated;width:var(--tile);height:calc(var(--tile)*${def.aspect})`;
    el.title = kind === "bug" ? "A bug. Stomp it!" : "Legacy code. Refactor it!";
    const x = V.outBox ? V.outBox.x - 0.95 : W - 1;
    const en = { kind, def, el, x, y: 0, w: 0.8, h: def.aspect * 0.9, vx: -(def.speed + Math.random() * 0.5), flat: 0, t: 0 };
    el.addEventListener("pointerdown", (e) => { e.stopPropagation(); e.preventDefault(); begin(); squash(en); });
    active.layer.append(el); V.enemies.push(en);
  }
  function squash(en) {
    if (en.flat) return;
    en.flat = 0.7; en.el.src = SPR(en.def.flat); sfx.stomp(); addScore(en.def.points); V.stomps++;
    fixed++; $("#bugs-fixed").textContent = pad2(fixed);
    const r = en.el.getBoundingClientRect(); popScore(en.def.label, r.left - 8, r.top - 18);
    if (fixed === 10) { toast("10 FIXES. SHIP IT!"); fireworks(3); }
  }
  const pad2 = (v) => pad(v, 2);

  function spawnBoss() {
    const el = document.createElement("img");
    el.src = SPR("boss-1"); el.alt = ""; el.title = "Boss: PROD INCIDENT. Stomp it 3 times!";
    el.className = "absolute left-0 top-0 z-[6] select-none";
    el.style.cssText += "image-rendering:pixelated;width:calc(var(--tile)*2);height:calc(var(--tile)*1.75)";
    V.boss = { el, x: W * 0.6, y: 0, w: 1.6, h: 1.5, vx: -1.3, hp: 3, inv: 0, t: 0, down: 0 };
    active.layer.append(el); paintBossHp();
  }
  function paintBossHp() {
    const hp = $("[data-boss-hp]"); if (!hp) return;
    hp.innerHTML = [0, 1, 2].map((i) => `<i class="inline-block h-3 w-3 border-2 border-ink ${i < (V.boss?.hp ?? 0) ? "bg-mario" : "bg-white/20"}"></i>`).join("");
  }
  function stompBoss() {
    const b = V.boss; b.hp--; b.inv = 0.9; sfx.stomp(); addScore(1000); paintBossHp();
    const r = b.el.getBoundingClientRect(); popScore(b.hp ? "HIT!" : "INCIDENT RESOLVED", r.left, r.top - 20);
    if (!b.hp) {
      G.bossDown = true; b.down = 1; b.el.src = SPR("boss-flat"); fireworks(5); sfx.flag();
      toast("BOSS DEFEATED! +5000"); addScore(5000);
    }
  }

  function hurtHero(fromX, msg) {
    P.hurt = 1.2; P.vx = (P.x < fromX ? -1 : 1) * 5; P.vy = 7; P.ground = false;
    hero.classList.remove("is-hurt"); void hero.offsetWidth; hero.classList.add("is-hurt");
    sfx.hurt(); toast(msg);
  }

  /* ---------- warps ---------- */
  function warpTo(next) {
    if (warping || !next) return;
    warping = 0.7; hero.style.zIndex = "5"; sfx.pipe(); begin();
    setTimeout(() => {
      next.el.scrollIntoView({ behavior: reducedMotion ? "auto" : "smooth", block: "center" });
      toast(`WORLD ${next.name}`);
      setTimeout(() => { if (active !== next) enterStage(next); next.el.focus({ preventScroll: true }); }, 900);
    }, 650);
  }
  stages.forEach((st) => st.out?.addEventListener("pointerdown", (e) => { e.stopPropagation(); if (active === st) warpTo(st.next); }));

  /* ---------- input ---------- */
  function begin() {
    if (!G.started) { G.started = true; everPlayed = true; }
    if (TOUCH) padEl.classList.remove("hidden");
  }
  stages.forEach((st) => st.el.addEventListener("pointerdown", (e) => {
    if (active !== st) enterStage(st);
    st.el.focus({ preventScroll: true }); begin();
    if (e.target.closest("[data-block], [data-pipe], #p2, [data-enemy], #flagpole, [data-npc]")) return;
    const fr = st.el.getBoundingClientRect();
    target = (e.clientX - fr.left) / T;
    if ((fr.bottom - e.clientY) / T > P.y + P.h + 0.4) tapJump = 0.3;
  }));
  const KEYMAP = { ArrowLeft: "left", KeyA: "left", ArrowRight: "right", KeyD: "right", Space: "jump", ArrowUp: "jump", KeyW: "jump", ArrowDown: "down", KeyS: "down" };
  const playing = () => document.activeElement?.hasAttribute?.("data-stage");
  addEventListener("keydown", (e) => {
    const k = KEYMAP[e.code]; if (!k || !playing()) return;
    if (document.activeElement !== active?.el) enterStage(stages.find((st) => st.el === document.activeElement));
    e.preventDefault(); keys[k] = true; begin();
  });
  addEventListener("keyup", (e) => { const k = KEYMAP[e.code]; if (k) keys[k] = false; });
  addEventListener("blur", () => { keys.left = keys.right = keys.jump = keys.down = false; });
  $$("[data-pad]").forEach((btn) => {
    const k = btn.dataset.pad;
    btn.addEventListener("pointerdown", (e) => { e.preventDefault(); keys[k] = true; begin(); });
    ["pointerup", "pointercancel", "pointerleave"].forEach((ev) => btn.addEventListener(ev, () => { keys[k] = false; }));
  });

  // Player 2 cheers you on in 1-1
  const p2 = $("#p2"), p2img = $("img", p2);
  const P2_LINES = ["PLAYER 2: RACE YOU TO THE FLAG!", "PLAYER 2: I'VE GOT THE ON-CALL PAGER.", "PLAYER 2: SHIP IT!", "PLAYER 2: THE DINO IS IN WORLD 1-2."];
  let p2Line = 0;
  p2.addEventListener("click", (e) => { e.stopPropagation(); hop(p2, p2img, "hero2"); sfx.jump(); toast(P2_LINES[p2Line++ % P2_LINES.length]); });
  if (!reducedMotion) setInterval(() => { if (active?.name === "1-1" && stageVisible && !document.hidden) hop(p2, p2img, "hero2"); }, 5200);

  /* ---------- physics: tile units, y grows up from the stage floor ---------- */
  const overlapX = (r) => P.x + P.w > r.x + 0.02 && P.x < r.x + r.w - 0.02;
  const overlapY = (r) => P.y + P.h > r.y + 0.02 && P.y < r.y + r.h - 0.02;
  const touches = (a, b) => a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  const NIGHT_G = { x: 1, y: 3, shy: false, t: 0 };

  function step(dt) {
    if (emerging > 0) { emerging -= dt; P.y += (1 / 0.55) * dt * P.h; if (emerging <= 0) { P.y = V.inBox.y + V.inBox.h; hero.style.zIndex = ""; } return; }
    if (warping) { P.y -= 1.6 * dt; P.vx = 0; return; }

    // down on the exit pipe warps to the next world
    const op = V.outBox;
    if (keys.down && P.ground && op && Math.abs(P.y - (op.y + op.h)) < 0.05 && P.x + P.w / 2 > op.x && P.x + P.w / 2 < op.x + op.w) {
      P.x = op.x + (op.w - P.w) / 2; warpTo(active.next); return;
    }

    let dir = P.hurt > 0.9 ? 0 : (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    if (dir) target = null;
    else if (target !== null && P.hurt < 0.9) {
      const d = target - (P.x + P.w / 2);
      if (Math.abs(d) < 0.2 || (P.x <= 0 && d < 0) || (P.x >= W - P.w && d > 0)) target = null; else dir = Math.sign(d);
    }
    const accel = P.ground ? 40 : 24, maxV = 6;
    if (dir) { P.vx += dir * accel * dt; P.face = dir; } else { P.vx *= P.ground ? 0.78 : 0.96; if (Math.abs(P.vx) < 0.05) P.vx = 0; }
    P.vx = Math.max(-maxV, Math.min(maxV, P.vx));
    P.hurt = Math.max(0, P.hurt - dt);
    if (Math.abs(P.vx) > 1) V.moved = true;

    const pressed = (keys.jump && !lastJump) || tapJump > 0;
    if (pressed && (P.ground || (G.dino && P.jumps === 1))) {
      P.vy = P.ground ? 13.5 : 11.5; P.jumps = P.ground ? 1 : 2; P.ground = false; tapJump = 0; sfx.jump(); V.moved = true;
    }
    const holding = keys.jump || tapJump > 0;
    tapJump = Math.max(0, tapJump - dt);
    if (!holding && P.vy > 4 && !P.hurt) P.vy = 4; // variable jump height
    lastJump = keys.jump;
    P.vy -= (P.vy > 0 && holding ? 30 : 48) * dt;

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
        const b = head && active.blocks.find((k) => k.el === head.el);
        if (b) hitBlock(b);
      } else { P.y = r.y + r.h; P.vy = 0; P.ground = true; }
    }
    if (P.ground) P.jumps = 0;
    if (P.y > H) P.y = H;
    const hb = { x: P.x + 0.1, y: P.y, w: P.w - 0.2, h: P.h - 0.1 };

    // coins
    for (const c of active.coins) {
      if (c.got || !touches(hb, c)) continue;
      c.got = true; c.el.classList.add("hidden"); sfx.coin(); addCoin(); addScore(200);
      const r = c.el.getBoundingClientRect(); popScore("200", r.left, r.top - 16);
    }
    // characters you can meet
    for (const npc of V.npcs || []) {
      if (!touches(hb, npc)) continue;
      const kind = npc.el.dataset.npc;
      if (kind === "dino" && !G.dino) {
        G.dino = true; npc.el.classList.add("hidden"); follower.classList.remove("hidden"); sfx.oneup();
        toast("DINO JOINED YOUR PARTY! DOUBLE JUMP UNLOCKED"); measure();
      } else if (kind === "host" && !V.host) {
        V.host = true; sfx.coin(); hop(npc.el, npc.el, "host-noop");
        toast("HOST: WELCOME! DIVESH WILL WRITE BACK. USE THE FORM BELOW.", 3600);
      }
    }
    // goal + castle door
    if (V.goal && !goalDone && touches(hb, V.goal)) courseClear();
    if (V.door && goalDone && touches(hb, V.door) && !warping) { warping = 0; warpTo(active.next); }

    // enemies crawl out of the exit pipe and walk left
    if (active.kinds.length && !reducedMotion && (V.nextEnemy -= dt) <= 0 && V.enemies.length < 3) {
      addEnemy(active.kinds[Math.floor(Math.random() * active.kinds.length)]); V.nextEnemy = 3 + Math.random() * 4;
    }
    for (const en of V.enemies) {
      if (en.flat) { en.flat -= dt; continue; }
      en.x += en.vx * dt; en.t += dt;
      if (!touches(hb, en)) continue;
      if (P.vy < 0 && P.y > en.y + en.h * 0.35) { squash(en); P.vy = 9; P.ground = false; P.jumps = 1; }
      else if (!P.hurt) hurtHero(en.x + en.w / 2, en.kind === "bug" ? "A BUG GOT TO PROD! STOMP IT FROM ABOVE" : "LEGACY CODE BIT BACK! STOMP IT FROM ABOVE");
    }
    V.enemies = V.enemies.filter((en) => { const keep = en.x > -1.2 && (!en.flat || en.flat > 0); if (!keep) en.el.remove(); return keep; });

    // boss patrols the arena
    const B = V.boss;
    if (B && !B.down) {
      B.t += dt; B.inv = Math.max(0, B.inv - dt);
      B.x += B.vx * dt * (B.hp === 1 ? 1.8 : 1);
      if (B.x < W * 0.3) B.vx = Math.abs(B.vx); if (B.x > W * 0.78) B.vx = -Math.abs(B.vx);
      if (touches(hb, B)) {
        if (P.vy < 0 && P.y > B.y + B.h * 0.4 && !B.inv) { stompBoss(); P.vy = 11; P.ground = false; P.jumps = 1; }
        else if (!P.hurt && !B.inv) hurtHero(B.x + B.w / 2, "THE INCIDENT ESCALATED! STOMP IT FROM ABOVE");
      }
    }

    // night ghost
    if (night) {
      NIGHT_G.t += dt;
      const toHero = Math.sign(P.x - NIGHT_G.x) || 1;
      NIGHT_G.shy = P.face === -toHero;
      if (!NIGHT_G.shy) { NIGHT_G.x += toHero * 1.1 * dt; NIGHT_G.y += (Math.min(H - 1.2, P.y + 1.5) - NIGHT_G.y) * 0.6 * dt; }
    }
    trail.push({ x: P.x, y: P.y, face: P.face }); if (trail.length > 24) trail.shift();
  }

  function render(dt) {
    let frame = "hero-idle";
    if (!P.ground && !emerging) frame = "hero-jump";
    else if (Math.abs(P.vx) > 0.3) { walkT += dt * Math.abs(P.vx) * 2.2; frame = Math.floor(walkT) % 2 ? "hero-walk1" : "hero-walk2"; }
    const src = SPR(frame);
    if (!hero.src.endsWith(src)) hero.src = src;
    hero.style.transform = `translate(${Math.round((P.x - (1 - P.w) / 2) * T)}px, ${Math.round((H - P.y - P.h) * T)}px) scaleX(${P.face})`;
    if (G.dino && trail.length) {
      const f = trail[0], fx = f.x - f.face * 1.1;
      follower.style.transform = `translate(${Math.round(Math.max(0, fx) * T)}px, ${Math.round((H - f.y - 1) * T)}px) scaleX(${f.face})`;
    }
    for (const en of V.enemies) {
      if (!en.flat) { const f = SPR(en.def.frames[Math.floor(en.t * 5) % 2]); if (!en.el.src.endsWith(f)) en.el.src = f; }
      en.el.style.transform = `translate(${Math.round((en.x - 0.1) * T)}px, ${Math.round((H - en.y - en.def.aspect) * T)}px)`;
    }
    const B = V.boss;
    if (B) {
      if (!B.down) { const f = SPR(Math.floor(B.t * 4) % 2 ? "boss-1" : "boss-2"); if (!B.el.src.endsWith(f)) B.el.src = f; }
      B.el.style.opacity = B.inv && Math.floor(B.inv * 10) % 2 ? ".4" : "1";
      B.el.style.transform = `translate(${Math.round((B.x - 0.2) * T)}px, ${Math.round((H - 1.75) * T)}px) scaleX(${B.vx > 0 ? -1 : 1})`;
    }
    placeCoach(dt);
    if (night) {
      const g = SPR(NIGHT_G.shy ? "ghost-shy" : "ghost");
      if (!ghost.src.endsWith(g)) ghost.src = g;
      ghost.style.transform = `translate(${Math.round(NIGHT_G.x * T)}px, ${Math.round((H - NIGHT_G.y - 1) * T + Math.sin(NIGHT_G.t * 3) * 3)}px) scaleX(${P.x > NIGHT_G.x ? 1 : -1})`;
    }
  }

  // the hero follows you: whichever stage is most on screen becomes active
  const ratios = new Map();
  let stageVisible = true;
  const stageObs = new IntersectionObserver((entries) => {
    entries.forEach((e) => ratios.set(e.target, e.intersectionRatio));
    let best = null, bestR = 0;
    stages.forEach((st) => { const r = ratios.get(st.el) || 0; if (r > bestR) { best = st; bestR = r; } });
    stageVisible = bestR > 0;
    if (best && bestR >= 0.35 && best !== active && !warping) enterStage(best);
    if (TOUCH) padEl.classList.toggle("hidden", !(G.started && stageVisible));
  }, { threshold: [0, 0.2, 0.35, 0.5, 0.75, 1] });
  stages.forEach((st) => stageObs.observe(st.el));

  function loop(now) {
    const dt = Math.min(0.033, (now - (loop.last || now)) / 1000); loop.last = now;
    if (active && stageVisible) { step(dt); render(dt); }
    requestAnimationFrame(loop);
  }
  ["hero-walk1", "hero-walk2", "hero-jump", "hero2-jump", "qblock-used", "bug-2", "bug-flat", "turtle-1", "turtle-2", "shell", "ghost-shy", "boss-2", "boss-flat", "dino"]
    .forEach((n) => { new Image().src = SPR(n); });
  addEventListener("resize", () => { const ox = P.x / (W || 1); measure(); P.x = ox * W; });
  (document.fonts?.ready ?? Promise.resolve()).then(() => { enterStage(stages[0]); requestAnimationFrame(loop); });

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
