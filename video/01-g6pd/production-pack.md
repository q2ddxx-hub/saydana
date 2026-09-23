# Saydana Video 01: "Why primaquine destroys red cells" (G6PD)

Format: 9:16 (1080×1920), about 70 s. The narration is Arabic and the technical terms stay in English.
Look: the same glowing X-ray style as your example (dark navy, cyan glow, orange for the thing that matters).

---

## 1. Platforms

| Job | Platform | Why |
|---|---|---|
| Images | **fal.ai** (runs the top image models such as Flux Pro and Imagen through one API key) | It has an API, so the pipeline can make images automatically (option B). If you make images by hand, **Midjourney** gives the best look, using the same prompts. |
| Voice | **ElevenLabs** (Multilingual model) | It has the most natural Arabic of the services available today. It can also clone a real native voice. |
| Short "living" shots (optional) | **Kling** image-to-video (also available on fal.ai) | It turns a still image into a 5-second shot with gentle movement, like the moving shots in your example. |
| Titles, labels, captions, music mix, final render | **Me**, in code | There's no platform to set up for this. |

**Note:** the prompts below ask the image models for **no text**. Image AIs misspell words, especially in Arabic. I add every label and caption in code, so the spelling is exact and I can use Arabic fonts.

## 2. What you set up for option B (once)

In this environment's settings (the cloud environment menu in the session title bar, then **Edit**):

1. **Network access:** add these domains to the allowed list:
   - `api.elevenlabs.io`
   - `fal.run`, `queue.fal.run`, `fal.media`, `v3.fal.media`
2. **API keys:** add these as environment variables:
   - `ELEVENLABS_API_KEY`
   - `FAL_KEY`
3. Start a new session. The changes only apply to new sessions.

Never paste keys into the chat. The environment settings are the right place for them.

## 3. Arabic voice test (do this before committing)

In ElevenLabs, go to **Voice Library** and filter by Language = Arabic, Accent = Saudi / Gulf, and Use case = Narration.
Pick **3 male and 2 female** voices and generate lines 1, 5 and 11 of the script below with each one.
Settings: model *Multilingual* (the newest one offered), Stability 45, Similarity 75, Style 10.

Judge each voice on three things:
- Does it sound like a Saudi pharmacist, or like a news anchor from somewhere else?
- Does it say **G6PD, NADPH, glutathione** like an English-speaking doctor would, or does it Arabize them?
- Does it switch between Arabic and English without a pause or a change of voice?

**If none of them pass**, clone a real voice. Use **Instant Voice Clone** with a clean 1–2 minute recording of you, or of a pharmacist you know, reading Arabic that includes English terms. This option is the most reliable way to get a native accent. The voice is then a real person's voice and belongs to the channel.

## 4. Style prompt (add to the end of every image prompt)

```
scientific X-ray visualization, translucent glass-like anatomy with glowing cyan edges, deep navy background (#050B18), bioluminescent cyan rim light (#38D5FF), selective warm orange glow (#FF7A1A) only on the key structure, volumetric light, cinematic macro photography, ultra-detailed, high contrast, shallow depth of field, calm empty dark space in the top third and bottom third of the frame, vertical composition, no text, no letters, no labels, no watermark, no logo
```

Midjourney: add `--ar 9:16 --style raw`. fal.ai: set the aspect ratio to 9:16 (portrait).

## 5. Shot list: image prompts

