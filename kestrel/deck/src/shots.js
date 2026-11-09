// Render every slide to PNG and flag text that runs off the slide or out of its box.
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1280, height: 720 } });
  await p.goto('file://' + path.join(__dirname, 'deck.html'));
  await p.evaluate(() => document.fonts.ready);
  const only = process.argv.slice(2).map(Number);
  const s = await p.$$('section.slide');
  for (let i = 0; i < s.length; i++) {
    if (only.length && !only.includes(i + 1)) continue;
    await s[i].screenshot({ path: path.join(__dirname, `qa-${String(i + 1).padStart(2, '0')}.png`) });
  }
  const issues = await p.evaluate(() => [...document.querySelectorAll('section.slide')].flatMap((sl, i) => {
    const r0 = sl.getBoundingClientRect();
    return [...sl.querySelectorAll('[data-t]')]
      .filter((e) => { const r = e.getBoundingClientRect(); return r.right > r0.right - 30 || r.bottom > r0.bottom - 20 || e.scrollWidth > e.clientWidth + 2; })
      .map((e) => `${i + 1}: ${e.textContent.slice(0, 50)}`);
  }));
  console.log(issues.join('\n') || 'no edge overflow');
  await b.close();
})();
