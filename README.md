# Seventeen

Exact static export of the finalized website, version 5, dated 25 September 2026.
All 63 original website files are unchanged, byte for byte. The entry point is
`index.html`. The centre-drawer unlock sequence and final birthday message are
included. There is no build step, package installation, backend, API key, or
platform account needed to run this project.

## Open and test locally

1. Extract the ZIP and open its `Seventeen` folder in VS Code.
2. Open a terminal in that folder, beside `index.html`.
3. Run `py -m http.server 8000` on Windows, or `python3 -m http.server 8000` elsewhere.
4. Open http://localhost:8000/ in your browser.
5. Use Ctrl+C in the terminal when finished.

Serve it over HTTP as above, rather than relying on double-clicking an HTML file.

## Publish on GitHub Pages

Put the **contents** of the `Seventeen` folder at the root of your repository,
so `index.html` sits directly beside `README.md`. Include `.nojekyll`, all images,
and all folders. Do not upload the ZIP itself as the website.

Commit and push these files to your repository's `main` branch. Then open the
repository's **Settings → Pages**, choose **Deploy from a branch**, choose
**main** and **/(root)**, and save. Wait for its Pages deployment to finish and
use the URL GitHub displays.

The relative asset URLs support project sites under a repository path, as well
as a custom domain. No base URL needs to be edited.

GitHub's publishing instructions:
https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site

## Files

| File or folder | Purpose |
| --- | --- |
| `index.html` | Entry point, interface structure, inline favicon, audio element |
| `style.css` | Active styling, animation, responsive rules and font reference |
| `app.js` | Object popups, lamp, exploration state and centre-drawer reveal |
| `content.js` | Exact message, poem, photo order and scoop messages |
| `audio.js` | Song playback, brown noise, sound effects and haptics |
| `gallery.js` | Photo viewing, swiping, keyboard controls and final-photo sequence |
| `camera/` | All 18 camera photos |
| `flowers/` | All 16 flower photos |
| `telescope/` | All 13 telescope photos |
| `audio/` | The complete original birthday MP3 |
| `art/` | Journal artwork and moon image |
| `lounge-v4.webp` | Final room image |
| `lounge-v3.webp` | Source image used by the cheetah popup |
| `.nojekyll` | Allows the static files to be published without Jekyll processing |
| `SHA256SUMS.txt` | Integrity hashes for all original website files |
| `VERIFICATION.md` | Export checks and their limits |

Other legacy image, CSS and JavaScript files from the published directory are
retained as part of the complete export. They remain unreferenced by the entry
point; do not add them to `index.html`.

## Dependencies and existing behaviour

The original Google Fonts CSS reference is preserved exactly. The three font
families are Cormorant Garamond, DM Sans and Libre Caslon Display. Their font
files are loaded from Google when the page is opened, so the original fonts
require internet access. Their existing CSS fallbacks are unchanged. Images,
JavaScript, CSS, icons and the MP3 are included locally.

The song starts on the first lamp-on gesture at 70% volume. Sound off/on pauses
and resumes it; later lamp toggles do not pause it. Browser audio restrictions
and support for the Vibration API still apply, just as before.

Exploration state lives in memory and resets when the page reloads. The drawer
unlocks only when all other picture objects have been opened and the final
popup closes. Individual photo galleries do not have to be exhausted. The
camera's final-photo reveal is unchanged.

The hosting provider's account/access gate is not part of the website code.
This export runs without that gate. GitHub Pages normally publishes a publicly
accessible website; a private repository alone does not make its Pages site
private. The existing `noindex,nofollow` metadata is retained and is not an
access-control mechanism.
