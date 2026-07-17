-- Product rating aggregates used in product listings.
ALTER TABLE public.products
    ADD COLUMN IF NOT EXISTS rating DOUBLE PRECISION NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS reviews INTEGER NOT NULL DEFAULT 0;

-- One review per signed-in customer and product. Submitting again updates it.
CREATE TABLE IF NOT EXISTS public.product_reviews (
    id BIGSERIAL PRIMARY KEY,
    product_id BIGINT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    user_id BIGINT,
    user_name VARCHAR(120) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    title VARCHAR(120),
    comment TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_product_review_user UNIQUE (product_id, user_email)
);

CREATE INDEX IF NOT EXISTS idx_product_reviews_product_id
    ON public.product_reviews(product_id);

-- Remove old seeded/demo aggregates and rebuild them from real review rows.
UPDATE public.products product
SET rating = COALESCE(review_summary.average_rating, 0),
    reviews = COALESCE(review_summary.review_count, 0)
FROM (
    SELECT products.id AS product_id,
           ROUND(AVG(product_reviews.rating)::numeric, 1)::double precision AS average_rating,
           COUNT(product_reviews.id)::integer AS review_count
    FROM public.products
    LEFT JOIN public.product_reviews ON product_reviews.product_id = products.id
    GROUP BY products.id
) review_summary
WHERE product.id = review_summary.product_id;
