# Model assets

## Files

- `pornozamok.glb` — Web preview (model-viewer)
- `pornozamok.usdz` — iOS AR Quick Look

## iOS Quick Look limits (Apple)

If Quick Look shows **0 KB** or spins forever, the USDZ is usually too heavy or badly exported — not a web bug.

Typical working AR assets:

- Under ~20 MB total
- Under ~100K polygons
- Textures at 2048×2048 or smaller

`pornozamok.usdz` is ~31 MB with multi‑MB textures. Re-export from Blender/Reality Converter with:

1. Resize all textures to max 2048 px
2. Reduce polygon count
3. Re-pack USDZ and test in Files app on iPhone (tap file → AR should open)

## Quick test

Replace `href` / `ios-src` temporarily with Apple’s sample:

`https://webkit.org/demos/ar/heart.usdz`

If that opens AR, your pipeline is fine and only this USDZ needs fixing.

## Server MIME

Serve `.usdz` as `model/vnd.usdz+zip` (configured in `vite.config.ts` for dev/preview).
