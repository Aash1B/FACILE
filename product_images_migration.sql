CREATE TABLE IF NOT EXISTS public.product_images (
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    image_url VARCHAR(1000) NOT NULL,
    display_order INTEGER NOT NULL,
    PRIMARY KEY (product_id, display_order)
);

CREATE INDEX IF NOT EXISTS idx_product_images_product_id
    ON public.product_images(product_id);
