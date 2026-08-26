/* ========================================
   DEYAN TODOROV — PERSONAL & LAB PORTFOLIO
   Clean, accessible, zero-thrash interactions.
   ======================================== */

// === Internationalization (i18n) ===
const I18n = {
  currentLang: 'en',
  translations: {},

  init() {
    if (typeof TRANSLATIONS !== 'undefined') {
      this.translations = TRANSLATIONS;
    }
    const detected = this.detectLanguage();
    this.setLanguage(detected);
  },

  detectLanguage() {
    const navLang = navigator.language || (navigator.languages && navigator.languages[0]) || 'en';
    const code = navLang.split('-')[0].toLowerCase();
    return code === 'bg' ? 'bg' : 'en';
  },

  setLanguage(lang) {
    this.currentLang = lang;
    document.documentElement.setAttribute('lang', lang);
    this.applyTranslations();
  },

  t(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];
    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key;
      }
    }
    return value || key;
  },

  applyTranslations() {
    const elements = document.querySelectorAll('[data-i18n]');

    elements.forEach(el => {
      const key = el.dataset.i18n;
      const translation = this.t(key);

      if (translation && translation !== key) {
        if (translation.includes('<')) {
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    this.updateNames();
  },

  updateNames() {
    const firstName = this.t('name.firstName');
    const lastName = this.t('name.lastName');

    const firstNameEl = document.querySelector('[data-i18n-name="firstName"]');
    if (firstNameEl && firstName && firstName !== 'name.firstName') {
      firstNameEl.innerHTML = firstName.split('').map(letter =>
        `<span class="name-letter" data-letter>${letter}</span>`
      ).join('');
    }

    const lastNameEl = document.querySelector('[data-i18n-name="lastName"]');
    if (lastNameEl && lastName && lastName !== 'name.lastName') {
      lastNameEl.innerHTML = lastName.split('').map(letter =>
        `<span class="name-letter" data-letter>${letter}</span>`
      ).join('');
    }

    if (typeof MagneticLetters !== 'undefined' && MagneticLetters.inited) {
      MagneticLetters.letterData = [];
      MagneticLetters.init();
    }
    if (typeof MobileTouchRepel !== 'undefined' && MobileTouchRepel.inited) {
      MobileTouchRepel.letterData = [];
      MobileTouchRepel.letters = [];
      MobileTouchRepel.init();
    }
  }
};

// === Magnetic Letters Effect (Desktop only - mouse hover) ===
const MagneticLetters = {
  containers: [],
  letterData: [],
  mouseX: 0,
  mouseY: 0,
  lastCalcX: 0,
  lastCalcY: 0,
  isActive: false,
  isTouchDevice: false,
  needsRecalc: false,
  isAnimating: false,
  inited: false,

  init() {
    this.isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (this.isTouchDevice) return;

    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return;

    this.containers = document.querySelectorAll('[data-magnetic]');
    if (!this.containers.length) return;

    this.letterData = [];
    this.containers.forEach(container => {
      const letters = Array.from(container.querySelectorAll('[data-letter]'));
      letters.forEach(letter => {
        this.letterData.push({
          element: letter,
          currentX: 0,
          currentY: 0,
          currentRotation: 0,
          currentScale: 1,
          targetX: 0,
          targetY: 0,
          targetRotation: 0,
          targetScale: 1,
          cachedCenterX: 0,
          cachedCenterY: 0
        });
      });
    });

    if (!this.letterData.length) return;

    this.cachePositions();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.cachePositions());
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.isActive = true;

      const dx = this.mouseX - this.lastCalcX;
      const dy = this.mouseY - this.lastCalcY;
      if (dx * dx + dy * dy > 25) {
        this.needsRecalc = true;
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.animate();
        }
      }
    }, { passive: true });

    this.inited = true;
  },

  cachePositions() {
    if (!this.containers.length) return;

    this.letterData.forEach(data => {
      data.element.style.transform = '';
    });

    this.letterData.forEach(data => {
      const rect = data.element.getBoundingClientRect();
      data.cachedCenterX = rect.left + rect.width / 2 + window.scrollX;
      data.cachedCenterY = rect.top + rect.height / 2 + window.scrollY;
    });

    this.letterData.forEach(data => {
      if (Math.abs(data.currentX) > 0.1 || Math.abs(data.currentY) > 0.1 ||
        Math.abs(data.currentRotation) > 0.1 || Math.abs(data.currentScale - 1) > 0.001) {
        data.element.style.transform = `translate(${data.currentX}px, ${data.currentY}px) rotate(${data.currentRotation}deg) scale(${data.currentScale})`;
      }
    });
  },

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },

  isSettled() {
    return this.letterData.every(d =>
      Math.abs(d.currentX) < 0.1 && Math.abs(d.currentY) < 0.1 &&
      Math.abs(d.currentRotation) < 0.1 && Math.abs(d.currentScale - 1) < 0.001 &&
      Math.abs(d.targetX) < 0.1 && Math.abs(d.targetY) < 0.1
    );
  },

  animate() {
    const lerpFactor = 0.12;

    if (this.isActive && this.needsRecalc) {
      this.lastCalcX = this.mouseX;
      this.lastCalcY = this.mouseY;
      this.needsRecalc = false;

      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      this.letterData.forEach((data) => {
        const letterCenterX = data.cachedCenterX - scrollX;
        const letterCenterY = data.cachedCenterY - scrollY;

        const deltaX = this.mouseX - letterCenterX;
        const deltaY = this.mouseY - letterCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const magnetRadius = 170;
        const maxDisplacement = 21.25;

        if (distance < magnetRadius && distance > 0) {
          const force = (magnetRadius - distance) / magnetRadius;
          const easeForce = force * force;

          data.targetX = (deltaX / distance) * maxDisplacement * easeForce;
          data.targetY = (deltaY / distance) * maxDisplacement * easeForce;
          data.targetRotation = (deltaX / magnetRadius) * 12.75 * easeForce;
          data.targetScale = 1 + (easeForce * 0.085);
        } else {
          data.targetX = 0;
          data.targetY = 0;
          data.targetRotation = 0;
          data.targetScale = 1;
        }
      });
    }

    this.letterData.forEach((data) => {
      data.currentX = this.lerp(data.currentX, data.targetX, lerpFactor);
      data.currentY = this.lerp(data.currentY, data.targetY, lerpFactor);
      data.currentRotation = this.lerp(data.currentRotation, data.targetRotation, lerpFactor);
      data.currentScale = this.lerp(data.currentScale, data.targetScale, lerpFactor);

      if (Math.abs(data.currentX) > 0.1 || Math.abs(data.currentY) > 0.1 ||
        Math.abs(data.currentRotation) > 0.1 || Math.abs(data.currentScale - 1) > 0.001) {
        data.element.style.transform = `translate(${data.currentX}px, ${data.currentY}px) rotate(${data.currentRotation}deg) scale(${data.currentScale})`;
      } else {
        data.element.style.transform = '';
      }
    });

    if (this.isSettled() && !this.needsRecalc) {
      this.isAnimating = false;
      return;
    }

    requestAnimationFrame(() => this.animate());
  }
};

