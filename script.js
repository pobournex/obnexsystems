/* =============================================
   OBNEX SYSTEMS — script.js
   Performance-first · Accessible · Lightweight
   ============================================= */

'use strict';

// ── Navbar scroll shadow ──────────────────────
const navbar = document.getElementById('navbar');
const onScroll = () => {
  navbar.classList.toggle('scrolled', window.scrollY > 10);
  // Back to top visibility
  backToTop.classList.toggle('visible', window.scrollY > 400);
};
window.addEventListener('scroll', onScroll, { passive: true });

// ── Mobile hamburger ──────────────────────────
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');

hamburger.addEventListener('click', () => {
  const isOpen = navLinks.classList.toggle('open');
  hamburger.setAttribute('aria-expanded', String(isOpen));
  // Trap focus when open on mobile (basic)
  if (isOpen) navLinks.querySelector('a')?.focus();
});

// Close mobile nav on link click
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  });
});

// Close on ESC
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && navLinks.classList.contains('open')) {
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.focus();
  }
});

// ── Services dropdown ─────────────────────────
const dropdownToggle = document.querySelector('.nav-dropdown-toggle');
const dropdownMenu   = document.querySelector('.nav-dropdown-menu');

if (dropdownToggle && dropdownMenu) {
  dropdownToggle.addEventListener('click', e => {
    e.stopPropagation();
    const isOpen = dropdownMenu.classList.toggle('open');
    dropdownToggle.setAttribute('aria-expanded', String(isOpen));
  });

  // Close when clicking a menu item
  dropdownMenu.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      dropdownMenu.classList.remove('open');
      dropdownToggle.setAttribute('aria-expanded', 'false');
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  // Close when clicking outside
  document.addEventListener('click', () => {
    dropdownMenu.classList.remove('open');
    dropdownToggle.setAttribute('aria-expanded', 'false');
  });

  // Close on ESC
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      dropdownMenu.classList.remove('open');
      dropdownToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

// ── Dynamic year ──────────────────────────────
const yearEl = document.getElementById('year');
if (yearEl) yearEl.textContent = new Date().getFullYear();

// ── Back to top ───────────────────────────────
const backToTop = document.getElementById('backToTop');
backToTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

// ── Animated node canvas (hero background) ───
(function initCanvas() {
  const canvas = document.getElementById('nodeCanvas');
  if (!canvas) return;

  const ctx    = canvas.getContext('2d');
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced) {
    canvas.style.display = 'none';
    return;
  }

  let W, H, nodes, animId;
  const NODE_COUNT  = 55;
  const LINK_DIST   = 140;
  const NODE_SPEED  = 0.35;
  const NODE_RADIUS = 2.5;
  const COLOR_NODE  = 'rgba(15,98,254,0.55)';
  const COLOR_LINE  = 'rgba(15,98,254,';

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width  = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width  = W + 'px';
    canvas.style.height = H + 'px';
    ctx.scale(dpr, dpr);
  }

  function makeNode() {
    const angle = Math.random() * Math.PI * 2;
    const speed = (Math.random() * 0.5 + 0.15) * NODE_SPEED;
    return {
      x: Math.random() * W,
      y: Math.random() * H,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
    };
  }

  function init() {
    resize();
    nodes = Array.from({ length: NODE_COUNT }, makeNode);
  }

  function draw() {
    ctx.clearRect(0, 0, W, H);

    // Update positions
    nodes.forEach(n => {
      n.x += n.vx;
      n.y += n.vy;
      if (n.x < 0 || n.x > W) n.vx *= -1;
      if (n.y < 0 || n.y > H) n.vy *= -1;
    });

    // Draw connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx   = nodes[i].x - nodes[j].x;
        const dy   = nodes[i].y - nodes[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < LINK_DIST) {
          const alpha = (1 - dist / LINK_DIST) * 0.35;
          ctx.beginPath();
          ctx.strokeStyle = COLOR_LINE + alpha + ')';
          ctx.lineWidth   = 1;
          ctx.moveTo(nodes[i].x, nodes[i].y);
          ctx.lineTo(nodes[j].x, nodes[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw nodes
    nodes.forEach(n => {
      ctx.beginPath();
      ctx.fillStyle = COLOR_NODE;
      ctx.arc(n.x, n.y, NODE_RADIUS, 0, Math.PI * 2);
      ctx.fill();
    });

    animId = requestAnimationFrame(draw);
  }

  init();
  draw();

  // Handle resize with debounce
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      cancelAnimationFrame(animId);
      init();
      draw();
    }, 200);
  }, { passive: true });

  // Pause when tab not visible (performance)
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      cancelAnimationFrame(animId);
    } else {
      draw();
    }
  });
})();

// ── Scroll-triggered animations ───────────────
(function initAnimations() {
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced) {
    // Show all immediately if motion is reduced
    document.querySelectorAll('[data-animate]').forEach(el => {
      el.classList.add('in-view');
    });
    return;
  }

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        observer.unobserve(entry.target);
      }
    }),
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  document.querySelectorAll('[data-animate]').forEach((el, i) => {
    // Stagger children in grids
    const parent = el.closest('.services-grid, .pillars-grid, .hero-metrics, .about-stats');
    if (parent) {
      const siblings = parent.querySelectorAll('[data-animate]');
      const idx = Array.from(siblings).indexOf(el);
      el.style.transitionDelay = (idx * 80) + 'ms';
    }
    observer.observe(el);
  });
})();

// ── Contact form — Web3Forms submission ───────
const contactForm = document.getElementById('contactForm');
const formNote    = document.getElementById('formNote');
const submitBtn   = document.getElementById('submitBtn');

if (contactForm) {
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();

    // Client-side validation
    const name    = this.querySelector('#name');
    const email   = this.querySelector('#email');
    const message = this.querySelector('#message');

    if (!name.value.trim() || !email.value.trim() || !message.value.trim()) {
      formNote.textContent = 'Please fill in all required fields.';
      formNote.style.color = '#e11d48';
      return;
    }

    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML = 'Sending&hellip;';
    submitBtn.disabled  = true;
    submitBtn.style.opacity = '.7';

    try {
      const res  = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        body: new FormData(this),
      });
      const json = await res.json();

      if (json.success) {
        submitBtn.innerHTML     = '&#10003; Message Sent!';
        submitBtn.style.opacity = '1';
        submitBtn.style.background = '#15803d';
        submitBtn.style.borderColor = '#15803d';
        formNote.textContent = 'Thank you — we will be in touch within one business day.';
        formNote.style.color = '#15803d';
        this.reset();
      } else {
        throw new Error('Submission failed');
      }
    } catch {
      submitBtn.innerHTML     = 'Something went wrong — try again';
      submitBtn.style.opacity = '1';
      submitBtn.style.background = '#e11d48';
      submitBtn.style.borderColor = '#e11d48';
      submitBtn.disabled = false;
      formNote.textContent = 'Please try again or email us directly.';
      formNote.style.color = '#e11d48';
    }

    setTimeout(() => {
      submitBtn.innerHTML    = originalText;
      submitBtn.style.background = '';
      submitBtn.style.borderColor = '';
      submitBtn.style.opacity = '1';
      submitBtn.disabled     = false;
      formNote.textContent   = 'We typically respond within one business day.';
      formNote.style.color   = '';
    }, 5000);
  });
}
