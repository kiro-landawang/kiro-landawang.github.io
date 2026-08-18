/* =========================================================
   SHEEP HUB - 交互逻辑
   - 鼠标光晕跟随
   - 鼠标粒子拖尾
   - 视差背景
   - 占位按钮渲染（用户后续替换名称+链接）
   ========================================================= */

/* ---------- 占位导航数据 ----------
   后续用户给真实名称和链接后，
   只需把这里每条的 title/desc/url/icon 改掉即可。
   颜色 class 从 c-purple/c-cyan/c-pink/c-yellow/
   c-mint/c-blue/c-orange/c-rose 里选一个。
   ----------------------------------- */
const NAV_ITEMS = [
  { title: "kiro 官网直达", desc: "购卡通道",   url: "http://aceyun.cn/shop/TCJZZCXC",       icon: "✦", cls: "c-purple" },
  { title: "全项目直达",     desc: "备用购卡",   url: "https://buy.jry0.com/shop/LANDAWANG", icon: "◆", cls: "c-cyan"   },
  { title: "kiro 下载链接",  desc: "夸克网盘",   url: "https://pan.quark.cn/s/f0a0655f63a9",  icon: "✧", cls: "c-mint"   },
  { title: "kiro抽奖",        desc: "每日抽奖",   url: "https://cj.sojmx.cn/",                icon: "✪", cls: "c-orange" },
  { title: "闲聊Q群",        desc: "加入群聊",   url: "https://qm.qq.com/q/tYDT4ldGpy",       icon: "✪", cls: "c-blue"   },
  { title: "参数闲聊群",     desc: "加入群聊",   url: "https://qm.qq.com/q/e4ZwV9vNKw",       icon: "✪", cls: "c-rose"   },
];

/* ===== 渲染导航按钮 ===== */
const grid = document.getElementById("navGrid");
grid.innerHTML = NAV_ITEMS.map(it => `
  <a class="nav-btn ${it.cls}" href="${it.url}" target="_blank" rel="noopener">
    <span class="nav-icon">${it.icon}</span>
    <span class="nav-text">
      <span class="nav-title">${it.title}</span>
      <span class="nav-desc">${it.desc}</span>
    </span>
    <span class="nav-arrow">→</span>
  </a>
`).join("");

/* ===== 鼠标光晕跟随 ===== */
const glow = document.getElementById("cursorGlow");
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let glowX = mouseX, glowY = mouseY;

document.addEventListener("mousemove", e => {
  mouseX = e.clientX; mouseY = e.clientY;
});

function loopGlow(){
  glowX += (mouseX - glowX) * 0.12;
  glowY += (mouseY - glowY) * 0.12;
  glow.style.transform = `translate(${glowX}px, ${glowY}px) translate(-50%, -50%)`;
  requestAnimationFrame(loopGlow);
}
loopGlow();

/* ===== 鼠标粒子拖尾 ===== */
const canvas = document.getElementById("particles");
const ctx = canvas.getContext("2d");
let dpr = Math.min(window.devicePixelRatio || 1, 2);

function resize(){
  canvas.width  = window.innerWidth  * dpr;
  canvas.height = window.innerHeight * dpr;
  canvas.style.width  = window.innerWidth  + "px";
  canvas.style.height = window.innerHeight + "px";
  ctx.scale(dpr, dpr);
}
resize();
window.addEventListener("resize", resize);

const COLORS = [
  "rgba(124, 92, 255, .9)",
  "rgba(41, 224, 200, .9)",
  "rgba(255, 122, 214, .9)",
  "rgba(255, 209, 102, .9)",
];
const particles = [];
const MAX = 80;

function spawn(x, y){
  if (particles.length >= MAX) particles.shift();
  particles.push({
    x, y,
    vx: (Math.random() - 0.5) * 1.2,
    vy: (Math.random() - 0.5) * 1.2,
    life: 1,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    size: Math.random() * 2.5 + 1.2,
  });
}

let lastSpawn = 0;
function onMove(x, y){
  const now = performance.now();
  if (now - lastSpawn < 16) return; // 节流 ~60fps
  lastSpawn = now;
  spawn(x, y);
}
document.addEventListener("mousemove", e => onMove(e.clientX, e.clientY));
document.addEventListener("touchmove", e => {
  if (e.touches[0]) onMove(e.touches[0].clientX, e.touches[0].clientY);
}, {passive: true});

function tick(){
  ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
  for (let i = particles.length - 1; i >= 0; i--){
    const p = particles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.012;
    p.vx *= 0.98;
    p.vy *= 0.98;
    if (p.life <= 0){ particles.splice(i, 1); continue; }
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
    ctx.fillStyle = p.color.replace("1)", `${p.life})`).replace(".9)", `${p.life * .9})`);
    // 简单处理：直接使用不透明颜色 + 透明度
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  // 粒子之间画线（仅相邻）
  for (let i = 0; i < particles.length; i++){
    for (let j = i + 1; j < particles.length; j++){
      const a = particles[i], b = particles[j];
      const dx = a.x - b.x, dy = a.y - b.y;
      const d = Math.sqrt(dx*dx + dy*dy);
      if (d < 90){
        ctx.globalAlpha = (1 - d / 90) * 0.3 * Math.min(a.life, b.life);
        ctx.strokeStyle = a.color;
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;
  requestAnimationFrame(tick);
}
tick();

/* ===== 按钮悬停时再喷一波粒子 ===== */
document.querySelectorAll(".nav-btn").forEach(btn => {
  btn.addEventListener("mouseenter", e => {
    const r = btn.getBoundingClientRect();
    const cx = r.left + r.width / 2;
    const cy = r.top  + r.height / 2;
    for (let i = 0; i < 14; i++) spawn(cx, cy);
  });
});
