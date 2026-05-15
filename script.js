/* ═══════════════════════════════════════════
   SARAH & KARIM — script.js
   ═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
    initStars('starCanvas');
    initStars('verseStars', 60);
    initStars('closeStars', 80);
    initProgress();
    initReveal();
    initTimelineReveal();
    initBackToTop();
    initCountdown();
    initRSVP();
    initScrollCueFade();
});

/* ═══════════════════════════════════════════
   STAR CANVAS — reusable for multiple canvases
   ═══════════════════════════════════════════ */

function initStars(canvasId, count) {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const isHero = canvasId === 'starCanvas';
    const starCount = count || (window.innerWidth < 600 ? 80 : 160);

    let W, H, stars = [];

    function resize() {
        const parent = canvas.parentElement;
        W = canvas.width  = parent.offsetWidth;
        H = canvas.height = parent.offsetHeight;
        buildStars();
    }

    function buildStars() {
        stars = [];
        for (let i = 0; i < starCount; i++) {
            stars.push({
                x:    Math.random() * W,
                y:    Math.random() * H,
                r:    Math.random() * (isHero ? 1.6 : 1.2),
                a:    Math.random(),
                da:   (Math.random() - 0.5) * 0.006,
                gold: Math.random() < 0.12,
            });
        }
    }

    resize();
    window.addEventListener('resize', resize, { passive: true });

    function loop() {
        ctx.clearRect(0, 0, W, H);
        stars.forEach(s => {
            s.a += s.da;
            if (s.a > 1 || s.a < 0) s.da *= -1;
            s.a = Math.max(0, Math.min(1, s.a));

            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fillStyle = s.gold
                ? `rgba(201,168,76,${s.a * 0.75})`
                : `rgba(240,234,216,${s.a * 0.65})`;
            ctx.fill();
        });
        requestAnimationFrame(loop);
    }

    loop();
}

/* ═══════════════════════════════════════════
   SCROLL PROGRESS
   ═══════════════════════════════════════════ */

function initProgress() {
    const bar = document.getElementById('progress');
    if (!bar) return;
    let t = false;
    window.addEventListener('scroll', () => {
        if (!t) {
            requestAnimationFrame(() => {
                const tot = document.documentElement.scrollHeight - innerHeight;
                bar.style.width = (tot > 0 ? scrollY / tot * 100 : 0) + '%';
                t = false;
            });
            t = true;
        }
    }, { passive: true });
}

/* ═══════════════════════════════════════════
   SCROLL REVEAL — generic blocks
   ═══════════════════════════════════════════ */

function initReveal() {
    const io = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) {
                e.target.classList.add('visible');
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.reveal').forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════════
   TIMELINE REVEAL — staggered
   ═══════════════════════════════════════════ */

function initTimelineReveal() {
    const items = document.querySelectorAll('.tl-item');
    if (!items.length) return;

    const io = new IntersectionObserver(entries => {
        entries.forEach((e, i) => {
            if (e.isIntersecting) {
                setTimeout(() => {
                    e.target.classList.add('visible');
                }, i * 150);
                io.unobserve(e.target);
            }
        });
    }, { threshold: 0.15 });

    items.forEach(el => io.observe(el));
}

/* ═══════════════════════════════════════════
   BACK TO TOP
   ═══════════════════════════════════════════ */

function initBackToTop() {
    const btn = document.getElementById('btt');
    if (!btn) return;
    window.addEventListener('scroll', () => btn.classList.toggle('show', scrollY > 450), { passive: true });
    btn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

/* ═══════════════════════════════════════════
   LIVE COUNTDOWN
   ═══════════════════════════════════════════ */

function initCountdown() {
    const wedding = new Date('2026-03-14T17:00:00');
    const els = {
        d: document.getElementById('cDays'),
        h: document.getElementById('cHours'),
        m: document.getElementById('cMins'),
        s: document.getElementById('cSecs'),
    };
    const pad = n => String(Math.max(0, n)).padStart(2, '0');

    function tick() {
        const diff = wedding - new Date();
        if (diff <= 0) {
            Object.values(els).forEach(el => { if (el) el.textContent = '00'; });
            return;
        }
        if (els.d) els.d.textContent = pad(Math.floor(diff / 86400000));
        if (els.h) els.h.textContent = pad(Math.floor(diff % 86400000 / 3600000));
        if (els.m) els.m.textContent = pad(Math.floor(diff % 3600000 / 60000));
        if (els.s) els.s.textContent = pad(Math.floor(diff % 60000 / 1000));
    }

    tick();
    setInterval(tick, 1000);
}

/* ═══════════════════════════════════════════
   RSVP FORM
   ═══════════════════════════════════════════ */

function initRSVP() {
    const card    = document.getElementById('rsvpCard');
    const thanks  = document.getElementById('rsvpThanks');
    const btnSend = document.getElementById('rsvpBtn');
    const stepDn  = document.getElementById('stDown');
    const stepUp  = document.getElementById('stUp');
    const gCount  = document.getElementById('gCount');
    const rtYes   = document.getElementById('rtYes');
    const rtNo    = document.getElementById('rtNo');
    const rthMsg  = document.getElementById('rthMsg');

    if (!card || !btnSend) return;

    let guests   = 1;
    let attending = true;

    // Guest stepper
    stepDn && stepDn.addEventListener('click', () => {
        guests = Math.max(1, guests - 1);
        gCount.textContent = guests;
    });
    stepUp && stepUp.addEventListener('click', () => {
        guests = Math.min(10, guests + 1);
        gCount.textContent = guests;
    });

    // Attend toggle
    rtYes && rtYes.addEventListener('click', () => {
        attending = true;
        rtYes.classList.add('active');
        rtNo.classList.remove('active');
    });
    rtNo && rtNo.addEventListener('click', () => {
        attending = false;
        rtNo.classList.add('active');
        rtYes.classList.remove('active');
    });

    // Submit
    btnSend.addEventListener('click', () => {
        const name = document.getElementById('rName')?.value.trim();
        if (!name) {
            document.getElementById('rName')?.focus();
            document.getElementById('rName')?.style.setProperty('border-color', 'rgba(220,80,80,.7)');
            setTimeout(() => document.getElementById('rName')?.style.setProperty('border-color', 'rgba(201,168,76,.22)'), 2000);
            return;
        }

        // Animate out
        card.style.transition = 'opacity .4s, transform .4s';
        card.style.opacity = '0';
        card.style.transform = 'translateY(-16px)';

        setTimeout(() => {
            card.style.display = 'none';
            if (rthMsg) {
                rthMsg.textContent = attending
                    ? `${name}, we are so excited to celebrate with you and your ${guests > 1 ? guests + ' guests' : 'guest'}!`
                    : `${name}, you will be missed — but we appreciate you letting us know.`;
            }
            thanks.style.display = 'block';
            thanks.style.animation = 'bttIn .5s ease both';
        }, 400);
    });
}

/* ═══════════════════════════════════════════
   HERO SCROLL CUE FADE
   ═══════════════════════════════════════════ */

function initScrollCueFade() {
    const cue = document.querySelector('.hero-scroll-cue');
    if (!cue) return;
    window.addEventListener('scroll', () => {
        cue.style.opacity = scrollY > 80 ? '0' : '1';
    }, { passive: true });
}

/* ── Smooth anchors ── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
        e.preventDefault();
        const t = document.querySelector(a.getAttribute('href'));
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
});
