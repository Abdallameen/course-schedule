"use strict";
// ===== إعدادات التصميم (بوحدات العرض الموحدة 1200) =====
const W = 1200, S = 2;            // S = معامل الجودة (الناتج 2400 بكسل عرض)
const BG_H = 1493, TOP_CUT = 385, FOOT_Y = 1360;
const DATE_Y = 290, TABLE_TOP = 440, TABLE_RIGHT = 1130;
const COLS = [46, 108, 160, 290, 88, 88, 110, 170]; // م، اليوم، التاريخ، اسم الدورة، الأيام، الساعات، التوقيت، المدرب
const HEAD_H = 70, LINE_H = 27, PAD = 16, ROW_MIN = 78, FOOT_GAP = 20;
const GREEN = "#57641e", ROW1 = "#d7d9d3", ROW2 = "#e9eae6", TXT = "#1d3a10", GOLD = "#a98421";

const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const msg = document.getElementById("msg"), dateEl = document.getElementById("date");
const themeBtns = document.querySelectorAll(".themes button[data-theme]");
let rows = [], header = [], bg1 = null, bg2 = null;
let currentTheme = localStorage.getItem("scheduleTheme") || "1";

function syncThemeButtons() {
  themeBtns.forEach(b => b.classList.toggle("active", b.dataset.theme === currentTheme));
}
syncThemeButtons();
themeBtns.forEach(b => b.addEventListener("click", () => {
  currentTheme = b.dataset.theme;
  localStorage.setItem("scheduleTheme", currentTheme);
  syncThemeButtons();
  draw();
}));

dateEl.value = localStorage.getItem("dateLine") || "من تاريخ 2/8/1448 إلى 24/1/1449 هـ الموافق 10/1/2027 إلى 29/6/2027 م";
dateEl.addEventListener("input", () => { localStorage.setItem("dateLine", dateEl.value); draw(); });

function parseCSV(t) {
  t = t.replace(/^\uFEFF/, "");
  const out = []; let r = [], f = "", q = false;
  for (let i = 0; i < t.length; i++) {
    const c = t[i];
    if (q) { if (c === '"') { if (t[i + 1] === '"') { f += '"'; i++; } else q = false; } else f += c; }
    else if (c === '"') q = true;
    else if (c === ",") { r.push(f); f = ""; }
    else if (c === "\n" || c === "\r") { if (c === "\r" && t[i + 1] === "\n") i++; r.push(f); f = ""; out.push(r); r = []; }
    else f += c;
  }
  if (f !== "" || r.length) { r.push(f); out.push(r); }
  return out.filter(r => r.some(x => x.trim()));
}

function wrap(text, maxW) {
  const lines = [];
  for (const para of String(text).split(/\r?\n/)) {
    const words = para.trim().split(/\s+/); let cur = "";
    for (const w of words) {
      const test = cur ? cur + " " + w : w;
      if (cur && ctx.measureText(test).width > maxW) { lines.push(cur); cur = w; } else cur = test;
    }
    if (cur) lines.push(cur);
  }
  return lines.length ? lines : [""];
}

function font(w, size) { ctx.font = `${w} ${size * S}px Cairo, sans-serif`; }

function drawLines(lines, cx, top, h, lineH) {
  const blockH = lines.length * lineH, y0 = top + (h - blockH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx * S, (y0 + i * lineH + lineH / 2) * S));
}

// ===== التصميم الأول =====
function layoutTheme1() {
  const heights = rows.map(r => {
    let max = 1;
    r.forEach((c, i) => {
      font(i === 2 ? 700 : 600, 17);
      max = Math.max(max, wrap(c, (COLS[i + 1] - 14) * S).length);
    });
    return Math.max(ROW_MIN, max * LINE_H + PAD * 2);
  });
  const tableH = HEAD_H + heights.reduce((a, b) => a + b, 0);
  const total = Math.max(BG_H, Math.ceil(TABLE_TOP + tableH + FOOT_GAP + (BG_H - FOOT_Y)));
  return { heights, total };
}

