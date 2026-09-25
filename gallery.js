(() => {
  'use strict';
  let session;
  const dispose = () => { session?.abort(); session = null; };

  function show(dialog, body, { name, photos, sequential = false, flower = false }) {
    dispose();
    session = new AbortController();
    const options = { signal: session.signal };
    dialog.classList.add('photo-gallery');
    if (flower) dialog.classList.add('flower-gallery');
    dialog.setAttribute('aria-label', name);
    let selected = sequential ? 0 : -1;
    let gridScroll = 0, pointer;
    body.innerHTML = `${name === 'Telescope' ? '<h2 class="gallery-title">Telescope</h2>' : ''}
      <div class="photo-grid" aria-label="${name}"${sequential ? ' hidden' : ''}></div>
      <section class="photo-viewer"${sequential ? '' : ' hidden'} aria-label="Selected photograph">
        ${sequential ? '' : '<button class="gallery-back" type="button" aria-label="All photos">←</button>'}
        <div class="photo-stage"><img class="photo-full" alt="" draggable="false"><p class="photo-error" role="status" hidden>This photo couldn’t load.</p></div>
        <nav class="gallery-navigation" aria-label="Photo navigation">
          <button class="photo-prev" type="button" aria-label="Previous photo">←</button>
          <span class="photo-position" aria-live="polite"></span>
          <button class="photo-next" type="button" aria-label="Next photo">→</button>
        </nav>
      </section>`;
    const grid = body.querySelector('.photo-grid'), viewer = body.querySelector('.photo-viewer');
    const title = body.querySelector('.gallery-title'), picture = body.querySelector('.photo-full');
    const previous = body.querySelector('.photo-prev'), next = body.querySelector('.photo-next');
    const position = body.querySelector('.photo-position'), error = body.querySelector('.photo-error');
    if (!sequential) photos.forEach((photo, index) => {
      const tile = document.createElement('button'); tile.type = 'button'; tile.className = 'photo-thumb';
      tile.setAttribute('aria-label', `Open photo ${index + 1} of ${photos.length}`);
      const image = document.createElement('img'); image.src = photo.src; image.alt = photo.alt;
      image.loading = 'lazy'; image.decoding = 'async'; tile.append(image);
      tile.addEventListener('click', () => select(index, true), options); grid.append(tile);
    });
    function select(index, fromGrid = false) {
      if (index < 0 || index >= photos.length) return;
      if (selected === -1) gridScroll = dialog.scrollTop;
      selected = index; grid.hidden = true; viewer.hidden = false;
      if (title) title.hidden = true;
      error.hidden = true;
      picture.alt = photos[index].alt;
      // Camera loads only the selected photo: no grid, previews or wraparound can reveal the last image early.
      picture.src = photos[index].src;
      position.textContent = `${index + 1} / ${photos.length}`;
      previous.disabled = index === 0; next.disabled = index === photos.length - 1;
      if (fromGrid) { dialog.scrollTop = 0; body.querySelector('.gallery-back')?.focus({ preventScroll: true }); }
      window.RoomAudio.tone('paper');
    }
    function showGrid() {
      if (sequential || selected < 0) return;
      const former = selected; selected = -1; pointer = null;
      viewer.hidden = true; grid.hidden = false; if (title) title.hidden = false;
      grid.children[former].focus({ preventScroll: true }); dialog.scrollTop = gridScroll;
      window.RoomAudio.tone('paper');
    }
    body.querySelector('.gallery-back')?.addEventListener('click', showGrid, options);
    previous.addEventListener('click', () => select(selected - 1), options);
    next.addEventListener('click', () => select(selected + 1), options);
    picture.addEventListener('error', () => { error.hidden = false; }, options);
    picture.addEventListener('load', () => { error.hidden = true; }, options);
    dialog.addEventListener('keydown', event => {
      if (selected < 0) return;
      if (event.key === 'ArrowLeft') { event.preventDefault(); select(selected - 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); select(selected + 1); }
    }, options);
    dialog.addEventListener('cancel', event => {
      if (!sequential && selected >= 0) { event.preventDefault(); showGrid(); }
    }, options);
    const stage = body.querySelector('.photo-stage');
    stage.addEventListener('pointerdown', event => {
      if (!event.isPrimary || event.button !== 0) return;
      pointer = { x: event.clientX, y: event.clientY, id: event.pointerId };
      stage.setPointerCapture?.(event.pointerId);
    }, options);
    stage.addEventListener('pointerup', event => {
      if (!pointer || pointer.id !== event.pointerId) return;
      const dx = event.clientX - pointer.x, dy = event.clientY - pointer.y; pointer = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) select(selected + (dx < 0 ? 1 : -1));
    }, options);
    stage.addEventListener('pointercancel', () => { pointer = null; }, options);
    dialog.addEventListener('close', dispose, { ...options, once: true });
    if (sequential) select(0);
  }
  window.PhotoGallery = Object.freeze({ show, dispose });
})();
