# SUGGESTIONS — vessel fit (F/V EILEEN, Kodiak)

*From the 2026-08-26 vessel-fit playtest. Honest status check first: this repo is a **193-line sketch** (`src/index.js`) — cell *declarations* for caption/classify/detect/ocr, no models wired, URLs point at example.com. Nothing here runs on a boat today. That's fine for a sketch; here's what the vessel actually needs if it grows up.*

## The one use-case that matters: log/debris detection, offline

- **Deck cameras are the input; "something in the water ahead" is the output.** Nothing else in the quilt family touches this.
- **Offline constraint decides the architecture.** The cell kinds are right (`vision.image → vision.detect → alert`), but the `model:` fields all name cloud/weights assumptions. For the boat, the model slot must be a **local** one: a YOLO-nano-class detector on the helm SBC (or an ESP32-S3 with a tiny model for motion-score only — that's already sketched as a quilt-esp32 limb).
- **Frame the output as a score cell, not a caption.** `vision.detect` bounding boxes are a shoreside luxury; what the helm sheet needs is a scalar `debris.score` pushed over the escalation path, thresholded by a `.qm` band table on the limb (see `quilt-esp32/docs/VESSEL-FIT.md`). Captions/tags/OCR are marina-day toys.

## Ranked suggestions

1. **Pick the smallest real detector and wire one cell kind to it** (`vision.detect` → local ONNX/TFLite model). One working offline cell beats five aspirational ones.
2. **Rate-limit at capture**: process 1 frame per N seconds, escalate only band-hit frames upstream. Bandwidth between limb and helm is ESP-NOW/UART — treat frames as expensive.
3. **Defer OCR/palette/caption entirely.** Not one of them helps avoid a deadhead log at 8 knots.

*Companion docs: `quilt-rust/docs/VESSEL-FIT.md` (helm tier), `quilt-esp32/docs/VESSEL-FIT.md` (limb tier).*