function drawBackground1(total) {
  const footH = BG_H - FOOT_Y, midSrcH = FOOT_Y - TOP_CUT, midH = total - TOP_CUT - footH;
  ctx.drawImage(bg1, 0, 0, W, TOP_CUT, 0, 0, W * S, TOP_CUT * S);
  let y = TOP_CUT, flip = false;
  while (y < TOP_CUT + midH) {
    const h = Math.min(midSrcH, TOP_CUT + midH - y);
    ctx.save();
    if (flip) { ctx.translate(0, (y * 2 + h) * S); ctx.scale(1, -1); }
    ctx.drawImage(bg1, 0, TOP_CUT, W, h, 0, y * S, W * S, h * S);
    ctx.restore();
    y += h; flip = !flip;
  }
  ctx.drawImage(bg1, 0, FOOT_Y, W, footH, 0, (total - footH) * S, W * S, footH * S);
}

function cellText1(text, cx, top, h, weight, colW) {
  font(weight, 17); ctx.fillStyle = TXT;
  drawLines(wrap(text, (colW - 14) * S), cx, top, h, LINE_H);
}

function drawTheme1() {
  if (!bg1) return;
  const { heights, total } = layoutTheme1();
  cv.width = W * S; cv.height = total * S;
  ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  drawBackground1(total);

  font(800, 26); ctx.fillStyle = GOLD;
  ctx.fillText(dateEl.value, (W / 2) * S, DATE_Y * S);

  const xs = []; let x = TABLE_RIGHT;
  COLS.forEach(w => { xs.push({ r: x, w, c: x - w / 2 }); x -= w; });

  ctx.fillStyle = GREEN; ctx.fillRect((TABLE_RIGHT - 1060) * S, TABLE_TOP * S, 1060 * S, HEAD_H * S);
  ["م", ...header].forEach((h, i) => {
    ctx.fillStyle = "#fff"; font(700, 18);
    drawLines(wrap(h, (xs[i].w - 8) * S), xs[i].c, TABLE_TOP, HEAD_H, 26);
    if (i) ctx.fillRect(xs[i].r * S - 1, TABLE_TOP * S, 2, HEAD_H * S);
  });

  let y = TABLE_TOP + HEAD_H;
  rows.forEach((r, ri) => {
    const h = heights[ri];
    ctx.fillStyle = ri % 2 === 0 ? ROW1 : ROW2;
    ctx.fillRect((TABLE_RIGHT - 1060) * S, y * S, 1060 * S, h * S);
    ctx.fillStyle = "#fff";
    xs.forEach((c, i) => { if (i) ctx.fillRect(c.r * S - 1, y * S, 2, h * S); });
    ctx.fillRect((TABLE_RIGHT - 1060) * S, (y + h) * S - 1, 1060 * S, 2);
    cellText1(String(ri + 1), xs[0].c, y, h, 600, COLS[0]);
    r.forEach((c, i) => cellText1(c, xs[i + 1].c, y, h, i === 2 ? 700 : 600, COLS[i + 1]));
    y += h;
  });
  cv.style.width = Math.min(W, 900) + "px";
}

// ===== التصميم الثاني =====
function pillPath(x, y, w, h, r) {
  const rad = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rad, y);
  ctx.arcTo(x + w, y, x + w, y + h, rad);
  ctx.arcTo(x + w, y + h, x, y + h, rad);
  ctx.arcTo(x, y + h, x, y, rad);
  ctx.arcTo(x, y, x + w, y, rad);
  ctx.closePath();
}