// === Mobile Touch Repel Letters (Touch devices only - letters repel from touch) ===
const MobileTouchRepel = {
  letters: [],
  letterData: [],
  touchX: 0,
  touchY: 0,
  startY: 0,
  isTouching: false,
  isScrolling: false,
  isAnimating: false,
  moveThrottled: false,
  inited: false,

  init() {
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (!isTouchDevice) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const containers = Array.from(document.querySelectorAll('[data-magnetic]'));
    if (!containers.length) return;

    this.letters = [];
    this.letterData = [];
    containers.forEach(container => {
      const letters = Array.from(container.querySelectorAll('[data-letter]'));
      letters.forEach(letter => {
        this.letters.push(letter);
        this.letterData.push({
          element: letter,
          currentX: 0,
          currentY: 0,
          targetX: 0,
          targetY: 0,
          cachedCenterX: 0,
          cachedCenterY: 0
        });
      });
    });

    if (!this.letters.length) return;

    this.cachePositions();
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => this.cachePositions());
    }

    containers.forEach(container => {
      const room = container.closest('.room') || container;
      room.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
      room.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
      room.addEventListener('touchend', () => this.onTouchEnd(), { passive: true });
    });

    this.inited = true;
  },

  cachePositions() {
    if (!this.letters.length) return;

    this.letterData.forEach(data => {
      data.element.style.transform = '';
    });

    this.letterData.forEach(data => {
      const rect = data.element.getBoundingClientRect();
      data.cachedCenterX = rect.left + rect.width / 2 + window.scrollX;
      data.cachedCenterY = rect.top + rect.height / 2 + window.scrollY;
    });

    this.letterData.forEach(data => {
      if (Math.abs(data.currentX) > 0.1 || Math.abs(data.currentY) > 0.1) {
        data.element.style.transform = `translate(${data.currentX}px, ${data.currentY}px)`;
      }
    });
  },

  onTouchStart(e) {
    this.isTouching = true;
    this.isScrolling = false;
    const touch = e.touches[0];
    this.touchX = touch.clientX;
    this.touchY = touch.clientY;
    this.startY = touch.clientY;
    this.updateTargets();

    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  },

  onTouchMove(e) {
    if (!this.isTouching) return;

    const touch = e.touches[0];

    if (!this.isScrolling && Math.abs(touch.clientY - this.startY) > 15) {
      this.isScrolling = true;
      this.letterData.forEach(data => {
        data.targetX = 0;
        data.targetY = 0;
      });
      return;
    }

    if (this.isScrolling) return;

    this.touchX = touch.clientX;
    this.touchY = touch.clientY;

    if (!this.moveThrottled) {
      this.moveThrottled = true;
      this.updateTargets();
      setTimeout(() => { this.moveThrottled = false; }, 32);
    }
  },

  onTouchEnd() {
    this.isTouching = false;
    this.isScrolling = false;
    this.letterData.forEach(data => {
      data.targetX = 0;
      data.targetY = 0;
    });
  },

  updateTargets() {
    const repelRadius = 102;
    const maxRepel = 13.6;
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    this.letterData.forEach(data => {
      const letterCenterX = data.cachedCenterX - scrollX;
      const letterCenterY = data.cachedCenterY - scrollY;

      const deltaX = letterCenterX - this.touchX;
      const deltaY = letterCenterY - this.touchY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < repelRadius && distance > 0) {
        const force = (repelRadius - distance) / repelRadius;
        const easeForce = force * force;
        data.targetX = (deltaX / distance) * maxRepel * easeForce;
        data.targetY = (deltaY / distance) * maxRepel * easeForce;
      } else {
        data.targetX = 0;
        data.targetY = 0;
      }
    });
  },

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },

  isSettled() {
    return this.letterData.every(d =>
      Math.abs(d.currentX) < 0.1 && Math.abs(d.currentY) < 0.1 &&
      Math.abs(d.targetX) < 0.1 && Math.abs(d.targetY) < 0.1
    );
  },

  animate() {
    if (!this.isTouching && this.isSettled()) {
      this.isAnimating = false;
      this.letterData.forEach(data => {
        data.element.style.transform = '';
      });
      return;
    }

    const lerpFactor = 0.15;

    this.letterData.forEach(data => {
      data.currentX = this.lerp(data.currentX, data.targetX, lerpFactor);
      data.currentY = this.lerp(data.currentY, data.targetY, lerpFactor);

      if (Math.abs(data.currentX) > 0.1 || Math.abs(data.currentY) > 0.1) {
        data.element.style.transform = `translate(${data.currentX}px, ${data.currentY}px)`;
      } else {
        data.element.style.transform = '';
      }
    });

    requestAnimationFrame(() => this.animate());
  }
};

