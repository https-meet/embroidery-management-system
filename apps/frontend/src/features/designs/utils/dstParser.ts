/**
 * Tajima (.DST) Embroidery File Parser & Real-Time Canvas Renderer
 * Extracts stitch count, color count, dimensions (Inches & MM), and renders preview thumbnails without server storage.
 */

export interface DstMetadata {
  designName?: string;
  stitchCount: number;
  colorCount: number;
  widthMm: number;
  heightMm: number;
  widthInches: number;
  heightInches: number;
  previewDataUrl: string;
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

  let minX = 0;
  let maxX = 0;
  let minY = 0;
  let maxY = 0;

  const points: Array<{ x: number; y: number; type: 'stitch' | 'jump' | 'color' }> = [];

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

    // Decode Tajima 3-byte bitwise deltas
    if (b1 & 0x01) dx += 1;
    if (b1 & 0x02) dx -= 1;
    if (b1 & 0x04) dx += 9;
    if (b1 & 0x08) dx -= 9;
    if (b1 & 0x10) dy += 1;
    if (b1 & 0x20) dy -= 1;
    if (b1 & 0x40) dy += 9;
    if (b1 & 0x80) dy -= 9;

    if (b2 & 0x01) dx += 3;
    if (b2 & 0x02) dx -= 3;
    if (b2 & 0x04) dx += 27;
    if (b2 & 0x08) dx -= 27;
    if (b2 & 0x10) dy += 3;
    if (b2 & 0x20) dy -= 3;
    if (b2 & 0x40) dy += 27;
    if (b2 & 0x80) dy -= 27;

    if (b3 & 0x04) dx += 81;
    if (b3 & 0x08) dx -= 81;
    if (b3 & 0x40) dy += 81;
    if (b3 & 0x80) dy -= 81;

    currX += dx;
    currY += dy;

    if (currX < minX) minX = currX;
    if (currX > maxX) maxX = currX;
    if (currY < minY) minY = currY;
    if (currY > maxY) maxY = currY;

    let type: 'stitch' | 'jump' | 'color' = 'stitch';
    if ((b3 & 0xc0) === 0xc0) {
      type = 'color';
    } else if (b3 & 0x80 || b3 & 0x40) {
      type = 'jump';
    }

    points.push({ x: currX, y: currY, type });
  }

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
      // Dark slate background for rich contrast
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, canvasWidth, canvasHeight);

      // Calculate scale & offset
      const rangeX = maxX - minX || 1;
      const rangeY = maxY - minY || 1;
      const padding = 30;

      const scaleX = (canvasWidth - padding * 2) / rangeX;
      const scaleY = (canvasHeight - padding * 2) / rangeY;
      const scale = Math.min(scaleX, scaleY);

      const offsetX = (canvasWidth - rangeX * scale) / 2 - minX * scale;
      const offsetY = (canvasHeight - rangeY * scale) / 2 - minY * scale;

      // Color Palette for thread simulation
      const palette = ['#38bdf8', '#f43f5e', '#a855f7', '#eab308', '#10b981', '#f97316', '#ec4899'];
      let colorIndex = 0;

      ctx.lineWidth = 1.5;
      ctx.strokeStyle = palette[colorIndex % palette.length] || '#38bdf8';
      ctx.beginPath();

      for (let i = 0; i < points.length; i++) {
        const pt = points[i];
        if (!pt) continue;

        const px = pt.x * scale + offsetX;
        const py = canvasHeight - (pt.y * scale + offsetY); // Flip Y axis for screen space

        if (pt.type === 'color') {
          ctx.stroke();
          colorIndex++;
          ctx.strokeStyle = palette[colorIndex % palette.length] || '#38bdf8';
          ctx.beginPath();
          ctx.moveTo(px, py);
        } else if (pt.type === 'jump') {
          ctx.stroke();
          ctx.beginPath();
          ctx.moveTo(px, py);
        } else {
          ctx.lineTo(px, py);
        }
      }
      ctx.stroke();

      previewDataUrl = canvas.toDataURL('image/png');
    }
  }

  return {
    designName: nameVal,
    stitchCount: stVal || points.length,
    colorCount: coVal || 1,
    widthMm: widthMm || parseFloat(((maxX - minX) / 10).toFixed(1)),
    heightMm: heightMm || parseFloat(((maxY - minY) / 10).toFixed(1)),
    widthInches: widthInches || parseFloat((widthMm / 25.4).toFixed(2)),
    heightInches: heightInches || parseFloat((heightMm / 25.4).toFixed(2)),
    previewDataUrl,
  };
}