function drawBackground2(total) {
  const K = W / bg2.width;
  const TOP_CUT2 = 250, FOOT_Y2 = 648;
  const topH = Math.round(TOP_CUT2 * K);
  const footSrcH = bg2.height - FOOT_Y2;
  const footH = Math.round(footSrcH * K);
  const midSrcH = FOOT_Y2 - TOP_CUT2;
  const midDstH = Math.round(midSrcH * K);
  const midNeed = total - topH - footH;

  ctx.drawImage(bg2, 0, 0, bg2.width, TOP_CUT2, 0, 0, W * S, topH * S);
  let y = topH, flip = false;
  while (y < topH + midNeed) {
    const dstH = Math.min(midDstH, topH + midNeed - y);
    const srcH = (dstH / midDstH) * midSrcH;
    ctx.save();
    if (flip) {
      ctx.translate(0, (y * 2 + dstH) * S);
      ctx.scale(1, -1);
      ctx.drawImage(bg2, 0, FOOT_Y2 - srcH, bg2.width, srcH, 0, y * S, W * S, dstH * S);
    } else {
      ctx.drawImage(bg2, 0, TOP_CUT2, bg2.width, srcH, 0, y * S, W * S, dstH * S);
    }
    ctx.restore();
    y += dstH; flip = !flip;
  }
  ctx.drawImage(bg2, 0, FOOT_Y2, bg2.width, footSrcH, 0, (total - footH) * S, W * S, footH * S);
}

function drawTheme2() {
  if (!bg2) return;
  const K = W / bg2.width;
  const TABLE_TOP2 = Math.round(254 * K); // 480
  const HEAD_H2 = 58, ROW_GAP = 10, HEAD_GAP = 14, LINE_H2 = 24;

  // المجموعات الأربع من اليمين (1082) لليسار (118) مع فجوة 10 بين المجموعات
  const groups = [
    { x: 1038, w: 44, cols: [{ idx: -1, w: 44, fsize: 15.5, bold: true }] },       // م
    { x: 784,  w: 244, cols: [{ idx: 2, w: 244, fsize: 15.5, bold: true }] },       // اسم الدورة
    { x: 632,  w: 142, cols: [{ idx: 6, w: 142, fsize: 15.5, bold: false }] },      // المدرب
    { x: 118,  w: 504, cols: [                                                     // الأيام، الساعات، اليوم، التاريخ، التوقيت
      { idx: 3, w: 74,  fsize: 14.5, bold: false },
      { idx: 4, w: 74,  fsize: 14.5, bold: false },
      { idx: 0, w: 92,  fsize: 14.5, bold: false },
      { idx: 1, w: 166, fsize: 14.5, bold: false },
      { idx: 5, w: 98,  fsize: 14.5, bold: false }
    ]}
  ];
  groups.forEach(g => {
    let rx = g.x + g.w;
    g.cols.forEach(c => { c.cx = rx - c.w / 2; rx -= c.w; });
  });

  // حساب ارتفاع كل صف ديناميكياً
  const heights = rows.map(r => {
    let maxLines = 1;
    groups.forEach(g => g.cols.forEach(c => {
      if (c.idx < 0) return;
      font(c.bold ? 700 : 600, c.fsize);
      maxLines = Math.max(maxLines, wrap(r[c.idx] || "", (c.w - 14) * S).length);
    }));
    return Math.max(66, maxLines * LINE_H2 + 22);
  });

  const rowsTotalH = heights.reduce((a, b) => a + b, 0) + Math.max(0, rows.length - 1) * ROW_GAP;
  const tableBottom = TABLE_TOP2 + HEAD_H2 + (rows.length ? HEAD_GAP + rowsTotalH : 0);
  const sloganTailH = Math.round((bg2.height - 736) * K);
  const total = Math.max(Math.round(bg2.height * K), Math.ceil(tableBottom + 34 + sloganTailH));

  cv.width = W * S; cv.height = total * S;
  ctx.direction = "rtl"; ctx.textBaseline = "middle";
  drawBackground2(total);

  // سطر التاريخ العلوي بمحاذاة اليمين تحت "الدورات التدريبية"
  ctx.textAlign = "right";
  ctx.fillStyle = "#2f3b35";
  let dateSz = 22;
  for (; dateSz > 16; dateSz--) {
    font(700, dateSz);
    if (ctx.measureText(dateEl.value).width <= 740 * S) break;
  }
  font(700, dateSz);
  ctx.fillText(dateEl.value, Math.round(554 * K) * S, Math.round(200 * K) * S);
  ctx.textAlign = "center";

  // صف العناوين (كبسولات خضراء بتدرج رأسي)
  const grad = ctx.createLinearGradient(0, TABLE_TOP2 * S, 0, (TABLE_TOP2 + HEAD_H2) * S);
  grad.addColorStop(0, "#466951");
  grad.addColorStop(0.5, "#345947");
  grad.addColorStop(1, "#2b4a3c");
  groups.forEach(g => {
    ctx.fillStyle = grad;
    pillPath(g.x * S, TABLE_TOP2 * S, g.w * S, HEAD_H2 * S, 29 * S);
    ctx.fill();
    ctx.fillStyle = "#ffffff";
    g.cols.forEach(c => {
      const label = c.idx < 0 ? "م" : (header[c.idx] || "");
      font(700, 16);
      let lines = wrap(label, (c.w - 10) * S);
      if (lines.length > 1) font(700, 15);
      drawLines(lines, c.cx, TABLE_TOP2, HEAD_H2, 21);
    });
  });

  // صفوف الدورات
  let y = TABLE_TOP2 + HEAD_H2 + HEAD_GAP;
  rows.forEach((r, ri) => {
    const h = heights[ri];
    const pillFill = ri % 2 === 0 ? "#eceeed" : "#d8dcd9";
    const rad = Math.min(28, h / 2);
    groups.forEach(g => {
      ctx.fillStyle = pillFill;
      pillPath(g.x * S, y * S, g.w * S, h * S, rad * S);
      ctx.fill();
      ctx.fillStyle = "#25382e";
      g.cols.forEach(c => {
        const val = c.idx < 0 ? String(ri + 1) : (r[c.idx] || "");
        font(c.bold ? 700 : 600, c.fsize);
        drawLines(wrap(val, (c.w - 14) * S), c.cx, y, h, LINE_H2);
      });
    });
    y += h + ROW_GAP;
  });

  cv.style.width = Math.min(W, 900) + "px";
}

