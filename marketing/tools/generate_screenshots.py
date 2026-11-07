#!/usr/bin/env python3
"""Generate KnowMe store screenshots — modeled on the onboarding screens.

Design (from src/features/onboarding): dark quiet room, progress dots with an
elongated amber active dot, the gnome talking in a surface speech bubble, calm
left-aligned type. Slide 1 is the onboarding-style gnome hero (no phone).
Slides 2-6: bold clear headline above a PARTIAL phone — the top of a real app
capture in a phone frame that runs off the bottom edge.

Real captures live in each device folder's device-captures/ (shot on iPhone 17
Pro, iPhone Duo, iPad Pro 13, Pixel 7). When the UI changes, re-shoot captures first, then
rerun: /tmp/knowme-venv/bin/python marketing/tools/generate_screenshots.py
Bump VERSION per store release. Copy: no medical/treatment/cure claims.
"""
from PIL import Image, ImageDraw, ImageFont
import os

VERSION = "v0.0.1"
DATE_TAG = "2026.11.03"
ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
def P(*a): return os.path.join(ROOT, *a)

BG = (15, 17, 21); SURFACE = (23, 26, 32); BORDER = (34, 38, 46)
TEXT = (236, 232, 225); MUTED = (138, 143, 152)
AMBER = (232, 176, 122); INK = (15, 17, 21); SAGE = (127, 179, 166)

def font(sz, bold=False):
    for c in ["/Library/Fonts/Arial Bold.ttf" if bold else "/Library/Fonts/Arial.ttf",
              "/System/Library/Fonts/Helvetica.ttc"]:
        try: return ImageFont.truetype(c, sz)
        except Exception: pass
    return ImageFont.load_default()

def rr(d, box, r, **kw): d.rounded_rectangle(box, radius=r, **kw)

CAPS = {  # kind -> capture file names; each set's own device folder is searched first
    "today":    ["iphone-today.png", "ipad-today.png", "android-today.png"],
    "log":      ["iphone-log.png", "ipad-log.png", "android-log.png"],
    "init":     ["iphone-in-it.png", "ipad-in-it.png", "android-in-it.png"],
    "patterns": ["iphone-patterns.png", "ipad-patterns.png", "android-patterns.png"],
    "privacy":  ["iphone-me.png", "ipad-me.png", "android-me.png"],
}
SLIDES = [
    dict(kind="hero", head="Know yourself.\nChange follows.",
         sub="Track the moment. See your pattern.\nBecome who you meant to be.",
         bubble="Hello. I hold the lantern, not the lecture.",
         hint="Everything stays on this phone. No account."),
    dict(kind="log", head="Ten seconds,\nright in the moment.",
         sub="How strong it is, where you are, and what helped.\nNo forms, no fuss."),
    dict(kind="init", head="When it's hard,\nstart here.",
         sub="Your own reasons. What has helped before.\nOne slow breath at a time."),
    dict(kind="patterns", head="Your evenings\ntell a story.",
         sub="When moments land, what surrounds them,\nand what actually helps. In plain language."),
    dict(kind="privacy", head="Your journal\nnever leaves home.",
         sub="Stored only on this phone.\nNo account. No cloud. No tracking."),
    dict(kind="reflect", head="A gnome who\nnever judges.",
         sub="The gnome holds the lantern, never the lecture.\nA short letter about your week, once a day.",
         bubble="No streaks. No shame. Just noticing.",
         hint="One price: $7.99 once. No subscription."),
]

def find_capture(kind, cap_dirs):
    for d in cap_dirs:  # the set's own device first, so an iPad slide shows the iPad app
        for name in CAPS.get(kind, []):
            p = os.path.join(d, name)
            if os.path.exists(p): return p
    return None

def dots(d, x, y, idx, total=6, u=1.0):
    for i in range(total):
        w = 34*u if i == idx else 16*u
        rr(d, (x, y, x+w, y+16*u), 8*u, fill=AMBER if i == idx else BORDER)
        x += w + 14*u

def gnome_img(h):
    g = Image.open(P("assets/reflect-gnome@3x.png")).convert("RGBA")
    w = int(h * g.width / g.height)
    return g.resize((w, h))

