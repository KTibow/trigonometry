# /// script
# requires-python = ">=3.11"
# dependencies = ["pillow>=10"]
# ///
from __future__ import annotations

import colorsys
import tempfile
from pathlib import Path

from PIL import Image

from generate_icons import SIZE, angular_field

PURPLE_HUE_DEG = 260  # original -> m3 -> primary color -> hsl
OUT_DIR = Path(tempfile.gettempdir()) / "out"


def sample_favicon(u: float, v: float) -> tuple[int, int, int, int]:
    x = 2.0 * u - 1.0
    y = 2.0 * v - 1.0
    t = angular_field(x, y)

    h = (PURPLE_HUE_DEG % 360.0) / 360.0
    r, g, b = colorsys.hsv_to_rgb(h, 1.0, 1.0)
    a = round(255 * t)
    return round(255 * r), round(255 * g), round(255 * b), a


def render_favicon(size: int, sampler) -> Image.Image:
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    px = img.load()

    for j in range(size):
        v = (j + 0.5) / size
        for i in range(size):
            u = (i + 0.5) / size
            px[i, j] = sampler(u, v)

    return img


def main() -> None:
    OUT_DIR.mkdir(parents=True, exist_ok=True)

    favicon_path = OUT_DIR / "favicon_style.png"
    render_favicon(SIZE, sample_favicon).save(favicon_path)
    print(f"Wrote {favicon_path}")


if __name__ == "__main__":
    main()
