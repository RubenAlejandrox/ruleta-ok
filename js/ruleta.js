(() => {
  const P = {
    D: { name: "Dulce", label: "Dulce", pct: 40, bg: "#ECA72C", fg: "#0E1D49", tag: "¡Ganaste!", text: "Pasa por tu dulce con el staff. Un respiro dulce para el estrés académico.", note: "Premio seguro" },
    S: { name: "Stickers", label: "Stickers", pct: 20, bg: "#48A9A6", fg: "#0E1D49", tag: "¡Ganaste!", text: "Elige tus stickers OK? favoritos para la laptop o el termo.", note: "Elige tu diseño" },
    H: { name: "Publica una historia", label: "Historia", pct: 15, bg: "#5F86A6", fg: "#FFFFFF", tag: "Reto OK?", text: "Sube una historia en el stand y etiquétanos en ", note: "Reto: etiquétanos" },
    V: { name: "Vuelve a girar", label: "Otra vez", pct: 15, bg: "#415284", fg: "#FFFFFF", tag: "Casi…", text: "La ruleta te da otra oportunidad.", note: "Giro extra" },
    E: { name: "Sesión psicológica gratis", label: "Sesión gratis", pct: 5, bg: "#C0D3FF", fg: "#0E1D49", tag: "¡Premio mayor!", text: "Una sesión con un psicólogo de OK?. Deja tus datos con el staff para agendarla.", note: "Premio especial" },
    M: { name: "Suscripción MAX", label: "MAX", pct: 5, bg: "#D96A10", fg: "#FFFFFF", tag: "¡Premio mayor!", text: "Acceso a OK? MAX. El staff te ayuda a activarla en tu cuenta.", note: "Premio especial" }
  };

  const SEG = ["D", "S", "D", "V", "D", "H", "D", "S", "D", "M", "D", "V", "D", "H", "S", "D", "E", "S", "H", "V"];
  const N = SEG.length;
  const STEP = 360 / N;

  const canvas = document.getElementById("wheel");
  const ctx = canvas.getContext("2d");
  const hub = document.getElementById("hub");
  const spinBtn = document.getElementById("spin");
  const overlay = document.getElementById("overlay");
  const handle = document.getElementById("handle");

  let rot = 0;
  let spinning = false;
  let soundOn = true;
  let audio = null;
  let counts = {};

  try {
    counts = JSON.parse(localStorage.getItem("okRuletaCounts") || "{}");
  } catch (e) {}

  function size() {
    const r = canvas.getBoundingClientRect();
    const d = window.devicePixelRatio || 1;
    canvas.width = Math.round(r.width * d);
    canvas.height = Math.round(r.height * d);
    draw();
  }

  function draw() {
    const W = canvas.width;
    const c = W / 2;
    const R = c * 0.965;
    const d = W / 560;
    ctx.clearRect(0, 0, W, W);
    ctx.beginPath();
    ctx.arc(c, c, c, 0, Math.PI * 2);
    ctx.fillStyle = "#FFFFFF";
    ctx.fill();
    ctx.save();
    ctx.translate(c, c);
    ctx.rotate(rot * Math.PI / 180);
    for (let i = 0; i < N; i++) {
      const p = P[SEG[i]];
      const a0 = (i * STEP - 90) * Math.PI / 180;
      const a1 = ((i + 1) * STEP - 90) * Math.PI / 180;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, R, a0, a1);
      ctx.closePath();
      ctx.fillStyle = p.bg;
      ctx.fill();
      ctx.lineWidth = 3 * d;
      ctx.strokeStyle = "#0E1D49";
      ctx.stroke();
      ctx.save();
      ctx.rotate((a0 + a1) / 2);
      ctx.fillStyle = p.fg;
      ctx.textAlign = "right";
      ctx.textBaseline = "middle";
      const big = SEG[i] === "E" || SEG[i] === "M";
      ctx.font = `700 ${Math.round((p.label.length > 9 ? 15 : 19) * d)}px Fredoka, system-ui, sans-serif`;
      ctx.fillText(p.label, R - 16 * d, 0);
      if (big) {
        ctx.beginPath();
        ctx.arc(R * 0.40, 0, 5 * d, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    ctx.restore();
    for (let i = 0; i < N; i++) {
      const a = (i * STEP - 90 + rot) * Math.PI / 180;
      ctx.beginPath();
      ctx.arc(c + Math.cos(a) * c * 0.982, c + Math.sin(a) * c * 0.982, 4 * d, 0, Math.PI * 2);
      ctx.fillStyle = "#0E1D49";
      ctx.fill();
    }
  }

  function renderPrizes(hit) {
    const ul = document.getElementById("prizes");
    ul.innerHTML = "";
    ["D", "S", "H", "V", "E", "M"].forEach((k) => {
      const p = P[k];
      const li = document.createElement("li");
      li.className = "prize" + (hit === k ? " hit" : "");
      li.innerHTML = `<span class="sw" style="background:${p.bg}"></span><span class="pname">${p.name}<small>${p.note}</small></span><span class="pct">${p.pct}%</span><span class="cnt" title="Veces que ha salido">${counts[k] || 0}</span>`;
      ul.appendChild(li);
    });
  }

  function tick() {
    if (!soundOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator();
      const g = audio.createGain();
      o.type = "triangle";
      o.frequency.value = 900;
      g.gain.setValueAtTime(0.12, audio.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, audio.currentTime + 0.05);
      o.connect(g).connect(audio.destination);
      o.start();
      o.stop(audio.currentTime + 0.06);
    } catch (e) {}
  }

  function chime(big) {
    if (!soundOn || !audio) return;
    (big ? [523, 659, 784, 1047] : [659, 880]).forEach((f, i) => {
      const o = audio.createOscillator();
      const g = audio.createGain();
      const t = audio.currentTime + i * 0.11;
      o.type = "sine";
      o.frequency.value = f;
      g.gain.setValueAtTime(0.18, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g).connect(audio.destination);
      o.start(t);
      o.stop(t + 0.4);
    });
  }

  function spin() {
    if (spinning) return;
    spinning = true;
    hub.disabled = spinBtn.disabled = true;
    overlay.hidden = true;
    const buf = new Uint32Array(1);
    crypto.getRandomValues(buf);
    const idx = buf[0] % N;
    const key = SEG[idx];
    const center = (idx + 0.5) * STEP;
    const jitter = (Math.random() - 0.5) * STEP * 0.7;
    const cur = ((rot % 360) + 360) % 360;
    const delta = ((-center + jitter - cur) % 360 + 360) % 360;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = rot;
    const total = delta + 360 * (reduce ? 1 : 6);
    const dur = reduce ? 1200 : 5200;
    const t0 = performance.now();
    let lastSeg = Math.floor(start / STEP);
    const ease = (t) => 1 - Math.pow(1 - t, 4);
    (function frame(now) {
      const t = Math.min(1, (now - t0) / dur);
      rot = start + total * ease(t);
      draw();
      const s = Math.floor(rot / STEP);
      if (s !== lastSeg) {
        lastSeg = s;
        tick();
      }
      if (t < 1) requestAnimationFrame(frame);
      else finish(key);
    })(t0);
  }

  function finish(key) {
    spinning = false;
    hub.disabled = spinBtn.disabled = false;
    counts[key] = (counts[key] || 0) + 1;
    try {
      localStorage.setItem("okRuletaCounts", JSON.stringify(counts));
    } catch (e) {}
    renderPrizes(key);
    const p = P[key];
    const card = document.getElementById("card");
    card.style.background = p.bg;
    card.style.color = p.fg;
    document.getElementById("rTag").textContent = p.tag;
    document.getElementById("rTitle").textContent = p.name;
    document.getElementById("rText").textContent = key === "H"
      ? p.text + handle.textContent.trim() + "."
      : p.text;
    const b = document.getElementById("rBtn");
    b.textContent = key === "V" ? "Girar de nuevo" : "Listo";
    b.dataset.again = key === "V" ? "1" : "";
    overlay.hidden = false;
    b.focus();
    chime(key === "E" || key === "M");
  }

  document.getElementById("rBtn").addEventListener("click", (e) => {
    overlay.hidden = true;
    if (e.currentTarget.dataset.again) spin();
    else spinBtn.focus();
  });
  overlay.addEventListener("click", (e) => {
    if (e.target.id === "overlay") overlay.hidden = true;
  });
  hub.addEventListener("click", spin);
  spinBtn.addEventListener("click", spin);
  document.getElementById("reset").addEventListener("click", () => {
    counts = {};
    try {
      localStorage.removeItem("okRuletaCounts");
    } catch (e) {}
    renderPrizes();
  });
  const sb = document.getElementById("sound");
  sb.addEventListener("click", () => {
    soundOn = !soundOn;
    sb.textContent = "Sonido: " + (soundOn ? "sí" : "no");
    sb.setAttribute("aria-pressed", soundOn);
  });
  document.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      e.preventDefault();
      if (!overlay.hidden) document.getElementById("rBtn").click();
      else spin();
    }
    if (e.key === "Escape") overlay.hidden = true;
  });

  new ResizeObserver(size).observe(canvas);
  renderPrizes();
  size();
  if (document.fonts) document.fonts.ready.then(draw);
})();
