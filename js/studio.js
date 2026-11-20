/*
  Tech Simpld Studio - Release Page Interactions
  Handles install tabs, copy-to-clipboard buttons, and accessible screenshot lightbox.
*/

(function () {
  'use strict';

  const statusLive = document.getElementById('studioLiveStatus');

  function announce(msg) {
    if (!statusLive) return;
    statusLive.textContent = '';
    setTimeout(function () {
      statusLive.textContent = msg;
    }, 30);
  }

  /* 1. Quickstart Install Tabs (click + Left/Right arrow keyboard navigation) */
  const tabButtons = Array.from(document.querySelectorAll('.studio-tab-btn'));
  const tabPanels = Array.from(document.querySelectorAll('.studio-tab-panel'));

  function activateTab(btn) {
    const targetId = btn.getAttribute('aria-controls');
    tabButtons.forEach(function (b) {
      const selected = b === btn;
      b.setAttribute('aria-selected', selected ? 'true' : 'false');
      b.setAttribute('tabindex', selected ? '0' : '-1');
    });
    tabPanels.forEach(function (panel) {
      panel.hidden = panel.id !== targetId;
    });
  }

  tabButtons.forEach(function (btn, index) {
    btn.addEventListener('click', function () {
      activateTab(btn);
    });
    btn.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') {
        e.preventDefault();
        const next = tabButtons[(index + 1) % tabButtons.length];
        activateTab(next);
        next.focus();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        const prev = tabButtons[(index - 1 + tabButtons.length) % tabButtons.length];
        activateTab(prev);
        prev.focus();
      }
    });
  });

  /* 2. Copy-to-Clipboard Buttons */
  const copyButtons = document.querySelectorAll('.studio-copy-btn');
  copyButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      const codeId = btn.getAttribute('data-copy-target');
      const codeEl = document.getElementById(codeId);
      if (!codeEl) return;

      const text = codeEl.textContent.trim();
      const onCopied = function () {
        btn.textContent = 'Copied';
        btn.classList.add('is-copied');
        announce('Command copied to clipboard.');
        setTimeout(function () {
          btn.textContent = 'Copy';
          btn.classList.remove('is-copied');
        }, 1800);
      };

      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(onCopied).catch(function () {
          fallbackCopy(text, onCopied);
        });
      } else {
        fallbackCopy(text, onCopied);
      }
    });
  });

  function fallbackCopy(text, cb) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try {
      document.execCommand('copy');
      cb();
    } catch (err) {
      announce('Copy failed. Please copy the command manually.');
    }
    document.body.removeChild(ta);
  }

  /* 3. Accessible Screenshot Lightbox Modal (Escape to close, focus restore) */
  const lightbox = document.getElementById('studioLightbox');
  const lightboxImg = document.getElementById('studioLightboxImg');
  const lightboxTitle = document.getElementById('studioLightboxTitle');
  const lightboxClose = document.getElementById('studioLightboxClose');
  const shotTriggers = document.querySelectorAll('.studio-shot-btn');
  let lastTrigger = null;

  function openLightbox(trigger) {
    if (!lightbox || !lightboxImg || !lightboxTitle) return;
    lastTrigger = trigger;
    lightboxImg.src = trigger.getAttribute('data-full-src') || '';
    lightboxImg.alt = trigger.getAttribute('data-full-alt') || '';
    lightboxTitle.textContent = trigger.getAttribute('data-full-title') || 'Screenshot Preview';
    lightbox.hidden = false;
    document.body.style.overflow = 'hidden';
    if (lightboxClose) lightboxClose.focus();
  }

  function closeLightbox() {
    if (!lightbox || lightbox.hidden) return;
    lightbox.hidden = true;
    document.body.style.overflow = '';
    if (lastTrigger) {
      lastTrigger.focus();
      lastTrigger = null;
    }
  }

  shotTriggers.forEach(function (trigger) {
    trigger.addEventListener('click', function () {
      openLightbox(trigger);
    });
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }

  if (lightbox) {
    lightbox.addEventListener('click', function (e) {
      if (e.target === lightbox) {
        closeLightbox();
      }
    });
  }

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && lightbox && !lightbox.hidden) {
      closeLightbox();
    }
  });
})();
