// Build Kestrel-Pitch-Deck.pdf (exact, from deck.html) and an editable .pptx backup.
// PPTX: each slide's art (gradients, grid, bars, panels, images) is a background
// image; every [data-t] element becomes a native text box at the same position.
const { chromium } = require('playwright');
const pptxgen = require('pptxgenjs');
const path = require('path');
const fs = require('fs');
const { applyTheme } = require(process.env.PPTX_SKILL + '/scripts/apply_theme.js');

const OUT = process.argv[2] || path.join(__dirname, 'out');
fs.mkdirSync(OUT, { recursive: true });
const PX = 96; // CSS px per inch; slide is 1280 x 720 px = 13.333 x 7.5 in

const THEME = {
  name: 'Kestrel Dark',
  headFontFace: 'Inter',
  bodyFontFace: 'Inter',
  colors: {
    dk1: '05090A', lt1: 'EAF6F8', dk2: '071D22', lt2: '9FBFC5',
    accent1: '6FCFE0', accent2: 'FF6B5E', accent3: 'E8C25B', accent4: '6FD69C', accent5: '4F6F74', accent6: '1B5562',
    hlink: '6FCFE0', folHlink: '7FA3AA',
  },
};

const hex = (rgb) => {
  const m = rgb.match(/\d+(\.\d+)?/g).map(Number);
  return m.slice(0, 3).map((v) => Math.round(v).toString(16).padStart(2, '0')).join('').toUpperCase();
};
const face = (ff) => (/KMono|JetBrains/i.test(ff) ? 'JetBrains Mono' : 'Inter');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 2 });
  await page.goto('file://' + path.join(__dirname, 'deck.html'));
  await page.evaluate(async () => { await document.fonts.ready; return [...document.fonts].filter((f) => f.status === 'loaded').length; }).then((n) => console.log('fonts loaded:', n));

  // 1) PDF straight from the HTML: real fonts, vector text.
  await page.pdf({ path: path.join(OUT, 'Kestrel-Pitch-Deck.pdf'), width: '1280px', height: '720px', printBackground: true, preferCSSPageSize: true });

  // 2) Collect text boxes with their runs.
  const slides = await page.evaluate(() => {
    const css = (e) => getComputedStyle(e);
    return [...document.querySelectorAll('section.slide')].map((sl) => {
      const r0 = sl.getBoundingClientRect();
      const boxes = [...sl.querySelectorAll('[data-t]')].map((e) => {
        const r = e.getBoundingClientRect();
        const s = css(e);
        const pre = s.whiteSpace === 'pre';
        const runs = [];
        const walk = (n) => {
          for (const c of n.childNodes) {
            if (c.nodeType === 3) {
              let t = c.textContent;
              if (!pre) t = t.replace(/\s+/g, ' ');
              if (!t) continue;
              const ps = css(c.parentElement);
              const parts = pre ? t.split('\n') : [t];
              parts.forEach((p, i) => runs.push({ text: p, color: ps.color, weight: +ps.fontWeight, italic: ps.fontStyle === 'italic', size: parseFloat(ps.fontSize), ff: ps.fontFamily, br: i < parts.length - 1 }));
            } else if (c.nodeName === 'BR') {
              if (runs.length) runs[runs.length - 1].br = true;
            } else if (c.nodeType === 1) walk(c);
          }
        };
        walk(e);
        if (runs.length) { runs[0].text = runs[0].text.replace(/^ /, ''); runs[runs.length - 1].text = runs[runs.length - 1].text.replace(/ $/, ''); }
        const lh = s.lineHeight === 'normal' ? parseFloat(s.fontSize) * 1.2 : parseFloat(s.lineHeight);
        const ls = s.letterSpacing === 'normal' ? 0 : parseFloat(s.letterSpacing);
        // inner box (exclude padding/border) so text sits where the browser drew it
        const pl = parseFloat(s.paddingLeft) + parseFloat(s.borderLeftWidth), pt = parseFloat(s.paddingTop) + parseFloat(s.borderTopWidth);
        const pr = parseFloat(s.paddingRight) + parseFloat(s.borderRightWidth), pb = parseFloat(s.paddingBottom) + parseFloat(s.borderBottomWidth);
        const link = /^(hadijayyy\.github\.io|github\.com)/.test(e.textContent.trim()) ? 'https://' + e.textContent.trim() : null;
        return { cell: e.tagName === 'TD', x: r.left - r0.left + pl, y: r.top - r0.top + pt, w: r.width - pl - pr, h: r.height - pt - pb, lh, ls, align: s.textAlign, runs, link, single: (r.height - pt - pb) < lh * 1.5 };
      });
      return { notes: sl.dataset.notes || '', boxes };
    });
  });

  // 3) Background art: same slides with the editable text made transparent.
  await page.addStyleTag({ content: '[data-t],[data-t] *{color:transparent!important}' });
  const handles = await page.$$('section.slide');
  const bgs = [];
  for (let i = 0; i < handles.length; i++) {
    const f = path.join(OUT, `.bg-${i + 1}.jpg`);
    await handles[i].screenshot({ path: f, type: 'jpeg', quality: 88 });
    bgs.push(f);
  }
  await browser.close();

  const pres = new pptxgen();
  pres.layout = 'LAYOUT_WIDE';
  pres.title = 'Kestrel: Ascend Builder Incubator';
  pres.author = 'Ryan Hadi';
  pres.company = 'Kestrel';
  pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
  const sections = [[1, 'Opening'], [3, 'Day one data'], [6, 'Problem'], [7, 'Product'], [11, 'Business'], [12, 'Traction'], [14, 'Plan'], [15, 'Team and ask']];
  let sec = 'Opening';

  slides.forEach((sd, i) => {
    const hit = sections.find(([n]) => n === i + 1);
    if (hit) { sec = hit[1]; pres.addSection({ title: sec }); }
    const s = pres.addSlide({ sectionTitle: sec });
    s.background = { path: bgs[i] };
    sd.boxes.forEach((b, j) => {
      if (!b.runs.length) return;
      const base = b.runs[0];
      const runs = b.runs.map((r, k) => ({
        text: r.text,
        options: {
          color: hex(r.color), fontFace: face(r.ff), fontSize: +(r.size * 0.75).toFixed(1), bold: r.weight >= 600, italic: r.italic,
          breakLine: r.br && k < b.runs.length - 1 ? true : undefined,
          hyperlink: b.link ? { url: b.link } : undefined,
        },
      }));
      // Slack for font fallback: single lines don't wrap; paragraphs get ~8% more width.
      const w = b.single ? Math.min(b.w * 1.25 + 8, 1280 - b.x - 8) : Math.min(b.w * 1.08, 1280 - b.x - 8);
      const x = b.align === 'right' ? b.x - (w - b.w) : b.x; // right-aligned text grows leftwards
      s.addText(runs, {
        x: x / PX, y: b.y / PX, w: w / PX, h: Math.max(b.h, b.lh) / PX,
        margin: 0, valign: b.cell ? 'middle' : 'top', isTextBox: true, fit: 'none', wrap: !b.single,
        align: b.align === 'right' ? 'right' : b.align === 'center' ? 'center' : 'left',
        lineSpacing: +(b.lh * 0.75).toFixed(1),
        charSpacing: b.ls ? +(b.ls * 0.75).toFixed(2) : undefined,
        fontFace: face(base.ff),
        objectName: `text-${i + 1}-${j + 1}`,
      });
    });
    if (sd.notes) s.addNotes(sd.notes);
  });

  const pptx = path.join(OUT, 'Kestrel-Pitch-Deck.pptx');
  await pres.writeFile({ fileName: pptx });
  await applyTheme(pptx, THEME);
  bgs.forEach((f) => fs.unlinkSync(f));
  console.log('built', slides.length, 'slides ->', OUT);
})();
