"""اختبار محلي: يفتح الصفحة ويحفظ الصورة الناتجة في test.png (يتطلب خادم على 8765)."""
import base64
from playwright.sync_api import sync_playwright as s
with s() as p:
    b = p.chromium.launch(channel="msedge")
    pg = b.new_page()
    pg.on("pageerror", lambda e: print("err", e))
    pg.goto("http://localhost:8765/index.html")
    pg.wait_for_timeout(2500)
    pg.fill("#date", "من تاريخ 29/4/1448 إلى 29/6/1448 هـ")
    pg.wait_for_timeout(800)
    d = pg.evaluate("document.getElementById('cv').toDataURL()")
    open("test.png", "wb").write(base64.b64decode(d.split(",")[1]))
    b.close()
