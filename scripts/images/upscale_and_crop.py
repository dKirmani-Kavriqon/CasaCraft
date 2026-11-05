"""Image pipeline for the Casa Craft site.

Source: Instagram screenshots supplied by the user (images 1 and 4).
Steps: crop photo region, inpaint Instagram UI overlays, 4x upscale (Real-ESRGAN),
then derive scenes, product cutouts (rembg) and material swatches.
"""
import sys, os
import numpy as np
import cv2
import torch
from PIL import Image
from spandrel import ModelLoader

HERE = os.path.dirname(os.path.abspath(__file__))
SRC = sys.argv[1]           # folder with 1.jpg and 4.jpg
OUT = sys.argv[2]           # output folder
os.makedirs(OUT, exist_ok=True)
torch.set_num_threads(os.cpu_count())

PHOTO = (116, 104, 717, 702)  # photo area inside the Instagram screenshot (x0, y0, x1, y1)
ARROW = (695, 404)            # Instagram "next" carousel arrow, screenshot coords


def load_photo(name):
    im = cv2.imread(os.path.join(SRC, name))
    mask = np.zeros(im.shape[:2], np.uint8)
    cv2.circle(mask, ARROW, 15, 255, -1)
    im = cv2.inpaint(im, mask, 6, cv2.INPAINT_TELEA)
    x0, y0, x1, y1 = PHOTO
    return im[y0:y1, x0:x1]


model = ModelLoader().load_from_file(os.path.join(HERE, "RealESRGAN_x4plus.pth"))
model.eval()
assert model.scale == 4


def upscale(bgr, tile=160, pad=16):
    rgb = cv2.cvtColor(bgr, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    h, w = rgb.shape[:2]
    out = np.zeros((h * 4, w * 4, 3), np.float32)
    t = torch.from_numpy(rgb).permute(2, 0, 1).unsqueeze(0)
    with torch.inference_mode():
        for y in range(0, h, tile):
            for x in range(0, w, tile):
                ya, xa = max(y - pad, 0), max(x - pad, 0)
                yb, xb = min(y + tile + pad, h), min(x + tile + pad, w)
                res = model(t[:, :, ya:yb, xa:xb]).clamp(0, 1)[0].permute(1, 2, 0).numpy()
                oy, ox = (y - ya) * 4, (x - xa) * 4
                th, tw = min(tile, h - y) * 4, min(tile, w - x) * 4
                out[y * 4:y * 4 + th, x * 4:x * 4 + tw] = res[oy:oy + th, ox:ox + tw]
                print(f"  tile {y},{x}", flush=True)
    return Image.fromarray((out * 255).round().astype(np.uint8))


def S(box):
    """Screenshot coords -> 4x upscaled photo coords."""
    x0, y0, x1, y1 = box
    return ((x0 - PHOTO[0]) * 4, (y0 - PHOTO[1]) * 4, (x1 - PHOTO[0]) * 4, (y1 - PHOTO[1]) * 4)


big = {}
for n in ("1", "4"):
    cache = os.path.join(OUT, f"_up{n}.png")
    if os.path.exists(cache):
        big[n] = Image.open(cache).convert("RGB")
        continue
    print("upscaling", n, flush=True)
    big[n] = upscale(load_photo(f"{n}.jpg"))
    big[n].save(cache)

# Scenes (no logo, no carousel dots)
big["1"].crop(S((116, 248, 717, 684))).save(os.path.join(OUT, "scene-nishat-pair.png"))
big["4"].crop(S((116, 232, 717, 684))).save(os.path.join(OUT, "scene-zabarwan.png"))
big["4"].crop(S((330, 300, 717, 684))).save(os.path.join(OUT, "detail-zabarwan-frame.png"))
big["1"].crop(S((300, 300, 560, 520))).save(os.path.join(OUT, "detail-nishat-arms.png"))

# Single-piece crops for cutouts
crops = {
    "nishat-saddle": (128, 266, 418, 668),
    "nishat-dal": (420, 264, 702, 668),
    "zabarwan": (232, 294, 640, 668),
    "zabarwan-cushion": (378, 352, 518, 452),
}
for k, box in crops.items():
    big["1" if k.startswith("nishat") else "4"].crop(S(box)).save(os.path.join(OUT, f"crop-{k}.png"))

# Material swatches, sampled from the products themselves
swatches = {
    "leather-saddle": ("1", (232, 300, 302, 360)),
    "leather-dal": ("1", (470, 300, 540, 360)),
    "boucle-cocoa": ("4", (300, 482, 380, 532)),
    "wood-walnut": ("1", (237, 572, 257, 640)),
    "wood-ebonised": ("4", (566, 560, 578, 650)),
}
for k, (n, box) in swatches.items():
    big[n].crop(S(box)).save(os.path.join(OUT, f"swatch-{k}.png"))
print("done")