// === Clean Editorial Project Drawers ===
const ProjectDrawers = {
  init() {
    document.querySelectorAll('.drawer-item').forEach(drawer => {
      const trigger = drawer.querySelector('.drawer-trigger');
      if (!trigger) return;

      trigger.addEventListener('click', (e) => {
        e.preventDefault();
        this.toggle(drawer);
      });

      trigger.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.toggle(drawer);
        }
      });
    });
  },

  toggle(targetDrawer) {
    const isOpen = targetDrawer.classList.contains('is-open');
    const trigger = targetDrawer.querySelector('.drawer-trigger');
    const indicator = targetDrawer.querySelector('.drawer-indicator');

    if (isOpen) {
      targetDrawer.classList.remove('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
      if (indicator) indicator.textContent = '+';
    } else {
      targetDrawer.classList.add('is-open');
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
      if (indicator) indicator.textContent = '−';
    }
  }
};

// === Section Navigation (Bottom-Left Numbering & Active Tracking) ===
const SectionNav = {
  currentSection: null,
  observer: null,

  init() {
    const sections = Array.from(document.querySelectorAll('.room[id]'));
    if (!sections.length) return;

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.setActive(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-30% 0px -40% 0px',
        threshold: 0
      }
    );

    sections.forEach(sec => this.observer.observe(sec));
    this.setActive(sections[0].id);
  },

  setActive(sectionId) {
    if (this.currentSection === sectionId) return;
    this.currentSection = sectionId;

    document.querySelectorAll('.section-nav .nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === sectionId);
    });

    document.querySelectorAll('.mobile-menu-nav .mobile-nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.section === sectionId);
    });
  }
};

