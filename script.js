/* ========================================
   WHITE CUBE GALLERY
   Living, breathing art installation
   ======================================== */

// === Smooth Scroll with Lenis ===
// Lenis is loaded via CDN in index.html
let lenis = null;

const SmoothScrollInit = {
  init() {
    // Don't apply on reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    // Check if Lenis is available (loaded via CDN)
    if (typeof Lenis === 'undefined') {
      console.warn('Lenis not loaded, smooth scroll disabled');
      return;
    }

    // Detect touch device for mobile-specific configuration
    const isTouchDevice = window.matchMedia('(hover: none) and (pointer: coarse)').matches;

    // Initialize Lenis with device-specific settings
    lenis = new Lenis({
      duration: isTouchDevice ? 0.8 : 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      syncTouch: isTouchDevice,
      syncTouchLerp: 0.1,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
      infinite: false,
    });

    // Animation frame loop
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
          targetScale: 1
        });
      });
    });

    if (!this.letterData.length) return;

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

    // DON'T start animation loop - only run when mouse moves
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

      this.letterData.forEach((data) => {
        const letter = data.element;
        const rect = letter.getBoundingClientRect();
        const letterCenterX = rect.left + rect.width / 2;
        const letterCenterY = rect.top + rect.height / 2;

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
  isTouching: false,
  isAnimating: false,
  moveThrottled: false,

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
        targetY: 0
      });
    });

    // Touch event listeners on the name section
    this.nameSection.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    this.nameSection.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
    this.nameSection.addEventListener('touchend', () => this.onTouchEnd(), { passive: true });

    // DON'T start animation loop - only run when touching
  },

  onTouchStart(e) {
    this.isTouching = true;
    const touch = e.touches[0];
    this.touchX = touch.clientX;
    this.touchY = touch.clientY;
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
    // Reset all targets to 0
    this.letterData.forEach(data => {
      data.targetX = 0;
      data.targetY = 0;
    });
  },

  updateTargets() {
    const repelRadius = 120; // How close touch needs to be to affect letters
    const maxRepel = 16; // Maximum displacement in pixels (33% stronger)

    this.letterData.forEach(data => {
      const letter = data.element;
      const rect = letter.getBoundingClientRect();
      const letterCenterX = rect.left + rect.width / 2;
      const letterCenterY = rect.top + rect.height / 2;

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
  modalContent: null,
  isModalActive: false,

  init() {
    this.bar = document.querySelector('.scroll-progress');
    if (!this.bar) return;

    window.addEventListener('scroll', () => this.update(), { passive: true });
    this.update();
  },

  setModalMode(active, contentElement = null) {
    this.isModalActive = active;
    this.modalContent = contentElement;

    if (active && contentElement) {
      contentElement.addEventListener('scroll', () => this.updateModal(), { passive: true });
      this.updateModal();
    } else {
      this.update();
    }
  },

  update() {
    if (this.isModalActive) return;
    const scrollTop = window.scrollY;
    const docHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (scrollTop / docHeight) * 100;
    this.bar.style.width = `${progress}%`;
  },

  updateModal() {
    if (!this.isModalActive || !this.modalContent) return;
    const scrollTop = this.modalContent.scrollTop;
    const scrollHeight = this.modalContent.scrollHeight - this.modalContent.clientHeight;
    const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;
    this.bar.style.width = `${progress}%`;
  }
};

// === Annotation Reveal ===
const AnnotationReveal = {
  init() {
    const annotations = document.querySelectorAll('.statement-annotation');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.classList.add('revealed');
          }, 1000);
        }
      });
    }, {
      threshold: 0.5
    });

    annotations.forEach(el => observer.observe(el));
  }
};