def bubble(d, x, y, w, text, u):
    f = font(int(34*u))
    # single-line bubble like onboarding (surface, radius 16, small tail)
    tw = d.textlength(text, font=f)
    bw = min(w, tw + 48*u)
    rr(d, (x, y, x+bw, y+84*u), 28*u, fill=SURFACE)
    d.polygon([(x+bw-70*u, y+84*u), (x+bw-30*u, y+84*u), (x+bw-50*u, y+104*u)], fill=SURFACE)
    d.text((x+24*u, y+22*u), text, font=f, fill=TEXT)
    return bw

def hero(W, H, s, idx):
    img = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(img)
    u = W/1290.0; gx = int(90*u)
    dots(d, gx, int(96*u), idx, u=u)
    # onboarding talk row: bubble left, gnome right, bottoms aligned
    row_y = int(H*0.14); gh = int(H*0.34)
    g = gnome_img(gh)
    bubble(d, gx, row_y+int(gh*0.18), int(W*0.62), s["bubble"], u)
    img.paste(g, (W-gx-g.width, row_y), g)
    d = ImageDraw.Draw(img)
    y = row_y + gh + int(70*u)
    for ln in s["head"].split("\n"):
        d.text((gx, y), ln, font=font(int(118*u), True), fill=TEXT); y += int(138*u)
    y += int(18*u)
    for ln in s["sub"].split("\n"):
        d.text((gx, y), ln, font=font(int(42*u)), fill=MUTED); y += int(56*u)
    y += int(46*u)
    rr(d, (gx, y, gx+int(d.textlength(s["hint"], font=font(int(36*u), True)))+56*u, y+84*u), 42*u, outline=AMBER, width=max(2, int(3*u)))
    d.text((gx+28*u, y+20*u), s["hint"], font=font(int(36*u), True), fill=AMBER)
    if s["kind"] == "hero":  # onboarding footer: the app's one filled button
        by = H - int(300*u)
        rr(d, (gx, by, W-gx, by+120*u), 30*u, fill=AMBER)
        bt = "I'm in it"; bf = font(int(44*u), True)
        d.text(((W-d.textlength(bt, font=bf))/2, by+34*u), bt, font=bf, fill=INK)
    d.text((gx, H-int(110*u)), "KnowMe  ·  Know thyself", font=font(int(38*u), True), fill=AMBER)
    return img

