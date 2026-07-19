"use client";

import { useState, type SyntheticEvent } from "react";

type ProductImageProps = { src: string; alt: string; className?: string };

export default function ProductImage({ src, alt, className = "" }: ProductImageProps) {
  const [hasLightBackground, setHasLightBackground] = useState<boolean | null>(null);

  const inspectBackground = (event: SyntheticEvent<HTMLImageElement>) => {
    const image = event.currentTarget;
    try {
      const size = 24;
      const canvas = document.createElement("canvas");
      canvas.width = size;
      canvas.height = size;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) return setHasLightBackground(false);
      context.drawImage(image, 0, 0, size, size);
      const pixels = context.getImageData(0, 0, size, size).data;
      let edgePixels = 0;
      let lightPixels = 0;
      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          if (x > 2 && x < size - 3 && y > 2 && y < size - 3) continue;
          const index = (y * size + x) * 4;
          edgePixels++;
          if (pixels[index + 3] < 20 || (pixels[index] > 238 && pixels[index + 1] > 238 && pixels[index + 2] > 238)) lightPixels++;
        }
      }
      setHasLightBackground(lightPixels / edgePixels >= 0.62);
    } catch {
      setHasLightBackground(false);
    }
  };

  const displayClass = hasLightBackground === false ? "object-cover" : "object-contain p-3 mix-blend-multiply";
  return <img src={src} alt={alt} crossOrigin="anonymous" onLoad={inspectBackground} className={`h-full w-full ${displayClass} ${className}`} />;
}
