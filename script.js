/* ========================================
   WHITE CUBE GALLERY
   Living, breathing art installation
   ======================================== */

// === Smooth Scroll with Lenis (Desktop only) ===
// Lenis causes significant jank on mobile due to always-on RAF loop
let lenis = null;

const SmoothScrollInit = {
  init() {
    // Don't apply on reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // SKIP ENTIRELY on touch devices - native scroll is far more performant
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (isTouchDevice) {
      // Native smooth scroll via CSS is hardware-accelerated
      document.documentElement.style.scrollBehavior = 'smooth';
      return;
    }

    // Check if Lenis is available (loaded via CDN)
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis not loaded, smooth scroll disabled');
      return;
    }

    // Desktop only - Initialize Lenis
    lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: false,  // Never sync touch
      wheelMultiplier: 1,
      infinite: false,
    });

    // Animation frame loop (desktop only)
    function raf(time) {
      lenis.raf(time);
      requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);
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
    // Check if touch device or low-end device - skip magnetic effect
    this.isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (this.isTouchDevice) return;

    // Skip on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return;

    // Select ALL magnetic containers (DEYAN and TODOROV)
    this.containers = document.querySelectorAll('[data-magnetic]');
    if (!this.containers.length) return;

    // Collect all letters from all containers
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

    // cache initial positions
    this.cachePositions();
    // re-cache when fonts load since layout might shift
    document.fonts.ready.then(() => this.cachePositions());

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Track mouse position with movement threshold
    document.addEventListener('mousemove', (e) => {
      this.mouseX = e.clientX;
      this.mouseY = e.clientY;
      this.isActive = true;

      // Only mark for recalc if moved more than 5px
      const dx = this.mouseX - this.lastCalcX;
      const dy = this.mouseY - this.lastCalcY;
      if (dx * dx + dy * dy > 25) {
        this.needsRecalc = true;
        // Start animation loop if not running
        if (!this.isAnimating) {
          this.isAnimating = true;
          this.animate();
        }
      }
    }, { passive: true });

    this.inited = true;
    // DON'T start animation loop - only run when mouse moves
  },

  cachePositions() {
    if (!this.containers.length) return;

    // clear transforms to get accurate base positions
    this.letterData.forEach(data => {
      data.element.style.transform = '';
    });

    this.letterData.forEach(data => {
      const rect = data.element.getBoundingClientRect();
      // store document-relative coordinates
      data.cachedCenterX = rect.left + rect.width / 2 + window.scrollX;
      data.cachedCenterY = rect.top + rect.height / 2 + window.scrollY;
    });

    // restore transforms if needed
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

  // Check if all letters are settled
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

      // ⚡ bolt: hoist global property access out of high-frequency loop
      const scrollX = window.scrollX;
      const scrollY = window.scrollY;

      this.letterData.forEach((data) => {
        // use cached document positions converted to viewport coordinates
        const letterCenterX = data.cachedCenterX - scrollX;
        const letterCenterY = data.cachedCenterY - scrollY;

        const deltaX = this.mouseX - letterCenterX;
        const deltaY = this.mouseY - letterCenterY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

        const magnetRadius = 200;
        const maxDisplacement = 25;

        if (distance < magnetRadius && distance > 0) {
          const force = (magnetRadius - distance) / magnetRadius;
          const easeForce = force * force;

          data.targetX = (deltaX / distance) * maxDisplacement * easeForce;
          data.targetY = (deltaY / distance) * maxDisplacement * easeForce;
          data.targetRotation = (deltaX / magnetRadius) * 15 * easeForce;
          data.targetScale = 1 + (easeForce * 0.1);
        } else {
          data.targetX = 0;
          data.targetY = 0;
          data.targetRotation = 0;
          data.targetScale = 1;
        }
      });
    }

    // Always lerp towards targets
    this.letterData.forEach((data) => {
      data.currentX = this.lerp(data.currentX, data.targetX, lerpFactor);
      data.currentY = this.lerp(data.currentY, data.targetY, lerpFactor);
      data.currentRotation = this.lerp(data.currentRotation, data.targetRotation, lerpFactor);
      data.currentScale = this.lerp(data.currentScale, data.targetScale, lerpFactor);

      // Only update DOM if there's meaningful movement
      if (Math.abs(data.currentX) > 0.1 || Math.abs(data.currentY) > 0.1 ||
        Math.abs(data.currentRotation) > 0.1 || Math.abs(data.currentScale - 1) > 0.001) {
        data.element.style.transform = `translate(${data.currentX}px, ${data.currentY}px) rotate(${data.currentRotation}deg) scale(${data.currentScale})`;
      } else {
        data.element.style.transform = '';
      }
    });

    // Stop animation when settled to save CPU
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
  nameSection: null,
  touchX: 0,
  touchY: 0,
  startY: 0, // Initial Y for scroll detection
  isTouching: false,
  isScrolling: false, // True when user is scrolling (skip repel)
  isAnimating: false,
  moveThrottled: false,
  inited: false,

  init() {
    // Only run on touch devices
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (!isTouchDevice) return;

    // Respect reduced motion
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    this.nameSection = document.getElementById('name');
    if (!this.nameSection) return;

    this.letters = Array.from(this.nameSection.querySelectorAll('[data-letter]'));
    if (!this.letters.length) return;

    // Initialize letter data for smooth animation
    this.letters.forEach(letter => {
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

    // cache initial positions
    this.cachePositions();
    // re-cache when fonts load
    document.fonts.ready.then(() => this.cachePositions());

    // Touch event listeners on the name section
    this.nameSection.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    this.nameSection.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
    this.nameSection.addEventListener('touchend', () => this.onTouchEnd(), { passive: true });

    this.inited = true;
    // DON'T start animation loop - only run when touching
  },

  cachePositions() {
    if (!this.letters.length) return;

    // clear transforms
    this.letterData.forEach(data => {
      data.element.style.transform = '';
    });

    this.letterData.forEach(data => {
      const rect = data.element.getBoundingClientRect();
      data.cachedCenterX = rect.left + rect.width / 2 + window.scrollX;
      data.cachedCenterY = rect.top + rect.height / 2 + window.scrollY;
    });

    // restore transforms if needed
    this.letterData.forEach(data => {
      if (Math.abs(data.currentX) > 0.1 || Math.abs(data.currentY) > 0.1) {
        data.element.style.transform = `translate(${data.currentX}px, ${data.currentY}px)`;
      }
    });
  },

  onTouchStart(e) {
    this.isTouching = true;
    this.isScrolling = false; // Reset scroll detection
    const touch = e.touches[0];
    this.touchX = touch.clientX;
    this.touchY = touch.clientY;
    this.startY = touch.clientY; // Track initial Y for scroll detection
    this.updateTargets();
    // Start animation loop only when touching
    if (!this.isAnimating) {
      this.isAnimating = true;
      this.animate();
    }
  },

  onTouchMove(e) {
    if (!this.isTouching) return;

    const touch = e.touches[0];

    // Detect scroll gesture: if vertical movement > 15px, treat as scroll
    if (!this.isScrolling && Math.abs(touch.clientY - this.startY) > 15) {
      this.isScrolling = true;
      // Reset targets to stop repel effect during scroll
      this.letterData.forEach(data => {
        data.targetX = 0;
        data.targetY = 0;
      });
      return;
    }

    // Skip updates while scrolling
    if (this.isScrolling) return;

    this.touchX = touch.clientX;
    this.touchY = touch.clientY;

    // Throttle updateTargets to ~30fps to reduce layout thrashing
    if (!this.moveThrottled) {
      this.moveThrottled = true;
      this.updateTargets();
      setTimeout(() => { this.moveThrottled = false; }, 32);
    }
  },

  onTouchEnd() {
    this.isTouching = false;
    this.isScrolling = false;
    // Reset all targets to 0
    this.letterData.forEach(data => {
      data.targetX = 0;
      data.targetY = 0;
    });
  },

  updateTargets() {
    const repelRadius = 120; // How close touch needs to be to affect letters
    const maxRepel = 16; // Maximum displacement in pixels (33% stronger)

    // ⚡ bolt: hoist global property access out of high-frequency loop
    const scrollX = window.scrollX;
    const scrollY = window.scrollY;

    this.letterData.forEach(data => {
      // use cached document positions converted to viewport coordinates
      const letterCenterX = data.cachedCenterX - scrollX;
      const letterCenterY = data.cachedCenterY - scrollY;

      // Calculate distance from touch to letter center
      const deltaX = letterCenterX - this.touchX;
      const deltaY = letterCenterY - this.touchY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance < repelRadius && distance > 0) {
        // Calculate repel force (inverse of distance)
        const force = (repelRadius - distance) / repelRadius;
        const easeForce = force * force; // Quadratic ease for smooth falloff

        // Repel direction (away from touch)
        const repelX = (deltaX / distance) * maxRepel * easeForce;
        const repelY = (deltaY / distance) * maxRepel * easeForce;

        data.targetX = repelX;
        data.targetY = repelY;
      } else {
        data.targetX = 0;
        data.targetY = 0;
      }
    });
  },

  lerp(start, end, factor) {
    return start + (end - start) * factor;
  },

  // Check if all letters are settled back to rest position
  isSettled() {
    return this.letterData.every(d =>
      Math.abs(d.currentX) < 0.1 && Math.abs(d.currentY) < 0.1 &&
      Math.abs(d.targetX) < 0.1 && Math.abs(d.targetY) < 0.1
    );
  },

  animate() {
    // Stop the loop if not touching AND all letters are settled
    if (!this.isTouching && this.isSettled()) {
      this.isAnimating = false;
      // Clear any remaining transforms
      this.letterData.forEach(data => {
        data.element.style.transform = '';
      });
      return;
    }

    const lerpFactor = 0.15; // Smoothness (higher = faster response)

    this.letterData.forEach(data => {
      // Lerp current position towards target
      data.currentX = this.lerp(data.currentX, data.targetX, lerpFactor);
      data.currentY = this.lerp(data.currentY, data.targetY, lerpFactor);

      // Only apply transform if there's meaningful movement
      if (Math.abs(data.currentX) > 0.1 || Math.abs(data.currentY) > 0.1) {
        data.element.style.transform = `translate(${data.currentX}px, ${data.currentY}px)`;
      } else {
        data.element.style.transform = '';
      }
    });

    requestAnimationFrame(() => this.animate());
  }
};

