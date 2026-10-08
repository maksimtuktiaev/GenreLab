/* ============================================================
   GenreLab — игровые прототипы (7 мини-игр на canvas)
   Все игры запускаются на страницах 1game.html ... 7game.html
   ============================================================ */

(function () {
  "use strict";

  const canvas = document.getElementById("game");
  if (!canvas) return;

  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  /* ---------- Ввод ---------- */
  const keys = {};
  const just = {};
  const mouse = { x: W / 2, y: H / 2, down: false, clicked: false };

  window.addEventListener("keydown", (e) => {
    if (!keys[e.code]) just[e.code] = true;
    keys[e.code] = true;
    if (
      [
        "Space",
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Backspace",
      ].includes(e.code)
    ) {
      e.preventDefault();
    }
  });
  window.addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    const r = canvas.getBoundingClientRect();
    mouse.x = (e.clientX - r.left) * (W / r.width);
    mouse.y = (e.clientY - r.top) * (H / r.height);
  });
  canvas.addEventListener("mousedown", (e) => {
    e.preventDefault();
    mouse.down = true;
    mouse.clicked = true;
  });
  window.addEventListener("mouseup", () => {
    mouse.down = false;
  });
  canvas.addEventListener("contextmenu", (e) => e.preventDefault());

  /* ---------- Утилиты ---------- */
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const rnd = (a, b) => a + Math.random() * (b - a);
  const dist = (ax, ay, bx, by) => Math.hypot(bx - ax, by - ay);
  const TAU = Math.PI * 2;

  function rr(x, y, w, h, r) {
    r = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function text(str, x, y, size, color, align, weight) {
    ctx.fillStyle = color || "#e9eefb";
    ctx.font = `${weight || 700} ${size || 14}px Inter, system-ui, sans-serif`;
    ctx.textAlign = align || "left";
    ctx.textBaseline = "alphabetic";
    ctx.fillText(str, x, y);
  }

  function circleRect(cx, cy, r, rc) {
    const nx = clamp(cx, rc.x, rc.x + rc.w);
    const ny = clamp(cy, rc.y, rc.y + rc.h);
    return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
  }

  /* ============================================================
     ИГРА 1 — Dungeon Maintenance
     ============================================================ */
  function game1() {
    function reset() {
      return {
        p: { x: 70, y: 270 },
        traps: [
          { x: 250, hp: 100 },
          { x: 470, hp: 100 },
          { x: 690, hp: 100 },
        ],
        heroes: [],
        spawnT: 1.4,
        killed: 0,
        stolen: 0,
        t: 0,
        state: "play",
        flash: 0,
      };
    }
    return {
      init: reset,
      update(s, dt) {
        if (s.state !== "play") {
          if (just.Space || just.Enter) Object.assign(s, reset());
          return;
        }
        s.t += dt;
        if (s.flash > 0) s.flash -= dt;

        const p = s.p,
          sp = 220;
        let dx = 0,
          dy = 0;
        if (keys.KeyW || keys.ArrowUp) dy--;
        if (keys.KeyS || keys.ArrowDown) dy++;
        if (keys.KeyA || keys.ArrowLeft) dx--;
        if (keys.KeyD || keys.ArrowRight) dx++;
        if (dx || dy) {
          const l = Math.hypot(dx, dy);
          p.x += (dx / l) * sp * dt;
          p.y += (dy / l) * sp * dt;
        }
        p.x = clamp(p.x, 26, W - 26);
        p.y = clamp(p.y, 78, H - 26);

        // Ремонт
        if (keys.KeyE) {
          for (const tr of s.traps) {
            if (
              Math.abs(tr.x - p.x) < 72 &&
              Math.abs(270 - p.y) < 100 &&
              tr.hp < 100
            ) {
              tr.hp = Math.min(100, tr.hp + 52 * dt);
            }
          }
        }

        // Спавн героев
        s.spawnT -= dt;
        if (s.spawnT <= 0) {
          s.spawnT = Math.max(1.05, 2.6 - s.t * 0.028);
          s.heroes.push({ x: -26, y: 270, hp: 100, hitT: 0 });
        }

        // Герои
        for (const h of s.heroes) {
          let blocked = false;
          for (const tr of s.traps) {
            if (tr.hp > 0 && h.x > tr.x - 28 && h.x < tr.x + 6) {
              blocked = true;
              tr.hp -= 15 * dt;
              h.hp -= 28 * dt;
              h.hitT = 0.15;
              break;
            }
          }
          if (!blocked) h.x += 58 * dt;
          if (h.hitT > 0) h.hitT -= dt;
          if (h.x > W - 16) {
            h.dead = true;
            s.stolen++;
            s.flash = 0.35;
          }
          if (h.hp <= 0) {
            h.dead = true;
            s.killed++;
          }
        }
        s.heroes = s.heroes.filter((h) => !h.dead);
        for (const tr of s.traps) tr.hp = clamp(tr.hp, 0, 100);

        if (s.stolen >= 3) s.state = "lose";
        if (s.killed >= 12) s.state = "win";
      },

      draw(s) {
        ctx.fillStyle = "#0b0f1c";
        ctx.fillRect(0, 0, W, H);

        // Сетка пола
        ctx.strokeStyle = "rgba(108,92,231,.09)";
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 45) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        for (let y = 0; y < H; y += 45) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }

        // Коридор
        ctx.fillStyle = "rgba(108,92,231,.10)";
        ctx.fillRect(0, 238, W, 64);
        ctx.strokeStyle = "rgba(108,92,231,.28)";
        ctx.beginPath();
        ctx.moveTo(0, 238);
        ctx.lineTo(W, 238);
        ctx.moveTo(0, 302);
        ctx.lineTo(W, 302);
        ctx.stroke();

        // Сокровищница
        ctx.fillStyle = "rgba(255,209,102,.10)";
        ctx.fillRect(W - 86, 168, 86, 204);
        ctx.strokeStyle = "rgba(255,209,102,.5)";
        ctx.lineWidth = 2;
        ctx.strokeRect(W - 86, 168, 86, 204);
        text("СОКРОВИЩА", W - 43, 196, 11, "#ffd166", "center", 800);
        ctx.font = "26px system-ui";
        ctx.textAlign = "center";
        ctx.fillText("💰", W - 43, 300);

        // Ловушки
        for (const tr of s.traps) {
          const k = tr.hp / 100;
          const col = k > 0.5 ? "#00e0c6" : k > 0.2 ? "#ffb020" : "#ff4d5e";
          ctx.globalAlpha = 0.22 + 0.78 * k;
          ctx.fillStyle = col;
          rr(tr.x - 7, 240, 14, 60, 7);
          ctx.fill();
          ctx.globalAlpha = 1;

          ctx.fillStyle = "rgba(0,0,0,.55)";
          rr(tr.x - 11, 306, 22, 6, 3);
          ctx.fill();
          ctx.fillStyle = col;
          rr(tr.x - 11, 306, 22 * k, 6, 3);
          ctx.fill();

          if (tr.hp <= 0) {
            text("СЛОМАНА", tr.x, 332, 10, "#ff4d5e", "center", 800);
          }
        }

        // Герои
        for (const h of s.heroes) {
          ctx.fillStyle = h.hitT > 0 ? "#ff8fa3" : "#ff4d5e";
          ctx.beginPath();
          ctx.arc(h.x, h.y, 13, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#2a0d14";
          ctx.beginPath();
          ctx.arc(h.x - 4, h.y - 3, 2.2, 0, TAU);
          ctx.arc(h.x + 4, h.y - 3, 2.2, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "rgba(0,0,0,.55)";
          ctx.fillRect(h.x - 15, h.y - 24, 30, 5);
          ctx.fillStyle = "#ff4d5e";
          ctx.fillRect(h.x - 15, h.y - 24, 30 * (h.hp / 100), 5);
        }

        // Игрок (гоблин-механик)
        const repairing =
          keys.KeyE &&
          s.traps.some((tr) => Math.abs(tr.x - s.p.x) < 72 && tr.hp < 100);
        ctx.shadowBlur = 22;
        ctx.shadowColor = repairing ? "#00e0c6" : "#51cf66";
        ctx.fillStyle = repairing ? "#00e0c6" : "#51cf66";
        ctx.beginPath();
        ctx.arc(s.p.x, s.p.y, 15, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#0b1d10";
        ctx.beginPath();
        ctx.arc(s.p.x - 5, s.p.y - 3, 2.6, 0, TAU);
        ctx.arc(s.p.x + 5, s.p.y - 3, 2.6, 0, TAU);
        ctx.fill();
        if (repairing) {
          ctx.strokeStyle = "#00e0c6";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(s.p.x, s.p.y, 24, -Math.PI / 2, -Math.PI / 2 + TAU * 0.7);
          ctx.stroke();
        }

        // HUD
        ctx.fillStyle = "rgba(10,14,26,.82)";
        rr(20, 18, 300, 44, 12);
        ctx.fill();
        text(
          `Обезврежено: ${s.killed} / 12`,
          36,
          46,
          15,
          "#00e0c6",
          "left",
          800,
        );
        ctx.fillStyle = "rgba(10,14,26,.82)";
        rr(W - 300, 18, 280, 44, 12);
        ctx.fill();
        text(
          `Украдено: ${s.stolen} / 3`,
          W - 36,
          46,
          15,
          s.stolen >= 2 ? "#ff4d5e" : "#ffd166",
          "right",
          800,
        );

        if (s.flash > 0) {
          ctx.fillStyle = `rgba(255,77,94,${s.flash * 0.35})`;
          ctx.fillRect(0, 0, W, H);
        }

        if (s.state !== "play") {
          ctx.fillStyle = "rgba(6,9,16,.82)";
          ctx.fillRect(0, 0, W, H);
          const win = s.state === "win";
          text(win ? "🏆" : "💀", W / 2, H / 2 - 30, 64, "#fff", "center");
          text(
            win ? "Подземелье защищено!" : "Сокровищница разграблена...",
            W / 2,
            H / 2 + 30,
            30,
            win ? "#00e0c6" : "#ff4d5e",
            "center",
            800,
          );
          text(
            `Обезврежено героев: ${s.killed}   ·   Время: ${s.t.toFixed(1)} с`,
            W / 2,
            H / 2 + 70,
            16,
            "#8b98b8",
            "center",
            600,
          );
          text(
            "Нажмите ПРОБЕЛ, чтобы начать заново",
            W / 2,
            H / 2 + 110,
            15,
            "#6c5ce7",
            "center",
            700,
          );
        }
      },
    };
  }

  /* ============================================================
     ИГРА 2 — Shifted Core
     ============================================================ */
  function game2() {
    const FLOOR_Y = 516,
      CEIL_Y = 24;

    function reset() {
      return {
        p: { x: 60, y: FLOOR_Y - 24, w: 24, h: 24, vx: 0, vy: 0 },
        g: 1,
        cd: 0,
        deaths: 0,
        t: 0,
        state: "play",
        respawn: 0,
      };
    }

    const PLATS = [
      { x: 0, y: FLOOR_Y, w: W, h: 24 },
      { x: 0, y: 0, w: W, h: CEIL_Y },
    ];
    const HAZ = [
      { x: 250, y: FLOOR_Y - 24, w: 70, h: 24 },
      { x: 520, y: FLOOR_Y - 24, w: 90, h: 24 },
      { x: 760, y: FLOOR_Y - 24, w: 70, h: 24 },
      { x: 380, y: CEIL_Y, w: 90, h: 24 },
      { x: 640, y: CEIL_Y, w: 90, h: 24 },
    ];
    const EXIT = { x: 820, y: CEIL_Y, w: 60, h: 76 };

    return {
      init: reset,
      update(s, dt) {
        if (s.state !== "play") {
          if (just.Space || just.Enter) Object.assign(s, reset());
          return;
        }
        const p = s.p;
        s.t += dt;
        if (s.cd > 0) s.cd -= dt;

        // Переворот гравитации
        if (just.Space && s.cd <= 0) {
          s.g *= -1;
          p.vy = 0;
          s.cd = 0.28;
        }

        // Горизонталь
        const speed = 230;
        p.vx = 0;
        if (keys.KeyA || keys.ArrowLeft) p.vx = -speed;
        if (keys.KeyD || keys.ArrowRight) p.vx = speed;

        // Вертикаль
        p.vy += 1700 * s.g * dt;
        p.vy = clamp(p.vy, -1100, 1100);

        // Движение по X
        p.x += p.vx * dt;
        for (const pl of PLATS) {
          if (overlap(p, pl)) {
            if (p.vx > 0) p.x = pl.x - p.w;
            else if (p.vx < 0) p.x = pl.x + pl.w;
          }
        }
        p.x = clamp(p.x, 24, W - p.w - 24);

        // Движение по Y
        p.y += p.vy * dt;
        for (const pl of PLATS) {
          if (overlap(p, pl)) {
            if (p.vy > 0) p.y = pl.y - p.h;
            else if (p.vy < 0) p.y = pl.y + pl.h;
            p.vy = 0;
          }
        }

        // Шипы
        for (const hz of HAZ) {
          if (overlap(p, hz)) {
            s.state = "dead";
            s.deaths++;
            s.respawn = 0;
            return;
          }
        }

        // Выход
        if (overlap(p, EXIT)) s.state = "win";
      },

      draw(s) {
        const g = s.g;
        const bgGrad = ctx.createLinearGradient(0, 0, 0, H);
        if (g === 1) {
          bgGrad.addColorStop(0, "#0a1024");
          bgGrad.addColorStop(1, "#0f1a33");
        } else {
          bgGrad.addColorStop(0, "#101a33");
          bgGrad.addColorStop(1, "#0a1024");
        }
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, W, H);

        // Звёзды
        for (let i = 0; i < 40; i++) {
          const x = (i * 137.5) % W;
          const y = (i * 79.3) % H;
          ctx.fillStyle = `rgba(150,180,255,${0.05 + (i % 5) * 0.02})`;
          ctx.fillRect(x, y, 2, 2);
        }

        // Платформы
        for (const pl of PLATS) {
          ctx.fillStyle = "#1c2745";
          ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
          ctx.fillStyle = "#2f3f6b";
          ctx.fillRect(pl.x, pl.y, pl.w, 3);
        }

        // Шипы
        for (const hz of HAZ) {
          ctx.fillStyle = "#ff4d5e";
          const count = Math.floor(hz.w / 14);
          for (let i = 0; i < count; i++) {
            const sx = hz.x + i * 14;
            ctx.beginPath();
            if (hz.y < 200) {
              // потолочные, вниз
              ctx.moveTo(sx, hz.y);
              ctx.lineTo(sx + 7, hz.y + hz.h);
              ctx.lineTo(sx + 14, hz.y);
            } else {
              ctx.moveTo(sx, hz.y + hz.h);
              ctx.lineTo(sx + 7, hz.y);
              ctx.lineTo(sx + 14, hz.y + hz.h);
            }
            ctx.closePath();
            ctx.fill();
          }
          ctx.globalAlpha = 0.15;
          ctx.fillStyle = "#ff4d5e";
          ctx.fillRect(hz.x, hz.y - 6, hz.w, hz.h + 12);
          ctx.globalAlpha = 1;
        }

        // Выход
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300);
        ctx.shadowBlur = 24 * pulse + 8;
        ctx.shadowColor = "#00e0c6";
        ctx.fillStyle = "rgba(0,224,198,.18)";
        ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
        ctx.strokeStyle = "#00e0c6";
        ctx.lineWidth = 3;
        ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
        ctx.shadowBlur = 0;
        text(
          "ВЫХОД",
          EXIT.x + EXIT.w / 2,
          EXIT.y + EXIT.h / 2 + 5,
          14,
          "#00e0c6",
          "center",
          800,
        );

        // Игрок-дрон
        const p = s.p;
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#6c5ce7";
        ctx.fillStyle = "#8b7bff";
        rr(p.x, p.y, p.w, p.h, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#00e0c6";
        ctx.beginPath();
        ctx.arc(p.x + p.w / 2, p.y + p.h / 2, 4, 0, TAU);
        ctx.fill();

        // Индикатор гравитации
        ctx.fillStyle = "rgba(10,14,26,.8)";
        rr(20, 18, 250, 44, 12);
        ctx.fill();
        text(
          g === 1 ? "⬇ Гравитация: вниз" : "⬆ Гравитация: вверх",
          36,
          46,
          15,
          g === 1 ? "#8b98b8" : "#00e0c6",
          "left",
          800,
        );

        ctx.fillStyle = "rgba(10,14,26,.8)";
        rr(W - 240, 18, 220, 44, 12);
        ctx.fill();
        text(
          `Провалов: ${s.deaths}`,
          W - 36,
          46,
          15,
          s.deaths ? "#ff4d5e" : "#8b98b8",
          "right",
          800,
        );

        if (s.state === "dead") {
          ctx.fillStyle = "rgba(255,77,94,.25)";
          ctx.fillRect(0, 0, W, H);
          text("💥 Столкновение!", W / 2, H / 2, 34, "#ff4d5e", "center", 800);
        }
        if (s.state === "win") {
          ctx.fillStyle = "rgba(6,9,16,.85)";
          ctx.fillRect(0, 0, W, H);
          text("🛰️", W / 2, H / 2 - 40, 64, "#fff", "center");
          text(
            "Ядро стабилизировано!",
            W / 2,
            H / 2 + 20,
            32,
            "#00e0c6",
            "center",
            800,
          );
          text(
            `Провалов: ${s.deaths}  ·  Время: ${s.t.toFixed(1)} с`,
            W / 2,
            H / 2 + 58,
            16,
            "#8b98b8",
            "center",
            600,
          );
          text(
            "ПРОБЕЛ — заново",
            W / 2,
            H / 2 + 96,
            15,
            "#6c5ce7",
            "center",
            700,
          );
        }
      },
    };

    function overlap(p, r) {
      return (
        p.x < r.x + r.w && p.x + p.w > r.x && p.y < r.y + r.h && p.y + p.h > r.y
      );
    }
  }

  /* ============================================================
     ИГРА 3 — Orbit Recovery
     ============================================================ */
  function game3() {
    const STATION = { x: 450, y: 78, r: 46 };

    function newDebris() {
      let x,
        y,
        tries = 0;
      do {
        x = rnd(60, W - 60);
        y = rnd(160, H - 60);
        tries++;
      } while (dist(x, y, STATION.x, STATION.y) < 140 && tries < 30);
      return { x, y, vx: rnd(-25, 25), vy: rnd(-25, 25), r: 9, val: 1 };
    }

    function reset() {
      const debris = [];
      for (let i = 0; i < 7; i++) debris.push(newDebris());
      return {
        ship: { x: 450, y: 400, vx: 0, vy: 0, a: -Math.PI / 2, inv: 1.2 },
        debris,
        asteroids: [
          { x: 180, y: 220, vx: 55, vy: 40, r: 24 },
          { x: 720, y: 300, vx: -45, vy: 55, r: 28 },
          { x: 400, y: 480, vx: 60, vy: -35, r: 20 },
          { x: 640, y: 180, vx: -55, vy: -45, r: 22 },
        ],
        cargo: [],
        delivered: 0,
        lives: 3,
        spawnT: 3,
        state: "play",
        t: 0,
        msgT: 0,
        msg: "",
      };
    }

    return {
      init: reset,
      update(s, dt) {
        if (s.state !== "play") {
          if (just.Space || just.Enter) Object.assign(s, reset());
          return;
        }
        s.t += dt;
        if (s.msgT > 0) s.msgT -= dt;
        const sh = s.ship;
        if (sh.inv > 0) sh.inv -= dt;

        // Управление
        if (keys.KeyA || keys.ArrowLeft) sh.a -= 3.4 * dt;
        if (keys.KeyD || keys.ArrowRight) sh.a += 3.4 * dt;

        const thrust = 320;
        if (keys.KeyW || keys.ArrowUp) {
          sh.vx += Math.cos(sh.a) * thrust * dt;
          sh.vy += Math.sin(sh.a) * thrust * dt;
        }
        if (keys.KeyS || keys.ArrowDown) {
          sh.vx -= Math.cos(sh.a) * thrust * 0.7 * dt;
          sh.vy -= Math.sin(sh.a) * thrust * 0.7 * dt;
        }

        // Сопротивление (тяжелее с грузом)
        const drag = 0.55 + s.cargo.length * 0.12;
        sh.vx -= sh.vx * drag * dt;
        sh.vy -= sh.vy * drag * dt;

        // Масса груза влияет на разгон
        const massFactor = 1 / (1 + s.cargo.length * 0.35);
        sh.vx *= 1 + (massFactor - 1) * dt * 2;
        sh.vy *= 1 + (massFactor - 1) * dt * 2;

        const maxSp = 380;
        const sp = Math.hypot(sh.vx, sh.vy);
        if (sp > maxSp) {
          sh.vx = (sh.vx / sp) * maxSp;
          sh.vy = (sh.vy / sp) * maxSp;
        }

        sh.x += sh.vx * dt;
        sh.y += sh.vy * dt;

        // Границы
        if (sh.x < 26) {
          sh.x = 26;
          sh.vx *= -0.55;
        }
        if (sh.x > W - 26) {
          sh.x = W - 26;
          sh.vx *= -0.55;
        }
        if (sh.y < 26) {
          sh.y = 26;
          sh.vy *= -0.55;
        }
        if (sh.y > H - 26) {
          sh.y = H - 26;
          sh.vy *= -0.55;
        }

        // Магнит
        const magnetOn = keys.Space;
        if (magnetOn && s.cargo.length < 4) {
          let best = null,
            bestD = 1e9;
          for (const d of s.debris) {
            const dd = dist(d.x, d.y, sh.x, sh.y);
            if (dd < 190 && dd < bestD) {
              bestD = dd;
              best = d;
            }
          }
          if (best) {
            const ang = Math.atan2(sh.y - best.y, sh.x - best.x);
            best.vx += Math.cos(ang) * 700 * dt;
            best.vy += Math.sin(ang) * 700 * dt;
          }
        }

        // Мусор
        for (const d of s.debris) {
          d.x += d.vx * dt;
          d.y += d.vy * dt;
          d.vx *= 1 - 0.4 * dt;
          d.vy *= 1 - 0.4 * dt;
          if (d.x < 20) {
            d.x = 20;
            d.vx = Math.abs(d.vx) * 0.6;
          }
          if (d.x > W - 20) {
            d.x = W - 20;
            d.vx = -Math.abs(d.vx) * 0.6;
          }
          if (d.y < 20) {
            d.y = 20;
            d.vy = Math.abs(d.vy) * 0.6;
          }
          if (d.y > H - 20) {
            d.y = H - 20;
            d.vy = -Math.abs(d.vy) * 0.6;
          }

          if (!d.taken && dist(d.x, d.y, sh.x, sh.y) < 26) {
            d.taken = true;
            s.cargo.push({});
            s.msg = "Груз зацеплен!";
            s.msgT = 1.2;
          }
        }
        s.debris = s.debris.filter((d) => !d.taken);

        // Спавн нового мусора
        s.spawnT -= dt;
        if (s.spawnT <= 0 && s.debris.length < 7) {
          s.spawnT = 3.2;
          s.debris.push(newDebris());
        }

        // Разгрузка
        if (
          s.cargo.length > 0 &&
          dist(sh.x, sh.y, STATION.x, STATION.y) < STATION.r + 26
        ) {
          s.delivered += s.cargo.length;
          s.msg = `Сдано: +${s.cargo.length}`;
          s.msgT = 1.4;
          s.cargo = [];
        }

        // Астероиды
        for (const a of s.asteroids) {
          a.x += a.vx * dt;
          a.y += a.vy * dt;
          if (a.x < a.r + 18 || a.x > W - a.r - 18) a.vx *= -1;
          if (a.y < a.r + 18 || a.y > H - a.r - 18) a.vy *= -1;
          a.x = clamp(a.x, a.r + 18, W - a.r - 18);
          a.y = clamp(a.y, a.r + 18, H - a.r - 18);

          if (sh.inv <= 0 && dist(a.x, a.y, sh.x, sh.y) < a.r + 14) {
            s.lives--;
            s.cargo = [];
            sh.x = 450;
            sh.y = 400;
            sh.vx = 0;
            sh.vy = 0;
            sh.inv = 1.6;
            s.msg = "Столкновение! Груз потерян";
            s.msgT = 1.6;
          }
        }

        if (s.delivered >= 6) s.state = "win";
        if (s.lives <= 0) s.state = "lose";
      },

      draw(s) {
        ctx.fillStyle = "#05070f";
        ctx.fillRect(0, 0, W, H);

        // Звёзды
        for (let i = 0; i < 90; i++) {
          const x = (i * 173.7) % W;
          const y = (i * 91.3) % H;
          const a = 0.08 + ((i * 37) % 20) / 100;
          ctx.fillStyle = `rgba(180,200,255,${a})`;
          ctx.fillRect(x, y, 1.6, 1.6);
        }

        // Станция
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 400);
        ctx.shadowBlur = 28 + pulse * 18;
        ctx.shadowColor = "#00e0c6";
        ctx.strokeStyle = "rgba(0,224,198,.55)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(STATION.x, STATION.y, STATION.r, 0, TAU);
        ctx.stroke();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(0,224,198,.10)";
        ctx.beginPath();
        ctx.arc(STATION.x, STATION.y, STATION.r, 0, TAU);
        ctx.fill();
        text("🏭", STATION.x, STATION.y + 10, 34, "#fff", "center");
        text(
          "ПЕРЕРАБОТКА",
          STATION.x,
          STATION.y + STATION.r + 20,
          11,
          "#00e0c6",
          "center",
          800,
        );

        // Мусор
        for (const d of s.debris) {
          ctx.fillStyle = "#ffd166";
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#ffd166";
          ctx.beginPath();
          ctx.moveTo(d.x, d.y - d.r);
          ctx.lineTo(d.x + d.r, d.y);
          ctx.lineTo(d.x, d.y + d.r);
          ctx.lineTo(d.x - d.r, d.y);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Астероиды
        for (const a of s.asteroids) {
          ctx.fillStyle = "#3d4560";
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#4d5674";
          ctx.beginPath();
          ctx.arc(a.x - a.r * 0.3, a.y - a.r * 0.3, a.r * 0.45, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "rgba(255,77,94,.35)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(a.x, a.y, a.r + 4, 0, TAU);
          ctx.stroke();
        }

        // Магнитное поле
        if (keys.Space && s.cargo.length < 4) {
          ctx.strokeStyle = "rgba(108,92,231,.28)";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(s.ship.x, s.ship.y, 190, 0, TAU);
          ctx.stroke();
          ctx.strokeStyle = "rgba(108,92,231,.12)";
          ctx.beginPath();
          ctx.arc(s.ship.x, s.ship.y, 120, 0, TAU);
          ctx.stroke();
        }

        // Корабль
        const sh = s.ship;
        if (sh.inv <= 0 || Math.floor(performance.now() / 90) % 2 === 0) {
          ctx.save();
          ctx.translate(sh.x, sh.y);
          ctx.rotate(sh.a);
          ctx.shadowBlur = 18;
          ctx.shadowColor = "#6c5ce7";
          ctx.fillStyle = "#8b7bff";
          ctx.beginPath();
          ctx.moveTo(18, 0);
          ctx.lineTo(-12, -12);
          ctx.lineTo(-6, 0);
          ctx.lineTo(-12, 12);
          ctx.closePath();
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.restore();
        }

        // Груз за кораблём
        s.cargo.forEach((c, i) => {
          const ang = sh.a + Math.PI + (i - (s.cargo.length - 1) / 2) * 0.5;
          const cx = sh.x + Math.cos(ang) * 28;
          const cy = sh.y + Math.sin(ang) * 28;
          ctx.fillStyle = "#ffd166";
          ctx.beginPath();
          ctx.arc(cx, cy, 7, 0, TAU);
          ctx.fill();
        });

        // HUD
        ctx.fillStyle = "rgba(10,14,26,.82)";
        rr(20, 18, 300, 44, 12);
        ctx.fill();
        text(
          `Сдано груза: ${s.delivered} / 6`,
          36,
          46,
          15,
          "#00e0c6",
          "left",
          800,
        );

        ctx.fillStyle = "rgba(10,14,26,.82)";
        rr(W - 260, 18, 240, 44, 12);
        ctx.fill();
        text(
          "Корпус: " + "❤️".repeat(Math.max(0, s.lives)),
          W - 36,
          46,
          15,
          "#ff4d5e",
          "right",
          800,
        );

        if (s.msgT > 0) {
          ctx.globalAlpha = Math.min(1, s.msgT);
          ctx.fillStyle = "rgba(10,14,26,.9)";
          rr(W / 2 - 170, H - 74, 340, 42, 12);
          ctx.fill();
          text(s.msg, W / 2, H - 46, 15, "#ffd166", "center", 700);
          ctx.globalAlpha = 1;
        }

        if (s.state !== "play") {
          ctx.fillStyle = "rgba(6,9,16,.86)";
          ctx.fillRect(0, 0, W, H);
          const win = s.state === "win";
          text(win ? "🏭" : "☄️", W / 2, H / 2 - 40, 64, "#fff", "center");
          text(
            win ? "Норма по переработке выполнена!" : "Буксир уничтожен",
            W / 2,
            H / 2 + 20,
            30,
            win ? "#00e0c6" : "#ff4d5e",
            "center",
            800,
          );
          text(
            `Сдано груза: ${s.delivered} · Время: ${s.t.toFixed(1)} с`,
            W / 2,
            H / 2 + 58,
            16,
            "#8b98b8",
            "center",
            600,
          );
          text(
            "ПРОБЕЛ — заново",
            W / 2,
            H / 2 + 96,
            15,
            "#6c5ce7",
            "center",
            700,
          );
        }
      },
    };
  }

  /* ============================================================
     ИГРА 4 — Shadow Protocol
     ============================================================ */
  function game4() {
    const WALLS = [
      { x: 0, y: 0, w: W, h: 20 },
      { x: 0, y: H - 20, w: W, h: 20 },
      { x: 0, y: 0, w: 20, h: H },
      { x: W - 20, y: 0, w: 20, h: H },
      { x: 220, y: 130, w: 22, h: 110 },
      { x: 420, y: 300, w: 22, h: 110 },
      { x: 640, y: 130, w: 22, h: 110 },
    ];

    const START = { x: 62, y: 480 };
    const DATA = { x: 838, y: 480, r: 18 };
    const EXIT = { x: 62, y: 70, r: 20 };

    function guardPaths() {
      return [
        {
          pts: [
            { x: 90, y: 90 },
            { x: 810, y: 90 },
          ],
        },
        {
          pts: [
            { x: 810, y: 270 },
            { x: 90, y: 270 },
          ],
        },
        {
          pts: [
            { x: 90, y: 450 },
            { x: 810, y: 450 },
          ],
        },
      ];
    }

    function reset() {
      const gs = guardPaths().map((p, i) => ({
        pts: p.pts,
        i: 0,
        x: p.pts[0].x,
        y: p.pts[0].y,
        ang: 0,
        speed: 62 + i * 6,
      }));
      return {
        p: { x: START.x, y: START.y, r: 11 },
        guards: gs,
        hasData: false,
        state: "play",
        alertT: 0,
        t: 0,
        tries: 1,
      };
    }

    function losBlocked(x1, y1, x2, y2) {
      const d = dist(x1, y1, x2, y2);
      const steps = Math.ceil(d / 10);
      for (let i = 1; i < steps; i++) {
        const t = i / steps;
        const px = x1 + (x2 - x1) * t;
        const py = y1 + (y2 - y1) * t;
        for (const w of WALLS) {
          if (px > w.x && px < w.x + w.w && py > w.y && py < w.y + w.h)
            return true;
        }
      }
      return false;
    }

    function sees(g, p) {
      const d = dist(g.x, g.y, p.x, p.y);
      const range = 175;
      if (d > range) return false;
      const ang = Math.atan2(p.y - g.y, p.x - g.x);
      let diff = Math.abs(ang - g.ang);
      while (diff > Math.PI) diff = Math.abs(diff - TAU);
      if (diff > 0.62) return false; // ~70°
      return !losBlocked(g.x, g.y, p.x, p.y);
    }

    return {
      init: reset,
      update(s, dt) {
        if (s.alertT > 0) {
          s.alertT -= dt;
          if (s.alertT <= 0) {
            const keep = s.tries + 1;
            Object.assign(s, reset());
            s.tries = keep;
          }
          return;
        }
        if (s.state !== "play") {
          if (just.Space || just.Enter) Object.assign(s, reset());
          return;
        }

        s.t += dt;
        const p = s.p;
        const sp = keys.ShiftLeft || keys.ShiftRight ? 90 : 175;
        let dx = 0,
          dy = 0;
        if (keys.KeyW || keys.ArrowUp) dy--;
        if (keys.KeyS || keys.ArrowDown) dy++;
        if (keys.KeyA || keys.ArrowLeft) dx--;
        if (keys.KeyD || keys.ArrowRight) dx++;

        if (dx || dy) {
          const l = Math.hypot(dx, dy);
          const nx = p.x + (dx / l) * sp * dt;
          const ny = p.y + (dy / l) * sp * dt;
          if (!hitsWall(nx, p.y, p.r)) p.x = nx;
          if (!hitsWall(p.x, ny, p.r)) p.y = ny;
        }

        // Охрана
        for (const g of s.guards) {
          const target = g.pts[g.i];
          const d = dist(g.x, g.y, target.x, target.y);
          if (d < 6) {
            g.i = (g.i + 1) % g.pts.length;
          } else {
            const ang = Math.atan2(target.y - g.y, target.x - g.x);
            g.x += Math.cos(ang) * g.speed * dt;
            g.y += Math.sin(ang) * g.speed * dt;
            let diff = ang - g.ang;
            while (diff > Math.PI) diff -= TAU;
            while (diff < -Math.PI) diff += TAU;
            g.ang += diff * Math.min(1, dt * 6);
          }
          if (sees(g, p)) {
            s.alertT = 1.3;
            s.state = "caught";
            return;
          }
        }

        // Данные
        if (!s.hasData && dist(p.x, p.y, DATA.x, DATA.y) < DATA.r + p.r + 6) {
          s.hasData = true;
        }

        // Эвакуация
        if (s.hasData && dist(p.x, p.y, EXIT.x, EXIT.y) < EXIT.r + p.r + 6) {
          s.state = "win";
        }
      },

      draw(s) {
        // Свет/тень
        const grd = ctx.createRadialGradient(
          W / 2,
          H / 2,
          60,
          W / 2,
          H / 2,
          700,
        );
        grd.addColorStop(0, "#101a30");
        grd.addColorStop(1, "#060a14");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        // Пол
        ctx.strokeStyle = "rgba(108,92,231,.07)";
        ctx.lineWidth = 1;
        for (let x = 20; x < W; x += 50) {
          ctx.beginPath();
          ctx.moveTo(x, 20);
          ctx.lineTo(x, H - 20);
          ctx.stroke();
        }
        for (let y = 20; y < H; y += 50) {
          ctx.beginPath();
          ctx.moveTo(20, y);
          ctx.lineTo(W - 20, y);
          ctx.stroke();
        }

        // Стены
        for (const w of WALLS) {
          ctx.fillStyle = "#1a2338";
          ctx.fillRect(w.x, w.y, w.w, w.h);
          ctx.strokeStyle = "rgba(120,140,200,.28)";
          ctx.lineWidth = 2;
          ctx.strokeRect(w.x + 1, w.y + 1, w.w - 2, w.h - 2);
        }

        // Точка эвакуации
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 350);
        ctx.strokeStyle = s.hasData ? "#00e0c6" : "rgba(120,140,200,.3)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(EXIT.x, EXIT.y, EXIT.r, 0, TAU);
        ctx.stroke();
        if (s.hasData) {
          ctx.globalAlpha = 0.25 + pulse * 0.3;
          ctx.fillStyle = "#00e0c6";
          ctx.beginPath();
          ctx.arc(EXIT.x, EXIT.y, EXIT.r, 0, TAU);
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        text(
          "ВЫХОД",
          EXIT.x + 34,
          EXIT.y + 5,
          11,
          s.hasData ? "#00e0c6" : "#5a6480",
          "left",
          800,
        );

        // Сервер
        ctx.fillStyle = s.hasData ? "#3d4560" : "#4dabf7";
        ctx.shadowBlur = s.hasData ? 0 : 20;
        ctx.shadowColor = "#4dabf7";
        rr(DATA.x - 20, DATA.y - 26, 40, 52, 8);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#0b1020";
        for (let i = 0; i < 3; i++)
          ctx.fillRect(DATA.x - 13, DATA.y - 18 + i * 14, 26, 7);
        text(
          s.hasData ? "ДАННЫЕ УКРАДЕНЫ" : "СЕРВЕР",
          DATA.x - 30,
          DATA.y - 36,
          11,
          s.hasData ? "#00e0c6" : "#4dabf7",
          "left",
          800,
        );

        // Конусы обзора
        for (const g of s.guards) {
          const range = 175,
            half = 0.62;
          const grad = ctx.createRadialGradient(g.x, g.y, 8, g.x, g.y, range);
          grad.addColorStop(0, "rgba(255,209,102,.30)");
          grad.addColorStop(1, "rgba(255,209,102,0)");
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.moveTo(g.x, g.y);
          ctx.arc(g.x, g.y, range, g.ang - half, g.ang + half);
          ctx.closePath();
          ctx.fill();

          // Луч до стены/игрока
          ctx.strokeStyle = "rgba(255,209,102,.22)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(g.x, g.y);
          ctx.lineTo(
            g.x + Math.cos(g.ang) * range,
            g.y + Math.sin(g.ang) * range,
          );
          ctx.stroke();
        }

        // Охрана
        for (const g of s.guards) {
          ctx.fillStyle = "#ffb020";
          ctx.beginPath();
          ctx.arc(g.x, g.y, 12, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#2a1d05";
          ctx.beginPath();
          ctx.arc(
            g.x + Math.cos(g.ang) * 5,
            g.y + Math.sin(g.ang) * 5,
            4,
            0,
            TAU,
          );
          ctx.fill();
        }

        // Игрок
        const p = s.p;
        ctx.shadowBlur = 18;
        ctx.shadowColor = "#6c5ce7";
        ctx.fillStyle = s.hasData ? "#00e0c6" : "#8b7bff";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        if (s.hasData) {
          ctx.fillStyle = "#0b1020";
          text("📁", p.x, p.y + 5, 13, "#fff", "center");
        }

        // HUD
        ctx.fillStyle = "rgba(10,14,26,.85)";
        rr(20, H - 62, 420, 44, 12);
        ctx.fill();
        text(
          s.hasData
            ? "📁 Данные получены → бегите к выходу"
            : "🔍 Найдите сервер в правом нижнем углу",
          36,
          H - 34,
          14,
          s.hasData ? "#00e0c6" : "#8b98b8",
          "left",
          700,
        );

        ctx.fillStyle = "rgba(10,14,26,.85)";
        rr(W - 260, H - 62, 240, 44, 12);
        ctx.fill();
        text(
          `Попытка: ${s.tries}`,
          W - 36,
          H - 34,
          14,
          "#8b98b8",
          "right",
          700,
        );

        if (s.alertT > 0) {
          ctx.fillStyle = `rgba(255,77,94,${0.18 + 0.14 * Math.sin(performance.now() / 60)})`;
          ctx.fillRect(0, 0, W, H);
          text(
            "⚠️ ОБНАРУЖЕН! УРОВЕНЬ ПЕРЕЗАПУСКАЕТСЯ",
            W / 2,
            H / 2,
            26,
            "#ff4d5e",
            "center",
            800,
          );
        }

        if (s.state === "win") {
          ctx.fillStyle = "rgba(6,9,16,.86)";
          ctx.fillRect(0, 0, W, H);
          text("🕶️", W / 2, H / 2 - 40, 64, "#fff", "center");
          text(
            "Данные у корпорации. Вы ушли чисто.",
            W / 2,
            H / 2 + 20,
            28,
            "#00e0c6",
            "center",
            800,
          );
          text(
            `Попыток: ${s.tries} · Время: ${s.t.toFixed(1)} с`,
            W / 2,
            H / 2 + 58,
            16,
            "#8b98b8",
            "center",
            600,
          );
          text(
            "ПРОБЕЛ — заново",
            W / 2,
            H / 2 + 96,
            15,
            "#6c5ce7",
            "center",
            700,
          );
        }
      },
    };

    function hitsWall(x, y, r) {
      for (const w of WALLS) {
        if (circleRect(x, y, r, w)) return true;
      }
      return false;
    }
  }

  /* ============================================================
     ИГРА 5 — Core Override
     ============================================================ */
  function game5() {
    function reset() {
      return {
        p: {
          x: 450,
          y: 420,
          r: 13,
          vx: 0,
          vy: 0,
          hp: 3,
          inv: 0,
          dashCd: 0,
          shootCd: 0,
        },
        boss: {
          x: 450,
          y: 175,
          r: 58,
          hp: 320,
          max: 320,
          phase: 1,
          fireT: 2,
          ang: 0,
          laserAng: 0,
        },
        bullets: [],
        pbullets: [],
        lasers: [],
        t: 0,
        state: "play",
        hitFlash: 0,
      };
    }

    return {
      init: reset,
      update(s, dt) {
        if (s.state !== "play") {
          if (just.Space || just.Enter) Object.assign(s, reset());
          return;
        }
        s.t += dt;
        if (s.hitFlash > 0) s.hitFlash -= dt;

        const p = s.p;
        const speed = 245;
        let dx = 0,
          dy = 0;
        if (keys.KeyW || keys.ArrowUp) dy--;
        if (keys.KeyS || keys.ArrowDown) dy++;
        if (keys.KeyA || keys.ArrowLeft) dx--;
        if (keys.KeyD || keys.ArrowRight) dx++;
        if (dx || dy) {
          const l = Math.hypot(dx, dy);
          p.vx = (dx / l) * speed;
          p.vy = (dy / l) * speed;
        } else {
          p.vx *= 0.75;
          p.vy *= 0.75;
        }

        if (p.dashCd > 0) p.dashCd -= dt;
        if (just.Space && p.dashCd <= 0) {
          const m = Math.hypot(dx, dy) || 1;
          p.vx = (dx / m) * 760;
          p.vy = (dy / m) * 760;
          p.dashCd = 1.4;
          p.inv = Math.max(p.inv, 0.32);
        }

        p.x = clamp(p.x + p.vx * dt, 30, W - 30);
        p.y = clamp(p.y + p.vy * dt, 30, H - 30);
        if (p.inv > 0) p.inv -= dt;

        // Стрельба
        if (p.shootCd > 0) p.shootCd -= dt;
        if (mouse.down && p.shootCd <= 0) {
          p.shootCd = 0.16;
          const ang = Math.atan2(mouse.y - p.y, mouse.x - p.x);
          s.pbullets.push({
            x: p.x,
            y: p.y,
            vx: Math.cos(ang) * 640,
            vy: Math.sin(ang) * 640,
            r: 5,
          });
        }

        // Босс
        const b = s.boss;
        const hpRatio = b.hp / b.max;
        b.phase = hpRatio > 0.62 ? 1 : hpRatio > 0.3 ? 2 : 3;

        const interval = b.phase === 1 ? 1.6 : b.phase === 2 ? 1.15 : 0.85;
        b.fireT -= dt;
        if (b.fireT <= 0) {
          b.fireT = interval;
          const count = b.phase === 1 ? 14 : b.phase === 2 ? 18 : 24;
          const speedB = b.phase === 3 ? 190 : 150;
          for (let i = 0; i < count; i++) {
            const a = (i / count) * TAU + b.ang;
            s.bullets.push({
              x: b.x,
              y: b.y,
              vx: Math.cos(a) * speedB,
              vy: Math.sin(a) * speedB,
              r: 6,
            });
          }
          b.ang += 0.35;
        }

        // Лазеры (фаза 2+)
        s.lasers = [];
        if (b.phase >= 2) {
          b.laserAng += dt * (b.phase === 3 ? 1.5 : 0.9);
          const n = b.phase === 3 ? 4 : 3;
          for (let i = 0; i < n; i++) {
            s.lasers.push(b.laserAng + (i / n) * TAU);
          }
        }

        // Снаряды босса
        for (const bl of s.bullets) {
          bl.x += bl.vx * dt;
          bl.y += bl.vy * dt;
          if (bl.x < -30 || bl.x > W + 30 || bl.y < -30 || bl.y > H + 30)
            bl.dead = true;
          else if (p.inv <= 0 && dist(bl.x, bl.y, p.x, p.y) < bl.r + p.r) {
            bl.dead = true;
            p.hp--;
            p.inv = 1.2;
            s.hitFlash = 0.25;
          }
        }
        s.bullets = s.bullets.filter((b2) => !b2.dead);

        // Лазеры урон
        for (const a of s.lasers) {
          const dxp = p.x - b.x,
            dyp = p.y - b.y;
          const proj = dxp * Math.cos(a) + dyp * Math.sin(a);
          if (proj < 0) continue;
          const perp = Math.abs(-dxp * Math.sin(a) + dyp * Math.cos(a));
          if (perp < 14 + p.r && p.inv <= 0) {
            p.hp--;
            p.inv = 1.2;
            s.hitFlash = 0.25;
          }
        }

        // Пули игрока
        for (const bl of s.pbullets) {
          bl.x += bl.vx * dt;
          bl.y += bl.vy * dt;
          if (bl.x < -20 || bl.x > W + 20 || bl.y < -20 || bl.y > H + 20)
            bl.dead = true;
          else if (dist(bl.x, bl.y, b.x, b.y) < b.r + bl.r) {
            bl.dead = true;
            b.hp -= 6;
          }
        }
        s.pbullets = s.pbullets.filter((b2) => !b2.dead);

        if (b.hp <= 0) {
          b.hp = 0;
          s.state = "win";
        }
        if (p.hp <= 0) s.state = "lose";
      },

      draw(s) {
        const grd = ctx.createRadialGradient(W / 2, 175, 30, W / 2, 175, 600);
        grd.addColorStop(0, "#1a1030");
        grd.addColorStop(1, "#07080f");
        ctx.fillStyle = grd;
        ctx.fillRect(0, 0, W, H);

        // Арена
        ctx.strokeStyle = "rgba(108,92,231,.18)";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(W / 2, 175, 300, 0, TAU);
        ctx.stroke();
        ctx.strokeStyle = "rgba(108,92,231,.08)";
        ctx.beginPath();
        ctx.arc(W / 2, 175, 200, 0, TAU);
        ctx.stroke();

        const b = s.boss;

        // Лазеры
        for (const a of s.lasers) {
          ctx.strokeStyle = "rgba(255,77,125,.45)";
          ctx.lineWidth = 10;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x + Math.cos(a) * 1200, b.y + Math.sin(a) * 1200);
          ctx.stroke();
          ctx.strokeStyle = "rgba(255,180,210,.9)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(b.x + Math.cos(a) * 1200, b.y + Math.sin(a) * 1200);
          ctx.stroke();
        }

        // Босс
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 260);
        ctx.shadowBlur = 34 + pulse * 20;
        ctx.shadowColor =
          b.phase === 3 ? "#ff4d5e" : b.phase === 2 ? "#ffb020" : "#6c5ce7";
        ctx.fillStyle =
          b.phase === 3 ? "#ff4d5e" : b.phase === 2 ? "#ffb020" : "#6c5ce7";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(8,10,18,.7)";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r * 0.55, 0, TAU);
        ctx.fill();
        ctx.fillStyle = "#fff";
        ctx.beginPath();
        ctx.arc(b.x - 14, b.y - 6, 6 + pulse * 2, 0, TAU);
        ctx.arc(b.x + 14, b.y - 6, 6 + pulse * 2, 0, TAU);
        ctx.fill();

        // Снаряды босса
        for (const bl of s.bullets) {
          ctx.fillStyle = "#ff4d7d";
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#ff4d7d";
          ctx.beginPath();
          ctx.arc(bl.x, bl.y, bl.r, 0, TAU);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Пули игрока
        for (const bl of s.pbullets) {
          ctx.fillStyle = "#00e0c6";
          ctx.shadowBlur = 12;
          ctx.shadowColor = "#00e0c6";
          ctx.beginPath();
          ctx.arc(bl.x, bl.y, bl.r, 0, TAU);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Игрок
        const p = s.p;
        if (p.inv <= 0 || Math.floor(performance.now() / 80) % 2 === 0) {
          ctx.shadowBlur = 20;
          ctx.shadowColor = "#00e0c6";
          ctx.fillStyle = "#00e0c6";
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, TAU);
          ctx.fill();
          ctx.shadowBlur = 0;
          // Прицел
          const aim = Math.atan2(mouse.y - p.y, mouse.x - p.x);
          ctx.strokeStyle = "rgba(0,224,198,.6)";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.moveTo(p.x + Math.cos(aim) * 16, p.y + Math.sin(aim) * 16);
          ctx.lineTo(p.x + Math.cos(aim) * 28, p.y + Math.sin(aim) * 28);
          ctx.stroke();
        }

        // HUD: HP босса
        ctx.fillStyle = "rgba(10,14,26,.85)";
        rr(W / 2 - 250, 22, 500, 26, 13);
        ctx.fill();
        const ratio = b.hp / b.max;
        const barGrd = ctx.createLinearGradient(W / 2 - 246, 0, W / 2 + 246, 0);
        barGrd.addColorStop(0, "#ff4d7d");
        barGrd.addColorStop(1, "#ffb020");
        ctx.fillStyle = barGrd;
        rr(W / 2 - 246, 27, 492 * ratio, 16, 8);
        ctx.fill();
        text(`БОСС · ФАЗА ${b.phase}`, W / 2, 70, 14, "#ff8fb0", "center", 800);

        // HUD: игрок
        ctx.fillStyle = "rgba(10,14,26,.85)";
        rr(20, H - 66, 240, 46, 12);
        ctx.fill();
        text(
          "❤️".repeat(Math.max(0, p.hp)) + "·".repeat(Math.max(0, 3 - p.hp)),
          36,
          H - 36,
          16,
          "#ff4d7d",
          "left",
          800,
        );

        ctx.fillStyle = "rgba(10,14,26,.85)";
        rr(W - 300, H - 66, 280, 46, 12);
        ctx.fill();
        text(
          p.dashCd <= 0
            ? "⚡ Рывок готов (Пробел)"
            : `⚡ Рывок: ${p.dashCd.toFixed(1)} с`,
          W - 36,
          H - 36,
          14,
          p.dashCd <= 0 ? "#00e0c6" : "#5a6480",
          "right",
          700,
        );

        if (s.hitFlash > 0) {
          ctx.fillStyle = `rgba(255,77,94,${s.hitFlash * 0.6})`;
          ctx.fillRect(0, 0, W, H);
        }

        if (s.state !== "play") {
          ctx.fillStyle = "rgba(6,9,16,.86)";
          ctx.fillRect(0, 0, W, H);
          const win = s.state === "win";
          text(win ? "💥" : "☠️", W / 2, H / 2 - 40, 64, "#fff", "center");
          text(
            win ? "ГЛАВНЫЙ МОДУЛЬ УНИЧТОЖЕН" : "ЯДРО ПЕРЕЗАГРУЖЕНО",
            W / 2,
            H / 2 + 20,
            30,
            win ? "#00e0c6" : "#ff4d5e",
            "center",
            800,
          );
          text(
            `Время боя: ${s.t.toFixed(1)} с`,
            W / 2,
            H / 2 + 58,
            16,
            "#8b98b8",
            "center",
            600,
          );
          text(
            "ПРОБЕЛ — заново",
            W / 2,
            H / 2 + 96,
            15,
            "#6c5ce7",
            "center",
            700,
          );
        }
      },
    };
  }

  /* ============================================================
     ИГРА 6 — Infection Vector
     ============================================================ */
  function game6() {
    const START = { x: 46, y: 270 };
    const CORE = { x: 856, y: 270, r: 26 };

    function reset() {
      return {
        path: [{ x: START.x, y: START.y }],
        state: "plan",
        units: [],
        bullets: [],
        turrets: [
          { x: 250, y: 140, r: 16, range: 128, cd: 0, stun: 0 },
          { x: 250, y: 400, r: 16, range: 128, cd: 0, stun: 0 },
          { x: 450, y: 270, r: 16, range: 132, cd: 0, stun: 0 },
          { x: 650, y: 140, r: 16, range: 128, cd: 0, stun: 0 },
          { x: 650, y: 400, r: 16, range: 128, cd: 0, stun: 0 },
        ],
        empUsed: false,
        spawnQueue: 0,
        spawned: 0,
        t: 0,
        msg: "Кликайте по карте, чтобы проложить маршрут",
        msgT: 3,
      };
    }

    function moveAlong(u, path, dt, speed) {
      let remaining = speed * dt;
      let guard = 0;
      while (remaining > 0 && u.seg < path.length - 1 && guard < 50) {
        guard++;
        const a = path[u.seg],
          b = path[u.seg + 1];
        const d = Math.hypot(b.x - a.x, b.y - a.y) || 0.001;
        const need = d - u.d;
        if (remaining < need) {
          u.d += remaining;
          remaining = 0;
        } else {
          remaining -= need;
          u.seg++;
          u.d = 0;
        }
      }
      if (u.seg >= path.length - 1) {
        u.done = true;
        return;
      }
      const a = path[u.seg],
        b = path[u.seg + 1];
      const d = Math.hypot(b.x - a.x, b.y - a.y) || 1;
      u.x = a.x + (b.x - a.x) * (u.d / d);
      u.y = a.y + (b.y - a.y) * (u.d / d);
    }

    return {
      init: reset,
      update(s, dt) {
        if (s.state === "win" || s.state === "lose") {
          if (just.Space || just.Enter) Object.assign(s, reset());
          return;
        }
        s.t += dt;
        if (s.msgT > 0) s.msgT -= dt;

        /* ---- Фаза планирования ---- */
        if (s.state === "plan") {
          if (mouse.clicked) {
            const last = s.path[s.path.length - 1];
            const pt = {
              x: clamp(mouse.x, 26, W - 26),
              y: clamp(mouse.y, 26, H - 26),
            };
            if (dist(pt.x, pt.y, last.x, last.y) > 45 && s.path.length < 9) {
              s.path.push(pt);
            }
          }
          if (just.Backspace && s.path.length > 1) s.path.pop();

          if (just.Enter || just.Space) {
            if (s.path.length < 2) {
              s.msg = "Нужно минимум 2 точки маршрута!";
              s.msgT = 2;
            } else {
              s.path.push({ x: CORE.x, y: CORE.y });
              s.state = "run";
              s.spawnQueue = 0;
              s.spawned = 0;
              s.msg = "Отряд запущен! E — EMP-импульс";
              s.msgT = 2.5;
            }
          }
          return;
        }

        /* ---- Фаза прорыва ---- */
        s.spawnQueue -= dt;
        if (s.spawned < 3 && s.spawnQueue <= 0) {
          s.spawnQueue = 0.85;
          s.spawned++;
          const a = s.path[0],
            b = s.path[1];
          s.units.push({
            x: a.x,
            y: a.y,
            seg: 0,
            d: 0,
            hp: 70,
            max: 70,
            vx: Math.cos(Math.atan2(b.y - a.y, b.x - a.x)) * 95,
            vy: Math.sin(Math.atan2(b.y - a.y, b.x - a.x)) * 95,
          });
        }

        for (const u of s.units) {
          if (u.done) continue;
          const px = u.x,
            py = u.y;
          moveAlong(u, s.path, dt, 95);
          u.vx = (u.x - px) / dt;
          u.vy = (u.y - py) / dt;
          if (u.done) s.state = "win";
        }

        // EMP
        if (just.KeyE && !s.empUsed) {
          s.empUsed = true;
          s.turrets.forEach((t) => (t.stun = 3));
          s.msg = "⚡ EMP! Турели оглушены на 3 с";
          s.msgT = 1.8;
        }

        // Турели
        for (const t of s.turrets) {
          if (t.stun > 0) {
            t.stun -= dt;
            continue;
          }
          if (t.cd > 0) t.cd -= dt;
          if (t.cd <= 0) {
            let target = null,
              bestD = 1e9;
            for (const u of s.units) {
              if (u.done || u.hp <= 0) continue;
              const d = dist(t.x, t.y, u.x, u.y);
              if (d < t.range && d < bestD) {
                bestD = d;
                target = u;
              }
            }
            if (target) {
              t.cd = 1.05;
              const lead = (bestD / 340) * 0.7;
              const tx = target.x + target.vx * lead;
              const ty = target.y + target.vy * lead;
              const ang = Math.atan2(ty - t.y, tx - t.x);
              s.bullets.push({
                x: t.x,
                y: t.y,
                vx: Math.cos(ang) * 340,
                vy: Math.sin(ang) * 340,
                r: 5,
              });
            }
          }
        }

        // Пули
        for (const b of s.bullets) {
          b.x += b.vx * dt;
          b.y += b.vy * dt;
          if (b.x < -20 || b.x > W + 20 || b.y < -20 || b.y > H + 20) {
            b.dead = true;
            continue;
          }
          for (const u of s.units) {
            if (u.done || u.hp <= 0) continue;
            if (dist(b.x, b.y, u.x, u.y) < b.r + 9) {
              b.dead = true;
              u.hp -= 13;
              break;
            }
          }
        }
        s.bullets = s.bullets.filter((b) => !b.dead);
        s.units = s.units.filter((u) => u.hp > 0);

        if (s.units.length === 0 && s.spawned >= 3) s.state = "lose";
      },

      draw(s) {
        ctx.fillStyle = "#070b14";
        ctx.fillRect(0, 0, W, H);

        // Сетка
        ctx.strokeStyle = "rgba(81,207,102,.07)";
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 40) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        for (let y = 0; y < H; y += 40) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }

        // Радиусы турелей
        for (const t of s.turrets) {
          ctx.fillStyle =
            t.stun > 0 ? "rgba(90,100,128,.06)" : "rgba(255,77,94,.07)";
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.range, 0, TAU);
          ctx.fill();
          ctx.strokeStyle =
            t.stun > 0 ? "rgba(90,100,128,.3)" : "rgba(255,77,94,.25)";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.range, 0, TAU);
          ctx.stroke();
        }

        // Маршрут
        if (s.path.length > 1) {
          ctx.strokeStyle = "rgba(0,224,198,.65)";
          ctx.lineWidth = 3;
          ctx.setLineDash([10, 8]);
          ctx.beginPath();
          ctx.moveTo(s.path[0].x, s.path[0].y);
          for (let i = 1; i < s.path.length; i++)
            ctx.lineTo(s.path[i].x, s.path[i].y);
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Точки маршрута
        if (s.state === "plan") {
          s.path.forEach((p, i) => {
            if (i === 0) return;
            ctx.fillStyle = "#00e0c6";
            ctx.beginPath();
            ctx.arc(p.x, p.y, 7, 0, TAU);
            ctx.fill();
            text(String(i), p.x, p.y - 12, 11, "#00e0c6", "center", 800);
          });
        }

        // Ядро
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 320);
        ctx.shadowBlur = 26 + pulse * 16;
        ctx.shadowColor = "#51cf66";
        ctx.fillStyle = "#51cf66";
        ctx.beginPath();
        ctx.arc(CORE.x, CORE.y, CORE.r, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        text("CORE", CORE.x, CORE.y + 5, 12, "#04170a", "center", 800);

        // Старт
        ctx.strokeStyle = "rgba(0,224,198,.6)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(START.x, START.y, 20, 0, TAU);
        ctx.stroke();
        text("ВХОД", START.x, START.y - 30, 11, "#00e0c6", "center", 800);

        // Турели
        for (const t of s.turrets) {
          ctx.fillStyle = t.stun > 0 ? "#5a6480" : "#ff4d5e";
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r, 0, TAU);
          ctx.fill();
          ctx.strokeStyle = "#1a0510";
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(t.x, t.y, t.r * 0.5, 0, TAU);
          ctx.stroke();
          if (t.stun > 0) text("⚡", t.x, t.y - 24, 16, "#ffd166", "center");
        }

        // Пули
        for (const b of s.bullets) {
          ctx.fillStyle = "#ff4d7d";
          ctx.shadowBlur = 10;
          ctx.shadowColor = "#ff4d7d";
          ctx.beginPath();
          ctx.arc(b.x, b.y, b.r, 0, TAU);
          ctx.fill();
          ctx.shadowBlur = 0;
        }

        // Юниты
        for (const u of s.units) {
          ctx.fillStyle = "#00e0c6";
          ctx.shadowBlur = 14;
          ctx.shadowColor = "#00e0c6";
          rr(u.x - 9, u.y - 9, 18, 18, 5);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "rgba(0,0,0,.5)";
          ctx.fillRect(u.x - 13, u.y - 20, 26, 4);
          ctx.fillStyle = "#51cf66";
          ctx.fillRect(u.x - 13, u.y - 20, 26 * (u.hp / u.max), 4);
        }

        // HUD
        ctx.fillStyle = "rgba(10,14,26,.85)";
        rr(20, 18, 400, 46, 12);
        ctx.fill();
        if (s.state === "plan") {
          text(
            "ФАЗА ПЛАНИРОВАНИЯ · точек: " + (s.path.length - 1) + "/8",
            36,
            38,
            13,
            "#00e0c6",
            "left",
            800,
          );
          text(
            "ЛКМ — точка · Backspace — убрать · Enter — ПУСК",
            36,
            57,
            12,
            "#8b98b8",
            "left",
            600,
          );
        } else {
          text("ФАЗА ПРОРЫВА", 36, 38, 13, "#ff4d5e", "left", 800);
          text(
            `Юнитов в сети: ${s.units.filter((u) => !u.done).length} · ${s.empUsed ? "EMP использован" : "E — EMP доступен"}`,
            36,
            57,
            12,
            "#8b98b8",
            "left",
            600,
          );
        }

        if (s.msgT > 0) {
          ctx.globalAlpha = Math.min(1, s.msgT);
          ctx.fillStyle = "rgba(10,14,26,.92)";
          rr(W / 2 - 210, H - 76, 420, 44, 12);
          ctx.fill();
          text(s.msg, W / 2, H - 47, 14, "#00e0c6", "center", 700);
          ctx.globalAlpha = 1;
        }

        if (s.state === "win" || s.state === "lose") {
          ctx.fillStyle = "rgba(6,9,16,.86)";
          ctx.fillRect(0, 0, W, H);
          const win = s.state === "win";
          text(win ? "🦠" : "🛡️", W / 2, H / 2 - 40, 64, "#fff", "center");
          text(
            win ? "ЯДРО ВЗЛОМАНО!" : "АНТИВИРУС ОТРАЗИЛ АТАКУ",
            W / 2,
            H / 2 + 20,
            30,
            win ? "#51cf66" : "#ff4d5e",
            "center",
            800,
          );
          text(
            `Время: ${s.t.toFixed(1)} с`,
            W / 2,
            H / 2 + 58,
            16,
            "#8b98b8",
            "center",
            600,
          );
          text(
            "ПРОБЕЛ — заново",
            W / 2,
            H / 2 + 96,
            15,
            "#6c5ce7",
            "center",
            700,
          );
        }
      },
    };
  }

  /* ============================================================
     ИГРА 7 — Flipper Knight
     ============================================================ */
  function game7() {
    function segCircle(x1, y1, x2, y2, cx, cy) {
      const dx = x2 - x1,
        dy = y2 - y1;
      const len2 = dx * dx + dy * dy || 1;
      let t = ((cx - x1) * dx + (cy - y1) * dy) / len2;
      t = clamp(t, 0, 1);
      const px = x1 + dx * t,
        py = y1 + dy * t;
      return { px, py, d: dist(px, py, cx, cy) };
    }

    const WALLS_SEG = [
      { x1: 20, y1: 20, x2: 880, y2: 20 }, // верх
      { x1: 20, y1: 20, x2: 20, y2: 540 }, // лево
      { x1: 880, y1: 20, x2: 880, y2: 540 }, // право
      { x1: 20, y1: 300, x2: 20, y2: 540 },
      { x1: 20, y1: 440, x2: 340, y2: 530 }, // левая горка
      { x1: 880, y1: 440, x2: 560, y2: 530 }, // правая горка
    ];

    function reset() {
      return {
        ball: { x: 430, y: 90, vx: rnd(-90, 90), vy: 0, r: 11 },
        flippers: [
          {
            px: 330,
            py: 462,
            len: 112,
            rest: 0.55,
            active: -0.42,
            ang: 0.55,
            key: "KeyA",
            up: false,
          },
          {
            px: 570,
            py: 462,
            len: 112,
            rest: Math.PI - 0.55,
            active: Math.PI + 0.42,
            ang: Math.PI - 0.55,
            key: "KeyD",
            up: false,
          },
        ],
        enemies: [
          { x: 190, y: 150, r: 20, hp: 3, max: 3 },
          { x: 450, y: 130, r: 20, hp: 3, max: 3 },
          { x: 710, y: 150, r: 20, hp: 3, max: 3 },
          { x: 130, y: 330, r: 20, hp: 2, max: 2 },
          { x: 770, y: 330, r: 20, hp: 2, max: 2 },
          { x: 450, y: 340, r: 22, hp: 4, max: 4 },
        ],
        score: 0,
        combo: 0,
        lives: 3,
        state: "play",
        t: 0,
        msg: "",
        msgT: 0,
      };
    }

    return {
      init: reset,
      update(s, dt) {
        if (s.state !== "play") {
          if (just.Space || just.Enter) Object.assign(s, reset());
          return;
        }
        s.t += dt;
        if (s.msgT > 0) s.msgT -= dt;

        // Флипперы
        for (const f of s.flippers) {
          const want =
            keys[f.key] ||
            (f.key === "KeyA" && keys.ArrowLeft) ||
            (f.key === "KeyD" && keys.ArrowRight);
          const target = want ? f.active : f.rest;
          const prev = f.ang;
          f.ang += (target - f.ang) * Math.min(1, dt * 22);
          f.omega = (f.ang - prev) / dt;
        }

        // Физика шара
        const b = s.ball;
        b.vy += 950 * dt;
        b.vx *= 1 - 0.12 * dt;
        b.vy *= 1 - 0.12 * dt;

        const sp = Math.hypot(b.vx, b.vy);
        if (sp > 1300) {
          b.vx = (b.vx / sp) * 1300;
          b.vy = (b.vy / sp) * 1300;
        }

        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Стены
        for (const w of WALLS_SEG) {
          const r = segCircle(w.x1, w.y1, w.x2, w.y2, b.x, b.y);
          if (r.d < b.r) {
            const nx = (b.x - r.px) / (r.d || 1);
            const ny = (b.y - r.py) / (r.d || 1);
            const overlap = b.r - r.d;
            b.x += nx * overlap;
            b.y += ny * overlap;
            const dot = b.vx * nx + b.vy * ny;
            b.vx = (b.vx - 2 * dot * nx) * 0.92;
            b.vy = (b.vy - 2 * dot * ny) * 0.92;
          }
        }

        // Флипперы
        for (const f of s.flippers) {
          const tx = f.px + Math.cos(f.ang) * f.len;
          const ty = f.py + Math.sin(f.ang) * f.len;
          const r = segCircle(f.px, f.py, tx, ty, b.x, b.y);
          if (r.d < b.r + 8) {
            const nx = (b.x - r.px) / (r.d || 1);
            const ny = (b.y - r.py) / (r.d || 1);
            const overlap = b.r + 8 - r.d;
            b.x += nx * overlap;
            b.y += ny * overlap;
            const dot = b.vx * nx + b.vy * ny;
            b.vx = (b.vx - 2 * dot * nx) * 0.82;
            b.vy = (b.vy - 2 * dot * ny) * 0.82;
            if (f.omega < -0.5) {
              b.vx += nx * 430;
              b.vy += ny * 430;
            }
          }
        }

        // Враги
        for (const e of s.enemies) {
          if (e.hp <= 0) continue;
          const d = dist(b.x, b.y, e.x, e.y);
          if (d < b.r + e.r) {
            const nx = (b.x - e.x) / (d || 1);
            const ny = (b.y - e.y) / (d || 1);
            b.x = e.x + nx * (b.r + e.r + 1);
            b.y = e.y + ny * (b.r + e.r + 1);
            const dot = b.vx * nx + b.vy * ny;
            b.vx = (b.vx - 2 * dot * nx) * 0.9;
            b.vy = (b.vy - 2 * dot * ny) * 0.9;

            const speed = Math.hypot(b.vx, b.vy);
            if (speed > 110) {
              e.hp--;
              s.combo++;
              s.score += 10 * Math.min(s.combo, 8);
              if (e.hp <= 0) {
                s.score += 50;
                s.msg = `Враг повержен! +${50 + 10 * Math.min(s.combo, 8)}`;
                s.msgT = 1.4;
              } else {
                s.msg = `Комбо x${s.combo}`;
                s.msgT = 0.9;
              }
            }
          }
        }

        // Потеря шара
        if (b.y > H + 30) {
          s.lives--;
          s.combo = 0;
          if (s.lives <= 0) {
            s.state = "lose";
            return;
          }
          b.x = 430;
          b.y = 90;
          b.vx = rnd(-100, 100);
          b.vy = 0;
          s.msg = "Шар потерян!";
          s.msgT = 1.4;
        }

        // Победа
        if (s.enemies.every((e) => e.hp <= 0)) s.state = "win";
      },

      draw(s) {
        ctx.fillStyle = "#0a0713";
        ctx.fillRect(0, 0, W, H);

        // Подземелье: факелы
        for (let i = 0; i < 5; i++) {
          const x = 120 + i * 170;
          const g = ctx.createRadialGradient(x, 30, 5, x, 30, 130);
          g.addColorStop(0, "rgba(255,160,60,.16)");
          g.addColorStop(1, "rgba(255,160,60,0)");
          ctx.fillStyle = g;
          ctx.fillRect(x - 130, 0, 260, 200);
        }

        // Стены
        ctx.strokeStyle = "#3a3560";
        ctx.lineWidth = 8;
        ctx.lineCap = "round";
        for (const w of WALLS_SEG) {
          ctx.beginPath();
          ctx.moveTo(w.x1, w.y1);
          ctx.lineTo(w.x2, w.y2);
          ctx.stroke();
        }

        // Враги
        for (const e of s.enemies) {
          if (e.hp <= 0) continue;
          const hurt = e.hp < e.max;
          ctx.shadowBlur = 16;
          ctx.shadowColor = hurt ? "#ff4d5e" : "#ffb020";
          ctx.fillStyle = hurt ? "#ff4d5e" : "#ffb020";
          ctx.beginPath();
          ctx.arc(e.x, e.y, e.r, 0, TAU);
          ctx.fill();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#1a0a14";
          ctx.beginPath();
          ctx.arc(e.x - 6, e.y - 4, 3.2, 0, TAU);
          ctx.arc(e.x + 6, e.y - 4, 3.2, 0, TAU);
          ctx.fill();
          // HP точки
          for (let i = 0; i < e.max; i++) {
            ctx.fillStyle = i < e.hp ? "#fff" : "rgba(255,255,255,.2)";
            ctx.beginPath();
            ctx.arc(e.x - (e.max - 1) * 5 + i * 10, e.y + e.r + 10, 3, 0, TAU);
            ctx.fill();
          }
        }

        // Флипперы
        for (const f of s.flippers) {
          const tx = f.px + Math.cos(f.ang) * f.len;
          const ty = f.py + Math.sin(f.ang) * f.len;
          ctx.strokeStyle = "#ffd166";
          ctx.lineWidth = 14;
          ctx.lineCap = "round";
          ctx.shadowBlur = 16;
          ctx.shadowColor = "#ffd166";
          ctx.beginPath();
          ctx.moveTo(f.px, f.py);
          ctx.lineTo(tx, ty);
          ctx.stroke();
          ctx.shadowBlur = 0;
          ctx.fillStyle = "#6c5ce7";
          ctx.beginPath();
          ctx.arc(f.px, f.py, 8, 0, TAU);
          ctx.fill();
        }

        // Шар-рыцарь
        const b = s.ball;
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#00e0c6";
        ctx.fillStyle = "#00e0c6";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#04201d";
        ctx.beginPath();
        ctx.arc(b.x - 4, b.y - 2, 2.4, 0, TAU);
        ctx.arc(b.x + 4, b.y - 2, 2.4, 0, TAU);
        ctx.fill();

        // HUD
        ctx.fillStyle = "rgba(10,14,26,.85)";
        rr(20, 18, 280, 46, 12);
        ctx.fill();
        text(`Очки: ${s.score}`, 36, 47, 16, "#ffd166", "left", 800);

        ctx.fillStyle = "rgba(10,14,26,.85)";
        rr(W - 280, 18, 260, 46, 12);
        ctx.fill();
        text(
          "Шары: " + "⚪".repeat(Math.max(0, s.lives)),
          W - 36,
          47,
          15,
          "#00e0c6",
          "right",
          800,
        );

        if (s.msgT > 0) {
          ctx.globalAlpha = Math.min(1, s.msgT);
          text(s.msg, W / 2, H - 40, 20, "#ffd166", "center", 800);
          ctx.globalAlpha = 1;
        }

        if (s.state !== "play") {
          ctx.fillStyle = "rgba(6,9,16,.86)";
          ctx.fillRect(0, 0, W, H);
          const win = s.state === "win";
          text(win ? "🏆" : "💀", W / 2, H / 2 - 40, 64, "#fff", "center");
          text(
            win ? "ПОДЗЕМЕЛЬЕ ЗАЧИЩЕНО!" : "РЫЦАРЬ ПОТЕРЯН В ПРОВАЛЕ",
            W / 2,
            H / 2 + 20,
            30,
            win ? "#ffd166" : "#ff4d5e",
            "center",
            800,
          );
          text(
            `Очки: ${s.score} · Время: ${s.t.toFixed(1)} с`,
            W / 2,
            H / 2 + 58,
            16,
            "#8b98b8",
            "center",
            600,
          );
          text(
            "ПРОБЕЛ — заново",
            W / 2,
            H / 2 + 96,
            15,
            "#6c5ce7",
            "center",
            700,
          );
        }
      },
    };
  }

  /* ============================================================
   ИГРА 8 — Luminous Pulse
   ============================================================ */
  function game8() {
    const FLOOR = 500;
    const PLATS = [
      { x: 0, y: FLOOR, w: W, h: 40 },
      { x: 0, y: 0, w: W, h: 20 },
      { x: 160, y: 400, w: 110, h: 16 },
      { x: 340, y: 310, w: 110, h: 16 },
      { x: 530, y: 400, w: 110, h: 16 },
      { x: 700, y: 300, w: 140, h: 16 },
    ];
    const HAZ = [
      { x: 290, y: FLOOR - 26, w: 60, h: 26 },
      { x: 470, y: FLOOR - 26, w: 80, h: 26 },
      { x: 660, y: FLOOR - 26, w: 60, h: 26 },
      { x: 200, y: 270, w: 100, h: 20 },
      { x: 440, y: 200, w: 100, h: 20 },
    ];
    const EXIT = { x: 830, y: 380, w: 55, h: 120 };
    const PULSE_PERIOD = 1.5;
    const PULSE_LIT = 0.5;

    function reset() {
      return {
        p: {
          x: 40,
          y: FLOOR - 28,
          w: 26,
          h: 26,
          vx: 0,
          vy: 0,
          onGround: false,
        },
        enemies: [
          { x: 200, y: 370, w: 30, h: 30, vx: 70, minX: 180, maxX: 340 },
          { x: 560, y: 270, w: 30, h: 30, vx: 80, minX: 520, maxX: 700 },
        ],
        pulseT: 0,
        t: 0,
        deaths: 0,
        state: "play",
      };
    }

    return {
      init: reset,
      update(s, dt) {
        if (s.state !== "play") {
          if (just.Space || just.Enter) Object.assign(s, reset());
          return;
        }
        s.t += dt;
        s.pulseT += dt;
        const p = s.p;
        if (p.inv > 0) p.inv -= dt;

        const speed = 210;
        if (keys.KeyA || keys.ArrowLeft) p.vx = -speed;
        else if (keys.KeyD || keys.ArrowRight) p.vx = speed;
        else p.vx *= 0.7;

        if ((keys.KeyW || keys.Space || keys.ArrowUp) && p.onGround) {
          p.vy = -520;
          p.onGround = false;
        }

        p.vy += 1500 * dt;
        p.vy = clamp(p.vy, -700, 900);

        // X
        p.x += p.vx * dt;
        for (const pl of PLATS) {
          if (overlap(p, pl)) {
            if (p.vx > 0) p.x = pl.x - p.w;
            else if (p.vx < 0) p.x = pl.x + pl.w;
          }
        }
        p.x = clamp(p.x, 24, W - p.w - 24);

        // Y
        p.onGround = false;
        p.y += p.vy * dt;
        for (const pl of PLATS) {
          if (overlap(p, pl)) {
            if (p.vy > 0) {
              p.y = pl.y - p.h;
              p.onGround = true;
            } else if (p.vy < 0) p.y = pl.y + pl.h;
            p.vy = 0;
          }
        }

        // Враги
        for (const e of s.enemies) {
          e.x += e.vx * dt;
          if (e.x < e.minX || e.x + e.w > e.maxX) e.vx *= -1;
          if (overlap(p, e)) {
            s.state = "dead";
            s.deaths++;
            return;
          }
        }

        // Шипы
        for (const hz of HAZ) {
          if (overlap(p, hz)) {
            s.state = "dead";
            s.deaths++;
            return;
          }
        }

        // Финиш
        if (overlap(p, EXIT)) s.state = "win";
      },

      draw(s) {
        const phase = s.pulseT % PULSE_PERIOD;
        const isLit = phase < PULSE_LIT;
        // Плавное затухание света (0 — темно, 1 — ярко)
        let light = 0;
        if (phase < PULSE_LIT)
          light = Math.min(1, phase / 0.08, (PULSE_LIT - phase) / 0.1);
        light = Math.max(0, light);

        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, W, H);

        // Фоновый фон при вспышке
        if (light > 0.02) {
          const g = ctx.createRadialGradient(W / 2, 270, 40, W / 2, 270, 700);
          g.addColorStop(0, `rgba(167,139,250,${0.22 * light})`);
          g.addColorStop(1, `rgba(20,10,50,${0.9 * light})`);
          ctx.fillStyle = g;
          ctx.fillRect(0, 0, W, H);
        }

        // Платформы
        ctx.globalAlpha = light;
        for (const pl of PLATS) {
          ctx.fillStyle = "#2a2350";
          ctx.fillRect(pl.x, pl.y, pl.w, pl.h);
          ctx.fillStyle = "#a78bfa";
          ctx.fillRect(pl.x, pl.y, pl.w, 3);
        }

        // Шипы
        for (const hz of HAZ) {
          ctx.fillStyle = "#ff4d5e";
          const count = Math.floor(hz.w / 14);
          for (let i = 0; i < count; i++) {
            const sx = hz.x + i * 14;
            ctx.beginPath();
            if (hz.y < 250) {
              ctx.moveTo(sx, hz.y);
              ctx.lineTo(sx + 7, hz.y + hz.h);
              ctx.lineTo(sx + 14, hz.y);
            } else {
              ctx.moveTo(sx, hz.y + hz.h);
              ctx.lineTo(sx + 7, hz.y);
              ctx.lineTo(sx + 14, hz.y + hz.h);
            }
            ctx.closePath();
            ctx.fill();
          }
        }

        // Враги
        for (const e of s.enemies) {
          ctx.fillStyle = "#ffb020";
          ctx.beginPath();
          ctx.arc(e.x + e.w / 2, e.y + e.h / 2, e.w / 2, 0, TAU);
          ctx.fill();
          ctx.fillStyle = "#2a1d05";
          ctx.beginPath();
          ctx.arc(e.x + 10, e.y + 12, 3, 0, TAU);
          ctx.arc(e.x + 20, e.y + 12, 3, 0, TAU);
          ctx.fill();
        }

        // Финиш
        const pulse = 0.5 + 0.5 * Math.sin(performance.now() / 300);
        ctx.shadowBlur = 26 * pulse + 6;
        ctx.shadowColor = "#00e0c6";
        ctx.fillStyle = "rgba(0,224,198,.18)";
        ctx.fillRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
        ctx.strokeStyle = "#00e0c6";
        ctx.lineWidth = 3;
        ctx.strokeRect(EXIT.x, EXIT.y, EXIT.w, EXIT.h);
        ctx.shadowBlur = 0;

        // Игрок всегда виден (приглушённо в темноте)
        ctx.globalAlpha = 0.35 + 0.65 * light;
        const p = s.p;
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#a78bfa";
        ctx.fillStyle = "#a78bfa";
        rr(p.x, p.y, p.w, p.h, 7);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "#0d0620";
        ctx.beginPath();
        ctx.arc(p.x + 8, p.y + 10, 2.6, 0, TAU);
        ctx.arc(p.x + 18, p.y + 10, 2.6, 0, TAU);
        ctx.fill();
        ctx.globalAlpha = 1;

        // HUD
        ctx.fillStyle = "rgba(10,10,26,.82)";
        rr(20, 18, 260, 44, 12);
        ctx.fill();
        text(
          "💡 " +
            (isLit ? "СВЕТ" : "ТЕМНОТА") +
            " · " +
            (PULSE_PERIOD - phase).toFixed(1) +
            " с",
          36,
          46,
          15,
          isLit ? "#a78bfa" : "#8b98b8",
          "left",
          800,
        );

        ctx.fillStyle = "rgba(10,10,26,.82)";
        rr(W - 220, 18, 200, 44, 12);
        ctx.fill();
        text(
          `Провалов: ${s.deaths}`,
          W - 36,
          46,
          15,
          s.deaths ? "#ff4d5e" : "#8b98b8",
          "right",
          800,
        );

        if (s.state === "dead") {
          ctx.fillStyle = "rgba(255,77,94,.28)";
          ctx.fillRect(0, 0, W, H);
          text(
            "💥 Темнота поглотила вас",
            W / 2,
            H / 2,
            32,
            "#ff4d5e",
            "center",
            800,
          );
          text(
            "ПРОБЕЛ — попробовать снова",
            W / 2,
            H / 2 + 46,
            15,
            "#8b98b8",
            "center",
            700,
          );
        }
        if (s.state === "win") {
          ctx.fillStyle = "rgba(6,9,16,.88)";
          ctx.fillRect(0, 0, W, H);
          text("💡", W / 2, H / 2 - 40, 64, "#fff", "center");
          text(
            "Свет довёл вас до финиша!",
            W / 2,
            H / 2 + 20,
            30,
            "#a78bfa",
            "center",
            800,
          );
          text(
            `Провалов: ${s.deaths} · Время: ${s.t.toFixed(1)} с`,
            W / 2,
            H / 2 + 58,
            16,
            "#8b98b8",
            "center",
            600,
          );
          text(
            "ПРОБЕЛ — заново",
            W / 2,
            H / 2 + 96,
            15,
            "#6c5ce7",
            "center",
            700,
          );
        }
      },
    };

    function overlap(a, b) {
      return (
        a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y
      );
    }
  }

  /* ============================================================
   ИГРА 9 — Wreck-Ball Golf
   ============================================================ */
  function game9() {
    const WALLS = [
      { x: 0, y: 0, w: W, h: 18 },
      { x: 0, y: H - 18, w: W, h: 18 },
      { x: 0, y: 0, w: 18, h: H },
      { x: W - 18, y: 0, w: 18, h: H },
    ];
    const HOLE = { x: W - 110, y: H - 90, r: 34 };

    function makeObjects() {
      return [
        { x: 260, y: 180, w: 46, h: 46, hp: 2, type: "crate" },
        { x: 360, y: 260, w: 46, h: 46, hp: 2, type: "crate" },
        { x: 480, y: 160, w: 46, h: 46, hp: 2, type: "crate" },
        { x: 560, y: 320, w: 46, h: 46, hp: 2, type: "crate" },
        { x: 200, y: 380, w: 40, h: 70, hp: 3, type: "barrel" },
        { x: 420, y: 400, w: 40, h: 70, hp: 3, type: "barrel" },
        { x: 660, y: 220, w: 40, h: 70, hp: 3, type: "barrel" },
        { x: 300, y: 100, w: 90, h: 22, hp: 4, type: "wall" },
        { x: 560, y: 120, w: 90, h: 22, hp: 4, type: "wall" },
        { x: 700, y: 380, w: 90, h: 22, hp: 4, type: "wall" },
      ];
    }

    function reset() {
      return {
        ball: { x: 100, y: 420, r: 13, vx: 0, vy: 0 },
        objects: makeObjects(),
        score: 0,
        shots: 0,
        moving: false,
        stillT: 0,
        aimAng: 0,
        charge: 0,
        holeGlow: 0,
        state: "play",
        t: 0,
        msg: "Наведите мышь и зажмите ЛКМ, чтобы ударить",
        msgT: 3,
      };
    }

    return {
      init: reset,
      update(s, dt) {
        if (s.state !== "play") {
          if (just.Space || just.Enter) Object.assign(s, reset());
          return;
        }
        s.t += dt;
        if (s.msgT > 0) s.msgT -= dt;
        const b = s.ball;

        s.aimAng = Math.atan2(mouse.y - b.y, mouse.x - b.x);

        if (!s.moving) {
          if (mouse.down) {
            s.charge = Math.min(1, s.charge + dt * 0.9);
          } else if (s.charge > 0.05) {
            const power = 320 + s.charge * 1000;
            b.vx = Math.cos(s.aimAng) * power;
            b.vy = Math.sin(s.aimAng) * power;
            s.moving = true;
            s.charge = 0;
            s.shots++;
          } else {
            s.charge = 0;
          }
        }

        // Физика
        b.vy += 780 * dt;
        b.vx *= 1 - 0.18 * dt;
        b.vy *= 1 - 0.18 * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        // Стены
        for (const w of WALLS) {
          if (circleRect(b.x, b.y, b.r, w)) {
            const cx = clamp(b.x, w.x, w.x + w.w);
            const cy = clamp(b.y, w.y, w.y + w.h);
            const dx = b.x - cx,
              dy = b.y - cy;
            const d = Math.hypot(dx, dy) || 1;
            const nx = dx / d,
              ny = dy / d;
            const overlap = b.r - d;
            b.x += nx * overlap;
            b.y += ny * overlap;
            const dot = b.vx * nx + b.vy * ny;
            b.vx = (b.vx - 2 * dot * nx) * 0.72;
            b.vy = (b.vy - 2 * dot * ny) * 0.72;
          }
        }

        // Объекты
        for (const o of s.objects) {
          if (o.hp <= 0) continue;
          if (circleRect(b.x, b.y, b.r, o)) {
            const cx = clamp(b.x, o.x, o.x + o.w);
            const cy = clamp(b.y, o.y, o.y + o.h);
            const dx = b.x - cx,
              dy = b.y - cy;
            const d = Math.hypot(dx, dy) || 1;
            const nx = dx / d,
              ny = dy / d;
            const overlap = b.r - d;
            b.x += nx * overlap;
            b.y += ny * overlap;
            const dot = b.vx * nx + b.vy * ny;
            b.vx = (b.vx - 2 * dot * nx) * 0.7;
            b.vy = (b.vy - 2 * dot * ny) * 0.7;

            const speed = Math.hypot(b.vx, b.vy);
            if (speed > 130) {
              o.hp--;
              s.score += 5;
              if (o.hp <= 0) {
                s.score += 40;
                s.msg = "💥 +40 (объект разрушен)";
                s.msgT = 1.1;
              }
            }
          }
        }

        // Остановка мяча
        const spd = Math.hypot(b.vx, b.vy);
        if (s.moving && spd < 32 && b.y + b.r > H - 60) {
          s.stillT += dt;
          if (s.stillT > 0.5) {
            s.moving = false;
            s.stillT = 0;
            b.vx = 0;
            b.vy = 0;
          }
        } else {
          s.stillT = 0;
        }

        // Лунка
        s.holeGlow = 0.5 + 0.5 * Math.sin(performance.now() / 280);
        const dh = dist(b.x, b.y, HOLE.x, HOLE.y);
        if (dh < HOLE.r - 4 && spd < 260) {
          s.state = "win";
          s.score += Math.max(0, 100 - s.shots * 8);
        }
      },

      draw(s) {
        // Небо/трава
        const g = ctx.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, "#1a1428");
        g.addColorStop(1, "#0d0a18");
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);

        // Сетка газона
        ctx.strokeStyle = "rgba(120,200,120,.05)";
        ctx.lineWidth = 1;
        for (let x = 0; x < W; x += 60) {
          ctx.beginPath();
          ctx.moveTo(x, 0);
          ctx.lineTo(x, H);
          ctx.stroke();
        }
        for (let y = 0; y < H; y += 60) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(W, y);
          ctx.stroke();
        }

        // Стены
        for (const w of WALLS) {
          ctx.fillStyle = "#2b2440";
          ctx.fillRect(w.x, w.y, w.w, w.h);
        }

        // Лунка
        ctx.shadowBlur = 26 * s.holeGlow;
        ctx.shadowColor = "#51cf66";
        ctx.strokeStyle = "#51cf66";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(HOLE.x, HOLE.y, HOLE.r, 0, TAU);
        ctx.stroke();
        ctx.fillStyle = "rgba(81,207,102,.18)";
        ctx.beginPath();
        ctx.arc(HOLE.x, HOLE.y, HOLE.r, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        text("ЛУНКА", HOLE.x, HOLE.y + 5, 12, "#51cf66", "center", 800);

        // Объекты
        for (const o of s.objects) {
          if (o.hp <= 0) continue;
          const dmg =
            o.hp < (o.type === "crate" ? 2 : o.type === "barrel" ? 3 : 4);
          if (o.type === "crate") {
            ctx.fillStyle = dmg ? "#8a5a2b" : "#c97a35";
            ctx.fillRect(o.x, o.y, o.w, o.h);
            ctx.strokeStyle = "#4a2a12";
            ctx.lineWidth = 3;
            ctx.strokeRect(o.x, o.y, o.w, o.h);
            ctx.beginPath();
            ctx.moveTo(o.x, o.y);
            ctx.lineTo(o.x + o.w, o.y + o.h);
            ctx.moveTo(o.x + o.w, o.y);
            ctx.lineTo(o.x, o.y + o.h);
            ctx.stroke();
          } else if (o.type === "barrel") {
            ctx.fillStyle = dmg ? "#7a3030" : "#c24a3a";
            rr(o.x, o.y, o.w, o.h, 8);
            ctx.fill();
            ctx.fillStyle = "rgba(0,0,0,.28)";
            ctx.fillRect(o.x, o.y + o.h * 0.28, o.w, 5);
            ctx.fillRect(o.x, o.y + o.h * 0.6, o.w, 5);
          } else {
            ctx.fillStyle = dmg ? "#3a3a55" : "#555a7a";
            ctx.fillRect(o.x, o.y, o.w, o.h);
            ctx.strokeStyle = "rgba(0,0,0,.35)";
            ctx.lineWidth = 2;
            ctx.strokeRect(o.x + 1, o.y + 1, o.w - 2, o.h - 2);
          }
        }

        // Прицел
        if (!s.moving) {
          const b = s.ball;
          const len = 50 + s.charge * 100;
          ctx.strokeStyle = `rgba(255,122,69,${0.55 + s.charge * 0.4})`;
          ctx.lineWidth = 3;
          ctx.setLineDash([7, 6]);
          ctx.beginPath();
          ctx.moveTo(b.x, b.y);
          ctx.lineTo(
            b.x + Math.cos(s.aimAng) * len,
            b.y + Math.sin(s.aimAng) * len,
          );
          ctx.stroke();
          ctx.setLineDash([]);

          // Индикатор силы
          if (s.charge > 0) {
            ctx.fillStyle = "rgba(0,0,0,.55)";
            rr(b.x - 30, b.y - 42, 60, 8, 4);
            ctx.fill();
            const c = s.charge;
            ctx.fillStyle =
              c < 0.4 ? "#51cf66" : c < 0.75 ? "#ffb020" : "#ff4d5e";
            rr(b.x - 30, b.y - 42, 60 * c, 8, 4);
            ctx.fill();
          }
        }

        // Мяч
        const b = s.ball;
        ctx.shadowBlur = 22;
        ctx.shadowColor = "#ff7a45";
        ctx.fillStyle = "#ff7a45";
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, TAU);
        ctx.fill();
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(255,255,255,.35)";
        ctx.beginPath();
        ctx.arc(b.x - 4, b.y - 4, 3.5, 0, TAU);
        ctx.fill();

        // HUD
        ctx.fillStyle = "rgba(10,14,26,.85)";
        rr(20, 18, 260, 46, 12);
        ctx.fill();
        text(`Очки: ${s.score}`, 36, 47, 16, "#ff7a45", "left", 800);

        ctx.fillStyle = "rgba(10,14,26,.85)";
        rr(W - 240, 18, 220, 46, 12);
        ctx.fill();
        text(`Удары: ${s.shots}`, W - 36, 47, 15, "#ffd166", "right", 800);

        if (s.msgT > 0) {
          ctx.globalAlpha = Math.min(1, s.msgT);
          ctx.fillStyle = "rgba(10,14,26,.9)";
          rr(W / 2 - 200, H - 74, 400, 42, 12);
          ctx.fill();
          text(s.msg, W / 2, H - 46, 14, "#ff7a45", "center", 700);
          ctx.globalAlpha = 1;
        }

        if (s.state === "win") {
          ctx.fillStyle = "rgba(6,9,16,.86)";
          ctx.fillRect(0, 0, W, H);
          text("⛳", W / 2, H / 2 - 50, 64, "#fff", "center");
          text("В ЛУНКЕ!", W / 2, H / 2 + 20, 34, "#51cf66", "center", 800);
          text(
            `Очки: ${s.score} · Удары: ${s.shots}`,
            W / 2,
            H / 2 + 60,
            16,
            "#8b98b8",
            "center",
            600,
          );
          text(
            "ПРОБЕЛ — заново",
            W / 2,
            H / 2 + 100,
            15,
            "#6c5ce7",
            "center",
            700,
          );
        }
      },
    };

    function circleRect(cx, cy, r, rc) {
      const nx = clamp(cx, rc.x, rc.x + rc.w);
      const ny = clamp(cy, rc.y, rc.y + rc.h);
      return (cx - nx) ** 2 + (cy - ny) ** 2 < r * r;
    }
  }

  /* ============================================================
     Раннер
     ============================================================ */
  const GAMES_MAP = {
    1: game1,
    2: game2,
    3: game3,
    4: game4,
    5: game5,
    6: game6,
    7: game7,
  };

  const id = document.body.dataset.game;
  const factory = GAMES_MAP[id];
  if (!factory) return;

  const game = factory();
  let s = game.init();

  const restartBtn = document.getElementById("restartBtn");
  if (restartBtn) {
    restartBtn.addEventListener("click", () => {
      s = game.init();
      canvas.focus();
    });
  }

  let last = performance.now();
  function frame(t) {
    let dt = (t - last) / 1000;
    last = t;
    dt = Math.min(dt, 1 / 30);

    game.update(s, dt);
    game.draw(s);

    for (const k in just) delete just[k];
    mouse.clicked = false;

    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
