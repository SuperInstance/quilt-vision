# quilt-vision

> Images as cells. Computer vision as formulas.

A sketch. The thesis: an image is a cell. Computer vision is a formula.

## The thesis

Today, computer vision is bolted on. You have an app, the app has a
camera, the app calls out to a vision API, the app stores the result
somewhere. The image and the vision result live in different
systems, and the connection between them is implicit in the code.

Quilt inverts this. The image is a cell. The vision result is a
cell. The connection is a formula:

```yaml
id: photo-album
cells:
  - id: photo.morning
    kind: value
    value: "morning.jpg"

  - id: caption.morning
    kind: vision
    input: photo.morning
    model: blip-2
    kind: caption
```

That's the whole thing. The cell graph is the vision pipeline. Add
more cells for OCR, object detection, embeddings, segmentation,
depth — they're all the same shape: input image + model + kind →
output value.

## What it unlocks

- **A photo library that knows what it contains.** Every photo
  has a caption, a list of objects, a list of faces, a vector
  embedding. You can search for "beach photos" and the
  embedding-based search works.
- **A document scanner that knows what's in the document.** OCR
  cells, table-extraction cells, form-detection cells.
- **A medical imaging system that runs models as cells.** X-ray
  in, segmentation out, measurement out, diagnosis out.
- **A satellite imagery analyzer.** Tile in, change-detection
  out, alert out.
- **A security camera with cells.** Frame in, person-detection
  out, alert out.

In all of these, the cell graph is the workflow. You can read it,
modify it, branch it, replay it, share it.

## Vision cell kinds

| kind | description | output |
| --- | --- | --- |
| `caption` | Generate a natural-language caption | `string` |
| `text` | OCR — extract all text | `string[]` |
| `faces` | Detect faces + bounding boxes | `Face[]` |
| `objects` | Detect objects + bounding boxes | `Object[]` |
| `tags` | Return descriptive tags | `string[]` |
| `embed` | Return a vector embedding | `number[]` |
| `segment` | Return a segmentation mask | `Mask` |
| `depth` | Return a depth map | `number[][]` |

Each kind has a list of compatible models. Models can be remote
(OpenAI's GPT-4V, Google Cloud Vision) or local (CLIP, BLIP-2,
YOLOv8, SAM running via WebGPU in the browser).

## Example sheet

The file `examples/photo-album.yaml` shows a complete example: a
day-in-photos album where each photo is auto-captioned, objects
are detected, and a journal entry is composed from the captions.

## How it would run

A vision cell is a Quilt API cell under the hood. When the input
image changes, the vision cell calls out to the model API with the
new image and stores the response as its value. The reactive DAG
ensures all downstream cells (formulas, listeners) update.

For local models in the browser, the call goes to a WebGPU
runtime (transformers.js, ONNX Runtime Web, MediaPipe). For
remote models, it's a regular HTTPS call.

## Use cases

- **Photo search by content.** "Find me photos of my dog at the
  beach" — text query gets embedded, embeddings compared.
- **Receipt OCR.** Photograph a receipt; cells extract merchant,
  date, total, line items.
- **Document digitization.** Photograph a document; cells extract
  text, tables, signatures.
- **Inventory tracking.** Photograph a shelf; cells count items,
  detect missing products.
- **Accessibility.** Every photo gets a caption for screen
  readers; every document gets OCR.
- **Wildlife monitoring.** Trail-cam photos; cells identify
  species; listener cells send alerts.
- **Security.** Doorbell cam; cells detect people, packages,
  strangers; listener cells send notifications.

## Status

Sketch only. The cell shape and the kinds are stable. The
implementation is a Quilt API cell that calls out to a model.
The first implementation will be a JavaScript class that wraps
fetch + JSON Schema validation; the real implementation will
support local models via WebGPU.

## Related

- [Quilt (TypeScript)](https://github.com/SuperInstance/quilt) — the
  reactive runtime.
- [Quilt (Rust)](https://github.com/SuperInstance/quilt-rust) — the
  desktop runtime.
- [Quilt Live](https://github.com/SuperInstance/quilt-live) — the
  single-file browser runtime.
- [Quilt 5-year roadmap](https://github.com/SuperInstance/quilt/blob/main/quilt-roadmap-2026.md).

## License

MIT.