// === Theme (System Preference Sync) ===
const ThemeToggle = {
  init() {
    const updateTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      document.documentElement.setAttribute('data-theme', prefersDark ? 'dark' : 'light');
    };
    updateTheme();
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', updateTheme);
  }
};

// === Mobile Navigation Menu ===
const MobileMenu = {
  btn: null,
  overlay: null,
  isOpen: false,

  init() {
    this.btn = document.getElementById('mobile-menu-btn');
    this.overlay = document.getElementById('mobile-menu-overlay');
    if (!this.btn || !this.overlay) return;

    this.btn.addEventListener('click', () => this.toggle());

    this.overlay.querySelectorAll('.mobile-nav-item').forEach(item => {
      item.addEventListener('click', () => this.close());
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) this.close();
    });
  },

  toggle() {
    this.isOpen = !this.isOpen;
    this.btn.classList.toggle('active', this.isOpen);
    this.btn.setAttribute('aria-expanded', this.isOpen ? 'true' : 'false');
    this.overlay.classList.toggle('active', this.isOpen);
    document.body.style.overflow = this.isOpen ? 'hidden' : '';
  },

  close() {
    this.isOpen = false;
    this.btn.classList.remove('active');
    this.btn.setAttribute('aria-expanded', 'false');
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  }
};

// === Scroll Progress Bar ===
const ScrollProgress = {
  bar: null,

  init() {
    this.bar = document.querySelector('.scroll-progress');
    if (!this.bar) return;

    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      const progress = maxScroll > 0 ? scrollY / maxScroll : 0;
      this.bar.style.transform = `scaleX(${progress})`;
    }, { passive: true });
  }
};

// === Performance: Pause animations when tab is hidden ===
document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    document.body.classList.add('paused');
  } else {
    document.body.classList.remove('paused');
  }
});

// === Responsive resize handler ===
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    if (typeof MagneticLetters !== 'undefined') MagneticLetters.cachePositions();
    if (typeof MobileTouchRepel !== 'undefined') MobileTouchRepel.cachePositions();
  }, 250);
});

// === Initialization ===
document.addEventListener('DOMContentLoaded', () => {
  I18n.init();
  ThemeToggle.init();
  ProjectDrawers.init();
  SectionNav.init();
  MobileMenu.init();
  ScrollProgress.init();

  const initEffects = () => {
    MagneticLetters.letterData = [];
    MagneticLetters.init();
    MobileTouchRepel.letterData = [];
    MobileTouchRepel.letters = [];
    MobileTouchRepel.init();
  };
  requestAnimationFrame(() => requestAnimationFrame(initEffects));
});