// === Project Modal (Fade → Line → Content Animation) ===
const ProjectModal = {
  modal: null,
  backdrop: null,
  closeBtn: null,
  wrapper: null,
  line: null,
  projectData: {},

  init() {
    this.modal = document.getElementById('project-modal');
    if (!this.modal) return;

    this.backdrop = this.modal.querySelector('.project-modal-backdrop');
    this.closeBtn = this.modal.querySelector('.project-modal-close');
    this.wrapper = this.modal.querySelector('.project-modal-wrapper');
    this.line = this.modal.querySelector('.project-modal-line');

    // Define project data
    this.projectData = {
      'eptesicus-labs': {
        title: 'Eptesicus Labs',
        tagline: 'Advancing on-device intelligence',
        description: 'Building a world where AI runs on customer-controlled hardware through small, dependable models. We solve the problems of cloud-first AI — vendor lock-in, compounding costs, and data exposure — by developing on-device models paired with reliability tooling designed for enterprise deployment. Our objective: make on-device AI the default for real products.',
        media: null,
        links: [
          { text: 'View', url: 'https://eptesicuslabs.com' }
        ]
      },
      'schoolmap': {
        title: 'SchoolMap',
        tagline: 'Classroom-ready map tool',
        description: 'Teachers repeatedly lose valuable class time searching for suitable maps during geography quizzes and classroom exercises. SchoolMap provides instant access to clean, quiz-ready maps optimized for classroom projection. Designed for speed — teachers can pull up any map within seconds, not minutes.',
        media: null,
        links: [
          { text: 'View', url: 'https://schoolmap.pages.dev' }
        ]
      },
      'bas-award': {
        title: 'Bulgarian Academy of Sciences',
        tagline: '"Water for Peace" — 1st Place',
        description: 'March 2024 — The Bulgarian Academy of Sciences hosted a themed presentation contest focused on "Water for Peace," exploring the critical intersection of water resources and international cooperation. My project examined sustainable water resource management frameworks and how shared water systems can become bridges for peace. Awarded 1st place among all participants.',
        media: null,
        links: []
      }
    };

    // Click handlers for project cards
    document.querySelectorAll('.project-card[data-project]').forEach(card => {
      card.addEventListener('click', (e) => {
        this.open(card.dataset.project, card);
      });
    });

    // Close handlers
    if (this.closeBtn) {
      this.closeBtn.addEventListener('click', () => this.close());
    }
    if (this.backdrop) {
      this.backdrop.addEventListener('click', () => this.close());
    }

    // Escape key to close
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.modal.classList.contains('active')) {
        this.close();
      }
    });
  },

  open(projectId, cardElement) {
    const project = this.projectData[projectId];
    if (!project) return;

    // Populate modal content
    const titleEl = this.modal.querySelector('.project-modal-title');
    const taglineEl = this.modal.querySelector('.project-modal-tagline');
    const descriptionEl = this.modal.querySelector('.project-modal-description');
    const linksEl = this.modal.querySelector('.project-links-modal');

    if (titleEl) titleEl.textContent = project.title;
    if (taglineEl) taglineEl.textContent = project.tagline;
    if (descriptionEl) descriptionEl.textContent = project.description;

    // Handle links
    if (linksEl) {
      linksEl.innerHTML = '';
      project.links.forEach(link => {
        const a = document.createElement('a');
        a.href = link.url;
        a.className = 'project-link-modal';
        a.target = '_blank';
        a.rel = 'noopener noreferrer';
        a.textContent = link.text;
        linksEl.appendChild(a);
      });
    }

    // Show modal with animation
    this.modal.classList.remove('closing');
    this.modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Stop Lenis - modal has data-lenis-prevent for native scroll
    if (lenis) lenis.stop();

    // Enable modal scroll tracking for progress bar
    ScrollProgress.setModalMode(true, this.wrapper);
  },

  close() {
    // Add closing class for smooth exit animation
    this.modal.classList.add('closing');

    // Disable modal scroll tracking
    ScrollProgress.setModalMode(false);

    // Wait for animation to complete before removing active
    setTimeout(() => {
      this.modal.classList.remove('active');
      this.modal.classList.remove('closing');
      document.body.style.overflow = '';

      // Resume Lenis smooth scroll
      if (lenis) lenis.start();
    }, 700);
  }
};

// === Email Modal ===
const EmailModal = {
  modal: null,
  openBtn: null,
  cvNote: null,
  closeBtn: null,
  backdrop: null,
  form: null,

  init() {
    this.modal = document.getElementById('email-modal');
    this.openBtn = document.getElementById('open-email-form');
    this.cvNote = document.getElementById('cv-link');
    this.closeBtn = this.modal?.querySelector('.modal-close');
    this.backdrop = this.modal?.querySelector('.modal-backdrop');
    this.form = this.modal?.querySelector('.contact-form');

    if (!this.modal || !this.openBtn) return;

    this.openBtn.addEventListener('click', () => this.open());
    // Use event delegation for cv-request since it gets replaced by translations
    this.cvNote?.addEventListener('click', (e) => {
      if (e.target.classList.contains('cv-request')) {
        this.open();
      }
    });
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

    try {
      const response = await fetch(this.form.action, {
        method: 'POST',
        body: formData,
        headers: { 'Accept': 'application/json' }
      });

      if (response.ok) {
        this.form.style.display = 'none';
        if (successMsg) successMsg.style.display = 'block';

        setTimeout(() => {
          this.close();
          this.form.reset();
          this.form.style.display = 'flex';
          if (successMsg) successMsg.style.display = 'none';
          submitBtn.disabled = false;
          submitBtn.querySelector('span').textContent = I18n.t('modal.send');
        }, 2500);
      } else {
        throw new Error('Form submission failed');
      }
    } catch (error) {
      submitBtn.querySelector('span').textContent = I18n.t('modal.error');
      submitBtn.disabled = false;

      setTimeout(() => {
        submitBtn.querySelector('span').textContent = I18n.t('modal.send');
      }, 2000);
    }
  }
};

