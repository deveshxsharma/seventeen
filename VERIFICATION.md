# Export verification

Verified on 25 September 2026 against finalized version 5, source commit
`e0093433aee4ae45857f648ad1fe5934c1f30e18`.

## Exact preservation

- All 63 original deployed website files match the final source commit and the
  saved publication archive byte for byte.
- Original HTML, CSS, JavaScript, images, MP3, favicon, font reference, responsive
  rules and animations have not been edited.
- Added only export documentation, this report, integrity hashes and `.nojekyll`.
- No platform hosting manifest, Git credentials, Git history or preview settings
  are required or included.

## Static hosting and assets

- Served the export using a standard Python static HTTP server.
- Tested both the site root and a `/Seventeen/` repository-style subpath.
- The directory entry point and all 63 website files returned HTTP 200, with
  unchanged response bytes. JavaScript and CSS MIME types were checked.
- HTML and CSS local references resolve to included files with matching case.
- Dynamic photo references were exercised in the interaction checks.
- No platform-specific, internal, temporary or absolute local paths occur in the
  website HTML, CSS or JavaScript.
- All supplied JPEG/WebP images passed image decoding verification.
- The MP3 passed metadata inspection and complete audio decoding without errors.
- The original Google Fonts stylesheet and its eight returned font resources
  returned HTTP 200. The preserved remote reference remains network dependent.
- ZIP integrity and extracted source-file hashes were checked.

## JavaScript and progression

JavaScript syntax checks passed. Executed the original exported scripts in a
DOM simulation with mocked audio, timer and device interfaces. These checks
completed without uncaught script errors:

- All 13 picture controls and initial lamp reveal.
- Song starts on first lamp-on only; 70% volume; brown-noise gain 10%; sound
  off/on pauses/resumes the song; later lamp changes do not restart it.
- Five cow moos, sixth-click snort and automatic close.
- All 27 decorative moons.
- Camera sequence of all 18 images, with 15 second last and 13 last; one image
  displayed at a time and no early final-image preview.
- Flower and telescope photo collections.
- Exact poem and final birthday-message rendering.
- All 105 successive scoop clicks, including the 100–103 transitions.
- Every one of the 11 possible final object popups; drawer remains locked while
  that popup is open and unlocks on close. Repeated visits and toolbar controls
  cannot replace an unexplored picture object.
- Shankri's automatic close also reveals the centre drawer when she is last.
- `Something's here.` appears once, the label is `Drawer`, and the cue dismisses
  after opening the drawer.

## Limits

A full rendered browser session and physical Android test were not available.
These checks do not claim browser-console capture, pixel-level visual comparison,
actual audio playback or physical haptic verification. DOM simulation exercises
script logic but not browser layout or media/device hardware. The export's exact
file identity is the basis for preserving the already-approved visual experience.
GitHub Pages itself was not deployed from this export during verification.
