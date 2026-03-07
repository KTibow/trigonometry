# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=10"]
# ///
from __future__ import annotations

import math
import tempfile
from pathlib import Path

from PIL import Image

SIZE = 1024
OUT_DIR = Path(tempfile.gettempdir()) / "out"


def angular_field(x: float, y: float) -> float:
    return 1.0 - abs(math.atan2(y, x)) / math.pi


def sample_original(u: float, v: float) -> tuple[int, int, int]:
    x = 2.0 * u - 1.0
    y = 2.0 * v - 1.0
    t = angular_field(x, y)

    r = round(127.5 * u)
    g = 0
    b = round(255.0 * t)
    return r, g, b


def render(size: int, sampler) -> Image.Image:
    img = Image.new("RGB", (size, size))
    px = img.load()

    for j in range(size):
        v = (j + 0.5) / size
        for i in range(size):
            u = (i + 0.5) / size
            px[i, j] = sampler(u, v)

    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    original_path = OUT_DIR / "original_style.png"
    render(SIZE, sample_original).save(original_path)
    print(f"Wrote {original_path}")


if __name__ == "__main__":
    main()
