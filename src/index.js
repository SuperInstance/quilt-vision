// quilt-vision — a sketch of vision as a Quilt primitive.
//
// The thesis: an image is a cell. Computer vision is a formula.
// "What's in this image?" is `vision.caption(photo.image)`.
// "OCR this receipt" is `vision.text(photo.image)`.
// "Detect faces" is `vision.faces(photo.image)`.
//
// A vision cell is a value cell whose value is the result of
// running a vision model on an input image cell. The model
// is described declaratively: the cell's `model` field says
// which model to use, the cell's `input` field says which image
// cell to run on, and the cell's value is the model's output.
//
// Real implementation: each "vision" cell is a Quilt API cell
// that calls out to a vision API (CLIP, BLIP-2, LLaVA, GPT-4V,
// or a local model). For browsers, the model can be a WebNN or
// WebGPU model running locally.

/**
 * A vision cell description. When evaluated, calls a vision API
 * on the input image and stores the result.
 */
export class VisionCell {
  constructor({ id, input, model = 'clip', kind = 'caption', params = {} }) {
    this.id = id;
    this.input = input;       // cell id of the input image
    this.model = model;       // 'clip', 'blip-2', 'gpt-4v', 'local:yolov8', etc.
    this.kind = kind;         // 'caption', 'text', 'faces', 'objects', 'tags', 'embed'
    this.params = params;     // model-specific params
    this.value = null;
  }
}

/**
 * The kinds of vision operations. Each maps to a family of
 * vision models and produces a specific output type.
 */
export const VISION_KINDS = {
  caption: {
    description: 'Generate a natural-language caption of the image.',
    output: 'string',
    models: ['blip-2', 'llava', 'gpt-4v', 'local:blip'],
  },
  text: {
    description: 'OCR — extract all text from the image.',
    output: 'string[]',
    models: ['tesseract', 'gpt-4v', 'easyocr', 'local:paddleocr'],
  },
  faces: {
    description: 'Detect faces and return bounding boxes + landmarks.',
    output: 'Face[]',
    models: ['mtcnn', 'retinaface', 'mediapipe', 'local:yolov8-face'],
  },
  objects: {
    description: 'Detect objects and return bounding boxes + classes.',
    output: 'Object[]',
    models: ['yolov8', 'detr', 'local:yolov8', 'gpt-4v'],
  },
  tags: {
    description: 'Return a list of descriptive tags.',
    output: 'string[]',
    models: ['clip', 'ram', 'local:clip'],
  },
  embed: {
    description: 'Return a vector embedding of the image.',
    output: 'number[]',
    models: ['clip', 'dino', 'local:clip'],
  },
  segment: {
    description: 'Return a segmentation mask.',
    output: 'Mask',
    models: ['sam', 'maskrcnn', 'local:sam'],
  },
  depth: {
    description: 'Return a depth map.',
    output: 'number[][]',
    models: ['midas', 'depth-anything', 'local:midas'],
  },
};

/**
 * A picture cell — a value cell that holds a picture. Pictures
 * are referenced by URL (or, in a real implementation, by a
 * blob ID with the bytes stored elsewhere).
 */
export class PictureCell {
  constructor({ id, url, alt, takenAt }) {
    this.id = id;
    this.url = url;
    this.alt = alt;
    this.takenAt = takenAt;
    this.value = url;
  }
}

/**
 * An example sheet that demonstrates the vision-as-cell pattern.
 * This is the kind of thing a user would write by hand, or that
 * a UI would generate from a photo.
 */
export const EXAMPLE_PHOTO_SHEET = `
id: photo-album
title: "A day in photos"
cells:
  # The source image.
  - id: photo.morning
    kind: value
    value: "https://example.com/photos/morning.jpg"
  - id: photo.afternoon
    kind: value
    value: "https://example.com/photos/afternoon.jpg"
  - id: photo.evening
    kind: value
    value: "https://example.com/photos/evening.jpg"

  # Caption each photo.
  - id: caption.morning
    kind: vision
    input: photo.morning
    model: blip-2
    kind: caption
  - id: caption.afternoon
    kind: vision
    input: photo.afternoon
    model: blip-2
    kind: caption
  - id: caption.evening
    kind: vision
    input: photo.evening
    model: blip-2
    kind: caption

  # Detect objects in each photo.
  - id: objects.morning
    kind: vision
    input: photo.morning
    model: yolov8
    kind: objects
  - id: objects.evening
    kind: vision
    input: photo.evening
    model: yolov8
    kind: objects

  # Compose a journal entry.
  - id: journal.entry
    kind: formula
    expr: '"Today I saw: " + caption.morning + ". Then: " + caption.afternoon + ". And in the evening: " + caption.evening'

  # Alert if any photo shows a person.
  - id: alert.person
    kind: listener
    watch: objects.morning
    condition: "objects.morning.some(o => o.class === 'person')"
    action: "console.log('Person detected in morning photo')"
`;

/**
 * Search for similar images in a collection. Uses CLIP embeddings
 * (or any embedding model) and a vector similarity search.
 *
 * @param {Map<string, number[]>} embeddings - cell id -> embedding
 * @param {number[]} queryEmbedding - the query embedding
 * @param {number} topK - return the top K results
 * @returns {{cellId: string, score: number}[]}
 */
export function searchSimilar(embeddings, queryEmbedding, topK = 5) {
  const results = [];
  for (const [cellId, emb] of embeddings) {
    const score = cosineSimilarity(queryEmbedding, emb);
    results.push({ cellId, score });
  }
  results.sort((a, b) => b.score - a.score);
  return results.slice(0, topK);
}

function cosineSimilarity(a, b) {
  let dot = 0, na = 0, nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

export default {
  VisionCell,
  PictureCell,
  VISION_KINDS,
  EXAMPLE_PHOTO_SHEET,
  searchSimilar,
};
