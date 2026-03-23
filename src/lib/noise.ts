const gradBasis = [
  1, 1, 0, -1, 1, 0, 1, -1, 0, -1, -1, 0, 1, 0, 1, -1, 0, 1, 1, 0, -1, -1, 0, -1, 0, 1, 1, 0, -1, 1,
  0, 1, -1, 0, -1, -1,
];

const permutation = [
  23, 125, 161, 52, 103, 117, 70, 37, 247, 101, 203, 169, 124, 126, 44, 123, 152, 238, 145, 45, 171,
  114, 253, 10, 192, 136, 4, 157, 249, 30, 35, 72, 175, 63, 77, 90, 181, 16, 96, 111, 133, 104, 75,
  162, 93, 56, 66, 240, 8, 50, 84, 229, 49, 210, 173, 239, 141, 1, 87, 18, 2, 198, 143, 57, 225,
  160, 58, 217, 168, 206, 245, 204, 199, 6, 73, 60, 20, 230, 211, 233, 94, 200, 88, 9, 74, 155, 33,
  15, 219, 130, 226, 202, 83, 236, 42, 172, 165, 218, 55, 222, 46, 107, 98, 154, 109, 67, 196, 178,
  127, 158, 13, 243, 65, 79, 166, 248, 25, 224, 115, 80, 68, 51, 184, 128, 232, 208, 151, 122, 26,
  212, 105, 43, 179, 213, 235, 148, 146, 89, 14, 195, 28, 78, 112, 76, 250, 47, 24, 251, 140, 108,
  186, 190, 228, 170, 183, 139, 39, 188, 244, 246, 132, 48, 119, 144, 180, 138, 134, 193, 82, 182,
  120, 121, 86, 220, 209, 3, 91, 241, 149, 85, 205, 150, 113, 216, 31, 100, 41, 164, 177, 214, 153,
  231, 38, 71, 185, 174, 97, 201, 29, 95, 7, 92, 54, 254, 191, 118, 34, 221, 131, 11, 163, 99, 234,
  81, 227, 147, 156, 176, 17, 142, 69, 12, 110, 62, 27, 255, 0, 194, 59, 116, 242, 252, 19, 21, 187,
  53, 207, 129, 64, 135, 61, 40, 167, 237, 102, 223, 106, 159, 197, 189, 215, 137, 36, 32, 22, 5,
];

function initTables(tab: readonly number[], permTable: Uint8Array, gradTable: Float32Array) {
  const gradVectors = new Float32Array(12 * 3);
  for (let i = 0; i < 12; i++) {
    const v = i * 3;
    gradVectors[v] = gradBasis[v];
    gradVectors[v + 1] = gradBasis[v + 1];
    gradVectors[v + 2] = gradBasis[v + 2];
  }

  for (let i = 0; i < 256; i++) {
    permTable[i] = tab[i];
    permTable[i + 256] = tab[i];
  }

  let gradIdx = 0;
  for (let i = 0; i < permTable.length; i++) {
    const v = (permTable[i] % 12) * 3;
    gradTable[gradIdx++] = gradVectors[v];
    gradTable[gradIdx++] = gradVectors[v + 1];
    gradTable[gradIdx++] = gradVectors[v + 2];
  }
}

