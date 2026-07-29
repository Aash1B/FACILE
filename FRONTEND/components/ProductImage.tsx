"use client";

import { useState, type SyntheticEvent } from "react";

type ProductImageProps = {
    src: string;
    alt: string;
    className?: string;
};

export default function ProductImage({
    src,
    alt,
    className = "",
}: ProductImageProps) {
    const [hasLightBackground, setHasLightBackground] = useState(true);

    const inspectBackground = (event: SyntheticEvent<HTMLImageElement>) => {
        const image = event.currentTarget;

        try {
            const size = 32;
            const canvas = document.createElement("canvas");
            canvas.width = size;
            canvas.height = size;
            const context = canvas.getContext("2d", { willReadFrequently: true });
            if (!context) return;

            context.drawImage(image, 0, 0, size, size);
            const pixels = context.getImageData(0, 0, size, size).data;
            let edgePixels = 0;
            let lightNeutralPixels = 0;

            for (let y = 0; y < size; y++) {
                for (let x = 0; x < size; x++) {
                    if (x > 3 && x < size - 4 && y > 3 && y < size - 4) continue;

                    const index = (y * size + x) * 4;
                    const red = pixels[index];
                    const green = pixels[index + 1];
                    const blue = pixels[index + 2];
                    const alpha = pixels[index + 3];
                    const brightness = (red + green + blue) / 3;
                    const colorRange = Math.max(red, green, blue) - Math.min(red, green, blue);

                    edgePixels++;
                    if (alpha < 20 || (brightness >= 210 && colorRange <= 40)) {
                        lightNeutralPixels++;
                    }
                }
            }

            setHasLightBackground(lightNeutralPixels / edgePixels >= 0.55);
        } catch {
            // External hosts without canvas access use the safe, uncropped layout.
            setHasLightBackground(true);
        }
    };

    return (
        <img
            src={src}
            alt={alt}
            crossOrigin="anonymous"
            onLoad={inspectBackground}
            className={`h-full w-full object-center ${
                hasLightBackground
                    ? "object-contain p-3 mix-blend-multiply"
                    : "object-cover"
            } ${className}`}
        />
    );
}