| # | Time | Image prompt (+ style prompt) |
|---|---|---|
| S01 | 0–5 s | Red blood cells flowing through a translucent capillary, one red blood cell in the center cracking open and bursting into glowing fragments |
| S02 | 5–10 s | A single white pharmaceutical tablet dissolving inside a bloodstream, tiny orange sparks of oxidant particles radiating outward from it toward nearby red blood cells |
| S03 | 10–17 s | Cutaway of a single biconcave red blood cell rendered as translucent glass, packed with small glowing hemoglobin molecules, visibly no nucleus and no mitochondria, clean empty interior spaces |
| S04 | 17–23 s | A large 3D protein enzyme in ribbon-model style, glowing cyan, one section of the protein fractured and dim, floating inside a red blood cell |
| S05 | 23–30 s | An abstract metabolic pathway shown as streams of light flowing through the inside of a red blood cell, the very first gate of the stream glowing orange, the rest cyan |
| S06 | 30–37 s | Small glowing molecules linking into a hexagonal cyan energy shield along the inner membrane of a red blood cell, deflecting incoming orange sparks |
| S07 | 37–42 s | The same hexagonal cyan shield cracking and shattering, orange sparks piercing through into the red blood cell |
| S08 | 42–48 s | Fresh fava beans and a few white tablets on a dark reflective surface, cyan rim light, faint orange haze rising from them |
| S09 | 48–54 s | Inside a red blood cell, dark clumps of denatured protein sticking to the inner membrane, glowing orange, surrounding hemoglobin dimming |
| S10 | 54–60 s | A translucent macrophage in the spleen taking a semicircular bite out of a red blood cell, the bitten edge glowing orange |
| S11 | 60–65 s | Many red blood cells each missing a semicircular bite, drifting apart, some fragmenting, microscopy view |
| S12 | 65–72 s | A calm field of healthy red blood cells flowing gently through a vessel, light rays from above, peaceful |

The title cards between shots ("G6PD", "NO SHIELD", "BITE CELLS", "ANSWER: NADPH") are made in code, so they need no prompt.

**Optional Kling motion prompt** (use it on S01, S06/S07 and S10):
`slow cinematic push-in, particles drift gently, subtle glow pulsing, camera steady, no morphing, 5 seconds`

## 6. Narration: Arabic with English terms (ElevenLabs)

Write the English terms in Latin letters exactly as shown below, so the voice says them in English.

```
1  الـ primaquine… دواء للملاريا. بس عند بعض الناس، يدمّر كريات الدم الحمراء خلال أيام.
2  والسبب؟ إنزيم واحد ناقص… G6PD.
3  كرية الدم الحمراء ما فيها mitochondria… فمصدرها للـ NADPH هو الـ pentose phosphate pathway.
4  والـ G6PD هو أول خطوة فيه… الخطوة اللي تتحكم بالسرعة كلها.
5  الـ NADPH يحافظ على الـ glutathione بشكله الـ reduced… وهذا هو الدرع اللي يطفّي الـ oxidants.
6  لما ينقص الإنزيم… الدرع يطيح.
7  ويجي دواء oxidant… primaquine، dapsone، rasburicase… أو حتى الفول.
8  الهيموغلوبين يتأكسد ويتكتّل داخل الخلية… وهذي هي الـ Heinz bodies.
9  الطحال يشوفها… ويقضم منها. فتطلع لنا الـ bite cells.
10 والنتيجة: hemolysis… بعد يومين إلى ثلاثة من أول جرعة.
11 وفي الاختبار؟ قبل primaquine أو rasburicase… افحص G6PD. وتذكّر: الـ methylene blue ممنوع عنده.
12 الجواب إذن… NADPH. صيدنة. تدريب أصيل للـ SPLE.
```

On-screen captions show the Arabic line with the English term highlighted in cyan. Big title cards use the English term, as the exam does.

## 7. Music

Download one track from **Epidemic Sound** or **Artlist** (they have commercial licences for TikTok). Search for "ambient cinematic science, 70 bpm, no vocals", or a similar deep drone with a soft pulse. I'll duck it under the voice and bring the final loudness to TikTok's target level.

## 8. What I do once the keys are in

1. The pipeline generates all 12 images from the prompts above, making 2 versions of each so we can pick the better one.
2. It generates the voice line by line and gets word timings for the captions.
3. It builds the video: title cards, labels with leader lines, slow zooms, Arabic captions timed to each word, the Saydana logo, the music mix, and the final render at 1080×1920.
4. I send you the draft. Your notes go into the script and prompts, and the next version is one command.