// === Scroll Reveal Effect (Fade + Slide Up) ===
const ScrollReveal = {
  elements: null,
  observer: null,

  init() {
    this.elements = document.querySelectorAll('[data-scroll-reveal]');

    if (!this.elements.length) return;

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.elements.forEach(el => el.classList.add('revealed'));
      return;
    }

    // Create intersection observer for reveal animations
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          // Once revealed, stop observing (one-way animation)
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe all scroll-reveal elements
    this.elements.forEach(el => this.observer.observe(el));
  }
};

// === Scroll Animate Effect (For word-by-word reveals) ===
const ScrollAnimate = {
  elements: null,
  observer: null,

  init() {
    this.elements = document.querySelectorAll('[data-scroll-animate]');

    if (!this.elements.length) return;

    // Set word indices for staggered animation
    this.elements.forEach(container => {
      const words = container.querySelectorAll('.word');
      words.forEach((word, index) => {
        word.style.setProperty('--word-index', index);
      });
    });

    // Respect reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      this.elements.forEach(el => {
        el.classList.add('visible');
        el.querySelectorAll('.word').forEach(word => {
          word.style.opacity = '1';
          word.style.transform = 'translateY(0)';
        });
      });
      return;
    }

    // Create intersection observer
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          // One-way animation - stop observing
          this.observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -100px 0px'
    });

    // Observe all scroll-animate elements
    this.elements.forEach(el => this.observer.observe(el));
  }
};

