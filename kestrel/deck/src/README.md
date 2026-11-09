# Kestrel pitch deck source

`deck.html` is the master copy: 17 slides at 1280 x 720, one `<section class="slide">` each.
Text marked `data-t` becomes editable text in the PowerPoint file. Speaker notes are in `data-notes`.

Build:

```bash
# 1. Fonts (Inter, Inter Display, JetBrains Mono; SIL Open Font License) as static TrueType,
#    so the PDF embeds real fonts instead of Type 3 glyphs.
pip install fonttools
mkdir -p fonts
python3 otf2ttf.py fonts /path/to/Inter-{Regular,Medium,SemiBold}.otf /path/to/InterDisplay-{Regular,SemiBold}.otf
cp /path/to/JetBrainsMono-{Regular,Medium}.ttf fonts/

# 2. Check layout (renders qa-NN.png, reports text running off the slide)
node shots.js

# 3. Build out/Kestrel-Pitch-Deck.pdf and .pptx (needs playwright and pptxgenjs;
#    PPTX_SKILL points at a folder with scripts/apply_theme.js)
node build.js out
```

The PDF is the version to send. The PPTX keeps the same layout: slide art is a
background image and all text is editable. Install Inter and JetBrains Mono to see
it as designed; without them PowerPoint substitutes a default font.