// === Photo Carousel - Stacked Cards ===
const PhotoCarousel = {
  carousel: null,
  cards: [],
  captions: [],
  currentIndex: 2, // Start with center card (index 2)
  positions: ['far-left', 'left', 'center', 'right', 'far-right'],
  isAnimating: false,

  init() {
    this.carousel = document.getElementById('photo-carousel');
    if (!this.carousel) return;

    this.cards = Array.from(this.carousel.querySelectorAll('.carousel-card'));
    this.captions = Array.from(this.carousel.querySelectorAll('.caption-text'));

    if (!this.cards.length) return;

    // Set initial caption
    this.updateCaption(this.currentIndex);

    // Arrow click handlers
    const leftArrow = this.carousel.querySelector('.carousel-arrow--left');
    const rightArrow = this.carousel.querySelector('.carousel-arrow--right');

    leftArrow?.addEventListener('click', () => this.navigate('prev'));
    rightArrow?.addEventListener('click', () => this.navigate('next'));

    // Click on cards to navigate
    this.cards.forEach((card, index) => {
      card.addEventListener('click', () => {
        const position = card.dataset.position;
        if (position === 'left' || position === 'far-left') {
          this.navigate('prev');
        } else if (position === 'right' || position === 'far-right') {
          this.navigate('next');
        }
      });
    });

    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (!this.isInView()) return;
      if (e.key === 'ArrowLeft') this.navigate('prev');
      if (e.key === 'ArrowRight') this.navigate('next');
    });

    // Get the stack element early for all event handlers
    const stack = this.carousel.querySelector('.carousel-stack');

    // Touch/swipe support
    let touchStartX = 0;
    this.carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.touches[0].clientX;
    }, { passive: true });

    this.carousel.addEventListener('touchend', (e) => {
      const touchEndX = e.changedTouches[0].clientX;
      const diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) this.navigate('next');
        else this.navigate('prev');
      }
    }, { passive: true });

    // Mouse drag support
    let isDragging = false;
    let dragStartX = 0;
    let hasDragged = false;

    stack.addEventListener('mousedown', (e) => {
      // Only left mouse button
      if (e.button !== 0) return;
      isDragging = true;
      hasDragged = false;
      dragStartX = e.clientX;
      stack.classList.add('dragging');
      e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      const diff = dragStartX - e.clientX;
      if (Math.abs(diff) > 10) {
        hasDragged = true;
      }
    });

    document.addEventListener('mouseup', (e) => {
      if (!isDragging) return;
      isDragging = false;
      stack.classList.remove('dragging');

      if (hasDragged) {
        const diff = dragStartX - e.clientX;
        if (Math.abs(diff) > 50) {
          if (diff > 0) this.navigate('next');
          else this.navigate('prev');
        }
      }
    });

    // Also handle mouseleave on document to catch edge cases
    document.addEventListener('mouseleave', () => {
      if (isDragging) {
        isDragging = false;
        stack.classList.remove('dragging');
      }
    });

    // Scroll wheel navigation - only when hovering over carousel stack
    let wheelTimeout = null;
    let wheelAccumulator = 0;
    let isHoveringStack = false;
    const wheelThreshold = 80; // Pixels of scroll needed to trigger navigation

    // Track mouse enter/leave on the stack area
    stack.addEventListener('mouseenter', () => {
      isHoveringStack = true;
    });

    stack.addEventListener('mouseleave', () => {
      isHoveringStack = false;
      wheelAccumulator = 0;
    });

    // Only handle wheel when hovering directly over the stack
    stack.addEventListener('wheel', (e) => {
      if (!isHoveringStack) return;

      // Prevent page scroll when over carousel stack
      e.preventDefault();
      e.stopPropagation();

      // Use deltaX for horizontal scroll, or deltaY if no horizontal
      const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
      wheelAccumulator += delta;

      // Clear previous timeout
      clearTimeout(wheelTimeout);

      // Check if accumulated scroll exceeds threshold
      if (Math.abs(wheelAccumulator) >= wheelThreshold) {
        if (wheelAccumulator > 0) {
          this.navigate('next');
        } else {
          this.navigate('prev');
        }
        wheelAccumulator = 0; // Reset after navigation
      }

      // Reset accumulator after scroll stops
      wheelTimeout = setTimeout(() => {
        wheelAccumulator = 0;
      }, 150);
    }, { passive: false });
  },

  isInView() {
    if (!this.carousel) return false;
    const rect = this.carousel.getBoundingClientRect();
    return rect.top < window.innerHeight && rect.bottom > 0;
  },

  navigate(direction) {
    if (this.isAnimating) return;
    this.isAnimating = true;

    // Exit current caption
    const currentCaption = this.captions.find(c => c.classList.contains('active'));
    if (currentCaption) {
      currentCaption.classList.add('exiting');
      currentCaption.classList.remove('active');
    }

    // Rotate positions
    if (direction === 'next') {
      // Shift all cards left
      this.cards.forEach(card => {
        const currentPos = card.dataset.position;
        const currentIdx = this.positions.indexOf(currentPos);

        if (currentIdx === 0) {
          // far-left goes to hidden-left, then wraps to far-right
          card.dataset.position = 'hidden-left';
          setTimeout(() => {
            card.style.transition = 'none';
            card.dataset.position = 'hidden-right';
            setTimeout(() => {
              card.style.transition = '';
              card.dataset.position = 'far-right';
            }, 50);
          }, 350);
        } else {
          card.dataset.position = this.positions[currentIdx - 1];
        }
      });
      this.currentIndex = (this.currentIndex + 1) % this.cards.length;
    } else {
      // Shift all cards right
      this.cards.forEach(card => {
        const currentPos = card.dataset.position;
        const currentIdx = this.positions.indexOf(currentPos);

        if (currentIdx === this.positions.length - 1) {
          // far-right goes to hidden-right, then wraps to far-left
          card.dataset.position = 'hidden-right';
          setTimeout(() => {
            card.style.transition = 'none';
            card.dataset.position = 'hidden-left';
            setTimeout(() => {
              card.style.transition = '';
              card.dataset.position = 'far-left';
            }, 50);
          }, 350);
        } else {
          card.dataset.position = this.positions[currentIdx + 1];
        }
      });
      this.currentIndex = (this.currentIndex - 1 + this.cards.length) % this.cards.length;
    }

    // Update caption after a short delay
    setTimeout(() => {
      this.updateCaption(this.currentIndex);
    }, 300);

    // Reset animation lock
    setTimeout(() => {
      this.isAnimating = false;
      // Clean up exiting class
      this.captions.forEach(c => c.classList.remove('exiting'));
    }, 700);
  },

  updateCaption(index) {
    this.captions.forEach((caption, i) => {
      caption.classList.remove('active', 'exiting');
      if (i === index) {
        caption.classList.add('active');
      }
    });
  }
};

