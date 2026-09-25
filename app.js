'use strict';
const $ = id => document.getElementById(id);
const dialog = $('detail'), detail = $('detailBody'), scene = $('scene');
const content = window.SeventeenContent, audio = window.RoomAudio;
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
let entered = false, lampOn = false, revealed = false, drawerUnlocked = false, lastFocus, scoops = 0, snortTimer, toastTimer;
const explored = new Set();
const spots = [
  ['lamp', 'Lamp', 5.6, 47.2, 9, 20],
  ['cheetah', 'The Gallery', 23, 22, 25, 29],
  ['instruments', 'Violin and Flute', 42, 24.5, 10, 28],
  ['flowers', 'Flowers', 17.5, 45.2, 11, 13],
  ['journal', 'Journal', 29.6, 48.9, 10, 6],
  ['camera', 'Camera', 38.5, 46.4, 6, 8],
  ['drawer', 'Drawer', 32.1, 53.3, 6.4, 5.5],
  ['ice', 'Ice cream', 26.9, 73.8, 8, 10],
  ['dog', 'Huskiiiii', 51, 80, 21, 19],
  ['cow', 'Shankriiii', 68.2, 47.8, 11, 13],
  ['horse', 'Horsiii', 85.7, 43.8, 12, 19],
  ['moon', 'The moon', 81.3, 11.8, 6, 9],
  ['telescope', 'Telescope', 94, 55, 12, 39]
];
const discoveries = spots.filter(([id]) => id !== 'drawer').map(([id]) => id);

