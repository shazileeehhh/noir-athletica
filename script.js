(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none), (pointer: coarse)').matches;
  const hasGSAP = typeof window.gsap !== 'undefined';
  if (hasGSAP && window.ScrollTrigger) gsap.registerPlugin(ScrollTrigger);

  document.getElementById('year').textContent = new Date().getFullYear();

  /* =========================================================
     LOADER
     ========================================================= */
  const loader = document.getElementById('loader');
  const loaderBar = document.getElementById('loaderBar');
  const loaderPct = document.getElementById('loaderPct');
  let progress = 0;
  const loaderTimer = setInterval(() => {
    progress += Math.random() * 18 + 6;
    if (progress >= 100) {
      progress = 100;
      clearInterval(loaderTimer);
      finishLoad();
    }
    loaderBar.style.width = progress + '%';
    loaderPct.textContent = String(Math.floor(progress)).padStart(2, '0');
  }, 180);

  function finishLoad() {
    setTimeout(() => {
      loader.classList.add('is-hidden');
      document.body.style.overflow = '';
      runHeroEntrance();
    }, 320);
  }
  document.body.style.overflow = 'hidden';
  // Safety: never trap the user behind the loader
  setTimeout(finishLoad, 3200);

  /* =========================================================
     LENIS SMOOTH SCROLL
     ========================================================= */
  let lenis;
  if (!reducedMotion && !isTouch && typeof window.Lenis !== 'undefined') {
    lenis = new Lenis({ duration: 1.1, smoothWheel: true });
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
    if (hasGSAP && window.ScrollTrigger) {
      lenis.on('scroll', ScrollTrigger.update);
      gsap.ticker.add((time) => lenis.raf(time * 1000));
      gsap.ticker.lagSmoothing(0);
    }
  }

  /* =========================================================
     CUSTOM CURSOR
     ========================================================= */
  if (!isTouch) {
    document.body.classList.add('has-custom-cursor');
    const cursor = document.getElementById('cursor');
    const cursorLabel = document.getElementById('cursorLabel');
    let cx = window.innerWidth / 2, cy = window.innerHeight / 2;
    let rx = cx, ry = cy;

    window.addEventListener('mousemove', (e) => {
      cx = e.clientX;
      cy = e.clientY;
    });

    function tickCursor() {
      rx += (cx - rx) * 0.18;
      ry += (cy - ry) * 0.18;
      cursor.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(tickCursor);
    }
    tickCursor();

    document.querySelectorAll('[data-cursor]').forEach((el) => {
      const type = el.getAttribute('data-cursor');
      el.addEventListener('mouseenter', () => {
        cursor.classList.add('is-' + type);
        if (type === 'view') cursorLabel.textContent = 'View';
      });
      el.addEventListener('mouseleave', () => {
        cursor.classList.remove('is-' + type);
        cursorLabel.textContent = '';
      });
    });
  }

  /* =========================================================
     NAV
     ========================================================= */
  const nav = document.getElementById('nav');
  const navBurger = document.getElementById('navBurger');
  const navMobile = document.getElementById('navMobile');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('is-scrolled', window.scrollY > 40);
  }, { passive: true });

  navBurger.addEventListener('click', () => {
    const open = navMobile.classList.toggle('is-open');
    navBurger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  });
  navMobile.querySelectorAll('a').forEach((a) => a.addEventListener('click', () => {
    navMobile.classList.remove('is-open');
    navBurger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }));

  /* =========================================================
     HERO ENTRANCE (choreographed)
     ========================================================= */
  function runHeroEntrance() {
    if (reducedMotion || !hasGSAP) {
      document.querySelectorAll('.reveal-line').forEach((el) => (el.style.opacity = '1'));
      document.querySelectorAll('.hero-headline .line span').forEach((el) => (el.style.transform = 'none'));
      return;
    }
    gsap.set('.hero-headline .line span', { yPercent: 120 });
    gsap.set('.hero-media img', { scale: 1.15 });
    gsap.set('.reveal-line', { y: 16 });

    const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
    tl.to('.hero-media img', { scale: 1, duration: 1.8, ease: 'power2.out' }, 0)
      .to('.eyebrow[data-anim="hero"]', { opacity: 1, y: 0, duration: .8 }, .15)
      .to('.hero-headline .line span', { yPercent: 0, duration: 1, stagger: .12 }, .3)
      .to('.hero-sub[data-anim="hero"]', { opacity: 1, y: 0, duration: .8 }, .75)
      .to('.hero-actions[data-anim="hero"]', { opacity: 1, y: 0, duration: .8 }, .9)
      .to('.scroll-indicator[data-anim="hero"]', { opacity: 1, duration: .8 }, 1.1);
  }

  /* =========================================================
     SCROLL REVEALS — IntersectionObserver
     ========================================================= */
  const revealTargets = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealTargets.forEach((el) => io.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add('is-visible'));
  }

  /* =========================================================
     BRAND STATEMENT — word-by-word reveal
     ========================================================= */
  const statementEl = document.querySelector('[data-split]');
  if (statementEl) {
    const html = statementEl.innerHTML;
    const wrapped = html
      .split(/(<span[^>]*>|<\/span>|\s+)/)
      .filter(Boolean);
    let out = '';
    let insideSpan = false;
    wrapped.forEach((chunk) => {
      if (chunk.startsWith('<span')) { out += chunk; insideSpan = true; return; }
      if (chunk === '</span>') { out += chunk; insideSpan = false; return; }
      if (/^\s+$/.test(chunk)) { out += chunk; return; }
      out += `<span class="word">${chunk}</span>`;
    });
    statementEl.innerHTML = out;

    if (hasGSAP && window.ScrollTrigger && !reducedMotion) {
      gsap.to(statementEl.querySelectorAll('.word'), {
        opacity: 1,
        stagger: 0.04,
        ease: 'none',
        scrollTrigger: {
          trigger: statementEl,
          start: 'top 80%',
          end: 'bottom 55%',
          scrub: true,
        },
      });
    } else {
      statementEl.querySelectorAll('.word').forEach((w) => (w.style.opacity = '1'));
    }
  }

  /* =========================================================
     STAT COUNTERS
     ========================================================= */
  const statNums = document.querySelectorAll('.stat-num');
  if (statNums.length && 'IntersectionObserver' in window) {
    const counterIO = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        counterIO.unobserve(el);
        const target = parseFloat(el.dataset.count);
        const suffix = el.dataset.suffix || '';
        const duration = reducedMotion ? 0 : 1400;
        const start = performance.now();
        function tick(now) {
          const p = duration === 0 ? 1 : Math.min(1, (now - start) / duration);
          const eased = 1 - Math.pow(1 - p, 3);
          const val = Math.floor(target * eased);
          el.textContent = val.toLocaleString() + suffix;
          if (p < 1) requestAnimationFrame(tick);
          else el.textContent = target.toLocaleString() + suffix;
        }
        requestAnimationFrame(tick);
      });
    }, { threshold: 0.4 });
    statNums.forEach((el) => counterIO.observe(el));
  }

  /* =========================================================
     CINEMATIC PINNED SECTION
     ========================================================= */
  if (hasGSAP && window.ScrollTrigger && !reducedMotion) {
    gsap.timeline({
      scrollTrigger: {
        trigger: '.cinematic',
        start: 'top top',
        end: 'bottom top',
        scrub: 0.6,
      },
    })
      .fromTo('#cinematicImg', { scale: 1.25 }, { scale: 1.05, ease: 'none' }, 0)
      .fromTo('.cinematic-text span', { opacity: 0.18, y: 26 }, { opacity: 1, y: 0, stagger: 0.25, ease: 'none' }, 0);
  } else {
    document.querySelectorAll('.cinematic-text span').forEach((s) => (s.style.opacity = '1'));
  }

  /* =========================================================
     TESTIMONIAL SLIDER
     ========================================================= */
  const testimonials = document.querySelectorAll('.testimonial');
  const dotsWrap = document.getElementById('testimonialDots');
  let activeIndex = 0;
  let testimonialTimer;

  testimonials.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.setAttribute('aria-label', `Show testimonial ${i + 1}`);
    if (i === 0) dot.classList.add('active');
    dot.addEventListener('click', () => setTestimonial(i, true));
    dotsWrap.appendChild(dot);
  });

  function setTestimonial(i, userTriggered) {
    testimonials[activeIndex].classList.remove('active');
    dotsWrap.children[activeIndex].classList.remove('active');
    activeIndex = i;
    testimonials[activeIndex].classList.add('active');
    dotsWrap.children[activeIndex].classList.add('active');
    if (userTriggered) restartTestimonialTimer();
  }

  function restartTestimonialTimer() {
    clearInterval(testimonialTimer);
    if (reducedMotion) return;
    testimonialTimer = setInterval(() => {
      setTestimonial((activeIndex + 1) % testimonials.length, false);
    }, 5500);
  }
  restartTestimonialTimer();

  /* =========================================================
     SMOOTH ANCHOR SCROLL for nav links
     ========================================================= */
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (id.length < 2) return;
      const target = document.querySelector(id);
      if (!target) return;
      e.preventDefault();
      if (lenis) lenis.scrollTo(target, { offset: -20 });
      else target.scrollIntoView({ behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });
})();