function createNoise(tab: readonly number[]) {
  const permTableSize = 512;
  const gradTableSize = permTableSize * 3;
  const permTableBytes = permTableSize;
  const gradTableBytes = gradTableSize * 4;
  const totalBytes = permTableBytes + gradTableBytes;

  const ab = new ArrayBuffer(totalBytes);
  const permTable = new Uint8Array(ab, 0, permTableSize);
  const gradTable = new Float32Array(ab, permTableSize + (permTableSize % 4), gradTableSize);
  initTables(tab, permTable, gradTable);

  const fadeConst = new Float32Array([6, 15, 10]);

  function fade(t: number) {
    const t2 = t * t;
    const t3 = t2 * t;
    return t3 * (t * (t * fadeConst[0] - fadeConst[1]) + fadeConst[2]);
  }

  function grad(hash: number, x: number, y: number, z: number) {
    return gradTable[hash] * x + gradTable[hash + 1] * y + gradTable[hash + 2] * z;
  }

  return function noise(x: number, y: number, z: number) {
    const px = Math.floor(x);
    const py = Math.floor(y);
    const pz = Math.floor(z);

    const fx = x - px;
    const fy = y - py;
    const fz = z - pz;

    const u = fade(fx);
    const v = fade(fy);
    const w = fade(fz);

    const r0 = permTable[px & 255];
    const r1 = permTable[(px + 1) & 255];

    const r00 = permTable[(r0 + py) & 255];
    const r01 = permTable[(r0 + py + 1) & 255];
    const r10 = permTable[(r1 + py) & 255];
    const r11 = permTable[(r1 + py + 1) & 255];

    const h000 = permTable[(r00 + pz) & 255] * 3;
    const h001 = permTable[(r00 + pz + 1) & 255] * 3;
    const h010 = permTable[(r01 + pz) & 255] * 3;
    const h011 = permTable[(r01 + pz + 1) & 255] * 3;
    const h100 = permTable[(r10 + pz) & 255] * 3;
    const h101 = permTable[(r10 + pz + 1) & 255] * 3;
    const h110 = permTable[(r11 + pz) & 255] * 3;
    const h111 = permTable[(r11 + pz + 1) & 255] * 3;

    const n000 = grad(h000, fx, fy, fz);
    const n001 = grad(h001, fx, fy, fz - 1);
    const n010 = grad(h010, fx, fy - 1, fz);
    const n011 = grad(h011, fx, fy - 1, fz - 1);
    const n100 = grad(h100, fx - 1, fy, fz);
    const n101 = grad(h101, fx - 1, fy, fz - 1);
    const n110 = grad(h110, fx - 1, fy - 1, fz);
    const n111 = grad(h111, fx - 1, fy - 1, fz - 1);

    const n00 = n000 + w * (n001 - n000);
    const n01 = n010 + w * (n011 - n010);
    const n10 = n100 + w * (n101 - n100);
    const n11 = n110 + w * (n111 - n110);

    const n0 = n00 + v * (n01 - n00);
    const n1 = n10 + v * (n11 - n10);

    return n0 + u * (n1 - n0);
  };
}

const noise = createNoise(permutation);

function readRgbChannels(value: string): [number, number, number] {
  const channels =
    value
      .match(/\d+(?:\.\d+)?/g)
      ?.slice(0, 3)
      .map(Number) ?? [];
  return [channels[0] ?? 0, channels[1] ?? 0, channels[2] ?? 0];
}

type NoiseActionOptions = {
  chunkSize?: number;
  scaling?: number;
};

export function attachNoise(options: NoiseActionOptions = {}) {
  const chunkSize = Math.max(1, Math.round(options.chunkSize ?? 6));
  const scaling = options.scaling ?? 0.05;

  return (node: HTMLCanvasElement) => {
    const ctx = node.getContext('2d');
    if (!ctx) return;

    const computedStyle = getComputedStyle(node);
    const [bg1, bg2, bg3] = readRgbChannels(computedStyle.getPropertyValue('background-color'));
    const [fg1, fg2, fg3] = readRgbChannels(computedStyle.getPropertyValue('color'));

    let z = Math.random() * 1000;
    let lastRenderTime = performance.now();
    let frame = 0;

    const resize = () => {
      const width = Math.max(1, Math.round(node.clientWidth));
      const height = Math.max(1, Math.round(node.clientHeight));

      if (node.width !== width) node.width = width;
      if (node.height !== height) node.height = height;
    };

    const renderNoise = () => {
      const numChunksX = Math.ceil(node.width / chunkSize);
      const numChunksY = Math.ceil(node.height / chunkSize);
      const pixels = ctx.createImageData(node.width, node.height);

      for (let x = 0; x < numChunksX; x++) {
        let noiseTop = noise(x * chunkSize * scaling, -chunkSize * scaling, z);
        for (let y = 0; y < numChunksY; y++) {
          const value = noise(x * chunkSize * scaling, y * chunkSize * scaling, z);
          const maxFx = Math.min(chunkSize, node.width - x * chunkSize);
          const maxFy = Math.min(chunkSize, node.height - y * chunkSize);

          for (let fy = 0; fy < maxFy; fy++) {
            const valueFactor = fy / chunkSize;
            let factor = noiseTop + (value - noiseTop) * valueFactor;
            factor += 0.5;

            const color1 = bg1 + (fg1 - bg1) * factor;
            const color2 = bg2 + (fg2 - bg2) * factor;
            const color3 = bg3 + (fg3 - bg3) * factor;

            for (let fx = 0; fx < maxFx; fx++) {
              const index = (y * chunkSize + fy) * 4 * node.width + (x * chunkSize + fx) * 4;
              pixels.data[index] = color1;
              pixels.data[index + 1] = color2;
              pixels.data[index + 2] = color3;
              pixels.data[index + 3] = 255;
            }
          }

          noiseTop = value;
        }
      }

      ctx.putImageData(pixels, 0, 0);
    };

    const render = (now: number) => {
      z += ((now - lastRenderTime) / 1000) * 2;
      lastRenderTime = now;

      renderNoise();
      frame = requestAnimationFrame(render);
    };

    const observer = new ResizeObserver(() => {
      resize();
    });

    observer.observe(node);
    resize();
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      observer.disconnect();
    };
  };
}