function revealDrawer() {
  if (drawerUnlocked || dialog.open || !discoveries.every(id => explored.has(id))) return false;
  drawerUnlocked = true;
  const drawer = document.querySelector('[data-object="drawer"]');
  drawer.disabled = false;
  drawer.classList.add('new-discovery');
  drawer.setAttribute('aria-describedby', 'drawerPrompt');
  $('drawerPrompt').hidden = false;
  drawer.scrollIntoView?.({ behavior: reduced ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
  drawer.focus({ preventScroll: true });
  return true;
}

function toast(text) {
  $('toast').textContent = text; $('toast').classList.add('visible');
  clearTimeout(toastTimer); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 2800);
}
function resetPanel(className = '') {
  clearTimeout(snortTimer); window.PhotoGallery.dispose();
  dialog.className = className;
  dialog.removeAttribute('aria-labelledby'); dialog.removeAttribute('aria-label');
  detail.replaceChildren(); dialog.scrollTop = 0;
}
function showPanel(className, text, tag = 'h2') {
  resetPanel(className);
  const heading = document.createElement(tag); heading.id = 'detail-title'; heading.textContent = text;
  detail.append(heading); dialog.setAttribute('aria-labelledby', 'detail-title');
}
function addAction(label, fn, className = '') {
  let actions = detail.querySelector('.actions');
  if (!actions) { actions = document.createElement('div'); actions.className = 'actions'; detail.append(actions); }
  const button = document.createElement('button'); button.type = 'button'; button.className = className;
  button.textContent = label; button.addEventListener('click', fn); actions.append(button); return button;
}
function present() {
  if (!dialog.open) dialog.showModal();
  dialog.querySelector('.close').focus({ preventScroll: true });
}
function toggleLamp() {
  explored.add('lamp');
  lampOn = !lampOn;
  scene.classList.toggle('dimmed', !lampOn);
  document.body.classList.toggle('lights-low', !lampOn);
  const lamp = document.querySelector('[data-object="lamp"]');
  lamp.setAttribute('aria-pressed', String(lampOn));
  if (lampOn && !revealed) {
    revealed = true; scene.classList.remove('awaiting-lamp'); $('lampPrompt').hidden = true;
    for (const spot of scene.querySelectorAll('.hotspot')) spot.disabled = spot.dataset.object === 'drawer';
    audio.firstLampOn();
  } else audio.tone('lamp');
}
function enter() {
  if (entered) return; entered = true;
  $('intro').classList.add('dismissed'); $('intro').inert = true; $('world').inert = false;
  document.body.classList.add('lights-low');
  $('viewport').scrollLeft = 0; audio.prepare();
  setTimeout(() => {
    if (revealed) return;
    $('lampPrompt').hidden = false;
    document.querySelector('[data-object="lamp"]').focus({ preventScroll: true });
  }, reduced ? 0 : 720);
}
function openObject(id) {
  if (id === 'lamp') { toggleLamp(); return; }
  if (!revealed || (id === 'drawer' && !drawerUnlocked) || !spots.some(([object]) => object === id)) return;
  if (!dialog.open) lastFocus = document.activeElement;
  if (id !== 'drawer') explored.add(id);
  else {
    $('drawerPrompt').hidden = true;
    const drawer = document.querySelector('[data-object="drawer"]');
    drawer.classList.remove('new-discovery');
    drawer.removeAttribute('aria-describedby');
  }
  document.querySelector(`[data-object="${id}"]`)?.classList.add('visited');
  audio.tone(id === 'journal' || id === 'drawer' ? 'paper' : 'soft');
  switch (id) {
    case 'horse': showPanel('simple-panel', 'Horsiii'); break;
    case 'dog': {
      showPanel('simple-panel dog-panel', 'Huskiiiiii');
      const note = document.createElement('p'); note.className = 'small-note'; note.textContent = "Taffi's doooor ka cousin"; detail.append(note); break;
    }
    case 'instruments': {
      showPanel('simple-panel', 'Violin and Flute');
      const line = document.createElement('p'); line.textContent = 'Your favourite musical instruments!'; detail.append(line); break;
    }
    case 'moon': {
      showPanel('moon-panel', "Look at the sky, Khushi, It's a full-moon on your birthday!!!");
      const sky = document.createElement('div'); sky.className = 'moon-sky'; sky.setAttribute('aria-hidden', 'true');
      const positions = [[6,8,24],[23,6,15],[43,8,21],[63,5,14],[83,9,28],[94,23,15],[8,30,17],[29,22,13],[52,20,16],[74,23,12],[17,44,12],[92,45,23],[4,60,20],[30,64,12],[71,64,15],[86,66,13],[13,79,22],[36,81,14],[58,80,23],[80,84,18],[95,90,13],[7,96,12],[26,96,20],[47,94,14],[67,97,13],[92,8,10],[53,66,10]];
      positions.forEach(([x,y,size]) => { const moon = document.createElement('img'); moon.src = 'art/moon.jpg'; moon.alt = ''; moon.style.cssText = `left:${x}%;top:${y}%;width:${size}px;height:${size}px`; sky.append(moon); });
      for (let i = 0; i < 62; i++) { const star = document.createElement('i'); star.style.cssText = `left:${(i * 37 + 11) % 100}%;top:${(i * 29 + 4) % 100}%;opacity:${.2 + (i % 5) * .12};width:${i % 6 === 0 ? 3 : 1.5}px;height:${i % 6 === 0 ? 3 : 1.5}px`; sky.append(star); }
      detail.prepend(sky); break;
    }
    case 'cow': {
      showPanel('simple-panel cow-panel', 'Shankriiii');
      const line = document.createElement('p'); line.id = 'cowLine'; line.setAttribute('aria-live','polite'); detail.append(line);
      let moos = 0;
      const hello = addAction('say hello', () => {
        moos++;
        if (moos <= 5) { line.textContent = 'MOOO!!!'; line.classList.remove('moo-pop'); void line.offsetWidth; line.classList.add('moo-pop'); audio.moo(); }
        else { line.textContent = '*Snorts!'; hello.disabled = true; audio.snort(); snortTimer = setTimeout(() => dialog.close(), 1100); }
      }); break;
    }
    case 'cheetah': {
      showPanel('cheetah-panel', 'Some cute cheetah pics for you, your vibe matches with Cheetahs tho, not gonna lie');
      const frame = document.createElement('div'); frame.className = 'cheetah-photos'; frame.setAttribute('role','img'); frame.setAttribute('aria-label','Five cheetah photographs in the framed gallery'); detail.append(frame); break;
    }
    case 'camera': {
      resetPanel(); window.PhotoGallery.show(dialog, detail, { name: 'Camera photos', sequential: true,
        photos: content.cameraOrder.map((number,index) => ({ src: `camera/${String(number).padStart(2,'0')}.jpg`, alt: `Photograph ${index + 1} of 18` })) }); break;
    }
    case 'telescope': {
      resetPanel(); window.PhotoGallery.show(dialog, detail, { name: 'Telescope', photos: content.telescope.map(([file,title]) => ({ src: `telescope/${file}`, alt: title })) }); break;
    }
    case 'flowers': {
      resetPanel(); window.PhotoGallery.show(dialog, detail, { name: 'Lilies and pink roses', flower: true,
        photos: Array.from({length:16}, (_,i) => ({src:`flowers/${i+23}.jpg`, alt:`Flower photograph ${i+1} of 16`})) }); break;
    }
    case 'journal': {
      showPanel('journal-preface', 'A poem written beautifully by someone Beautiful.');
      addAction('continue', () => {
        audio.tone('paper'); resetPanel('journal-panel'); dialog.setAttribute('aria-label','Journal poem');
        const paper = document.createElement('article'); paper.className = 'journal-page';
        const poem = document.createElement('p'); poem.className = 'poem'; poem.textContent = content.poem;
        paper.append(poem); detail.append(paper); dialog.scrollTop = 0; dialog.querySelector('.close').focus({preventScroll:true});
      }); break;
    }
    case 'ice': openIceCream(); break;
    case 'drawer': {
      resetPanel('letter-panel'); dialog.setAttribute('aria-label', 'Birthday message from Devesh');
      const letter = document.createElement('article'); letter.className = 'letter';
      content.birthdayMessage.split('\n\n').forEach(paragraph => { const p = document.createElement('p'); p.textContent = paragraph; letter.append(p); });
      detail.append(letter); break;
    }
    default: return;
  }
  present();
}

function openIceCream() {
  showPanel('ice-panel', 'Well, this is the most important part. Like, you deserve to get mad if I forgot to add ICE-CREAM!!!');
  const flavors = [
    ['Vanilla','#f6e6be','favourite'], ['Cookies & Cream','#ded0bf','favourite'], ['Mango','#efb94f','mango'],
    ['Chocolate','#93634e'], ['Strawberry','#e2a4af'], ['Butterscotch','#d8ad78'], ['Mint Chocolate Chip','#afc8b0'],
    ['Pistachio','#bdc18c'], ['Coffee','#b9977c'], ['Caramel','#c99360'], ['Chocolate Chip','#ebd5b3'],
    ['Cookie Dough','#d8bf93'], ['Rocky Road','#93695d'], ['Rum Raisin','#b58f84'], ['Coconut','#eee9dd'],
    ['Blackcurrant','#ab85b5'], ['Blueberry','#9c96c8'], ['Butter Pecan','#cfa779'], ['Kulfi','#d8c68f'],
    ['Kesar Pista','#dcc782'], ['Peach','#e5b995'], ['Lemon','#ece09d']
  ];
  let selected = 'Vanilla';
  const choices = document.createElement('div'); choices.className = 'flavors'; choices.setAttribute('role','group'); choices.setAttribute('aria-label','Ice cream flavors');
  flavors.forEach(([name,color,weight]) => {
    const button = document.createElement('button'); button.type='button'; button.className=`flavor ${weight || ''}`;
    button.style.setProperty('--flavor',color); button.textContent=name; button.setAttribute('aria-pressed',String(name===selected));
    button.addEventListener('click', () => { selected=name; choices.querySelectorAll('button').forEach(b=>b.setAttribute('aria-pressed',String(b===button))); audio.tone(); }); choices.append(button);
  });
  detail.append(choices);
  const line = document.createElement('p'); line.id='scoopLine'; line.className='scoop-line'; line.setAttribute('aria-live','polite'); line.textContent=content.scoopLine(scoops); detail.append(line);
  addAction('one more scoop', event => {
    scoops++; line.textContent=content.scoopLine(scoops); audio.tone();
    const button=event.currentTarget; button.style.setProperty('--flavor',flavors.find(x=>x[0]===selected)[1]);
    button.classList.remove('scoop-pop'); void button.offsetWidth; button.classList.add('scoop-pop');
  }, 'scoop-button');
}

spots.forEach(([id,label,x,y,width,height]) => {
  const button=document.createElement('button'); button.type='button'; button.className='hotspot'; button.dataset.object=id;
  button.style.cssText=`left:${x}%;top:${y}%;width:${width}%;height:${height}%`;
  button.setAttribute('aria-label',label); button.disabled=id!=='lamp';
  if(id==='lamp') button.setAttribute('aria-pressed','false');
  button.addEventListener('click',()=>openObject(id)); $('hotspots').append(button);
});
// These five actual gallery photos are placed on the same print surfaces as the scene artwork.
const prints = document.createElement('div'); prints.className='tabletop-photos'; prints.setAttribute('aria-hidden','true');
content.tabletopPhotos.forEach((number,index) => { const photo=document.createElement('img'); photo.src=`camera/${String(number).padStart(2,'0')}.jpg`; photo.alt=''; photo.className=`table-print print-${index}`; prints.append(photo); });
scene.insertBefore(prints,scene.querySelector('.room-dimmer'));
$('enter').addEventListener('click',enter);
$('hints').addEventListener('click',()=>{ const on=scene.classList.toggle('show-hints'); $('hints').setAttribute('aria-pressed',String(on)); audio.tone(); });
dialog.querySelector('.close').addEventListener('click',()=>dialog.close());
dialog.addEventListener('close',()=>{
  clearTimeout(snortTimer); window.PhotoGallery.dispose(); audio.tone('paper');
  if (!revealDrawer()) lastFocus?.focus({preventScroll:true});
});
dialog.addEventListener('click',event=>{ if(event.target!==dialog)return; const r=dialog.getBoundingClientRect(); if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)dialog.close(); });
document.addEventListener('songblocked',()=>toast('Tap Sound off, then Sound on to start the music.'));

// The first version's fine rain and subtle interface tones return without covering the room.
const canvas=$('rain'), c=canvas.getContext('2d'); canvas.width=600; canvas.height=680;
const drops=Array.from({length:23},()=>({x:Math.random()*600,y:Math.random()*680,s:24+Math.random()*55}));
let last=0;
function rain(time){
  if(time-last>42){const dt=Math.min((time-last)/1000,.1);last=time;c.clearRect(0,0,600,680);
    if(entered&&!document.hidden){c.strokeStyle='#e3eff922';c.lineWidth=.6;for(const d of drops){d.y+=dt*d.s;if(d.y>700){d.y=-20;d.x=Math.random()*600;}c.beginPath();c.moveTo(d.x,d.y);c.lineTo(d.x-1,d.y+10);c.stroke();}}
  }requestAnimationFrame(rain);
}
if(!reduced && c)requestAnimationFrame(rain);