// === Parallax Layers ===
const ParallaxLayers = {
  elements: null,
  ambientElements: null,
  isMobile: false,

  init() {
    // Skip parallax entirely on mobile - too expensive
    this.isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    if (this.isMobile) return;

    // Skip on low-end devices
    if (navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4) return;

    this.elements = document.querySelectorAll('[data-parallax]');
    this.ambientElements = document.querySelectorAll('.ambient-orb, .ambient-shape');

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    // Mouse parallax for ambient elements (throttled)
    let lastMouseMove = 0;
    document.addEventListener('mousemove', (e) => {
      const now = Date.now();
      if (now - lastMouseMove > 32) { // ~30fps
        lastMouseMove = now;
        this.mouseParallax(e);
      }
    }, { passive: true });
  },

  update() {
    // Skip on mobile
    if (this.isMobile) return;
    if (!this.elements) return;

    const scrollY = window.scrollY;
    const windowHeight = window.innerHeight;

    this.elements.forEach(element => {
      const rect = element.getBoundingClientRect();
      const elementCenter = rect.top + rect.height / 2;
      const distanceFromCenter = elementCenter - windowHeight / 2;
      const speed = parseFloat(element.dataset.parallax) || 0.1;

      if (rect.bottom > 0 && rect.top < windowHeight) {
        const translateY = distanceFromCenter * speed;
        element.style.transform = `translateY(${translateY}px)`;
      }
    });
  },

  mouseParallax(e) {
    if (this.isMobile) return;
    if (!this.ambientElements) return;

    const mouseX = (e.clientX / window.innerWidth - 0.5) * 2;
    const mouseY = (e.clientY / window.innerHeight - 0.5) * 2;

    this.ambientElements.forEach((el, index) => {
      const speed = 10 + (index * 5);
      const x = mouseX * speed;
      const y = mouseY * speed;
      el.style.transform = `translate(${x}px, ${y}px)`;
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
          target.scrollIntoView({
            behavior: 'smooth',
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
    document.querySelectorAll('.form-submit, .album-reveal, .bio-toggle').forEach(btn => {
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
  minLoadTime: 800, // Minimum time to show preloader

  // All images to preload
  imagesToPreload: [
    'pictures/profile.jpg',
    'pictures/IMG_20250415_230725_326_edit_16243105548541.jpg',
    'pictures/IMG_20250419_235912.jpg',
    'pictures/IMG_20250710_095454~2 (1).jpg',
    'pictures/IMG_20250822_093038~2 (1).jpg',
    'pictures/IMG_20250925_175649_edit_41287785265446.jpg'
  ],

  init() {
    this.preloader = document.getElementById('preloader');
    const loadStart = Date.now();

    // Wait for fonts AND all images to be ready
    Promise.all([
      document.fonts.ready,
      this.preloadAllImages()
    ]).then(() => {
      document.body.classList.add('fonts-loaded');

      // Ensure minimum load time has passed
      const elapsed = Date.now() - loadStart;
      const remaining = Math.max(0, this.minLoadTime - elapsed);

      setTimeout(() => {
        this.hidePreloader();
      }, remaining);
    });
  },

  preloadAllImages() {
    const promises = this.imagesToPreload.map(src => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = resolve;
        img.onerror = resolve; // Continue even if image fails
        img.src = src;
      });
    });

    // Race against a timeout to prevent infinite loading
    return Promise.race([
      Promise.all(promises),
      new Promise(resolve => setTimeout(resolve, 5000))
    ]);
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

      // Reveal carousel cards with staggered animation
      setTimeout(() => {
        const cards = document.querySelectorAll('.carousel-card');
        cards.forEach((card, index) => {
          setTimeout(() => {
            card.classList.add('revealed');
          }, index * 100);
        });
      }, 600);

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
    // Add random animation delays to floating elements
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

// === Section Navigation (Scroll-based tracking) ===
const SectionNav = {
  nav: null,
  navItems: null,
  sections: null,
  currentSection: null,
  ticking: false,

  init() {
    this.nav = document.getElementById('section-nav');
    if (!this.nav) return;

    this.navItems = this.nav.querySelectorAll('.nav-item');
    this.sections = Array.from(document.querySelectorAll('.room[id]'));

    if (!this.sections.length) return;

    // Initial check (scroll handling moved to consolidated ScrollHandler)
    this.updateActiveSection();
  },

  updateActiveSection() {
    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const viewportCenter = scrollTop + windowHeight * 0.4; // Focus on upper portion of viewport

    let closestSection = null;
    let closestDistance = Infinity;

    this.sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionTop = scrollTop + rect.top;
      const sectionBottom = sectionTop + rect.height;
      const sectionCenter = sectionTop + rect.height / 2;

      // Check if section is in viewport at all
      if (sectionBottom > scrollTop && sectionTop < scrollTop + windowHeight) {
        // Calculate distance from viewport center to section center
        const distance = Math.abs(viewportCenter - sectionCenter);

        // Prefer sections that are more centered in view
        if (distance < closestDistance) {
          closestDistance = distance;
          closestSection = section.id;
        }
      }
    });

    // Also check if we're at the very top - always show first section
    if (scrollTop < 100) {
      closestSection = this.sections[0]?.id;
    }

    // Also check if we're at the very bottom - show last section
    if (scrollTop + windowHeight >= document.documentElement.scrollHeight - 50) {
      closestSection = this.sections[this.sections.length - 1]?.id;
    }

    if (closestSection && closestSection !== this.currentSection) {
      this.currentSection = closestSection;
      this.setActive(closestSection);
    }
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

    // Reinitialize magnetic/touch effects after name change
    if (typeof MagneticLetters !== 'undefined') {
      MagneticLetters.letterData = [];
      MagneticLetters.init();
    }
    if (typeof MobileTouchRepel !== 'undefined') {
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

// === About Section Toggle (Bio Plus → X) with Word-by-Word Animation ===
const AboutToggle = {
  btn: null,
  content: null,
  isExpanded: false,
  initialized: false,

  init() {
    this.btn = document.getElementById('see-more-toggle');
    this.content = document.getElementById('about-extended');

    if (!this.btn || !this.content) return;

    // Initialize word spans for bio paragraphs
    this.initWordSpans();

    this.btn.addEventListener('click', () => this.toggle());
  },

  initWordSpans() {
    if (this.initialized) return;

    const paragraphs = this.content.querySelectorAll('.about-paragraph');
    let globalWordIndex = 0;

    paragraphs.forEach(p => {
      const key = p.dataset.i18n;
      const text = I18n.t(key);

      if (text && text !== key) {
        const words = text.split(' ');
        p.innerHTML = words.map(word => {
          const delay = globalWordIndex * 0.035; // 35ms between each word
          globalWordIndex++;
          return `<span class="bio-word" style="transition-delay: ${delay}s">${word}</span>`;
        }).join(' ');
      }
    });

    this.initialized = true;
  },

  toggle() {
    this.isExpanded = !this.isExpanded;

    // Toggle classes
    this.content.classList.toggle('expanded', this.isExpanded);
    this.content.classList.toggle('collapsed', !this.isExpanded);

    // Update ARIA (CSS handles the plus → X rotation)
    this.btn.setAttribute('aria-expanded', this.isExpanded.toString());

    // Smooth scroll to content if expanding
    if (this.isExpanded) {
      setTimeout(() => {
        this.content.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }, 100);
    }
  },

  // Update word spans when language changes
  updateLanguage() {
    this.initialized = false;
    this.initWordSpans();
  }
};

// === Consolidated Scroll Handler ===
const ScrollHandler = {
  ticking: false,
  isMobile: false,
  lastUpdate: 0,

  init() {
    this.isMobile = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
    window.addEventListener('scroll', () => this.onScroll(), { passive: true });
  },

  onScroll() {
    if (!this.ticking) {
      // On mobile, throttle to ~15fps instead of 60fps to save battery
      const now = Date.now();
      const delay = this.isMobile ? 66 : 0; // 66ms = ~15fps

      if (now - this.lastUpdate > delay) {
        requestAnimationFrame(() => {
          // Skip parallax on mobile (already handled in ParallaxLayers but extra safety)
          if (!this.isMobile) {
            ParallaxLayers.update();
          }
          SectionNav.updateActiveSection();
          MobileMenu.updateActiveItem();
          this.ticking = false;
          this.lastUpdate = Date.now();
        });
        this.ticking = true;
      }
    }
  }
};

// === Initialize Everything ===
document.addEventListener('DOMContentLoaded', () => {
  // Initialize i18n first
  I18n.init();

  // Smooth scroll with Lenis (must be early)
  SmoothScrollInit.init();

  // Core functionality
  ScrollProgress.init();
  ScrollReveal.init();
  ScrollAnimate.init();
  AnnotationReveal.init();
  EmailModal.init();
  PhotoCarousel.init();
  SmoothScroll.init();
  PageLoad.init();

  // Enhanced effects
  MagneticLetters.init();
  MobileTouchRepel.init();
  ParallaxLayers.init();
  BreathingElements.init();
  HoverEffects.init();
  RandomDelays.init();

  // Controls
  ThemeToggle.init();
  LanguageSwitcher.init();
  SectionNav.init();

  // About section toggle
  AboutToggle.init();

  // Project modal for pop-out cards
  ProjectModal.init();

  // Mobile menu
  MobileMenu.init();

  // Consolidated scroll handler
  ScrollHandler.init();
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

    const scrollTop = window.scrollY;
    const windowHeight = window.innerHeight;
    const sections = Array.from(document.querySelectorAll('.room[id]'));

    let currentSection = sections[0]?.id;

    sections.forEach(section => {
      const rect = section.getBoundingClientRect();
      const sectionTop = scrollTop + rect.top;

      if (scrollTop >= sectionTop - windowHeight * 0.4) {
        currentSection = section.id;
      }
    });

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
    // Recalculate any size-dependent values if needed
  }, 250);
});
