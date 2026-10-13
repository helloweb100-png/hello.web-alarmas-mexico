/* ==========================================================================
   ALARMAS MÉXICO · script.js
   Dependencias (CDN, ver index.html): GSAP + ScrollTrigger + Lenis.
   Si no cargan, o el usuario prefiere menos movimiento, la página funciona sin
   animaciones (clase .no-gsap): todo el contenido queda visible y usable.

   Índice
   01 Utilidades · 02 Funciones comunes (WhatsApp, menú, FAQ, formulario, escenarios)
   03 Loader · 04 Smooth scroll · 05 Intro del hero · 06 Canvas del hero
   07 Reveals y texto · 08 Sentidos (sticky) · 09 Radar vecinal (canvas)
   10 Catálogo horizontal · 11 Proceso, parallax, footer · 12 UI: header, puntos,
   cursor, magnéticos · 13 Arranque
   ========================================================================== */
(() => {
  'use strict';

  /* 01 · Utilidades ------------------------------------------------------- */
  const $ = (s, c = document) => c.querySelector(s);
  const $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const root = document.documentElement;
  const WA = '5212216443333';
  const waUrl = (m) => `https://wa.me/${WA}` + (m ? `?text=${encodeURIComponent(m)}` : '');
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)').matches;
  const hasGsap = !!(window.gsap && window.ScrollTrigger);
  const FX = hasGsap && !reduced;
  let lenis = null;
  window.__ready = true;

  /* 02 · Funciones comunes -------------------------------------------------- */
  function initWhatsAppLinks() {
    $$('a[data-wa]').forEach((a) => { a.href = waUrl(a.dataset.wa); });
    const y = $('#yr'); if (y) y.textContent = new Date().getFullYear();
    const wa = $('#wa');
    if (wa) {
      setTimeout(() => wa.classList.add('is-tip'), 6500);
      setTimeout(() => wa.classList.remove('is-tip'), 12500);
    }
  }

  function initMenu() {
    const burger = $('#burger'), menu = $('#menu');
    if (!burger || !menu) return;
    const set = (open) => {
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
      menu.classList.toggle('is-open', open);
      menu.setAttribute('aria-hidden', String(!open));
      root.classList.toggle('menu-open', open);
      if (lenis) open ? lenis.stop() : lenis.start();
    };
    burger.addEventListener('click', () => set(!menu.classList.contains('is-open')));
    $$('a', menu).forEach((a) => a.addEventListener('click', () => set(false)));
    addEventListener('keydown', (e) => { if (e.key === 'Escape') set(false); });
    matchMedia('(min-width:980px)').addEventListener('change', (m) => { if (m.matches) set(false); });
  }

  function initFaq() {
    const items = $$('.qa');
    items.forEach((qa) => {
      const btn = $('.qa__q', qa);
      btn.addEventListener('click', () => {
        const open = !qa.classList.contains('is-open');
        items.forEach((o) => { o.classList.remove('is-open'); $('.qa__q', o).setAttribute('aria-expanded', 'false'); });
        if (open) { qa.classList.add('is-open'); btn.setAttribute('aria-expanded', 'true'); }
        if (window.ScrollTrigger) setTimeout(() => ScrollTrigger.refresh(), 700);
      });
    });
    if (items[0]) { items[0].classList.add('is-open'); $('.qa__q', items[0]).setAttribute('aria-expanded', 'true'); }
  }

  function initForm() {
    const form = $('#form'); if (!form) return;
    const name = $('#f-name'), fld = name.closest('.fld'), btn = $('button[type="submit"]', form);
    name.addEventListener('input', () => fld.classList.remove('is-bad'));
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const n = name.value.trim();
      if (!n) { fld.classList.add('is-bad'); name.focus(); return; }
      const interest = $('#f-int').value, more = $('#f-msg').value.trim();
      let text = `Hola Alarmas México, soy ${n}.`;
      if (interest) text += ` Me interesa: ${interest}.`;
      if (more) text += ` ${more}`;
      const label = $('span', btn), old = label.textContent;
      label.textContent = 'Abriendo WhatsApp…';
      window.open(waUrl(text), '_blank', 'noopener');
      setTimeout(() => { label.textContent = old; }, 2600);
    });
  }

  /* Escenarios: "¿Qué quieres proteger?" */
  const SCENARIOS = {
    calle: {
      tag: 'Te recomendamos para tu calle', title: 'Alarma vecinal P55 WiFi',
      text: 'Un control, una sirena de uso rudo y toda tu cuadra en alerta. Se activa desde tu celular con WiFi, estés donde estés.',
      list: ['Sonido de 80 W a 250–300 m', '20 cuentas WiFi incluidas', 'Controles de 35 a 400 m'],
      price: 2999, old: 3499, img: 'img/alarma-vecinal-p55.jpg', w: 564, h: 392,
      alt: 'Alarma vecinal metálica P55 con sirena doble, luz estroboscópica y letrero 911 Zona monitoreada',
    },
    negocio: {
      tag: 'Te recomendamos para tu negocio', title: 'Alarma para cortina metálica',
      text: 'Si alguien abre tu cortina, la alarma suena al instante. Ya va programada, con sirena de 130 dB y luz independiente.',
      list: ['Trompeta de 130 dB + luz tipo policía', 'Sensor inalámbrico de uso rudo', 'Opcional: WiFi y app móvil (+$1,100)'],
      price: 2299, old: 0, img: 'img/cortina.jpg', w: 533, h: 565,
      alt: 'Sistema de alarma para negocio con sirena, luz azul de policía, sensor de cortina metálica y control',
    },
    casa: {
      tag: 'Te recomendamos para tu casa', title: 'Alarma con cámara 360° tono policía',
      text: 'La cámara detecta movimiento, activa la alarma con tono de policía y te avisa en tu teléfono.',
      list: ['Cámara giratoria 360°', 'Tono de sirena tipo policía', 'Aviso inmediato a tu celular'],
      price: 3499, old: 0, img: 'img/alarma-camara-360.jpg', w: 457, h: 575,
      alt: 'Alarma con cámara 360 grados, trompeta y letrero Sistema anti golpes 911',
    },
    edificio: {
      tag: 'Te recomendamos para tu edificio', title: 'Video portero departamental · 500 usuarios',
      text: 'Para edificios y condominios: soporta 500 usuarios y 500 pantallas, con aviso a celular por WiFi y cuerpo metálico resistente al agua.',
      list: ['Bocina y micrófono bidireccional', 'Uso rudo en exteriores', 'Instalación básica desde $1,200'],
      price: 7499, old: 9999, img: 'img/video-portero-500.jpg', w: 510, h: 562,
      alt: 'Video portero departamental UNV con cámara, pantalla, teclado numérico y cuerpo metálico',
    },
  };
  const money = (n) => '$' + n.toLocaleString('en-US');

  function initScenarios() {
    const tabs = $$('.stab'), panel = $('#spanel'); if (!tabs.length) return;
    const img = $('#spImg'), imgBox = img.parentElement;
    const f = { tag: $('#spTag'), title: $('#spTitle'), text: $('#spText'), list: $('#spList'), price: $('#spPrice'), old: $('#spOld'), deal: $('#spDeal'), cta: $('#spCta') };
    const bgOf = (src) => imgBox.style.setProperty('--img', `url(${src})`);
    bgOf(SCENARIOS.calle.img);
    const render = (s) => {
      f.tag.textContent = s.tag; f.title.textContent = s.title; f.text.textContent = s.text;
      f.list.innerHTML = s.list.map((x) => `<li><svg class="ico"><use href="#i-check"/></svg>${x}</li>`).join('');
      f.price.textContent = money(s.price);
      f.old.textContent = s.old ? money(s.old) : ''; f.old.hidden = !s.old; f.deal.hidden = !s.old;
      img.src = s.img; img.alt = s.alt; img.width = s.w; img.height = s.h; bgOf(s.img);
      const msg = `Hola Alarmas México, me interesa: ${s.title} (${money(s.price)}). ¿Me das más información?`;
      f.cta.dataset.wa = msg; f.cta.href = waUrl(msg);
    };
    let busy = false;
    const select = (key, focus) => {
      const s = SCENARIOS[key]; if (!s) return;
      tabs.forEach((t) => { const on = t.dataset.scn === key; t.classList.toggle('is-on', on); t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; if (on && focus) t.focus(); });
      const body = $('.spanel__body', panel);
      if (FX) {
        gsap.killTweensOf([body, imgBox]);
        gsap.timeline()
          .to(body, { opacity: 0, y: 18, duration: .22, ease: 'power2.in' }, 0)
          .to(img, { opacity: 0, scale: .92, duration: .22, ease: 'power2.in' }, 0)
          .add(() => render(s))
          .to(body, { opacity: 1, y: 0, duration: .7, ease: 'expo.out' }, '>.05')
          .fromTo(img, { opacity: 0, scale: 1.1, rotate: -2 }, { opacity: 1, scale: 1, rotate: 0, duration: .9, ease: 'expo.out' }, '<');
      } else render(s);
    };
    tabs.forEach((t, i) => {
      t.tabIndex = i === 0 ? 0 : -1;
      t.addEventListener('click', () => select(t.dataset.scn));
      t.addEventListener('keydown', (e) => {
        if (!['ArrowDown', 'ArrowUp', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
        e.preventDefault();
        const step = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1 : -1;
        select(tabs[(i + step + tabs.length) % tabs.length].dataset.scn, true);
      });
    });
    render(SCENARIOS.calle);
  }

  /* 03 · Loader ---------------------------------------------------------------- */
  function runLoader(done) {
    const loader = $('#loader');
    if (!loader) { done(); return; }
    const arc = $('#loaderArc'), num = $('#loaderNum'), tk = $('#loaderTicks'), log = $('#loaderLog');
    const NS = 'http://www.w3.org/2000/svg', N = 72, ticks = [];
    for (let i = 0; i < N; i++) {
      const a = (i / N) * Math.PI * 2, r1 = 94, r2 = i % 6 === 0 ? 99 : 97, l = document.createElementNS(NS, 'line');
      l.setAttribute('x1', 100 + Math.cos(a) * r1); l.setAttribute('y1', 100 + Math.sin(a) * r1);
      l.setAttribute('x2', 100 + Math.cos(a) * r2); l.setAttribute('y2', 100 + Math.sin(a) * r2);
      tk.appendChild(l); ticks.push(l);
    }
    const msgs = [[0, 'Iniciando sistema'], [.22, 'Calibrando sensores'], [.46, 'Conectando sirena'], [.7, 'Enlazando cámaras'], [1, 'Sistema listo']];
    let shown = 0, lastTick = -1;
    const st = { v: 0 };
    const render = () => {
      const v = st.v;
      arc.style.strokeDashoffset = 578 * (1 - v);
      num.textContent = Math.round(v * 100);
      const t = Math.floor(v * N);
      if (t !== lastTick) { ticks.forEach((l, i) => l.classList.toggle('on', i < t)); lastTick = t; }
      while (shown < msgs.length && v >= msgs[shown][0] - 0.0001) {
        const li = document.createElement('li');
        li.innerHTML = `<b>[OK]</b>${msgs[shown][1]}`;
        log.appendChild(li);
        while (log.children.length > 4) log.removeChild(log.firstChild);
        shown++;
      }
    };
    render();
    const ready = Promise.race([
      Promise.all([new Promise((r) => (document.readyState === 'complete' ? r() : addEventListener('load', r, { once: true }))), document.fonts ? document.fonts.ready : Promise.resolve()]),
      new Promise((r) => setTimeout(r, 5000)),
    ]);
    const min = new Promise((resolve) => gsap.to(st, { v: .86, duration: 1.9, ease: 'power2.inOut', onUpdate: render, onComplete: resolve }));
    Promise.all([min, ready]).then(() => {
      gsap.to(st, {
        v: 1, duration: .6, ease: 'power1.out', onUpdate: render, onComplete: () => {
          setTimeout(() => {
            loader.classList.add('is-done');
            root.classList.remove('is-loading');
            setTimeout(done, 380);
            setTimeout(() => loader.classList.add('is-gone'), 1500);
          }, 280);
        },
      });
    });
  }

  /* 04 · Scroll suave (Lenis) ---------------------------------------------------- */
  function initScroll() {
    gsap.registerPlugin(ScrollTrigger);
    ScrollTrigger.config({ ignoreMobileResize: true });
    if (window.Lenis) {
      lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 0.95, smoothWheel: true });
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((t) => lenis.raf(t * 1000));
      gsap.ticker.lagSmoothing(0);
      lenis.stop();
    }
  }
  function goTo(target) {
    const el = typeof target === 'string' ? $(target) : target; if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: 0, duration: 1.8, easing: (t) => 1 - Math.pow(1 - t, 4) });
    else el.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  }
  function initAnchors() {
    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href^="#"]');
      if (!a) return;
      const h = a.getAttribute('href');
      if (h.length < 2 || !$(h)) return;
      e.preventDefault();
      goTo(h);
    });
  }

  /* 05 · Intro del hero ------------------------------------------------------------ */
  function intro() {
    const tl = gsap.timeline();
    gsap.set('.hero .ln__i', { y: 0, yPercent: 118 });   // anula el translateY del CSS (GSAP lo habría leído en px)
    tl.to('.hdr', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
      .fromTo('.hero .ln__i', { yPercent: 118 }, { yPercent: 0, duration: 1.5, ease: 'expo.out', stagger: .13 }, .05)
      .fromTo('.hero [data-hero]', { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 1.3, ease: 'expo.out', stagger: .12 }, .35)
      .fromTo('.stage', { opacity: 0, scale: .82, rotate: -6 }, { opacity: 1, scale: 1, rotate: 0, duration: 1.9, ease: 'expo.out' }, .1)
      .to('.hud', { opacity: 1, duration: .9, stagger: .2, ease: 'power2.out' }, 1);
    tl.add(() => {
      if (lenis) lenis.start();
      $('#dots').classList.add('is-show');
      toastLoop();
      hudFloat();
    }, .9);
  }
  function toastLoop() {
    const lis = $$('#toast li'), bar = $('#toast .toast__bar i'); if (!lis.length) return;
    const tl = gsap.timeline({ repeat: -1, repeatDelay: .5 });
    tl.set(bar, { scaleX: 0 }).add(() => lis.forEach((l) => l.classList.remove('on')))
      .to(bar, { scaleX: 1, duration: 4.2, ease: 'none' }, 0)
      .add(() => lis[0].classList.add('on'), .6).add(() => lis[1].classList.add('on'), 1.7).add(() => lis[2].classList.add('on'), 2.8)
      .to({}, { duration: 1.4 }, 2.8);
  }
  function hudFloat() {
    $$('.hud').forEach((h, i) => gsap.to(h, { y: i % 2 ? 9 : -9, duration: 2.4 + i * .5, ease: 'sine.inOut', yoyo: true, repeat: -1 }));
    if (!finePointer) return;
    const hero = $('#inicio'), scope = $('.scope'), logo = $('.stage__logo');
    gsap.set(scope, { transformPerspective: 900 });
    const rx = gsap.quickTo(scope, 'rotationY', { duration: .9, ease: 'power3.out' });
    const ry = gsap.quickTo(scope, 'rotationX', { duration: .9, ease: 'power3.out' });
    const lx = gsap.quickTo(logo, 'x', { duration: 1.1, ease: 'power3.out' });
    const huds = $$('.hud').map((h, i) => gsap.quickTo(h, 'x', { duration: 1.2, ease: 'power3.out' }));
    hero.addEventListener('pointermove', (e) => {
      const r = hero.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
      rx(nx * 18); ry(-ny * 14); lx(nx * 40);
      huds.forEach((q, i) => q(nx * (22 + i * 14)));
    });
    hero.addEventListener('pointerleave', () => { rx(0); ry(0); lx(0); huds.forEach((q) => q(0)); });
  }

  /* 06 · Red de partículas del hero ---------------------------------------------------- */
  function initHeroFx() {
    const cv = $('#heroFx'), hero = $('#inicio'); if (!cv) return;
    const ctx = cv.getContext('2d');
    let W = 0, H = 0, dpr = 1, nodes = [], raf = 0, vis = true;
    const mouse = { x: -9999, y: -9999 };
    const resize = () => {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const n = clamp(Math.round((W * H) / 17000), 26, 84);
      nodes = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H, vx: (Math.random() - .5) * .36, vy: (Math.random() - .5) * .36,
        r: .9 + Math.random() * 1.5, red: Math.random() < .2,
      }));
      if (reduced) frame();
    };
    const LINK = () => (W < 700 ? 105 : 140);
    const frame = () => {
      ctx.clearRect(0, 0, W, H);
      const L = LINK();
      for (const n of nodes) {
        const dx = n.x - mouse.x, dy = n.y - mouse.y, d = Math.hypot(dx, dy);
        if (d < 150) { n.vx += (dx / d) * .012; n.vy += (dy / d) * .012; }
        n.vx *= .995; n.vy *= .995;
        const sp = Math.hypot(n.vx, n.vy); if (sp < .12) { n.vx *= 1.02; n.vy *= 1.02; }
        n.x += n.vx; n.y += n.vy;
        if (n.x < -10) n.x = W + 10; else if (n.x > W + 10) n.x = -10;
        if (n.y < -10) n.y = H + 10; else if (n.y > H + 10) n.y = -10;
      }
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j], d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < L) {
            const al = (1 - d / L) * (a.red || b.red ? .5 : .2);
            ctx.strokeStyle = a.red || b.red ? `rgba(255,61,77,${al})` : `rgba(255,255,255,${al})`;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
        const dm = Math.hypot(a.x - mouse.x, a.y - mouse.y);
        if (dm < 190) {
          ctx.strokeStyle = `rgba(255,61,77,${(1 - dm / 190) * .7})`;
          ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(mouse.x, mouse.y); ctx.stroke();
        }
      }
      for (const n of nodes) {
        ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283);
        if (n.red) { ctx.fillStyle = 'rgba(255,61,77,.95)'; ctx.shadowColor = '#ff3d4d'; ctx.shadowBlur = 12; }
        else { ctx.fillStyle = 'rgba(255,255,255,.65)'; ctx.shadowBlur = 0; }
        ctx.fill();
      }
      ctx.shadowBlur = 0;
    };
    const loop = () => { if (!vis || document.hidden) { raf = 0; return; } frame(); raf = requestAnimationFrame(loop); };
    const start = () => { if (!raf && !reduced) raf = requestAnimationFrame(loop); };
    new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) start(); }, { threshold: 0 }).observe(hero);
    document.addEventListener('visibilitychange', start);
    hero.addEventListener('pointermove', (e) => { const r = cv.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resize, 200); });
    resize(); start();
  }

  /* 07 · Reveals y texto ------------------------------------------------------------------- */
  function splitWords(el, cls) {
    const out = [];
    (function walk(node, inGrad) {
      [...node.childNodes].forEach((n) => {
        if (n.nodeType === 3) {
          const frag = document.createDocumentFragment();
          let first = true;
          n.textContent.split(/(\s+)/).forEach((p) => {
            if (!p) return;
            // puntuación pegada a un elemento anterior (p. ej. "<em>proteger</em>?"): se une a su palabra
            if (first && cls === 'sw' && n.previousSibling && n.previousSibling.nodeType === 1 && !/^\s/.test(p) && out.length) {
              first = false; out[out.length - 1].textContent += p; return;
            }
            first = false;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
            if (cls === 'mw') {
              const s = document.createElement('span'); s.className = 'mw'; s.textContent = p; frag.appendChild(s); out.push(s);
            } else {
              const w = document.createElement('span'), i = document.createElement('span');
              w.className = 'sw'; i.className = 'sw__i' + (inGrad ? ' grad' : ''); i.textContent = p;
              w.appendChild(i); frag.appendChild(w); out.push(i);
            }
          });
          node.replaceChild(frag, n);
        } else if (n.nodeType === 1) {
          const g = n.classList.contains('grad');
          if (g && cls === 'sw') n.classList.remove('grad');
          walk(n, inGrad || g);
        }
      });
    })(el, false);
    return out;
  }

  function initReveals() {
    // Encabezados: palabra por palabra
    $$('[data-split]').forEach((h) => {
      const words = splitWords(h, 'sw');
      gsap.set(words, { yPercent: 112 });
      ScrollTrigger.create({
        trigger: h, start: 'top 88%', once: true,
        onEnter: () => gsap.to(words, { yPercent: 0, duration: 1.15, ease: 'expo.out', stagger: .055 }),
      });
    });
    // Elementos genéricos
    $$('[data-reveal]').forEach((el) => {
      const dir = el.dataset.reveal;
      const sib = el.parentElement && el.parentElement.hasAttribute('data-stagger') ? [...el.parentElement.children].indexOf(el) : 0;
      el.style.transition = 'none';
      gsap.set(el, { x: dir === 'left' ? -70 : dir === 'right' ? 70 : 0, y: dir ? 0 : 46 });
      ScrollTrigger.create({
        trigger: el, start: 'top 91%', once: true,
        onEnter: () => gsap.to(el, {
          opacity: 1, x: 0, y: 0, duration: 1.25, delay: sib * .1, ease: 'expo.out',
          onComplete: () => { el.style.transition = ''; gsap.set(el, { clearProps: 'transform' }); },
        }),
      });
    });
    // Manifiesto: se enciende palabra por palabra con el scroll
    const man = $('#manifesto');
    if (man) {
      const words = splitWords(man, 'mw');
      gsap.to(words, { opacity: 1, ease: 'none', stagger: .12, duration: .3, scrollTrigger: { trigger: man, start: 'top 82%', end: 'bottom 48%', scrub: true } });
    }
    // Contadores
    $$('[data-count]').forEach((el) => {
      const end = parseFloat(el.dataset.count), suf = el.dataset.suffix || '', o = { v: 0 };
      const fmt = (v) => Math.round(v).toLocaleString('en-US') + (suf ? `<small>${suf}</small>` : '');
      el.innerHTML = fmt(0);
      ScrollTrigger.create({
        trigger: el, start: 'top 92%', once: true,
        onEnter: () => gsap.to(o, { v: end, duration: 2.2, ease: 'power3.out', onUpdate: () => { el.innerHTML = fmt(o.v); } }),
      });
    });
  }

  /* 08 · Los tres sentidos (sticky + scrub) ------------------------------------------------------ */
  function initSenses() {
    const sec = $('#como-funciona'); if (!sec) return;
    const words = $$('.sword', sec), texts = $$('.stext', sec), vizs = $$('.viz', sec), bars = $$('.senses__bars i', sec);
    let cur = 0;
    const go = (to) => {
      if (to === cur) return;
      const d = to > cur ? 1 : -1, from = cur; cur = to;
      gsap.to(words[from], { yPercent: -108 * d, opacity: 0, duration: .55, ease: 'power3.in', overwrite: true });
      gsap.fromTo(words[to], { yPercent: 108 * d, opacity: 1 }, { yPercent: 0, opacity: 1, duration: 1, ease: 'expo.out', delay: .22, overwrite: true });
      gsap.to(texts[from], { opacity: 0, y: -22 * d, duration: .4, ease: 'power2.in', overwrite: true });
      gsap.fromTo(texts[to], { opacity: 0, y: 34 * d }, { opacity: 1, y: 0, duration: 1, ease: 'expo.out', delay: .3, overwrite: true });
      gsap.to(vizs[from], { opacity: 0, scale: .9, duration: .5, ease: 'power2.in', overwrite: true });
      gsap.fromTo(vizs[to], { opacity: 0, scale: 1.1 }, { opacity: 1, scale: 1, duration: 1.2, ease: 'expo.out', delay: .22, overwrite: true });
      [words, texts, vizs].forEach((g) => g.forEach((e, i) => e.classList.toggle('is-on', i === to)));
    };
    ScrollTrigger.create({
      trigger: sec, start: 'top top', end: 'bottom bottom',
      onUpdate: (self) => {
        const p = self.progress;
        go(clamp(Math.floor(p * 3), 0, 2));
        bars.forEach((b, i) => b.style.setProperty('--f', clamp(p * 3 - i)));
      },
    });
  }

  /* 09 · Radar vecinal: canvas controlado por scroll ----------------------------------------------- */
  function initRadar() {
    const cv = $('#radarCv'), sec = $('#vecinal'); if (!cv || !sec) return;
    const ctx = cv.getContext('2d'), status = $('#radarStatus'), steps = $$('.rsteps li', sec);
    const bg = document.createElement('canvas'), bctx = bg.getContext('2d');
    let W = 0, H = 0, dpr = 1, cx = 0, cy = 0, R = 0, g = 0, houses = [], labels = [];
    let target = FX ? 0 : 1, p = target, vis = false, raf = 0, lastStep = -1, lastAlert = null;
    const seeded = (s) => () => { s |= 0; s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
    const hasConic = typeof ctx.createConicGradient === 'function';
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    function build() {
      dpr = Math.min(devicePixelRatio || 1, 2);
      W = cv.clientWidth; H = cv.clientHeight;
      cv.width = bg.width = W * dpr; cv.height = bg.height = H * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const wide = W >= 980;
      cx = wide ? W * .68 : W * .5; cy = wide ? H * .46 : H * .78;
      R = wide ? Math.min(W * .25, H * .36) : Math.min(W * .42, H * .2);
      g = R / 6.4;
      const rand = seeded(11); houses = []; labels = [];
      for (let i = -14; i <= 14; i++) for (let j = -14; j <= 14; j++) {
        if (i % 4 === 0 || j % 4 === 0) continue;
        if (rand() < .1) continue;
        const x = cx + i * g + (rand() - .5) * g * .26, y = cy + j * g + (rand() - .5) * g * .26;
        const d = Math.hypot(x - cx, y - cy);
        if (d > R * 1.3 || x < -20 || x > W + 20 || y < -20 || y > H + 20 || d < g * .9) continue;
        houses.push({ x, y, d, s: g * (.34 + rand() * .16), ph: rand() * 6.28, a: Math.atan2(y - cy, x - cx) });
      }
      // casas con etiqueta (una por sector)
      const pool = houses.filter((h) => h.d > R * .3 && h.d < R * .92 && h.y > 90 && h.y < H - 40 && h.x > 60 && h.x < W - 80);
      const sectors = 6;
      for (let s = 0; s < sectors; s++) {
        const lo = -Math.PI + (s / sectors) * Math.PI * 2, hi = lo + (Math.PI * 2) / sectors;
        const c = pool.filter((h) => h.a >= lo && h.a < hi);
        if (c.length) { const h = c[Math.floor(rand() * c.length)]; h.label = `CASA ${10 + Math.floor(rand() * 80)}`; labels.push(h); }
      }
      // capa estática: calles y casas apagadas
      bctx.clearRect(0, 0, W, H);
      bctx.lineWidth = 1;
      for (let k = -16; k <= 16; k += 4) {
        for (let m = -34; m < 34; m++) {
          const a = m * g * .5, b = (m + 1) * g * .5;
          const segs = [[cx + k * g, cy + a, cx + k * g, cy + b], [cx + a, cy + k * g, cx + b, cy + k * g]];
          for (const s of segs) {
            const mx = (s[0] + s[2]) / 2 - cx, my = (s[1] + s[3]) / 2 - cy, al = clamp(1 - Math.hypot(mx, my) / (R * 1.35)) * .17;
            if (al <= 0) continue;
            bctx.strokeStyle = `rgba(255,255,255,${al})`; bctx.beginPath(); bctx.moveTo(s[0], s[1]); bctx.lineTo(s[2], s[3]); bctx.stroke();
          }
        }
      }
      for (const h of houses) {
        const al = clamp(1 - h.d / (R * 1.4)) * .5 + .08;
        bctx.fillStyle = `rgba(255,255,255,${al * .32})`; bctx.strokeStyle = `rgba(255,255,255,${al * .55})`;
        bctx.beginPath(); bctx.roundRect ? bctx.roundRect(h.x - h.s / 2, h.y - h.s / 2, h.s, h.s, 2) : bctx.rect(h.x - h.s / 2, h.y - h.s / 2, h.s, h.s);
        bctx.fill(); bctx.stroke();
      }
      if (!FX || reduced) draw(performance.now());
    }

    function draw(now) {
      const t = now / 1000;
      p += (target - p) * .075;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(bg, 0, 0, W, H);
      const a = clamp((p - .1) / .62), rr = R * ease(a), alarm = p > .1;

      // barrido de radar (siempre en movimiento)
      const ang = t * .85;
      ctx.save(); ctx.beginPath(); ctx.arc(cx, cy, R * 1.32, 0, 6.283); ctx.clip();
      if (hasConic) {
        const cg = ctx.createConicGradient(ang - 1.1, cx, cy);
        const col = alarm ? '255,61,77' : '160,190,255';
        cg.addColorStop(0, `rgba(${col},0)`); cg.addColorStop(.17, `rgba(${col},${alarm ? .2 : .1})`); cg.addColorStop(.175, `rgba(${col},0)`);
        ctx.fillStyle = cg; ctx.fillRect(0, 0, W, H);
      }
      ctx.strokeStyle = alarm ? 'rgba(255,90,100,.7)' : 'rgba(170,200,255,.4)'; ctx.lineWidth = 1.2;
      ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(cx + Math.cos(ang) * R * 1.32, cy + Math.sin(ang) * R * 1.32); ctx.stroke();
      ctx.restore();

      // anillos de distancia
      ctx.setLineDash([3, 7]); ctx.lineWidth = 1;
      for (let k = 1; k <= 3; k++) {
        ctx.strokeStyle = `rgba(255,255,255,${.1 + (alarm ? .08 : 0)})`;
        ctx.beginPath(); ctx.arc(cx, cy, (R * k) / 3, 0, 6.283); ctx.stroke();
      }
      ctx.setLineDash([]);
      ctx.font = '500 10px "JetBrains Mono", monospace'; ctx.textAlign = 'left';
      ctx.fillStyle = 'rgba(255,255,255,.55)';
      for (let k = 1; k <= 3; k++) ctx.fillText(`${k * 100} m`, cx + Math.cos(-.62) * (R * k) / 3 + 6, cy + Math.sin(-.62) * (R * k) / 3);

      // pulso de espera
      if (!alarm) {
        const f = (t * .33) % 1;
        ctx.strokeStyle = `rgba(170,200,255,${(1 - f) * .28})`; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.arc(cx, cy, f * R * .7, 0, 6.283); ctx.stroke();
      }

      // onda de sonido de la alarma
      if (alarm && rr > 2) {
        const gr = ctx.createRadialGradient(cx, cy, 0, cx, cy, rr);
        gr.addColorStop(0, 'rgba(229,25,43,.02)'); gr.addColorStop(.8, 'rgba(229,25,43,.1)'); gr.addColorStop(1, 'rgba(229,25,43,.28)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.283); ctx.fill();
        ctx.strokeStyle = 'rgba(255,80,92,.95)'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.arc(cx, cy, rr, 0, 6.283); ctx.stroke();
        for (let k = 0; k < 3; k++) {
          const f = (t * .3 + k / 3) % 1;
          ctx.strokeStyle = `rgba(255,70,84,${(1 - f) * .5})`; ctx.lineWidth = 1.5;
          ctx.beginPath(); ctx.arc(cx, cy, f * rr, 0, 6.283); ctx.stroke();
        }
      }

      // casas alcanzadas
      if (alarm) {
        for (const h of houses) {
          if (h.d > R) continue;
          const lit = clamp((rr - h.d) / (g * 1.8)); if (lit <= 0) continue;
          const pulse = .55 + .45 * Math.sin(t * 5 + h.ph);
          ctx.fillStyle = `rgba(255,61,77,${.2 * lit * pulse})`;
          ctx.beginPath(); ctx.arc(h.x, h.y, h.s * (1.1 + .9 * pulse * lit), 0, 6.283); ctx.fill();
          ctx.fillStyle = `rgba(255,${70 + 90 * (1 - lit)},${84 + 80 * (1 - lit)},${.35 + .65 * lit})`;
          ctx.fillRect(h.x - h.s / 2, h.y - h.s / 2, h.s, h.s);
        }
      }

      // etiquetas de casa (versión parlante con ID)
      const la = clamp((p - .72) / .14);
      if (la > 0) {
        ctx.font = '600 10px "JetBrains Mono", monospace';
        for (const h of labels) {
          const lit = clamp((rr - h.d) / (g * 1.8)); if (lit < .9) continue;
          const dx = Math.cos(h.a) >= 0 ? 1 : -1, ex = h.x + dx * 26, ey = h.y - 22, w = ctx.measureText(h.label).width + 16;
          ctx.globalAlpha = la;
          ctx.strokeStyle = 'rgba(255,255,255,.6)'; ctx.lineWidth = 1;
          ctx.beginPath(); ctx.moveTo(h.x, h.y); ctx.lineTo(ex, ey); ctx.stroke();
          const bx = dx > 0 ? ex : ex - w;
          ctx.fillStyle = 'rgba(8,8,11,.9)'; ctx.strokeStyle = 'rgba(255,61,77,.85)';
          ctx.beginPath(); ctx.roundRect ? ctx.roundRect(bx, ey - 11, w, 22, 6) : ctx.rect(bx, ey - 11, w, 22); ctx.fill(); ctx.stroke();
          ctx.fillStyle = '#fff'; ctx.textAlign = 'left'; ctx.fillText(h.label, bx + 8, ey + 3.5);
          ctx.globalAlpha = 1;
        }
      }

      // nodo central (la alarma)
      if (alarm) {
        const fl = Math.sin(t * 9) > 0;
        for (const [ox, col] of [[-1, fl ? '255,40,55' : '255,40,55'], [1, fl ? '70,130,255' : '70,130,255']]) {
          const on = (ox < 0) === fl, rg = ctx.createRadialGradient(cx + ox * g * .5, cy, 0, cx + ox * g * .5, cy, g * 2.6);
          rg.addColorStop(0, `rgba(${col},${on ? .75 : .12})`); rg.addColorStop(1, `rgba(${col},0)`);
          ctx.fillStyle = rg; ctx.beginPath(); ctx.arc(cx + ox * g * .5, cy, g * 2.6, 0, 6.283); ctx.fill();
        }
      }
      ctx.fillStyle = alarm ? '#ff2d3d' : '#cfd8ff';
      ctx.beginPath(); ctx.arc(cx, cy, g * .5, 0, 6.283); ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,.85)'; ctx.lineWidth = 2;
      ctx.beginPath(); ctx.arc(cx, cy, g * .5 + 4, 0, 6.283); ctx.stroke();
      ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(cx, cy, g * .16, 0, 6.283); ctx.fill();

      // UI textual
      const si = p < .34 ? 0 : p < .67 ? 1 : 2;
      if (si !== lastStep) { steps.forEach((s, i) => s.classList.toggle('is-on', i === si)); lastStep = si; }
      if (alarm !== lastAlert) {
        status.classList.toggle('is-alert', alarm);
        $('span', status).textContent = alarm ? '¡Alarma activada!' : 'Todo tranquilo';
        lastAlert = alarm;
      }
    }

    const loop = (now) => { if (!vis) { raf = 0; return; } draw(now); raf = requestAnimationFrame(loop); };
    const start = () => { if (!raf && FX) raf = requestAnimationFrame(loop); };
    if (FX) {
      new IntersectionObserver(([e]) => { vis = e.isIntersecting; if (vis) start(); }, { rootMargin: '120px' }).observe(sec);
      ScrollTrigger.create({ trigger: sec, start: 'top top', end: 'bottom bottom', onUpdate: (s) => { target = s.progress; } });
    }
    let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 200); });
    build();
  }

  /* 10 · Catálogo: scroll horizontal controlado por scroll (escritorio) ------------------------------ */
  function initCatalog() {
    const cat = $('#catalogo'), track = $('#catTrack'); if (!cat || !track) return;
    $$('img', track).forEach((i) => { i.loading = 'eager'; });
    const cards = $$('.pc', track);
    if (finePointer) {
      cards.forEach((card) => {
        card.style.transition = 'box-shadow .7s cubic-bezier(.16,1,.3,1),border-color .4s';
        card.addEventListener('pointermove', (e) => {
          const r = card.getBoundingClientRect(), nx = (e.clientX - r.left) / r.width - .5, ny = (e.clientY - r.top) / r.height - .5;
          gsap.to(card, { rotationY: nx * 9, rotationX: -ny * 7, transformPerspective: 900, duration: .5, ease: 'power2.out', overwrite: 'auto' });
        });
        card.addEventListener('pointerleave', () => gsap.to(card, { rotationX: 0, rotationY: 0, duration: .9, ease: 'power3.out', overwrite: 'auto' }));
      });
    }
    const mm = gsap.matchMedia();
    mm.add('(min-width: 980px)', () => {
      const bar = $('#catBar'), now = $('#catNow'), lbl = $('#catLbl');
      let dist = 0, centers = [];
      const measure = () => {
        track.style.transform = 'none';
        dist = Math.max(0, track.scrollWidth - innerWidth);
        cat.style.height = (innerHeight + dist) + 'px';
        centers = cards.map((c) => c.offsetLeft + c.offsetWidth / 2);
      };
      measure();
      const st = ScrollTrigger.create({
        trigger: cat, start: 'top top', end: 'bottom bottom', invalidateOnRefresh: true, onRefreshInit: measure,
        onUpdate: (self) => {
          const pr = self.progress;
          track.style.transform = `translate3d(${(-dist * pr).toFixed(1)}px,0,0)`;
          bar.style.setProperty('--p', pr.toFixed(4));
          const vc = innerWidth / 2 + dist * pr;
          let best = 0, bd = 1e9;
          centers.forEach((c, i) => { const d = Math.abs(c - vc); if (d < bd) { bd = d; best = i; } });
          const n = String(best + 1).padStart(2, '0');
          if (now.textContent !== n) { now.textContent = n; lbl.textContent = $('.pc__cat', cards[best]).textContent; }
        },
      });
      return () => { st.kill(); cat.style.height = ''; track.style.transform = ''; };
    });
    // el catálogo cubre al bloque anterior mientras sube
    gsap.to('#soluciones', {
      scale: .93, opacity: .35, ease: 'none',
      scrollTrigger: { trigger: cat, start: 'top bottom', end: 'top top', scrub: true },
    });
  }

  /* 11 · Proceso, parallax, footer ---------------------------------------------------------------------- */
  function initScrollFx() {
    // línea de proceso
    const steps = $('#steps');
    if (steps) {
      const items = $$('.step', steps);
      ScrollTrigger.create({
        trigger: steps, start: 'top 72%', end: 'bottom 62%', scrub: .4,
        onUpdate: (s) => {
          steps.style.setProperty('--fill', s.progress.toFixed(4));
          items.forEach((it, i) => it.classList.toggle('is-on', s.progress >= (i + .12) / items.length));
        },
      });
    }
    // parallax de imágenes
    $$('img[data-speed]').forEach((img) => {
      gsap.fromTo(img, { yPercent: -6 }, { yPercent: 6, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } });
    });
    // salida del hero
    gsap.to('.hero__in', { yPercent: -9, opacity: .15, ease: 'none', scrollTrigger: { trigger: '#inicio', start: 'top top', end: 'bottom top', scrub: true } });
    gsap.to('.hero__fx', { opacity: 0, ease: 'none', scrollTrigger: { trigger: '#inicio', start: '40% top', end: 'bottom top', scrub: true } });
    // marca gigante del footer
    const ftr = $('.ftr');
    if (ftr) ScrollTrigger.create({ trigger: ftr, start: 'top 90%', end: 'bottom bottom', scrub: true, onUpdate: (s) => ftr.style.setProperty('--fill', s.progress.toFixed(4)) });
    // escala de la banda roja al entrar
    gsap.fromTo('.band__grid', { scale: .94, borderRadius: 48 }, { scale: 1, borderRadius: 28, ease: 'none', scrollTrigger: { trigger: '.band__grid', start: 'top 100%', end: 'top 55%', scrub: true } });
  }

  /* 12 · UI: header, puntos, progreso, cursor, magnéticos -------------------------------------------------- */
  function initChrome() {
    const hdr = $('#hdr'), prog = $('#progress'), dots = $('#dots');
    const secs = $$('[data-nav]');
    secs.forEach((s) => {
      const b = document.createElement('button');
      b.type = 'button'; b.setAttribute('aria-label', 'Ir a ' + s.dataset.nav);
      b.innerHTML = `<span>${s.dataset.nav}</span>`;
      b.addEventListener('click', () => goTo(s));
      dots.appendChild(b);
    });
    const dotBtns = $$('button', dots), navLinks = $$('.nav a');
    let lastY = scrollY, ticking = false, active = -1;
    const update = () => {
      ticking = false;
      const y = scrollY, max = document.documentElement.scrollHeight - innerHeight;
      prog.style.setProperty('--p', max > 0 ? (y / max).toFixed(4) : 0);
      hdr.classList.toggle('is-solid', y > 40);
      const dy = y - lastY;
      if (!root.classList.contains('menu-open')) {
        if (y > 500 && dy > 8) hdr.classList.add('is-hide'); else if (dy < -8 || y < 500) hdr.classList.remove('is-hide');
      }
      lastY = y;
      let idx = 0;
      secs.forEach((s, i) => { if (s.getBoundingClientRect().top <= innerHeight * .45) idx = i; });
      if (idx !== active) {
        active = idx;
        dotBtns.forEach((b, i) => b.classList.toggle('is-on', i === idx));
        const id = secs[idx].id;
        navLinks.forEach((a) => a.classList.toggle('is-on', a.getAttribute('href') === '#' + id));
        dots.classList.toggle('is-hide', id === 'catalogo');
      }
    };
    addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    update();
  }

  function initCursor() {
    if (!finePointer || reduced) return;
    const c = $('#cursor'), dot = $('.cursor__dot'), ring = $('.cursor__ring'), lab = $('span', ring);
    root.classList.add('has-cursor');
    let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
    addEventListener('pointermove', (e) => { x = e.clientX; y = e.clientY; dot.style.transform = `translate3d(${x}px,${y}px,0)`; }, { passive: true });
    (function loop() { rx += (x - rx) * .17; ry += (y - ry) * .17; ring.style.transform = `translate3d(${rx}px,${ry}px,0)`; requestAnimationFrame(loop); })();
    document.addEventListener('pointerover', (e) => {
      const t = e.target.closest('a,button,[data-cursor],label,select,textarea,input');
      c.classList.toggle('is-link', !!t);
      const d = e.target.closest('[data-cursor]');
      lab.textContent = d ? d.dataset.cursor : '';
    });
    addEventListener('pointerdown', () => c.classList.add('is-down'));
    addEventListener('pointerup', () => c.classList.remove('is-down'));
  }

  function initMagnetic() {
    if (!finePointer || !hasGsap) return;
    $$('[data-magnetic]').forEach((el) => {
      const s = { x: 0, y: 0 }, apply = () => { el.style.translate = `${s.x}px ${s.y}px`; };
      el.addEventListener('pointermove', (e) => {
        const r = el.getBoundingClientRect();
        gsap.to(s, { x: (e.clientX - (r.left + r.width / 2)) * .28, y: (e.clientY - (r.top + r.height / 2)) * .4, duration: .4, ease: 'power3.out', overwrite: true, onUpdate: apply });
      });
      el.addEventListener('pointerleave', () => gsap.to(s, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.4)', overwrite: true, onUpdate: apply }));
    });
  }

  /* 13 · Arranque ----------------------------------------------------------------------------------------------- */
  initWhatsAppLinks();
  initMenu();
  initFaq();
  initForm();
  initScenarios();
  initAnchors();
  initChrome();

  if (!FX) {
    // Sin GSAP o con "reducir movimiento": contenido estático, todo visible
    root.classList.add('no-gsap');
    root.classList.remove('is-loading');
    $('#dots').classList.add('is-show');
    initRadar();
    return;
  }

  root.classList.add('fx');
  initScroll();
  initHeroFx();
  initReveals();
  initSenses();
  initRadar();
  initCatalog();
  initScrollFx();
  initCursor();
  initMagnetic();
  runLoader(intro);

  const refresh = () => ScrollTrigger.refresh();
  addEventListener('load', () => { $$('img[loading="lazy"]').forEach((i) => { i.loading = 'eager'; }); setTimeout(refresh, 300); });
  if (document.fonts) document.fonts.ready.then(() => setTimeout(refresh, 100));
})();
