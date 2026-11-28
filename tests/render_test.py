"""اختبار محلي: يفتح الصفحة ويحفظ التصميمين في test1.png و test2.png (يتطلب خادم على 8765)."""
import base64
from playwright.sync_api import sync_playwright as s

DATE_TEXT = "من تاريخ 2/8/1448 إلى 24/1/1449 هـ الموافق 10/1/2027 إلى 29/6/2027 م"

with s() as p:
    b = p.chromium.launch(channel="msedge")
    pg = b.new_page()
    pg.on("pageerror", lambda e: print("pageerror:", e))
    pg.on("console", lambda m: print("console:", m.type, m.text) if m.type == "error" else None)
    pg.goto("http://localhost:8765/index.html")
    pg.wait_for_timeout(2500)
    pg.fill("#date", DATE_TEXT)
    pg.wait_for_timeout(600)

    pg.click('button[data-theme="1"]')
    pg.wait_for_timeout(600)
    d1 = pg.evaluate("document.getElementById('cv').toDataURL()")
    open("test1.png", "wb").write(base64.b64decode(d1.split(",")[1]))

    pg.click('button[data-theme="2"]')
    pg.wait_for_timeout(600)
    d2 = pg.evaluate("document.getElementById('cv').toDataURL()")
    open("test2.png", "wb").write(base64.b64decode(d2.split(",")[1]))
    b.close()
