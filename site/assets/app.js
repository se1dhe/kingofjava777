/**
 * KINGOFJAVA777 — Main Application Script
 *
 * Vanilla JS, zero dependencies. Modular IIFE architecture.
 * Features: particle system, i18n, scroll animations, lazy video,
 *           mobile nav, smooth scroll, language picker, a11y.
 *
 * Design tokens reference: design-system/MASTER.md
 * Locales path:             /locales/{ru,en,am}.json
 */

(function () {
  'use strict';

  /* ------------------------------------------------------------------ */
  /*  0. UTILITIES                                                      */
  /* ------------------------------------------------------------------ */

  /**
   * Debounce — delays invocation until `wait` ms of inactivity.
   * @param {Function} fn
   * @param {number}   wait  milliseconds
   * @returns {Function}
   */
  function debounce(fn, wait) {
    let timer;
    return function (...args) {
      clearTimeout(timer);
      timer = setTimeout(() => fn.apply(this, args), wait);
    };
  }

  /**
   * Throttle — guarantees at most one invocation per `limit` ms.
   * @param {Function} fn
   * @param {number}   limit  milliseconds
   * @returns {Function}
   */
  function throttle(fn, limit) {
    let lastCall = 0;
    return function (...args) {
      const now = Date.now();
      if (now - lastCall >= limit) {
        lastCall = now;
        fn.apply(this, args);
      }
    };
  }

  /**
   * Detect whether the user prefers reduced motion.
   * @returns {boolean}
   */
  function prefersReducedMotion() {
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /**
   * Safe querySelector — returns element or null, never throws.
   * @param {string} sel
   * @param {Element|Document} [ctx=document]
   * @returns {Element|null}
   */
  function qs(sel, ctx) {
    return (ctx || document).querySelector(sel);
  }

  /**
   * Safe querySelectorAll — returns a real Array.
   * @param {string} sel
   * @param {Element|Document} [ctx=document]
   * @returns {Element[]}
   */
  function qsa(sel, ctx) {
    return Array.from((ctx || document).querySelectorAll(sel));
  }

  /* ------------------------------------------------------------------ */
  /*  1. PARTICLE SYSTEM  (canvas, GPU-accelerated)                     */
  /* ------------------------------------------------------------------ */

  const ParticleSystem = (function () {
    const PARTICLE_COUNT_MIN  = 50;
    const PARTICLE_COUNT_MAX  = 80;
    const SIZE_MIN            = 2;
    const SIZE_MAX            = 6;
    const OPACITY_MIN         = 0.3;
    const OPACITY_MAX         = 0.6;
    const SPEED_Y_MIN         = 0.2;   // px per frame upward
    const SPEED_Y_MAX         = 0.5;
    const SWAY_AMPLITUDE      = 0.4;   // horizontal sway px per frame
    const SWAY_FREQUENCY      = 0.01;  // sine wave frequency factor
    // Gold-light colour from design system: #E8C582 → rgb(232,197,130)
    const COLOR_R = 232;
    const COLOR_G = 197;
    const COLOR_B = 130;
    // Cap frame-rate at ~60 fps
    const FRAME_INTERVAL = 1000 / 60;

    let canvas, ctx;
    let particles = [];
    let animId = null;
    let lastTime = 0;
    let width, height;

    /** Create one particle at a random position. */
    function createParticle(randomY) {
      return {
        x: Math.random() * width,
        y: randomY ? Math.random() * height : height + Math.random() * 20,
        size: SIZE_MIN + Math.random() * (SIZE_MAX - SIZE_MIN),
        opacity: OPACITY_MIN + Math.random() * (OPACITY_MAX - OPACITY_MIN),
        speedY: SPEED_Y_MIN + Math.random() * (SPEED_Y_MAX - SPEED_Y_MIN),
        phase: Math.random() * Math.PI * 2, // sway offset
      };
    }

    /** Resize canvas to fill viewport. */
    function resize() {
      if (!canvas) return;
      width  = window.innerWidth;
      height = window.innerHeight;
      canvas.width  = width;
      canvas.height = height;
    }

    /** Initialise particles array. */
    function seed() {
      const count = PARTICLE_COUNT_MIN +
        Math.round(Math.random() * (PARTICLE_COUNT_MAX - PARTICLE_COUNT_MIN));
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(true));
      }
    }

    /** Draw one frame. */
    function draw(timestamp) {
      try {
        animId = requestAnimationFrame(draw);

        // Frame-rate cap
        if (timestamp - lastTime < FRAME_INTERVAL) return;
        lastTime = timestamp;

        ctx.clearRect(0, 0, width, height);

        for (let i = 0; i < particles.length; i++) {
          const p = particles[i];

          // Update position
          p.y -= p.speedY;                           // drift upward
          p.phase += SWAY_FREQUENCY;
          p.x += Math.sin(p.phase) * SWAY_AMPLITUDE; // horizontal sway

          // Respawn at bottom when off-screen top
          if (p.y + p.size < 0) {
            particles[i] = createParticle(false);
            continue;
          }

          // Draw
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
          ctx.fillStyle =
            'rgba(' + COLOR_R + ',' + COLOR_G + ',' + COLOR_B + ',' + p.opacity + ')';
          ctx.fill();
        }
      } catch (err) {
        // Gracefully stop animation on error
        console.error('[ParticleSystem] frame error:', err);
        cancelAnimationFrame(animId);
      }
    }

    /** Start the system. */
    function init() {
      // Respect reduced-motion preference
      if (prefersReducedMotion()) return;

      canvas = document.createElement('canvas');
      canvas.id = 'particle-canvas';
      Object.assign(canvas.style, {
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        zIndex: '-1',
        pointerEvents: 'none',
        willChange: 'transform',
      });
      document.body.prepend(canvas);
      ctx = canvas.getContext('2d');

      resize();
      seed();
      animId = requestAnimationFrame(draw);

      window.addEventListener('resize', throttle(resize, 200));
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------ */
  /*  2. INTERNATIONALIZATION (i18n)                                    */
  /* ------------------------------------------------------------------ */

  const I18n = (function () {
    const SUPPORTED_LANGS  = ['ru', 'en', 'am'];
    const DEFAULT_LANG     = 'ru';
    const FALLBACK_LANG    = 'en';
    const STORAGE_KEY      = 'kingofjava777_lang';
    const LOCALES_BASE_URL = './locales/';

    let currentLang = DEFAULT_LANG;
    let translations = {}; // { ru: {...}, en: {...}, am: {...} }

    /**
     * Load a single locale JSON file.
     * @param {string} lang
     * @returns {Promise<Object>}
     */
    async function loadLocale(lang) {
      if (translations[lang]) return translations[lang];
      try {
        const res = await fetch(LOCALES_BASE_URL + lang + '.json');
        if (!res.ok) throw new Error('HTTP ' + res.status);
        translations[lang] = await res.json();
        return translations[lang];
      } catch (err) {
        console.warn('[I18n] Failed to load locale "' + lang + '":', err);
        return null;
      }
    }

    /**
     * Retrieve a nested translation value by dot-separated key.
     * Falls back to English, then returns the key itself.
     * @param {string} key   e.g. "nav.home"
     * @param {string} [lang]
     * @returns {string}
     */
    function t(key, lang) {
      lang = lang || currentLang;
      const keys = key.split('.');

      // Try requested language
      let val = translations[lang];
      for (const k of keys) {
        val = val && val[k] !== undefined ? val[k] : undefined;
      }
      if (val !== undefined) return val;

      // Fallback to English
      if (lang !== FALLBACK_LANG) {
        val = translations[FALLBACK_LANG];
        for (const k of keys) {
          val = val && val[k] !== undefined ? val[k] : undefined;
        }
        if (val !== undefined) return val;
      }

      // Last resort: return the key
      return key;
    }

    /**
     * Translate every element that carries a data-i18n attribute.
     * Supports:
     *   data-i18n="key"          → textContent
     *   data-i18n="attr:key"     → setAttribute(attr, value)
     *   data-i18n="html:key"     → innerHTML
     */
    function translateDOM() {
      qsa('[data-i18n]').forEach(function (el) {
        const raw = el.getAttribute('data-i18n');
        if (!raw) return;

        // Check for attribute or html prefix
        const colonIdx = raw.indexOf(':');
        if (colonIdx !== -1) {
          const prefix = raw.substring(0, colonIdx);
          const key    = raw.substring(colonIdx + 1);
          const value  = t(key);

          if (prefix === 'html') {
            el.innerHTML = value;
          } else {
            el.setAttribute(prefix, value);
          }
        } else {
          el.textContent = t(raw);
        }
      });
    }

    /**
     * Set the active language, persist it, and re-translate the page.
     * @param {string} lang
     */
    async function setLanguage(lang) {
      if (!SUPPORTED_LANGS.includes(lang)) {
        console.warn('[I18n] Unsupported language: ' + lang);
        return;
      }

      // Ensure locale data is loaded
      await loadLocale(lang);
      // Also ensure fallback is loaded
      if (lang !== FALLBACK_LANG) {
        await loadLocale(FALLBACK_LANG);
      }

      currentLang = lang;
      document.documentElement.lang = lang;

      try {
        localStorage.setItem(STORAGE_KEY, lang);
      } catch (_) { /* storage unavailable — ignore */ }

      translateDOM();

      // Announce change for screen readers
      announceToSR('Language changed to ' + lang);
    }

    /**
     * Determine initial language: localStorage → browser → default.
     * @returns {string}
     */
    function detectLanguage() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored && SUPPORTED_LANGS.includes(stored)) return stored;
      } catch (_) { /* ignore */ }

      const browserLang = (navigator.language || '').substring(0, 2).toLowerCase();
      if (SUPPORTED_LANGS.includes(browserLang)) return browserLang;

      return DEFAULT_LANG;
    }

    /** Initialise i18n system. */
    async function init() {
      const lang = detectLanguage();
      await loadLocale(lang);
      await loadLocale(FALLBACK_LANG);
      currentLang = lang;
      document.documentElement.lang = lang;
      translateDOM();
    }

    return {
      init: init,
      setLanguage: setLanguage,
      t: t,
      getCurrentLang: function () { return currentLang; },
      SUPPORTED_LANGS: SUPPORTED_LANGS,
    };
  })();

  /* ------------------------------------------------------------------ */
  /*  3. SCROLL ANIMATIONS  (Intersection Observer)                     */
  /* ------------------------------------------------------------------ */

  const ScrollAnimations = (function () {
    const THRESHOLD    = 0.15; // trigger at 15 % visibility
    const DURATION     = '600ms';
    const EASING       = 'cubic-bezier(0.16, 1, 0.3, 1)'; // expo-out
    const BASE_DELAY   = 100; // ms per stagger step

    let observer;

    /** Apply initial hidden state to .reveal elements. */
    function prepareElements() {
      if (prefersReducedMotion()) {
        // Make everything visible immediately
        qsa('.reveal').forEach(function (el) {
          el.style.opacity = '1';
          el.style.transform = 'none';
        });
        return;
      }

      qsa('.reveal').forEach(function (el) {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition =
          'opacity ' + DURATION + ' ' + EASING + ', ' +
          'transform ' + DURATION + ' ' + EASING;
        el.style.willChange = 'opacity, transform';
      });
    }

    /** Reveal an element with optional stagger delay. */
    function reveal(el) {
      const stagger = parseInt(el.getAttribute('data-stagger'), 10) || 0;
      const delay = stagger * BASE_DELAY;

      setTimeout(function () {
        el.style.opacity = '1';
        el.style.transform = 'translateY(0)';
        // Clean up will-change after animation
        setTimeout(function () {
          el.style.willChange = 'auto';
        }, 700 + delay);
      }, delay);
    }

    /** Set up Intersection Observer. */
    function init() {
      prepareElements();
      if (prefersReducedMotion()) return;

      observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            reveal(entry.target);
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: THRESHOLD });

      qsa('.reveal').forEach(function (el) {
        observer.observe(el);
      });
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------ */
  /*  4. VIDEO PLAYER INTEGRATION                                       */
  /* ------------------------------------------------------------------ */

  const VideoPlayer = (function () {

    /**
     * Extract YouTube video ID from various URL formats.
     * @param {string} url
     * @returns {string|null}
     */
    function extractYouTubeId(url) {
      if (!url) return null;
      const match = url.match(
        /(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/
      );
      return match ? match[1] : null;
    }

    /**
     * Convert a YouTube watch URL to an embed URL.
     * @param {string} url
     * @returns {string|null}
     */
    function youtubeEmbedUrl(url) {
      const id = extractYouTubeId(url);
      if (!id) return null;
      return 'https://www.youtube.com/embed/' + id;
    }

    /**
     * Build a fallback thumbnail URL for YouTube.
     * @param {string} videoId
     * @returns {string}
     */
    function youtubeThumbnail(videoId) {
      return 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
    }

    /**
     * Create a lazy-loaded iframe for YouTube.
     * @param {HTMLElement} container  — the .video-card element
     * @param {string}      url       — original YouTube URL
     */
    function setupYouTube(container, url) {
      const embedUrl = youtubeEmbedUrl(url);
      if (!embedUrl) {
        showFallback(container);
        return;
      }

      const videoId = extractYouTubeId(url);
      const thumbUrl = youtubeThumbnail(videoId);

      // Build thumbnail + play-button overlay
      const overlay = document.createElement('div');
      overlay.className = 'video-overlay';
      overlay.setAttribute('role', 'button');
      overlay.setAttribute('tabindex', '0');
      overlay.setAttribute('aria-label', 'Play video');
      overlay.style.cssText =
        'position:relative;width:100%;aspect-ratio:16/9;cursor:pointer;overflow:hidden;' +
        'border-radius:inherit;background:#000;';

      const img = document.createElement('img');
      img.src = thumbUrl;
      img.alt = '';
      img.loading = 'lazy';
      img.style.cssText = 'width:100%;height:100%;object-fit:cover;';

      const playBtn = document.createElement('div');
      playBtn.className = 'play-btn';
      playBtn.setAttribute('aria-hidden', 'true');
      playBtn.style.cssText =
        'position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);' +
        'width:68px;height:48px;background:rgba(212,175,55,0.9);border-radius:12px;' +
        'display:flex;align-items:center;justify-content:center;' +
        'transition:background 200ms ease;';
      // Play triangle via CSS
      playBtn.innerHTML =
        '<svg width="24" height="24" viewBox="0 0 24 24" fill="#08090C">' +
        '<polygon points="6,3 20,12 6,21"/></svg>';

      overlay.appendChild(img);
      overlay.appendChild(playBtn);

      // Click / Enter → replace with iframe
      function loadIframe() {
        const iframe = document.createElement('iframe');
        iframe.src = embedUrl + '?autoplay=1';
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('allow', 'autoplay; encrypted-media; picture-in-picture');
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('loading', 'lazy');
        iframe.title = container.getAttribute('data-title') || 'Video player';
        iframe.style.cssText =
          'position:absolute;top:0;left:0;width:100%;height:100%;border:0;';
        container.style.position = 'relative';
        container.innerHTML = '';
        container.appendChild(iframe);
      }

      overlay.addEventListener('click', loadIframe);
      overlay.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          loadIframe();
        }
      });

      overlay.addEventListener('mouseenter', function () {
        playBtn.style.background = 'rgba(212,175,55,1)';
      });
      overlay.addEventListener('mouseleave', function () {
        playBtn.style.background = 'rgba(212,175,55,0.9)';
      });

      container.appendChild(overlay);
    }

    /**
     * Set up TikTok embed.
     * Loads the official TikTok embed script if not already present.
     * @param {HTMLElement} container
     * @param {string}      url — TikTok video URL
     */
    function setupTikTok(container, url) {
      // TikTok uses a blockquote that their script converts
      const blockquote = document.createElement('blockquote');
      blockquote.className = 'tiktok-embed';
      blockquote.setAttribute('cite', url);
      blockquote.setAttribute('data-video-id', url.match(/video\/(\d+)/)?.[1] || '');
      blockquote.style.cssText = 'max-width:605px;min-width:325px;';

      const section = document.createElement('section');
      section.style.display = 'none';
      blockquote.appendChild(section);
      container.appendChild(blockquote);

      // Load TikTok embed script once
      if (!qs('#tiktok-embed-script')) {
        const script = document.createElement('script');
        script.id = 'tiktok-embed-script';
        script.src = 'https://www.tiktok.com/embed.js';
        script.async = true;
        document.body.appendChild(script);
      }
    }

    /**
     * Set up stream player (Twitch / Kick).
     * Shows a LIVE badge when the stream is active.
     * @param {HTMLElement} container
     * @param {Object}      opts — { platform, channel }
     */
    function setupStream(container, opts) {
      const { platform, channel } = opts;
      if (!channel) {
        showFallback(container);
        return;
      }

      let embedUrl = '';
      if (platform === 'twitch') {
        embedUrl = 'https://player.twitch.tv/?channel=' +
          encodeURIComponent(channel) + '&parent=' + location.hostname;
      } else if (platform === 'kick') {
        embedUrl = 'https://player.kick.com/' + encodeURIComponent(channel);
      } else {
        showFallback(container);
        return;
      }

      const iframe = document.createElement('iframe');
      iframe.src = embedUrl;
      iframe.setAttribute('frameborder', '0');
      iframe.setAttribute('allowfullscreen', '');
      iframe.setAttribute('loading', 'lazy');
      iframe.title = (platform === 'twitch' ? 'Twitch' : 'Kick') + ' stream player';
      iframe.style.cssText = 'width:100%;aspect-ratio:16/9;border:0;border-radius:inherit;';
      container.appendChild(iframe);

      // LIVE badge
      checkStreamLive(platform, channel, function (isLive) {
        if (isLive) {
          const badge = document.createElement('span');
          badge.className = 'live-badge';
          badge.textContent = 'LIVE';
          badge.setAttribute('aria-label', 'Stream is live');
          badge.style.cssText =
            'position:absolute;top:12px;left:12px;background:#C41E3A;color:#fff;' +
            'font-family:"Russo One",sans-serif;font-size:0.75rem;letter-spacing:0.08em;' +
            'padding:4px 10px;border-radius:4px;text-transform:uppercase;z-index:2;' +
            'animation:live-pulse 2s ease-in-out infinite;';
          container.style.position = 'relative';
          container.appendChild(badge);
        }
      });
    }

    /**
     * Check whether a stream is currently live.
     * Uses public endpoints where possible; gracefully fails.
     * @param {string}   platform
     * @param {string}   channel
     * @param {Function} callback — receives boolean
     */
    function checkStreamLive(platform, channel, callback) {
      // Optional: integrate with Twitch/Kick APIs here.
      // For now, assume live status is unknown → no badge shown.
      // Consumers can override this function or add API keys.
      try {
        if (platform === 'twitch') {
          // Example: fetch('https://api.twitch.tv/helix/streams?user_login=' + channel, ...)
          // Requires OAuth — left as stub.
          callback(false);
        } else if (platform === 'kick') {
          // Example: fetch('https://kick.com/api/v2/channels/' + channel)
          callback(false);
        } else {
          callback(false);
        }
      } catch (_) {
        callback(false);
      }
    }

    /** Show a generic fallback (thumbnail placeholder + play icon). */
    function showFallback(container) {
      container.style.cssText +=
        ';position:relative;aspect-ratio:16/9;background:#161921;' +
        'display:flex;align-items:center;justify-content:center;border-radius:inherit;';
      const icon = document.createElement('div');
      icon.setAttribute('aria-hidden', 'true');
      icon.style.cssText =
        'width:64px;height:64px;border-radius:50%;background:rgba(212,175,55,0.2);' +
        'display:flex;align-items:center;justify-content:center;';
      icon.innerHTML =
        '<svg width="28" height="28" viewBox="0 0 24 24" fill="#D4AF37">' +
        '<polygon points="6,3 20,12 6,21"/></svg>';
      container.appendChild(icon);
    }

    /**
     * Lazy-load video iframes when scrolled into view.
     * Processes elements with [data-video-type] attribute.
     */
    function init() {
      const lazyObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;

          const el   = entry.target;
          const type = el.getAttribute('data-video-type');

          if (type === 'youtube') {
            setupYouTube(el, el.getAttribute('data-video-url'));
          } else if (type === 'tiktok') {
            setupTikTok(el, el.getAttribute('data-video-url'));
          } else if (type === 'stream') {
            setupStream(el, {
              platform: el.getAttribute('data-stream-platform'),
              channel:  el.getAttribute('data-stream-channel'),
            });
          }

          lazyObserver.unobserve(el);
        });
      }, { rootMargin: '200px' }); // start loading 200px before visible

      qsa('[data-video-type]').forEach(function (el) {
        lazyObserver.observe(el);
      });
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------ */
  /*  5. MOBILE NAVIGATION                                              */
  /* ------------------------------------------------------------------ */

  const MobileNav = (function () {
    let nav, overlay, hamburger, focusableEls, firstFocusable, lastFocusable;
    let isOpen = false;

    /** Open the mobile navigation panel. */
    function open() {
      if (!nav || isOpen) return;
      isOpen = true;
      nav.classList.add('nav-open');
      nav.setAttribute('aria-hidden', 'false');
      hamburger.setAttribute('aria-expanded', 'true');
      document.body.style.overflow = 'hidden';

      // Focus first focusable element inside nav
      cacheFocusable();
      if (firstFocusable) firstFocusable.focus();
    }

    /** Close the mobile navigation panel. */
    function close() {
      if (!nav || !isOpen) return;
      isOpen = false;
      nav.classList.remove('nav-open');
      nav.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
      hamburger.focus();
    }

    /** Toggle the mobile navigation panel. */
    function toggle() {
      isOpen ? close() : open();
    }

    /** Cache focusable elements inside the nav for focus trapping. */
    function cacheFocusable() {
      if (!nav) return;
      focusableEls = qsa(
        'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])',
        nav
      );
      firstFocusable = focusableEls[0];
      lastFocusable  = focusableEls[focusableEls.length - 1];
    }

    /** Trap Tab / Shift+Tab within the nav when open. */
    function handleKeyDown(e) {
      if (!isOpen) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        close();
        return;
      }

      if (e.key === 'Tab') {
        cacheFocusable();
        if (focusableEls.length === 0) {
          e.preventDefault();
          return;
        }
        if (e.shiftKey) {
          // Shift+Tab: if on first element, wrap to last
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // Tab: if on last element, wrap to first
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      }
    }

    /** Close nav when clicking a link inside it. */
    function handleLinkClick(e) {
      if (e.target.closest('a') && isOpen) {
        close();
      }
    }

    /** Close nav when clicking outside. */
    function handleOutsideClick(e) {
      if (isOpen && nav && !nav.contains(e.target) && !hamburger.contains(e.target)) {
        close();
      }
    }

    /** Initialise mobile navigation. */
    function init() {
      hamburger = qs('.hamburger, [data-hamburger]');
      nav       = qs('.mobile-nav, [data-mobile-nav]');

      if (!hamburger || !nav) return; // no mobile nav on this page

      // Set initial ARIA state
      nav.setAttribute('aria-hidden', 'true');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.setAttribute('aria-controls', nav.id || 'mobile-nav');
      if (!nav.id) nav.id = 'mobile-nav';

      hamburger.addEventListener('click', toggle);
      document.addEventListener('keydown', handleKeyDown);
      document.addEventListener('click', handleOutsideClick);
      nav.addEventListener('click', handleLinkClick);
    }

    return { init: init, close: close };
  })();

  /* ------------------------------------------------------------------ */
  /*  6. SMOOTH SCROLL                                                  */
  /* ------------------------------------------------------------------ */

  const SmoothScroll = (function () {
    const HEADER_OFFSET = 64; // px — fixed header height

    /**
     * Scroll smoothly to a target element, accounting for fixed header.
     * @param {string} targetId — CSS selector or hash (e.g. "#about")
     */
    function scrollTo(targetId) {
      const target = qs(targetId);
      if (!target) return;

      const top = target.getBoundingClientRect().top + window.pageYOffset - HEADER_OFFSET;
      window.scrollTo({ top: top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    }

    /** Handle clicks on anchor links. */
    function handleClick(e) {
      const link = e.target.closest('a[href^="#"]');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href === '#') return;

      e.preventDefault();
      scrollTo(href);

      // Update URL hash without jumping
      history.pushState(null, '', href);
    }

    function init() {
      document.addEventListener('click', handleClick);
    }

    return { init: init, scrollTo: scrollTo };
  })();

  /* ------------------------------------------------------------------ */
  /*  7. LANGUAGE PICKER                                                */
  /* ------------------------------------------------------------------ */

  const LanguagePicker = (function () {
    let picker, dropdown, currentBtn;

    /** Toggle the dropdown visibility. */
    function toggleDropdown() {
      if (!dropdown) return;
      const isHidden = dropdown.hidden;
      dropdown.hidden = !isHidden;
      if (currentBtn) {
        currentBtn.setAttribute('aria-expanded', String(isHidden));
      }
    }

    /** Close the dropdown. */
    function closeDropdown() {
      if (!dropdown) return;
      dropdown.hidden = true;
      if (currentBtn) currentBtn.setAttribute('aria-expanded', 'false');
    }

    /** Handle language selection. */
    function selectLang(e) {
      const btn = e.target.closest('[data-lang]');
      if (!btn) return;

      const lang = btn.getAttribute('data-lang');
      I18n.setLanguage(lang);
      updateActiveState(lang);
      closeDropdown();
    }

    /** Update visual active state on picker buttons. */
    function updateActiveState(lang) {
      qsa('[data-lang]').forEach(function (btn) {
        const isActive = btn.getAttribute('data-lang') === lang;
        btn.classList.toggle('lang-active', isActive);
        btn.setAttribute('aria-current', isActive ? 'true' : 'false');
      });
      // Update the trigger button text
      if (currentBtn) {
        const label = qs('[data-lang="' + lang + '"] .lang-label');
        if (label) {
          const triggerLabel = qs('.lang-label', currentBtn);
          if (triggerLabel) triggerLabel.textContent = label.textContent;
        }
      }
    }

    /** Close when clicking outside. */
    function handleOutsideClick(e) {
      if (picker && !picker.contains(e.target)) {
        closeDropdown();
      }
    }

    /** Keyboard navigation inside dropdown. */
    function handleKeyDown(e) {
      if (!dropdown || dropdown.hidden) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        closeDropdown();
        if (currentBtn) currentBtn.focus();
      }

      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        const items = qsa('[data-lang]', dropdown);
        if (items.length === 0) return;
        const idx = items.indexOf(document.activeElement);
        let next;
        if (e.key === 'ArrowDown') {
          next = idx < items.length - 1 ? idx + 1 : 0;
        } else {
          next = idx > 0 ? idx - 1 : items.length - 1;
        }
        items[next].focus();
      }
    }

    function init() {
      picker    = qs('.lang-picker, [data-lang-picker]');
      if (!picker) return;

      currentBtn = qs('.lang-picker__trigger, [data-lang-trigger]', picker);
      dropdown   = qs('.lang-picker__dropdown, [data-lang-dropdown]', picker);

      if (!currentBtn || !dropdown) return;

      currentBtn.setAttribute('aria-haspopup', 'true');
      currentBtn.setAttribute('aria-expanded', 'false');

      currentBtn.addEventListener('click', function (e) {
        e.stopPropagation();
        toggleDropdown();
      });

      dropdown.addEventListener('click', selectLang);
      document.addEventListener('click', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);

      // Set initial active state
      updateActiveState(I18n.getCurrentLang());
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------ */
  /*  8. ACCESSIBILITY HELPERS                                          */
  /* ------------------------------------------------------------------ */

  const A11y = (function () {
    let liveRegion;

    /**
     * Create a visually-hidden aria-live region for announcements.
     */
    function createLiveRegion() {
      liveRegion = document.createElement('div');
      liveRegion.setAttribute('aria-live', 'polite');
      liveRegion.setAttribute('aria-atomic', 'true');
      liveRegion.className = 'sr-only';
      liveRegion.style.cssText =
        'position:absolute;width:1px;height:1px;padding:0;margin:-1px;' +
        'overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0;';
      document.body.appendChild(liveRegion);
    }

    /**
     * Announce a message to screen readers.
     * @param {string} message
     */
    function announce(message) {
      if (!liveRegion) createLiveRegion();
      // Clear then set to force re-announcement
      liveRegion.textContent = '';
      requestAnimationFrame(function () {
        liveRegion.textContent = message;
      });
    }

    /**
     * Add skip-link for main content.
     */
    function addSkipLink() {
      const main = qs('main, #main, [role="main"]');
      if (!main || qs('.skip-link')) return;

      if (!main.id) main.id = 'main-content';

      const skip = document.createElement('a');
      skip.href = '#' + main.id;
      skip.className = 'skip-link';
      skip.textContent = 'Skip to main content';
      skip.style.cssText =
        'position:absolute;top:-100%;left:16px;background:#D4AF37;color:#08090C;' +
        'padding:8px 16px;border-radius:0 0 6px 6px;font-weight:600;z-index:9999;' +
        'transition:top 200ms ease;';
      skip.addEventListener('focus', function () { skip.style.top = '0'; });
      skip.addEventListener('blur',  function () { skip.style.top = '-100%'; });
      document.body.prepend(skip);
    }

    /**
     * Set up global keyboard handlers.
     */
    function initKeyboard() {
      document.addEventListener('keydown', function (e) {
        // Escape closes any open mobile nav
        if (e.key === 'Escape') {
          MobileNav.close();
        }
      });
    }

    function init() {
      createLiveRegion();
      addSkipLink();
      initKeyboard();
    }

    return { init: init, announce: announce };
  })();

  // Expose announce helper globally for other modules
  function announceToSR(msg) {
    A11y.announce(msg);
  }

  /* ------------------------------------------------------------------ */
  /*  9. LAZY LOAD IMAGES                                               */
  /* ------------------------------------------------------------------ */

  const LazyImages = (function () {
    function init() {
      // Modern browsers support loading="lazy" natively.
      // For older browsers, use IntersectionObserver as fallback.
      if ('loading' in HTMLImageElement.prototype) return; // native support

      const imgObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
              img.src = img.dataset.src;
              img.removeAttribute('data-src');
            }
            if (img.dataset.srcset) {
              img.srcset = img.dataset.srcset;
              img.removeAttribute('data-srcset');
            }
            imgObserver.unobserve(img);
          }
        });
      });

      qsa('img[data-src]').forEach(function (img) {
        imgObserver.observe(img);
      });
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------ */
  /*  10. PERFORMANCE — scroll & resize handlers                        */
  /* ------------------------------------------------------------------ */

  const Performance = (function () {
    let lastScrollY = 0;
    let ticking = false;

    /**
     * Handle scroll events (debounced).
     * Add/remove a class on the header for background change.
     */
    function onScroll() {
      lastScrollY = window.pageYOffset;
      if (!ticking) {
        requestAnimationFrame(function () {
          const header = qs('header, .site-header, [data-header]');
          if (header) {
            header.classList.toggle('header-scrolled', lastScrollY > 10);
          }
          ticking = false;
        });
        ticking = true;
      }
    }

    /**
     * Handle resize events (throttled).
     * Recalculate any layout-dependent values.
     */
    function onResize() {
      // Close mobile nav on resize to desktop
      if (window.innerWidth > 1023) {
        MobileNav.close();
      }
    }

    function init() {
      window.addEventListener('scroll', debounce(onScroll, 100), { passive: true });
      window.addEventListener('resize',  throttle(onResize, 200),  { passive: true });
    }

    return { init: init };
  })();

  /* ------------------------------------------------------------------ */
  /*  BOOTSTRAP — Initialise all modules                                */
  /* ------------------------------------------------------------------ */

  async function boot() {
    try {
      // Core systems first
      A11y.init();
      ParticleSystem.init();
      await I18n.init();

      // UI interactions
      MobileNav.init();
      LanguagePicker.init();
      SmoothScroll.init();

      // Content loading
      ScrollAnimations.init();
      VideoPlayer.init();
      LazyImages.init();

      // Performance monitoring
      Performance.init();

      // Add LIVE badge pulse animation to stylesheet
      injectKeyframes();

      console.info('[KINGOFJAVA777] All modules initialised.');
    } catch (err) {
      console.error('[KINGOFJAVA777] Boot error:', err);
    }
  }

  /** Inject required @keyframes that JS-created elements depend on. */
  function injectKeyframes() {
    const style = document.createElement('style');
    style.textContent = [
      '@keyframes live-pulse {',
      '  0%, 100% { opacity: 1; }',
      '  50% { opacity: 0.6; }',
      '}',
    ].join('\n');
    document.head.appendChild(style);
  }

  // Start when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

})();
