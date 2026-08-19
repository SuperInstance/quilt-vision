# 👁 quilt-vision

> **Images as cells. Computer vision as formulas.**

A sketch. The thesis: an image is a cell. Computer vision is a formula. The result is composable, inspectable, reactive.

[![License](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Try it](https://img.shields.io/badge/try-live-7ec699)](https://superinstance.github.io/quilt/landing/quilt-vision.html)

**[→ Try the vision cells live](https://superinstance.github.io/quilt/landing/quilt-vision.html)** — drop in an image, get caption + tags + objects.

---

## ⚡ See it in 30 seconds

```yaml
id: photo-analyzer
title: "Drop a photo, get insights"
version: 0.1.0
cells:
  - id: image
    kind: vision.image
    source: upload
    description: "The image the user dropped"

  - id: caption
    kind: vision.caption
    model: blip-base
    description: "Auto-generated caption"

  - id: tags
    kind: vision.classify
    model: imagenet
    top_k: 5
    description: "Top 5 ImageNet classes"

  - id: objects
    kind: vision.detect
    model: yolov8n
    description: "Detected objects with bounding boxes"

  - id: ocr
    kind: vision.ocr
    model: tesseract
    description: "Extracted text"

  - id: dominant_colors
    kind: vision.palette
    n: 5
    description: "5 dominant colors"

  - id: faces
    kind: vision.faces
    description: "Detected faces with emotions"

  - id: description
    kind: formula
    expr: |
      caption.text + " Tagged: " + tags.join(", ") +
      ". Objects: " + objects.length
    description: "A human-friendly summary"
```

That's the whole vision pipeline. Eight cells. The image goes in, a description comes out. The cells are reactive — change the image, the description updates.

---

## 🎬 The vision pipeline, visualized

```
   ┌──────────────────────────────────────────────────────────────┐
   │                      quilt-vision                             │
   │                                                              │
   │   ┌─────────┐                                                │
   │   │  image  │   the input: an image as a cell                │
   │   │  (cell) │                                                │
   │   └────┬────┘                                                │
   │        │                                                     │
   │        ├──▶ caption         "A red car on a beach at sunset" │
   │        ├──▶ tags            ["sports car", "beach", ...]     │
   │        ├──▶ objects         [{label, box, conf}, ...]        │
   │        ├──▶ ocr             "EXIT 42"                        │
   │        ├──▶ palette         ["#c45", "#fa0", ...]            │
   │        ├──▶ faces           [{emotion, box}, ...]            │
   │        │                                                     │
   │        ▼                                                     │
   │   ┌──────────────┐                                           │
   │   │  description │  "A red car on a beach at sunset.         │
   │   │  (formula)   │   Tagged: sports car, beach, ...          │
   │   │              │   Objects: 3"                             │
   │   └──────────────┘                                           │
   │                                                              │
   │   All reactive. All inspectable. All cells.                  │
   │                                                              │
   └──────────────────────────────────────────────────────────────┘
```

---

## 🎁 The 8 vision cell kinds

| Cell kind | What it does | Example |
| --- | --- | --- |
| `vision.image` | Holds an image (upload, URL, or sensor) | `image: { width: 1920, height: 1080, data: ... }` |
| `vision.caption` | Generates a natural-language caption | "A red car on a beach" |
| `vision.classify` | Top-k ImageNet classification | ["sports car", "convertible", ...] |
| `vision.detect` | Object detection with bounding boxes | `{ label: "car", box: [x, y, w, h], conf: 0.94 }` |
| `vision.ocr` | Extract text from the image | ["EXIT 42", "Speed limit 30"] |
| `vision.palette` | Dominant color extraction | ["#c45", "#fa0", ...] |
| `vision.faces` | Face detection with emotions | `{ box, emotion, age, gender }` |
| `vision.depth` | Monocular depth estimation | A depth map as an image |

The cells are first-class. They have inputs, outputs, dependencies, status. They plug into the rest of Quilt like any other cell.

---

## 🏗️ Architecture

```
   ┌──────────────────────────────────────────────────────────────┐
   │                       quilt-vision                            │
   │                                                              │
   │   ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐    │
   │   │   Image       │  │   Models     │  │   Pipeline       │    │
   │   │   sources     │  │              │  │                  │    │
   │   │   upload      │  │   BLIP       │  │   caption        │    │
   │   │   url         │  │   CLIP       │─▶│   classify       │    │
   │   │   sensor      │  │   YOLO       │  │   detect         │    │
   │   │   camera      │  │   Tesseract  │  │   ocr            │    │
   │   │   canvas      │  │   MediaPipe  │  │   palette        │    │
   │   └──────────────┘  └──────────────┘  └──────────────────┘    │
   │            │                  │                    │        │
   │            └──────────────────┼────────────────────┘        │
   │                               ▼                             │
   │                      ┌──────────────────┐                    │
   │                      │   Reactive       │  every vision     │
   │                      │   Quilt engine   │  output is a cell │
   │                      └──────────────────┘                    │
   │                                                              │
   └──────────────────────────────────────────────────────────────┘
```

Three layers:
- **Sources** — where the image comes from
- **Models** — what runs on the image
- **Pipeline** — the resulting cell graph

---

## 💡 Use cases

| Use case | What you build |
| --- | --- |
| **Photo organization** | Auto-caption + auto-tag. Drop a folder, get a searchable index. |
| **Receipt scanner** | OCR + amount extraction. Cells: image, ocr, parser, expense. |
| **Accessibility** | Auto-caption every image on a page. Screen-reader friendly. |
| **Inventory tracking** | Detect objects on a shelf. Cells: image, detect, count. |
| **Security** | Detect faces + classify. Cells: image, faces, alert. |
| **AR overlays** | Detect objects, draw on them. Cells: image, detect, render. |
| **Visual debugging** | "Why did the model think this is a car?" — every step is a cell. |

---

## 🛠️ Develop

```bash
git clone https://github.com/SuperInstance/quilt-vision
cd quilt-vision
node src/index.js examples/photo-analyzer.yaml
```

---

## 📚 Examples

```
examples/
├── photo-analyzer.yaml    caption + tags + objects
├── receipt-scanner.yaml   OCR + amount extraction
├── face-attributes.yaml   face detection + emotions
├── color-palette.yaml     dominant color extraction
├── accessibility.yaml     auto-caption every image
└── inventory-tracker.yaml object detection + counting
```

---

## 🛣️ Roadmap

1. **Local model inference** — ONNX, TensorFlow.js, WebGPU
2. **Streaming pipelines** — webcam → real-time cells
3. **Custom training** — fine-tune on your own data, drop the model in
4. **3D vision** — depth maps, point clouds
5. **Video cells** — frame-by-frame, optical flow, action recognition
6. **Cross-modal** — text-to-image, image-to-text, search by description

---

## 🔗 Related

- [Quilt (TypeScript)](https://github.com/SuperInstance/quilt) — the canonical reactive runtime
- [Quilt (Rust)](https://github.com/SuperInstance/quilt-rust) — the desktop runtime
- [Quilt Agent](https://github.com/SuperInstance/quilt-agent) — agents that use vision cells as tools
- [Quilt Live](https://github.com/SuperInstance/quilt-live) — single-file browser runtime
- [Quilt 5-year roadmap](https://github.com/SuperInstance/quilt/blob/main/quilt-roadmap-2026.md)

## License

MIT.
