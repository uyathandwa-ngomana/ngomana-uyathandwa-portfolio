/* ================================================================
   PORTFOLIO — script.js
   Author : Uyathandwa Ngomana
   Stack  : Vanilla JavaScript (ES6+)
   Features:
     - Typing / typewriter animation
     - Sticky navbar with scroll detection
     - Active nav-link highlighting
     - Mobile hamburger menu
     - Dark / Light theme toggle (persisted in localStorage)
     - Scroll-reveal animations (IntersectionObserver)
     - Skill-bar fill animation (triggered on scroll into view)
     - Contact form validation & feedback
     - Back-to-top button
     - Footer year auto-update
   ================================================================ */

/* ----------------------------------------------------------------
   1. DOM READY — wait for full parse before running
   ---------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {

  /* ============================================================
     2. TYPING ANIMATION
     Cycles through an array of role strings, typing each one
     character by character, pausing, then erasing.
  ============================================================ */
  const typedEl   = document.getElementById('typedText');
  const roles      = [
    'Java Developer',
    'Python Programmer',
    'Problem Solver',
    'Database Designer',
    'Software Developer',
    'ICT Student @ CPUT',
  ];

  let roleIndex  = 0;   // which string we're on
  let charIndex  = 0;   // which character within the string
  let isDeleting = false;
  let typingTimer;

  /**
   * Core typing loop.
   * Calculates the next character state and schedules itself
   * recursively with a variable delay to feel natural.
   */
  function typeLoop() {
    const currentRole = roles[roleIndex];

    if (isDeleting) {
      // Remove one character
      typedEl.textContent = currentRole.substring(0, charIndex - 1);
      charIndex--;
    } else {
      // Add one character
      typedEl.textContent = currentRole.substring(0, charIndex + 1);
      charIndex++;
    }

    // Determine next delay
    let delay = isDeleting ? 60 : 100;

    if (!isDeleting && charIndex === currentRole.length) {
      // Finished typing — pause before deleting
      delay = 1800;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting — move to next role
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 400;
    }

    typingTimer = setTimeout(typeLoop, delay);
  }

  // Kick off the typing animation
  typeLoop();


  /* ============================================================
     3. NAVBAR — scroll detection & active link highlighting
  ============================================================ */
  const navbar   = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');

  /**
   * Add/remove the .scrolled class to the navbar based on
   * how far the user has scrolled.
   */
  function handleNavbarScroll() {
    if (window.scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  }

  /**
   * Determine which section is currently in the viewport and
   * highlight the corresponding nav link.
   */
  function highlightActiveLink() {
    let currentId = '';
    const scrollMid = window.scrollY + window.innerHeight / 2;

    sections.forEach(section => {
      const sectionTop    = section.offsetTop - 80;  // offset for navbar height
      const sectionBottom = sectionTop + section.offsetHeight;

      if (scrollMid >= sectionTop && scrollMid < sectionBottom) {
        currentId = section.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  }

  // Attach scroll listeners
  window.addEventListener('scroll', () => {
    handleNavbarScroll();
    highlightActiveLink();
  }, { passive: true });

  // Run once on load to set initial state
  handleNavbarScroll();
  highlightActiveLink();


  /* ============================================================
     4. MOBILE HAMBURGER MENU
  ============================================================ */
  const hamburger   = document.getElementById('hamburger');
  const navLinksEl  = document.getElementById('navLinks');

  /**
   * Toggle the mobile menu open/closed.
   */
  function toggleMenu(forceClose = false) {
    const isOpen = navLinksEl.classList.contains('open') || forceClose;

    if (isOpen) {
      navLinksEl.classList.remove('open');
      hamburger.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    } else {
      navLinksEl.classList.add('open');
      hamburger.classList.add('open');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden'; // prevent background scroll
    }
  }

  hamburger.addEventListener('click', () => toggleMenu());

  // Close menu when a nav link is clicked
  navLinksEl.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => toggleMenu(true));
  });

  // Close menu on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(true);
  });


  /* ============================================================
     5. DARK / LIGHT THEME TOGGLE
     Persists user preference in localStorage.
  ============================================================ */
  const themeToggle = document.getElementById('themeToggle');
  const themeIcon   = document.getElementById('themeIcon');
  const htmlEl      = document.documentElement;

  /**
   * Apply a theme ('dark' | 'light') to the document and
   * update the toggle icon accordingly.
   */
  function applyTheme(theme) {
    htmlEl.setAttribute('data-theme', theme);
    localStorage.setItem('portfolio-theme', theme);

    if (theme === 'light') {
      themeIcon.className = 'bx bx-sun';
      themeToggle.setAttribute('title', 'Switch to dark mode');
    } else {
      themeIcon.className = 'bx bx-moon';
      themeToggle.setAttribute('title', 'Switch to light mode');
    }
  }

  // Load saved preference (default: dark)
  const savedTheme = localStorage.getItem('portfolio-theme') || 'dark';
  applyTheme(savedTheme);

  themeToggle.addEventListener('click', () => {
    const current = htmlEl.getAttribute('data-theme');
    applyTheme(current === 'dark' ? 'light' : 'dark');
  });


  /* ============================================================
     6. SCROLL REVEAL — IntersectionObserver
     Adds .visible to elements with class .reveal when they
     enter the viewport.
  ============================================================ */
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // Unobserve after reveal so it stays visible on scroll back
          revealObserver.unobserve(entry.target);
        }
      });
    },
    {
      threshold: 0.12,          // trigger when 12% of element is visible
      rootMargin: '0px 0px -40px 0px',
    }
  );

  revealEls.forEach(el => revealObserver.observe(el));


  /* ============================================================
     7. SKILL BAR ANIMATION
     Fills skill bars to their target width (data-width attribute)
     when they scroll into view.
  ============================================================ */
  const skillBars = document.querySelectorAll('.skill-bar-fill');

  const skillObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const bar       = entry.target;
          const targetPct = bar.getAttribute('data-width');
          // Small delay so the reveal animation completes first
          setTimeout(() => {
            bar.style.width = `${targetPct}%`;
          }, 200);
          skillObserver.unobserve(bar);
        }
      });
    },
    { threshold: 0.3 }
  );

  skillBars.forEach(bar => skillObserver.observe(bar));


  /* ============================================================
     8. CONTACT FORM — client-side validation & feedback
  ============================================================ */
  const contactForm    = document.getElementById('contactForm');
  const formFeedback   = document.getElementById('formFeedback');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      // Gather values
      const name    = contactForm.name.value.trim();
      const email   = contactForm.email.value.trim();
      const subject = contactForm.subject.value.trim();
      const message = contactForm.message.value.trim();

      // Basic validation
      if (!name || !email || !subject || !message) {
        showFeedback('Please fill in all fields before sending.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showFeedback('Please enter a valid email address.', 'error');
        return;
      }

      // Simulate form submission (replace with real endpoint / EmailJS / Formspree)
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Sending…';

      setTimeout(() => {
        showFeedback(
          `Thanks, ${name}! Your message has been sent. I'll get back to you soon.`,
          'success'
        );
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="bx bx-paper-plane"></i> Send Message';
      }, 1800);
    });
  }

  /**
   * Display a feedback message below the form.
   * @param {string} msg   - The message text.
   * @param {'success'|'error'} type - Visual style.
   */
  function showFeedback(msg, type) {
    formFeedback.textContent = msg;
    formFeedback.className   = `form-feedback ${type}`;

    // Auto-clear after 6 seconds
    setTimeout(() => {
      formFeedback.textContent = '';
      formFeedback.className   = 'form-feedback';
    }, 6000);
  }

  /**
   * Lightweight email format validator.
   * @param {string} email
   * @returns {boolean}
   */
  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }


  /* ============================================================
     9. BACK-TO-TOP BUTTON
  ============================================================ */
  const backToTopBtn = document.getElementById('backToTop');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 400) {
      backToTopBtn.classList.add('visible');
    } else {
      backToTopBtn.classList.remove('visible');
    }
  }, { passive: true });

  backToTopBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });


  /* ============================================================
     10. FOOTER YEAR — auto-update copyright year
  ============================================================ */
  const footerYear = document.getElementById('footerYear');
  if (footerYear) {
    footerYear.textContent = new Date().getFullYear();
  }


  /* ============================================================
     11. SMOOTH SCROLL for all anchor links (fallback for older
         browsers that don't support CSS scroll-behavior)
  ============================================================ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const target = document.querySelector(anchor.getAttribute('href'));
      if (!target) return;

      e.preventDefault();
      const navbarH = parseInt(
        getComputedStyle(document.documentElement)
          .getPropertyValue('--navbar-height'),
        10
      ) || 70;

      const targetTop = target.getBoundingClientRect().top + window.scrollY - navbarH;

      window.scrollTo({ top: targetTop, behavior: 'smooth' });
    });
  });


  /* ============================================================
     12. HERO SECTION — subtle parallax on mouse move
         (desktop only, skipped if prefers-reduced-motion)
  ============================================================ */
  const prefersReducedMotion = window.matchMedia(
    '(prefers-reduced-motion: reduce)'
  ).matches;

  if (!prefersReducedMotion) {
    const heroSection = document.querySelector('.hero');
    const orb1        = document.querySelector('.orb-1');
    const orb2        = document.querySelector('.orb-2');

    if (heroSection && orb1 && orb2) {
      heroSection.addEventListener('mousemove', (e) => {
        const { clientX, clientY } = e;
        const { innerWidth, innerHeight } = window;

        // Normalise to -1 … +1
        const nx = (clientX / innerWidth  - 0.5) * 2;
        const ny = (clientY / innerHeight - 0.5) * 2;

        // Subtle movement — orbs drift slightly opposite to cursor
        orb1.style.transform = `translate(${nx * -18}px, ${ny * -18}px) scale(1)`;
        orb2.style.transform = `translate(${nx *  14}px, ${ny *  14}px) scale(1)`;
      });

      // Reset on mouse leave
      heroSection.addEventListener('mouseleave', () => {
        orb1.style.transform = '';
        orb2.style.transform = '';
      });
    }
  }


  /* ============================================================
     13. PROJECT CARD TILT EFFECT
         Subtle 3-D tilt on hover (desktop only)
  ============================================================ */
  if (!prefersReducedMotion && window.innerWidth > 768) {
    document.querySelectorAll('.project-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect   = card.getBoundingClientRect();
        const x      = e.clientX - rect.left;
        const y      = e.clientY - rect.top;
        const cx     = rect.width  / 2;
        const cy     = rect.height / 2;
        const rotateX = ((y - cy) / cy) * -6;   // max ±6°
        const rotateY = ((x - cx) / cx) *  6;

        card.style.transform =
          `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-8px)`;
      });

      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

}); // end DOMContentLoaded