// === Scroll Progress Bar ===
const ScrollProgress = {
  bar: null,
  ticking: false,
  cachedDocHeight: 0,
  cachedWindowHeight: 0,

  init() {
    this.bar = document.querySelector('.scroll-progress');
    if (!this.bar) return;

    this.cacheDimensions();
    window.addEventListener('scroll', () => this.requestUpdate(), { passive: true });
    this.update();
  },

  cacheDimensions() {
    this.cachedDocHeight = document.documentElement.scrollHeight;
    this.cachedWindowHeight = window.innerHeight;
  },

  requestUpdate() {
    if (this.ticking) return;

    this.ticking = true;
    requestAnimationFrame(() => {
      this.update();
      this.ticking = false;
    });
  },

  update() {
    const scrollTop = window.scrollY;
    const docHeight = this.cachedDocHeight - this.cachedWindowHeight;
    const progress = docHeight > 0 ? (scrollTop / docHeight) : 0;
    // ⚡ bolt: use transform instead of width to prevent layout thrashing
    this.bar.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
  }
};

// === Email Modal ===
const EmailModal = {
  modal: null,
  openBtn: null,
  closeBtn: null,
  backdrop: null,
  form: null,

  init() {
    this.modal = document.getElementById('email-modal');
    this.openBtn = document.getElementById('open-email-form');
    this.closeBtn = this.modal?.querySelector('.modal-close');
    this.backdrop = this.modal?.querySelector('.modal-backdrop');
    this.form = this.modal?.querySelector('.contact-form');

    if (!this.modal) return;

    this.openBtn?.addEventListener('click', () => this.open());
    this.closeBtn?.addEventListener('click', () => this.close());
    this.backdrop?.addEventListener('click', () => this.close());

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });

    if (this.form) {
      this.form.addEventListener('submit', (e) => this.handleSubmit(e));
    }
  },

  open() {
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    // Stop Lenis - modal has data-lenis-prevent for native scroll
    if (lenis) lenis.stop();
    setTimeout(() => {
      this.form?.querySelector('input')?.focus();
    }, 100);
  },

  close() {
    this.modal.classList.remove('active');
    document.body.style.overflow = '';
    // Resume Lenis smooth scroll
    if (lenis) lenis.start();
  },

  async handleSubmit(e) {
    e.preventDefault();

    const formData = new FormData(this.form);
    const submitBtn = this.form.querySelector('.form-submit');
    const successMsg = this.modal.querySelector('.form-success');

    submitBtn.disabled = true;
    submitBtn.querySelector('span').textContent = I18n.t('modal.sending');

    // Simulate delay for effect
    await new Promise(resolve => setTimeout(resolve, 800));

    const email = document.getElementById('email').value;
    const message = document.getElementById('message').value;
    const subject = `Contact from Website: ${email}`;
    const body = `${message}\n\nFrom: ${email}`;

    const mailtoLink = `mailto:deyan.todorov21@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoLink;

    // Reset UI
    submitBtn.querySelector('span').textContent = 'Open Client';
    submitBtn.disabled = false;

    // Show success message briefly inside form or just close?
    // Using existing success element
    this.form.style.display = 'none';
    successMsg.style.display = 'block'; // Changed from this.success to successMsg

    // Reset form after delay
    setTimeout(() => {
      this.close();
      setTimeout(() => {
        this.form.reset();
        this.form.style.display = 'flex';
        successMsg.style.display = 'none';
        submitBtn.disabled = false;
        submitBtn.querySelector('span').textContent = I18n.t('modal.send');
      }, 500);
    }, 2000);
  },
};

// === Parallax Layers ===
const ParallaxLayers = {
  elements: null,
  elementData: [],
  isMobile: false,

  init() {
    // Skip parallax entirely on mobile - too expensive
    this.isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (this.isMobile) return;

    // Skip on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return;

    this.elements = document.querySelectorAll('[data-parallax]');

    // Store elements and cache initial positions
    this.elementData = Array.from(this.elements).map(el => ({
      element: el,
      cachedTop: 0,
      cachedHeight: 0,
      speed: parseFloat(el.dataset.parallax) || 0.1
    }));

    this.cachePositions();
    document.fonts.ready.then(() => this.cachePositions());
  },

  cachePositions() {
    if (this.isMobile || !this.elementData.length) return;

    // clear transforms
    this.elementData.forEach(data => {
      data.element.style.transform = '';
    });

    this.elementData.forEach(data => {
      const rect = data.element.getBoundingClientRect();
      data.cachedTop = rect.top + window.scrollY;
      data.cachedHeight = rect.height;
    });

    // restore transforms via an immediate update
    this.update();
  },

  update() {
    // Skip on mobile
    if (this.isMobile) return;
    if (!this.elementData.length) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    this.elementData.forEach(data => {
      // Calculate current rect.top using cached document position minus scroll
      const currentTop = data.cachedTop - scrollY;
      const currentBottom = currentTop + data.cachedHeight;

      const elementCenter = currentTop + data.cachedHeight / 2;
      const distanceFromCenter = elementCenter - windowHeight / 2;

      // Only apply transform if element is in viewport
      if (currentBottom > 0 && currentTop < windowHeight) {
        const translateY = distanceFromCenter * data.speed;
        data.element.style.transform = `translateY(${translateY}px)`;
      }
    });
  }
};

// === Breathing Elements ===
const BreathingElements = {
  init() {
    // Add breathing class to certain elements for ambient life
    const breathables = document.querySelectorAll('.room-label, .section-number, .experience-number');

    breathables.forEach((el, index) => {
      el.style.animationDelay = `${index * 0.5}s`;
    });
  }
};

// === Smooth Scroll for Anchor Links ===
const SmoothScroll = {
  init() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', (e) => {
        const href = anchor.getAttribute('href');
        if (href === '#') return;

        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
          target.scrollIntoView({
            behavior: prefersReducedMotion ? 'auto' : 'smooth',
            block: 'start'
          });
        }
      });
    });
  }
};

// === Hover Effects Enhancement ===
const HoverEffects = {
  init() {
    // Add ripple effect to buttons only
    document.querySelectorAll('.form-submit').forEach(btn => {
      btn.addEventListener('mouseenter', (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        btn.style.setProperty('--ripple-x', `${x}px`);
        btn.style.setProperty('--ripple-y', `${y}px`);
      });
    });
  }
};

// === Page Load Animation with Preloader ===
const PageLoad = {
  preloader: null,
  minLoadTime: 400, // Short minimum time - don't block interactivity

  init() {
    this.preloader = document.getElementById('preloader');
    const loadStart = Date.now();

    // Only wait for fonts - don't block on images
    // Images load lazily in background with cover reveal animation
    document.fonts.ready.then(() => {
      document.body.classList.add('fonts-loaded');

      // Ensure minimum load time has passed (keeps loader from flashing)
      const elapsed = Date.now() - loadStart;
      const remaining = Math.max(0, this.minLoadTime - elapsed);

      setTimeout(() => {
        this.hidePreloader();
      }, remaining);
    });

    // Failsafe: hide preloader after 2s regardless
    setTimeout(() => {
      if (this.preloader && !this.preloader.classList.contains('hidden')) {
        document.body.classList.add('fonts-loaded');
        this.hidePreloader();
      }
    }, 2000);
  },

  hidePreloader() {
    if (this.preloader) {
      // Add hidden class to trigger fade out
      this.preloader.classList.add('hidden');

      // Stagger initial reveals after preloader starts fading
      setTimeout(() => {
        const firstRoom = document.querySelector('.room--name');
        if (firstRoom) {
          firstRoom.classList.add('visible');
        }
      }, 200);

      // Animate ambient layer in
      setTimeout(() => {
        document.querySelector('.ambient-layer')?.classList.add('active');
      }, 400);

      // Remove preloader from DOM after animation completes
      setTimeout(() => {
        this.preloader.remove();
      }, 800);
    }
  }
};

// === Random Float Animation Delays ===
const RandomDelays = {
  init() {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Add random animation delays only to ambient floating elements
    document.querySelectorAll('.ambient-orb, .ambient-shape').forEach(el => {
      const randomDelay = Math.random() * 3;
      el.style.animationDelay = `${randomDelay}s`;
    });
  }
};

// === Theme (System Preference Only) ===
const ThemeToggle = {
  init() {
    // Set theme based on system preference
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', systemPrefersDark ? 'dark' : 'light');

    // Listen for system preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
      document.documentElement.setAttribute('data-theme', e.matches ? 'dark' : 'light');
    });
  }
};

// === Language (System Preference Only) ===
const LanguageSwitcher = {
  init() {
    // Detect system language
    const lang = navigator.language || navigator.userLanguage;
    const langCode = lang.split('-')[0].toLowerCase();

    // Map to supported languages
    const supported = ['en', 'fr', 'bg', 'it', 'de'];
    const systemLang = supported.includes(langCode) ? langCode : 'en';

    // Apply language
    I18n.setLanguage(systemLang);
  }
};

// === Section Navigation (IntersectionObserver-based tracking) ===
const SectionNav = {
  nav: null,
  navItems: null,
  sections: null,
  currentSection: null,
  visibleSections: new Map(), // Track visibility ratios
  observer: null,
  cachedDocHeight: 0,
  cachedWindowHeight: 0,

  init() {
    this.nav = document.getElementById('section-nav');
    if (!this.nav) return;

    this.navItems = this.nav.querySelectorAll('.nav-item');
    this.sections = Array.from(document.querySelectorAll('.room[id]'));

    this.cacheDimensions();

    if (!this.sections.length) return;

    // Use IntersectionObserver instead of per-scroll getBoundingClientRect
    // This is MUCH more performant on mobile
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        // Trigger when sections cross these thresholds
        threshold: [0, 0.1, 0.25, 0.5, 0.75, 1],
        // Focus on upper 40% of viewport (matches original behavior)
        rootMargin: '-10% 0px -50% 0px'
      }
    );

    this.sections.forEach(section => {
      this.observer.observe(section);
    });

    // Set initial section
    this.currentSection = this.sections[0]?.id;
    this.setActive(this.currentSection);
  },

  cacheDimensions() {
    this.cachedDocHeight = document.documentElement.scrollHeight;
    this.cachedWindowHeight = window.innerHeight;
  },

  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        this.visibleSections.set(entry.target.id, entry.intersectionRatio);
      } else {
        this.visibleSections.delete(entry.target.id);
      }
    });

    // Find the most visible section
    let bestSection = null;
    let bestRatio = 0;

    this.visibleSections.forEach((ratio, id) => {
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestSection = id;
      }
    });

    // Edge cases: top and bottom of page
    if (window.scrollY < 100) {
      bestSection = this.sections[0]?.id;
    } else if (window.scrollY + this.cachedWindowHeight >= this.cachedDocHeight - 50) {
      bestSection = this.sections[this.sections.length - 1]?.id;
    }

    if (bestSection && bestSection !== this.currentSection) {
      this.currentSection = bestSection;
      this.setActive(bestSection);
    }
  },

  // Keep for manual updates if needed (but shouldn't be called on scroll anymore)
  updateActiveSection() {
    // No-op - handled by IntersectionObserver now
  },

  setActive(sectionId) {
    this.navItems.forEach(item => {
      const isActive = item.dataset.section === sectionId;
      item.classList.toggle('active', isActive);
    });
  }
};

// === Internationalization (i18n) ===
const I18n = {
  currentLang: 'en',
  translations: {},

  init() {
    // Load translations from global object
    if (typeof TRANSLATIONS !== 'undefined') {
      this.translations = TRANSLATIONS;
    }
  },

  setLanguage(lang) {
    this.currentLang = lang;
    this.applyTranslations();
  },

  t(key) {
    const keys = key.split('.');
    let value = this.translations[this.currentLang];

    for (const k of keys) {
      if (value && typeof value === 'object') {
        value = value[k];
      } else {
        return key; // Return key if translation not found
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
        // Check if element has children that need preserving
        if (el.classList.contains('statement')) {
          // Handle statement with word spans
          this.updateStatementWords(el, translation);
        } else if (translation.includes('<')) {
          // If translation contains HTML, use innerHTML
          el.innerHTML = translation;
        } else {
          el.textContent = translation;
        }
      }
    });

    // Handle name translations
    this.updateNames();
  },

  updateNames() {
    const firstName = this.t('name.firstName');
    const lastName = this.t('name.lastName');

    // Update first name
    const firstNameEl = document.querySelector('[data-i18n-name="firstName"]');
    if (firstNameEl && firstName && firstName !== 'name.firstName') {
      firstNameEl.innerHTML = firstName.split('').map(letter =>
        `<span class="name-letter" data-letter>${letter}</span>`
      ).join('');
    }

    // Update last name
    const lastNameEl = document.querySelector('[data-i18n-name="lastName"]');
    if (lastNameEl && lastName && lastName !== 'name.lastName') {
      lastNameEl.innerHTML = lastName.split('').map(letter =>
        `<span class="name-letter" data-letter>${letter}</span>`
      ).join('');
    }

    // Reinitialize magnetic/touch effects after a name change.
    // On initial load the deferred effect bootstrap handles this; only
    // re-init here once those effects already exist (e.g. language switch).
    if (typeof MagneticLetters !== 'undefined' && MagneticLetters.inited) {
      MagneticLetters.letterData = [];
      MagneticLetters.init();
    }
    if (typeof MobileTouchRepel !== 'undefined' && MobileTouchRepel.inited) {
      MobileTouchRepel.letterData = [];
      MobileTouchRepel.letters = [];
      MobileTouchRepel.init();
    }
  },

  updateStatementWords(el, translation) {
    // Split translation into words and rebuild spans
    const words = translation.split(' ');

    // Clear existing spans and rebuild
    el.innerHTML = words.map(word => {
      // Apply accent class to "100%" regardless of language
      const isAccent = word.includes('100%');
      return `<span class="word${isAccent ? ' accent' : ''}">${word}</span>`;
    }).join(' ');
  }
};

// === Consolidated Scroll Handler ===
// Now much lighter - SectionNav uses IntersectionObserver (no per-scroll calls)
const ScrollHandler = {
  ticking: false,
  isMobile: false,

  init() {
    this.isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    // Only attach scroll handler if parallax is active (desktop only)
    if (!this.isMobile) {
      window.addEventListener('scroll', () => this.onScroll(), { passive: true });
    }
    // SectionNav now uses IntersectionObserver - no scroll handler needed
    // MobileMenu updates when opened, not on every scroll
  },

  onScroll() {
    if (!this.ticking) {
      requestAnimationFrame(() => {
        ParallaxLayers.update();
        this.ticking = false;
      });
      this.ticking = true;
    }
  }
};

// === Initialize Everything ===
document.addEventListener('DOMContentLoaded', () => {
  // --- Critical path: content correctness, theming (no flash), preloader ---
  I18n.init();
  ThemeToggle.init();
  LanguageSwitcher.init();
  PageLoad.init();

  // --- Scroll engine + reveal infrastructure (observers/listeners only) ---
  SmoothScrollInit.init();
  ScrollProgress.init();
  ScrollReveal.init();
  ScrollAnimate.init();
  SectionNav.init();

  // --- Interaction handlers (attach listeners; no forced layout) ---
  EmailModal.init();
  SmoothScroll.init();
  MobileMenu.init();
  ScrollHandler.init();

  // --- Effects that force synchronous layout via getBoundingClientRect ---
  // Deferred to after first paint so they don't extend the initial long task.
  // They re-cache on document.fonts.ready, so positions stay accurate.
  const initEffects = () => {
    MagneticLetters.letterData = [];
    MagneticLetters.init();
    MobileTouchRepel.letterData = [];
    MobileTouchRepel.letters = [];
    MobileTouchRepel.init();
    ParallaxLayers.init();
    BreathingElements.init();
    HoverEffects.init();
    RandomDelays.init();
  };
  // Run just after the first paint (inside the preloader window, where the
  // compositor-driven spinner hides any main-thread work) so the layout-
  // forcing position caching never lands on the critical path or mid-scroll.
  requestAnimationFrame(() => requestAnimationFrame(initEffects));
});

// === Mobile Menu ===
const MobileMenu = {
  btn: null,
  overlay: null,
  navItems: null,
  isOpen: false,

  init() {
    this.btn = document.getElementById('mobile-menu-btn');
    this.overlay = document.getElementById('mobile-menu-overlay');
    this.navItems = this.overlay?.querySelectorAll('.mobile-nav-item');

    if (!this.btn || !this.overlay) return;

    // Toggle menu on button click
    this.btn.addEventListener('click', () => this.toggle());

    // Close menu when clicking a nav item
    this.navItems?.forEach(item => {
      item.addEventListener('click', () => {
        this.close();
      });
    });

    // Close on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isOpen) {
        this.close();
      }
    });
    // Scroll handling moved to consolidated ScrollHandler
  },

  toggle() {
    this.isOpen = !this.isOpen;
    this.btn.classList.toggle('active', this.isOpen);
    this.overlay.classList.toggle('active', this.isOpen);
    document.body.style.overflow = this.isOpen ? 'hidden' : '';

    if (this.isOpen) {
      this.updateActiveItem();
    }
  },

  close() {
    this.isOpen = false;
    this.btn.classList.remove('active');
    this.overlay.classList.remove('active');
    document.body.style.overflow = '';
  },

  updateActiveItem() {
    if (!this.navItems) return;

    // Reuse SectionNav's tracked section instead of recalculating
    // This avoids duplicate getBoundingClientRect calls
    const currentSection = SectionNav.currentSection;

    this.navItems.forEach(item => {
      const isActive = item.dataset.section === currentSection;
      item.classList.toggle('active', isActive);
    });
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

// === Resize handler for responsive adjustments ===
let resizeTimeout;
window.addEventListener('resize', () => {
  clearTimeout(resizeTimeout);
  resizeTimeout = setTimeout(() => {
    // Recalculate size-dependent values to maintain layout accuracy without forced reflows during animations
    if (typeof MagneticLetters !== 'undefined') MagneticLetters.cachePositions();
    if (typeof MobileTouchRepel !== 'undefined') MobileTouchRepel.cachePositions();
    if (typeof ParallaxLayers !== 'undefined') ParallaxLayers.cachePositions();
    if (typeof ScrollProgress !== 'undefined') ScrollProgress.cacheDimensions();
    if (typeof SectionNav !== 'undefined') SectionNav.cacheDimensions();
  }, 250);
});

// === Global Layout Change Observer ===
const layoutObserver = new ResizeObserver(() => {
  if (typeof ScrollProgress !== 'undefined') ScrollProgress.cacheDimensions();
  if (typeof SectionNav !== 'undefined') SectionNav.cacheDimensions();
});
layoutObserver.observe(document.documentElement);
