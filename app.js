"use strict";
// ===== إعدادات التصميم (بوحدات الخلفية 1200 عرض) =====
const W = 1200, S = 2;            // S = معامل الجودة
const BG_H = 1493, TOP_CUT = 385, FOOT_Y = 1360;
const DATE_Y = 290, TABLE_TOP = 440, TABLE_RIGHT = 1130;
const COLS = [46, 108, 160, 290, 88, 88, 110, 170]; // م، اليوم، التاريخ، اسم الدورة، الأيام، الساعات، التوقيت، المدرب
const HEAD_H = 70, LINE_H = 27, PAD = 16, ROW_MIN = 78, FOOT_GAP = 20;
const GREEN = "#57641e", ROW1 = "#d7d9d3", ROW2 = "#e9eae6", TXT = "#1d3a10", GOLD = "#a98421";

const cv = document.getElementById("cv"), ctx = cv.getContext("2d");
const msg = document.getElementById("msg"), dateEl = document.getElementById("date");
let rows = [], header = [], bgImg = null;

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

function layout() {
  // يحسب ارتفاع كل صف حسب عدد الأسطر
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

function drawBackground(total) {
  const footH = BG_H - FOOT_Y, midSrcH = FOOT_Y - TOP_CUT, midH = total - TOP_CUT - footH;
  ctx.drawImage(bgImg, 0, 0, W, TOP_CUT, 0, 0, W * S, TOP_CUT * S);
  let y = TOP_CUT, flip = false;
  while (y < TOP_CUT + midH) {
    const h = Math.min(midSrcH, TOP_CUT + midH - y);
    ctx.save();
    if (flip) { ctx.translate(0, (y * 2 + h) * S); ctx.scale(1, -1); }
    ctx.drawImage(bgImg, 0, TOP_CUT, W, h, 0, y * S, W * S, h * S);
    ctx.restore();
    y += h; flip = !flip;
  }
  ctx.drawImage(bgImg, 0, FOOT_Y, W, footH, 0, (total - footH) * S, W * S, footH * S);
}

function cellText(text, cx, top, h, weight) {
  font(weight, 17); ctx.fillStyle = TXT;
  const lines = wrap(text, (arguments[5] - 14) * S);
  const blockH = lines.length * LINE_H, y0 = top + (h - blockH) / 2;
  lines.forEach((l, i) => ctx.fillText(l, cx * S, (y0 + i * LINE_H + LINE_H / 2) * S));
}

function draw() {
  if (!bgImg || !header.length) return;
  const { heights, total } = layout();
  cv.width = W * S; cv.height = total * S;
  ctx.direction = "rtl"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  drawBackground(total);

  // سطر التاريخ
  font(800, 26); ctx.fillStyle = GOLD;
  ctx.fillText(dateEl.value, (W / 2) * S, DATE_Y * S);

  // أعمدة من اليمين لليسار
  const xs = []; let x = TABLE_RIGHT;
  COLS.forEach(w => { xs.push({ r: x, w, c: x - w / 2 }); x -= w; });

  // الهيدر
  ctx.fillStyle = GREEN; ctx.fillRect((TABLE_RIGHT - 1060) * S, TABLE_TOP * S, 1060 * S, HEAD_H * S);
  const heads = ["م", ...header];
  heads.forEach((h, i) => {
    ctx.fillStyle = "#fff"; font(700, 18);
    const lines = wrap(h, (xs[i].w - 8) * S), bh = lines.length * 26, y0 = TABLE_TOP + (HEAD_H - bh) / 2;
    lines.forEach((l, k) => ctx.fillText(l, xs[i].c * S, (y0 + k * 26 + 13) * S));
    if (i) { ctx.fillRect((xs[i].r + 0) * S - 1, TABLE_TOP * S, 2, HEAD_H * S); }
  });

  // الصفوف
  let y = TABLE_TOP + HEAD_H;
  rows.forEach((r, ri) => {
    const h = heights[ri];
    ctx.fillStyle = ri % 2 === 0 ? ROW1 : ROW2;
    ctx.fillRect((TABLE_RIGHT - 1060) * S, y * S, 1060 * S, h * S);
    ctx.fillStyle = "#fff";
    xs.forEach((c, i) => { if (i) ctx.fillRect(c.r * S - 1, y * S, 2, h * S); });
    ctx.fillRect((TABLE_RIGHT - 1060) * S, (y + h) * S - 1, 1060 * S, 2);
    cellText(String(ri + 1), xs[0].c, y, h, 600, COLS[0]);
    r.forEach((c, i) => cellText(c, xs[i + 1].c, y, h, i === 2 ? 700 : 600, COLS[i + 1]));
    y += h;
  });
  cv.style.width = Math.min(W, 900) + "px";
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
  const a = document.createElement("a"); a.download = "جدول_الدورات.png"; a.href = cv.toDataURL("image/png"); a.click();
};

Promise.all([
  new Promise(r => { const i = new Image(); i.onload = () => { bgImg = i; r(); }; i.src = "background.png"; }),
  Promise.all([400, 600, 700, 800].map(w => document.fonts.load(`${w} 20px Cairo`, "ا")))
]).then(loadSheet);
