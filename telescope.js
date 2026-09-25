/* The gallery uses the supplied photographs, in attachment order. */
(() => {
  'use strict';
  const photos = [
    { file: '01-moon.jpg', title: 'The Moon', alt: 'A warm golden full Moon against a dark sky.' },
    { file: '02-moon.jpg', title: 'The Moon', alt: 'A bright monochrome full Moon with visible craters.' },
    { file: '03-moon.jpg', title: 'The Moon', alt: 'The full Moon surrounded by deep blue sky.' },
    { file: '04-moon.jpg', title: 'The Moon', alt: 'The Moon framed by softly illuminated clouds.' },
    { file: '05-galaxy.jpg', title: 'A distant galaxy', alt: 'An elongated galaxy among a field of stars.' },
    { file: '06-jupiter.jpg', title: 'Jupiter', alt: 'Jupiter with its cloud bands and small points of light nearby.' },
    { file: '07-uranus.jpg', title: 'Uranus', alt: 'A pale turquoise Uranus surrounded by small points of light.' },
    { file: '08-saturn.jpg', title: 'Saturn', alt: 'Saturn and its rings against a dark sky.' },
    { file: '09-saturn.jpg', title: 'Saturn', alt: 'A second view of Saturn with its tilted rings.' },
    { file: '10-saturn.jpg', title: 'Saturn', alt: 'Saturn at a diagonal angle with bright rings.' },
    { file: '11-moon.jpg', title: 'The Moon', alt: 'A detailed pale Moon with subtle mineral colours.' },
    { file: '12-moon.jpg', title: 'The Moon', alt: 'A waning gibbous Moon against a black background.' },
    { file: '13-moon.jpg', title: 'The Moon', alt: 'A crescent Moon showing craters along its illuminated edge.' },
  ];
  let activeSession = null;
  let activeDialog = null;

  function dispose() {
    activeSession?.abort();
    activeDialog?.classList.remove('telescope-gallery');
    activeSession = null;
    activeDialog = null;
  }

  function show(dialog, container) {
    dispose();
    const session = new AbortController();
    const listen = { signal: session.signal };
    activeSession = session;
    activeDialog = dialog;
    dialog.classList.add('telescope-gallery');
    dialog.setAttribute('aria-labelledby', 'telescope-title');
    let selected = -1;
    let gridScroll = 0;
    let touchStart = null;

    container.innerHTML = `
      <div class="telescope-heading">
        <span class="detail-label">THE TELESCOPE</span>
        <h2 id="telescope-title">A closer look.</h2>
        <p class="telescope-description">13 images · tap to open</p>
      </div>
      <div class="telescope-grid" aria-label="Telescope image collection"></div>
      <section class="telescope-viewer" aria-label="Selected photograph" hidden>
        <button class="gallery-back" type="button">← All images</button>
        <figure class="telescope-photo">
          <div class="telescope-stage">
            <img class="telescope-full" alt="" draggable="false">
            <p class="gallery-error" hidden>This image couldn't load. Try another photo.</p>
          </div>
          <figcaption class="gallery-caption" aria-live="polite"></figcaption>
        </figure>
        <div class="gallery-navigation">
          <button class="gallery-previous" type="button" aria-label="Previous image">← Previous</button>
          <span class="gallery-position" aria-live="polite"></span>
          <button class="gallery-next" type="button" aria-label="Next image">Next →</button>
        </div>
        <p class="gallery-gesture">Swipe the photo or use the arrows.</p>
      </section>`;

    const grid = container.querySelector('.telescope-grid');
    const viewer = container.querySelector('.telescope-viewer');
    const heading = container.querySelector('.telescope-heading');
    const picture = container.querySelector('.telescope-full');
    const caption = container.querySelector('.gallery-caption');
    const position = container.querySelector('.gallery-position');
    const error = container.querySelector('.gallery-error');
    const prev = container.querySelector('.gallery-previous');
    const next = container.querySelector('.gallery-next');
    const back = container.querySelector('.gallery-back');
    const photoStage = container.querySelector('.telescope-stage');
    const source = index => `telescope/${photos[index].file}`;

    photos.forEach((photo, index) => {
      const tile = document.createElement('button');
      tile.className = 'telescope-thumb';
      tile.type = 'button';
      tile.setAttribute('aria-label', `Open ${photo.title}, image ${index + 1} of ${photos.length}`);
      const image = document.createElement('img');
      image.src = source(index);
      image.alt = photo.alt;
      image.loading = 'lazy';
      image.decoding = 'async';
      const label = document.createElement('span');
      label.className = 'telescope-thumb-caption';
      const name = document.createElement('span');
      name.textContent = photo.title;
      const number = document.createElement('span');
      number.className = 'telescope-number';
      number.textContent = String(index + 1).padStart(2, '0');
      label.append(name, number);
      tile.append(image, label);
      tile.addEventListener('click', () => select(index, true), listen);
      grid.append(tile);
    });

    function select(index, fromGrid = false) {
      if (!Number.isInteger(index) || index < 0 || index >= photos.length) return;
      if (selected === -1) gridScroll = dialog.scrollTop;
      selected = index;
      heading.hidden = true;
      grid.hidden = true;
      viewer.hidden = false;
      error.hidden = true;
      const photo = photos[index];
      picture.alt = photo.alt;
      picture.src = source(index);
      caption.textContent = photo.title;
      position.textContent = `${index + 1} / ${photos.length}`;
      prev.disabled = index === 0;
      next.disabled = index === photos.length - 1;
      if (fromGrid) {
        dialog.scrollTop = 0;
        back.focus({ preventScroll: true });
      }
    }

    function showGrid() {
      if (selected === -1) return;
      const former = selected;
      selected = -1;
      touchStart = null;
      viewer.hidden = true;
      heading.hidden = false;
      grid.hidden = false;
      grid.children[former].focus({ preventScroll: true });
      dialog.scrollTop = gridScroll;
    }

    back.addEventListener('click', showGrid, listen);
    prev.addEventListener('click', () => select(selected - 1), listen);
    next.addEventListener('click', () => select(selected + 1), listen);
    picture.addEventListener('error', () => { error.hidden = false; }, listen);
    picture.addEventListener('load', () => { error.hidden = true; }, listen);
    dialog.addEventListener('keydown', event => {
      if (selected === -1) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); select(selected - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); select(selected + 1); }
    }, listen);
    dialog.addEventListener('cancel', event => {
      if (selected !== -1) { event.preventDefault(); showGrid(); }
    }, listen);
    photoStage.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) { touchStart = null; return; }
      touchStart = { x: event.clientX, y: event.clientY, id: event.pointerId };
    }, listen);
    photoStage.addEventListener('pointerup', event => {
      if (!touchStart || touchStart.id !== event.pointerId) return;
      const dx = event.clientX - touchStart.x;
      const dy = event.clientY - touchStart.y;
      touchStart = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.6) select(selected + (dx < 0 ? 1 : -1));
    }, listen);
    photoStage.addEventListener('pointercancel', () => { touchStart = null; }, listen);
    dialog.addEventListener('close', dispose, { ...listen, once: true });
    dialog.scrollTop = 0;
  }

  window.TelescopeGallery = Object.freeze({ show, dispose });
})();
