# Poster Target Assets

`poster.mind` and `dev-poster.png` are temporary development assets.

To replace them with the real city poster:

1. Export the final poster as a flat PNG or JPG with all visible design details.
2. Open the MindAR Image Targets Compiler: https://hiukim.github.io/mind-ar-js-doc/tools/compile
3. Upload the poster image and check that feature points are spread across the whole poster.
4. Download the compiled file and replace `public/targets/poster.mind`.
5. Replace `public/targets/dev-poster.png` with the same source image for local testing docs.
6. Rebuild and test on a real phone over HTTPS.

The QR code only opens the website. The AR tracker uses the compiled poster image target.
