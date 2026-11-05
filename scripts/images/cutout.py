import sys, os
from PIL import Image
from rembg import new_session, remove
S = os.path.dirname(os.path.abspath(__file__)); IMG = os.path.join(S, 'img')
sess = new_session(sys.argv[1] if len(sys.argv) > 1 else 'birefnet-general')
up1 = Image.open(os.path.join(IMG, '_up1.png'))
# Pair: both chairs, screenshot coords -> 4x photo coords
X0, Y0 = 116, 104
box = lambda b: tuple(v * 4 for v in ((b[0]-X0), (b[1]-Y0), (b[2]-X0), (b[3]-Y0)))
up1.crop(box((128, 264, 702, 668))).save(os.path.join(IMG, 'crop-nishat-pair.png'))
for k in sys.argv[2:]:
    im = Image.open(os.path.join(IMG, f'crop-{k}.png')).convert('RGB')
    out = remove(im, session=sess, post_process_mask=True)
    bb = out.getchannel('A').point(lambda a: 255 if a > 8 else 0).getbbox()
    pad = 24
    out = out.crop((max(bb[0]-pad, 0), max(bb[1]-pad, 0), min(bb[2]+pad, out.width), min(bb[3]+pad, out.height)))
    out.save(os.path.join(IMG, f'cut-{k}.png'))
    print(k, out.size, flush=True)