function draw() {
  if (!header.length) return;
  if (currentTheme === "2") drawTheme2();
  else drawTheme1();
}

function setData(table) {
  header = table[0].map(s => s.trim());
  rows = table.slice(1).map(r => { const a = r.slice(0, 7); while (a.length < 7) a.push(""); return a; });
  msg.textContent = "";
  document.fonts.ready.then(draw);
}

async function loadSheet() {
  const url = window.SHEET_CSV_URL || new URLSearchParams(location.search).get("csv");
  if (url) {
    try {
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(res.status);
      setData(parseCSV(await res.text()));
      return;
    } catch (e) {
      try {
        const fb = await fetch("courses.csv", { cache: "no-store" });
        if (!fb.ok) throw new Error(fb.status);
        setData(parseCSV(await fb.text()));
        msg.textContent = "تنبيه: تعذّر تحميل رابط الشيت المنشور (" + e.message + ")، تم عرض البيانات المحلية (courses.csv).";
        return;
      } catch (e2) {
        msg.textContent = "تعذّر تحميل الجدول: " + e.message;
        return;
      }
    }
  }
  try {
    const res = await fetch("courses.csv", { cache: "no-store" });
    if (!res.ok) throw new Error(res.status);
    setData(parseCSV(await res.text()));
    msg.textContent = "تنبيه: لم يُضبط رابط الشيت في config.js، يتم استخدام courses.csv التجريبي.";
  } catch (e) { msg.textContent = "تعذّر تحميل الجدول: " + e.message; }
}

document.getElementById("refresh").onclick = loadSheet;
document.getElementById("file").onchange = async e => {
  const f = e.target.files[0]; if (f) setData(parseCSV(await f.text()));
};
document.getElementById("dl").onclick = () => {
  const a = document.createElement("a");
  a.download = currentTheme === "2" ? "جدول_الدورات_تصميم_2.png" : "جدول_الدورات.png";
  a.href = cv.toDataURL("image/png");
  a.click();
};

function loadImg(src) {
  return new Promise((res, rej) => {
    const i = new Image();
    i.onload = () => res(i);
    i.onerror = rej;
    i.src = src;
  });
}

Promise.all([
  loadImg("background.png").then(i => { bg1 = i; }),
  loadImg("background2.png").then(i => { bg2 = i; }),
  Promise.all([400, 600, 700, 800].map(w => document.fonts.load(`${w} 20px Cairo`, "ا")))
]).then(loadSheet);
