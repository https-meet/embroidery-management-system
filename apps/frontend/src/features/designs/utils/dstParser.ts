/**
 * Tajima (.DST) Embroidery File Parser & Real-Time Canvas Renderer
 * Extracts stitch count, color count, dimensions (Inches & MM), and renders preview thumbnails without server storage.
 */

export const DEFAULT_THREAD_PALETTE = [
  '#2563EB', // Layer 1: Blue
  '#F59E0B', // Layer 2: Amber / Orange
  '#10B981', // Layer 3: Green
  '#8B5CF6', // Layer 4: Purple
  '#EF4444', // Layer 5: Red
  '#14B8A6', // Layer 6: Teal
  '#EC4899', // Layer 7: Pink
  '#6366F1', // Layer 8: Indigo
];

export interface DstStitchPoint {
  x: number;
  y: number;
  type: 'stitch' | 'jump' | 'color';
}

export interface DstLayer {
  layerIndex: number;
  defaultColor: string;
  points: DstStitchPoint[];
}

export interface DstMetadata {
  designName?: string;
  stitchCount: number;
  colorCount: number;
  widthMm: number;
  heightMm: number;
  widthInches: number;
  heightInches: number;
  previewDataUrl: string;
  minX?: number;
  maxX?: number;
  minY?: number;
  maxY?: number;
  rangeX?: number;
  rangeY?: number;
  points?: DstStitchPoint[];
  layers?: DstLayer[];
}

