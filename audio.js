/* Audio begins only after a gesture; the song is armed by the first lamp-on. */
(() => {
  'use strict';
  const music = document.getElementById('birthdayMusic');
  const control = document.getElementById('sound');
  music.volume = 0.7;
  let enabled = true, songStarted = false, ctx, ambient, effects;

  function prepare() {
    if (!ctx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      ctx = new AudioContext();
      effects = ctx.createGain();
      effects.gain.value = enabled ? 1 : 0;
      effects.connect(ctx.destination);
      const noise = ctx.createBuffer(1, ctx.sampleRate * 6, ctx.sampleRate);
      const data = noise.getChannelData(0);
      let previous = 0;
      for (let i = 0; i < data.length; i++) {
        previous = (previous + (Math.random() * 2 - 1) * 0.02) / 1.02;
        data[i] = previous * 3;
      }
      const source = ctx.createBufferSource();
      source.buffer = noise;
      source.loop = true;
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 900;
      ambient = ctx.createGain();
      ambient.gain.value = 0;
      source.connect(filter).connect(ambient).connect(ctx.destination);
      source.start();
    }
    ctx.resume().catch(() => {});
    ambient.gain.setTargetAtTime(enabled ? 0.1 : 0, ctx.currentTime, 0.3);
  }

  function haptic(pattern = 9) {
    if (enabled && navigator.vibrate) navigator.vibrate(pattern);
  }

  function tone(kind = 'soft') {
    if (!enabled || !ctx) return;
    const time = ctx.currentTime;
    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(kind === 'paper' ? 320 : kind === 'lamp' ? 520 : 720, time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(0.025, time + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, time + 0.24);
    oscillator.connect(gain).connect(effects);
    oscillator.start(time);
    oscillator.stop(time + 0.25);
    haptic();
  }

  function moo() {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime, duration = 1.25;
    const voice = ctx.createOscillator();
    const harmonics = new Float32Array(28);
    for (let i = 1; i < harmonics.length; i++) harmonics[i] = 1 / Math.pow(i, 1.25);
    voice.setPeriodicWave(ctx.createPeriodicWave(new Float32Array(28), harmonics));
    const pitch = 128 + Math.random() * 15;
    voice.frequency.setValueAtTime(pitch * .8, t);
    voice.frequency.exponentialRampToValueAtTime(pitch, t + .24);
    voice.frequency.exponentialRampToValueAtTime(pitch * .74, t + duration);
    const envelope = ctx.createGain();
    envelope.gain.setValueAtTime(0, t);
    envelope.gain.linearRampToValueAtTime(.32, t + .15);
    envelope.gain.setValueAtTime(.27, t + .7);
    envelope.gain.exponentialRampToValueAtTime(.001, t + duration);
    for (const [frequency, amount] of [[360, .8], [690, .45], [1250, .12]]) {
      const formant = ctx.createBiquadFilter(), level = ctx.createGain();
      formant.type = 'bandpass'; formant.frequency.value = frequency; formant.Q.value = 2.1;
      level.gain.value = amount;
      voice.connect(formant).connect(level).connect(envelope);
    }
    envelope.connect(effects); voice.start(t); voice.stop(t + duration);
    haptic([12, 55, 10]);
  }

  function snort() {
    if (!enabled || !ctx) return;
    const t = ctx.currentTime, duration = .42;
    const buffer = ctx.createBuffer(1, ctx.sampleRate * duration, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (.7 + .3 * Math.sin(i / ctx.sampleRate * 115));
    const source = ctx.createBufferSource(), filter = ctx.createBiquadFilter(), gain = ctx.createGain();
    source.buffer = buffer; filter.type = 'bandpass'; filter.frequency.value = 580; filter.Q.value = .7;
    gain.gain.setValueAtTime(.001, t); gain.gain.linearRampToValueAtTime(.16, t + .04);
    gain.gain.exponentialRampToValueAtTime(.001, t + duration);
    source.connect(filter).connect(gain).connect(effects); source.start(t);
    haptic([16, 30, 12]);
  }

  function playSong() {
    if (songStarted && enabled) {
      music.volume = .7;
      const playback = music.play();
      if (playback?.catch) playback.catch(() => {
        document.dispatchEvent(new CustomEvent('songblocked'));
      });
    }
  }

  function firstLampOn() {
    prepare();
    if (!songStarted) { songStarted = true; playSong(); }
    tone('lamp');
  }

  function toggle() {
    enabled = !enabled;
    control.textContent = enabled ? 'Sound on' : 'Sound off';
    control.setAttribute('aria-pressed', String(enabled));
    prepare();
    if (ctx) {
      effects.gain.setTargetAtTime(enabled ? 1 : 0, ctx.currentTime, .06);
      ambient.gain.setTargetAtTime(enabled ? .1 : 0, ctx.currentTime, .2);
    }
    if (enabled) { playSong(); tone(); } else music.pause();
  }

  control.addEventListener('click', toggle);
  window.RoomAudio = Object.freeze({ prepare, tone, moo, snort, haptic, firstLampOn });
})();
