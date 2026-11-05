# Image pipeline

How the product images in `src/assets` were made from Casa Craft's own Instagram posts.
You only need this to add or redo photos. The site itself does not run it.

1. `upscale_and_crop.py <screenshots dir> <out dir>`: crops the photo out of an Instagram
   screenshot, paints out the carousel arrow, upscales 4x with Real-ESRGAN (x4plus weights,
   placed next to the script), then saves scenes, detail crops and material swatches.
2. `cutout.py birefnet-general <name>...`: removes the background from a product crop with
   BiRefNet (via rembg), trims it, and saves a transparent PNG. Run one image per process;
   the model needs several GB of memory.

Requirements: Python 3, `torch spandrel "rembg[cpu]" pillow numpy opencv-python-headless`.

Better source photos beat any of this. Original camera files of each piece, shot on a plain
background, will look sharper than anything upscaled from Instagram.