export function parseDstFile(arrayBuffer: ArrayBuffer): DstMetadata {
  const bytes = new Uint8Array(arrayBuffer);
  const headerText = new TextDecoder('ascii').decode(bytes.subarray(0, 512));

  const extractHeaderValue = (key: string): string | null => {
    const match = headerText.match(new RegExp(`${key}:\\s*([^\\r\\n]+)`));
    return match && match[1] ? match[1].trim() : null;
  };

  const nameVal = extractHeaderValue('LA') || 'Embroidery Design';
  const stVal = parseInt(extractHeaderValue('ST') || '0', 10);
  const coVal = parseInt(extractHeaderValue('CO') || '0', 10);
  const posX = parseInt(extractHeaderValue('\\+X') || '0', 10);
  const negX = parseInt(extractHeaderValue('-X') || '0', 10);
  const posY = parseInt(extractHeaderValue('\\+Y') || '0', 10);
  const negY = parseInt(extractHeaderValue('-Y') || '0', 10);

  // DST extents are in 0.1 mm units
  const widthMm = parseFloat(((posX + negX) / 10).toFixed(1));
  const heightMm = parseFloat(((posY + negY) / 10).toFixed(1));

  const widthInches = parseFloat((widthMm / 25.4).toFixed(2));
  const heightInches = parseFloat((heightMm / 25.4).toFixed(2));

  // Parse 3-byte stitch records starting at offset 512
  let currX = 0;
  let currY = 0;

  const points: DstStitchPoint[] = [];
  const layers: DstLayer[] = [];

  let currentLayerPoints: DstStitchPoint[] = [];
  let layerIndex = 0;

  for (let i = 512; i < bytes.length - 3; i += 3) {
    const b1 = bytes[i] ?? 0;
    const b2 = bytes[i + 1] ?? 0;
    const b3 = bytes[i + 2] ?? 0;

    if (b1 === 0xf3 && b2 === 0x0d && b3 === 0x00) {
      // End of DST file marker
      break;
    }

    let dx = 0;
    let dy = 0;

    // Decode Tajima 3-byte bitwise deltas per official Tajima specification
    // DX Deltas:
    if (b1 & 0x01) dx += 1;
    if (b1 & 0x02) dx -= 1;
    if (b2 & 0x01) dx += 3;
    if (b2 & 0x02) dx -= 3;
    if (b1 & 0x04) dx += 9;
    if (b1 & 0x08) dx -= 9;
    if (b2 & 0x04) dx += 27;
    if (b2 & 0x08) dx -= 27;
    if (b3 & 0x04) dx += 81;
    if (b3 & 0x08) dx -= 81;

    // DY Deltas (Tajima specification bit layout):
    if (b1 & 0x80) dy += 1;
    if (b1 & 0x40) dy -= 1;
    if (b2 & 0x80) dy += 3;
    if (b2 & 0x40) dy -= 3;
    if (b1 & 0x20) dy += 9;
    if (b1 & 0x10) dy -= 9;
    if (b2 & 0x20) dy += 27;
    if (b2 & 0x10) dy -= 27;
    if (b3 & 0x20) dy += 81;
    if (b3 & 0x10) dy -= 81;

    // Tajima specification Y-axis inversion
    dy = -dy;

    currX += dx;
    currY += dy;

    // PyEmbroidery-verified Tajima DST Command decoding
    // Bit 0 & Bit 1 in b3 are control flag markers (0x03)
    if ((b3 & 0xf3) === 0xf3) {
      // End of DST pattern marker
      break;
    }

    let type: 'stitch' | 'jump' | 'color' = 'stitch';

    if ((b3 & 0xc3) === 0xc3) {
      type = 'color';
    } else if ((b3 & 0x83) === 0x83 || (b3 & 0x43) === 0x43) {
      type = 'jump';
    } else {
      type = 'stitch';
    }

    const pt: DstStitchPoint = { x: currX, y: currY, type };
    points.push(pt);
    currentLayerPoints.push(pt);

    if (type === 'color') {
      layers.push({
        layerIndex,
        defaultColor: DEFAULT_THREAD_PALETTE[layerIndex % DEFAULT_THREAD_PALETTE.length] || '#2563EB',
        points: currentLayerPoints,
      });
      layerIndex++;
      currentLayerPoints = [];
    }
  }

  if (currentLayerPoints.length > 0) {
    layers.push({
      layerIndex,
      defaultColor: DEFAULT_THREAD_PALETTE[layerIndex % DEFAULT_THREAD_PALETTE.length] || '#2563EB',
      points: currentLayerPoints,
    });
  }

  // Step 3 — Compute design bounding box using ONLY actual stitched points (exclude frame jumps)
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;
  let hasStitches = false;

  for (let i = 0; i < points.length; i++) {
    const pt = points[i];
    if (pt && pt.type === 'stitch') {
      hasStitches = true;
      if (pt.x < minX) minX = pt.x;
      if (pt.x > maxX) maxX = pt.x;
      if (pt.y < minY) minY = pt.y;
      if (pt.y > maxY) maxY = pt.y;
    }
  }

  if (!hasStitches || minX === Infinity) {
    minX = 0;
    maxX = 100;
    minY = 0;
    maxY = 100;
  }

  const rangeX = maxX - minX || 1;
  const rangeY = maxY - minY || 1;

  // Render stitch thumbnail on an HTML5 canvas
  const canvasWidth = 400;
  const canvasHeight = 400;
  const canvas = typeof document !== 'undefined' ? document.createElement('canvas') : null;

  let previewDataUrl = '';

  if (canvas) {
    canvas.width = canvasWidth;
    canvas.height = canvasHeight;
    const ctx = canvas.getContext('2d');

    if (ctx) {
      // Dark slate background for professional embroidery contrast
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calculate scale & offset
      const padding = 30;
      const scaleX = (canvasWidth - padding * 2) / rangeX;
      const scaleY = (canvasHeight - padding * 2) / rangeY;
      const scale = Math.min(scaleX, scaleY);

      const offsetX = (canvasWidth - rangeX * scale) / 2 - minX * scale;
      const offsetY = (canvasHeight - rangeY * scale) / 2 - minY * scale;

      let colorIdx = 0;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = DEFAULT_THREAD_PALETTE[colorIdx % DEFAULT_THREAD_PALETTE.length] || '#2563EB';
      ctx.beginPath();
      let isPenDown = false;

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (!pt) continue;

        const px = (pt.x - minX) * scale + (canvasWidth - rangeX * scale) / 2;
        const py = (maxY - pt.y) * scale + (canvasHeight - rangeY * scale) / 2; // Inverted Y screen space

        if (pt.type === 'color') {
          if (isPenDown) ctx.stroke();
          colorIdx++;
          ctx.strokeStyle = DEFAULT_THREAD_PALETTE[colorIdx % DEFAULT_THREAD_PALETTE.length] || '#2563EB';
          ctx.beginPath();
          ctx.moveTo(px, py);
          isPenDown = false;
        } else if (pt.type === 'jump') {
          if (isPenDown) {
            ctx.stroke();
            ctx.beginPath();
          }
          ctx.moveTo(px, py);
          isPenDown = false;
        } else {
          if (!isPenDown) {
            ctx.moveTo(px, py);
            isPenDown = true;
          } else {
            ctx.lineTo(px, py);
          }
        }
      }
      if (isPenDown) {
        ctx.stroke();
      }

      previewDataUrl = canvas.toDataURL('image/png');
    }
  }

  return {
    designName: nameVal,
    stitchCount: stVal || points.length,
    colorCount: coVal || (layers.length > 0 ? layers.length : 1),
    widthMm: widthMm || parseFloat((rangeX / 10).toFixed(1)),
    heightMm: heightMm || parseFloat((rangeY / 10).toFixed(1)),
    widthInches: widthInches || parseFloat((widthMm / 25.4).toFixed(2)),
    heightInches: heightInches || parseFloat((heightMm / 25.4).toFixed(2)),
    previewDataUrl,
    minX,
    maxX,
    minY,
    maxY,
    rangeX,
    rangeY,
    points,
    layers,
  };
}