def phone_slide(W, H, s, idx, cap_path, trim_top=0.0):
    img = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(img)
    u = W/1290.0; gx = int(90*u)
    dots(d, gx, int(96*u), idx, u=u)
    y = int(170*u)
    for ln in s["head"].split("\n"):
        d.text((gx, y), ln, font=font(int(104*u), True), fill=TEXT); y += int(122*u)
    y += int(10*u)
    for ln in s["sub"].split("\n"):
        d.text((gx, y), ln, font=font(int(40*u)), fill=MUTED); y += int(54*u)
    # partial phone: frame starts below text, runs off the bottom edge
    pw = int(W*0.86); px = (W-pw)//2; py = y + int(70*u)
    rr(d, (px-10*u, py-10*u, px+pw+10*u, H+40*u), 72*u, fill=SURFACE, outline=BORDER, width=max(2, int(3*u)))
    if cap_path:
        # cover-crop: scale the real capture to fill the partial phone, top-aligned
        cap = Image.open(cap_path).convert("RGB")
        if trim_top:  # drop another platform's status bar (Android set built from iPhone captures)
            cap = cap.crop((0, int(cap.height*trim_top), cap.width, cap.height))
        vis = H - py
        sc = max(pw / cap.width, vis / cap.height)
        cap = cap.resize((int(cap.width*sc)+1, int(cap.height*sc)+1))
        y0 = cap.height - vis if s["kind"] == "privacy" else 0  # Privacy sits at the bottom of Me
        cap = cap.crop(((cap.width-pw)//2, y0, (cap.width-pw)//2 + pw, y0 + vis))
        mask = Image.new("L", (pw, vis), 0); md = ImageDraw.Draw(mask)
        md.rounded_rectangle((0, 0, pw, vis+80*u), radius=int(62*u), fill=255)
        img.paste(cap, (px, py), mask)
    return img

def main():
    ios = P(f"marketing/ios/{VERSION}/screenshots")
    andr = P(f"marketing/android/{VERSION}/screenshots/Phone")
    sets = [
        ("iPhone-6.9", (1290, 2796), os.path.join(ios, "iPhone-6.9"),
         [os.path.join(ios, "iPhone-6.9/device-captures"), os.path.join(ios, "iPad-13/device-captures"), os.path.join(andr, "device-captures")]),
        # App Store Connect's default iPhone slot: "iPhone with Dynamic Island (medium display)", 6.3"
        ("iPhone-6.3", (1206, 2622), os.path.join(ios, "iPhone-6.3"),
         [os.path.join(ios, "iPhone-6.9/device-captures"), os.path.join(ios, "iPad-13/device-captures"), os.path.join(andr, "device-captures")]),
        ("iPad-13", (2064, 2752), os.path.join(ios, "iPad-13"),
         [os.path.join(ios, "iPad-13/device-captures"), os.path.join(ios, "iPhone-6.9/device-captures"), os.path.join(andr, "device-captures")]),
        ("android/Phone", (1080, 1920), andr,
         [os.path.join(andr, "device-captures"), os.path.join(ios, "iPhone-6.9/device-captures"), os.path.join(ios, "iPad-13/device-captures")]),
    ]
    for name, (W, H), out, cap_dirs in sets:
        os.makedirs(out, exist_ok=True)
        for i, s in enumerate(SLIDES):
            cap = find_capture(s["kind"], cap_dirs)
            # No Android captures from the Release build yet: use the iPhone ones without their status bar.
            trim = 0.072 if name == "android/Phone" and cap and "/ios/" in cap else 0.0
            img = hero(W, H, s, i) if s["kind"] in ("hero", "reflect") else phone_slide(W, H, s, i, cap, trim)
            img.save(os.path.join(out, f"{i+1:02d}-{s['kind']}.png"))
            print(name, i+1, s["kind"], img.size)
    # Play feature graphic + promo hero stay onboarding-branded
    W, H = 1024, 500
    img = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(img)
    g = gnome_img(330); img.paste(g, (70, 90), g); d = ImageDraw.Draw(img)
    d.text((290, 130), "KnowMe", font=font(72, True), fill=TEXT)
    d.text((292, 222), "Know yourself. Change follows.", font=font(38), fill=AMBER)
    d.text((292, 282), "Private habit tracking. Stored only on your phone.", font=font(30), fill=MUTED)
    d.text((292, 332), "$7.99 once. No subscription.", font=font(30, True), fill=SAGE)
    fg = P(f"marketing/android/{VERSION}/hero"); os.makedirs(fg, exist_ok=True)
    img.save(os.path.join(fg, f"{DATE_TAG}-feature-graphic-1024x500.png")); print("feature", img.size)
    W, H = 1800, 1200
    img = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(img)
    g = gnome_img(430); img.paste(g, (W//2-g.width//2, 120), g); d = ImageDraw.Draw(img)
    def c(cx, y, t, f, fill): d.text((cx-d.textlength(t, font=f)/2, y), t, font=f, fill=fill)
    c(W//2, 620, "Know yourself. Change follows.", font(76, True), TEXT)
    c(W//2, 730, "A calm, private journal for understanding your habits.", font(38), MUTED)
    c(W//2, 800, "The gnome never judges. It just holds the lantern.", font(38), AMBER)
    pr = P(f"marketing/shared/{VERSION}/promo"); os.makedirs(pr, exist_ok=True)
    img.save(os.path.join(pr, f"{DATE_TAG}-promo-hero-1800x1200.png")); print("hero", img.size)
    # App Store product page header (App Store Connect → Header and Search Results)
    W, H = 3840, 1646
    img = Image.new("RGB", (W, H), BG); d = ImageDraw.Draw(img)
    g = gnome_img(1100); img.paste(g, (W-g.width-420, (H-g.height)//2), g); d = ImageDraw.Draw(img)
    d.text((420, 560), "Know yourself.", font=font(150, True), fill=TEXT)
    d.text((420, 740), "Change follows.", font=font(150, True), fill=AMBER)
    d.text((424, 960), "A calm, private journal. Stored only on your phone.", font=font(64), fill=MUTED)
    hd = P(f"marketing/ios/{VERSION}/hero"); os.makedirs(hd, exist_ok=True)
    img.save(os.path.join(hd, f"{DATE_TAG}-app-store-header-3840x1646.png")); print("header", img.size)

if __name__ == "__main__":
    main()
