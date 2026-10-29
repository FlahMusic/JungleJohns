# python tests/tour.py  -> tests/out/music-tour.wav: a 2-minute walk through the store's music
# 0:00 market, 0:12 produce, 0:26 bakery, 0:38 candy, 0:50 beer, 1:02 wine, 1:18 cheese, 1:30 market, 1:40 outside, 1:52 back in
import os, base64, time
ROOT=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
from playwright.sync_api import sync_playwright
out=os.path.join(ROOT,'tests','out'); os.makedirs(out,exist_ok=True)
with sync_playwright() as p:
    b=p.chromium.launch(); pg=b.new_page(); pg.goto('file:///'+os.path.join(ROOT,'tests','tour.html').replace('\\','/'))
    for i in range(240):
        if pg.title() in ('done',) or pg.title().startswith('ERR'): break
        time.sleep(0.5)
    if pg.title()!='done': print(pg.title())
    else: open(os.path.join(out,'music-tour.wav'),'wb').write(base64.b64decode(pg.evaluate('window.WAV'))); print('wrote',os.path.join(out,'music-tour.wav'))
    b.close()
