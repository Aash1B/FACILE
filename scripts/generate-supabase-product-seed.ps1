param(
    [string]$CsvPath = (Join-Path $PSScriptRoot '..\facile_151_mapped_products_inr.csv'),
    [string]$OutputPath = (Join-Path $PSScriptRoot '..\supabase_products_seed.sql')
)

$ErrorActionPreference = 'Stop'

function ConvertTo-SqlText {
    param([AllowNull()][string]$Value)

    if ($null -eq $Value) {
        return 'NULL'
    }

    return "'" + $Value.Replace("'", "''") + "'"
}

function ConvertTo-SqlNumber {
    param([string]$Value, [string]$ColumnName, [int]$RowNumber)

    $parsed = 0.0
    if (-not [double]::TryParse(
        $Value,
        [System.Globalization.NumberStyles]::Number,
        [System.Globalization.CultureInfo]::InvariantCulture,
        [ref]$parsed
    )) {
        throw "Invalid number in '$ColumnName' at CSV row ${RowNumber}: '$Value'"
    }

    return $parsed.ToString([System.Globalization.CultureInfo]::InvariantCulture)
}

$rows = @(Import-Csv -LiteralPath $CsvPath)
if ($rows.Count -eq 0) {
    throw "No product rows found in $CsvPath"
}

$requiredColumns = @(
    'product_id', 'product_name', 'brand', 'category', 'subcategory',
    'description', 'mrp_inr', 'selling_price_inr', 'rating', 'review_count', 'stock'
)
$actualColumns = @($rows[0].PSObject.Properties.Name)
$missingColumns = @($requiredColumns | Where-Object { $_ -notin $actualColumns })
if ($missingColumns.Count -gt 0) {
    throw "CSV is missing required columns: $($missingColumns -join ', ')"
}

$duplicateSourceIds = @($rows | Group-Object product_id | Where-Object Count -gt 1)
if ($duplicateSourceIds.Count -gt 0) {
    throw "CSV has duplicate product_id values: $($duplicateSourceIds.Name -join ', ')"
}

$values = for ($index = 0; $index -lt $rows.Count; $index++) {
    $row = $rows[$index]
    $csvRowNumber = $index + 2

    $sourceId = ConvertTo-SqlNumber $row.product_id 'product_id' $csvRowNumber
    $mrp = ConvertTo-SqlNumber $row.mrp_inr 'mrp_inr' $csvRowNumber
    $sellingPrice = ConvertTo-SqlNumber $row.selling_price_inr 'selling_price_inr' $csvRowNumber
    $rating = ConvertTo-SqlNumber $row.rating 'rating' $csvRowNumber
    $reviews = ConvertTo-SqlNumber $row.review_count 'review_count' $csvRowNumber
    $stock = ConvertTo-SqlNumber $row.stock 'stock' $csvRowNumber

    if ([decimal]$row.selling_price_inr -gt [decimal]$row.mrp_inr) {
        throw "selling_price_inr exceeds mrp_inr at CSV row $csvRowNumber"
    }

    "    ($sourceId, $(ConvertTo-SqlText $row.product_name), $(ConvertTo-SqlText $row.brand), " +
        "$(ConvertTo-SqlText $row.category), $(ConvertTo-SqlText $row.subcategory), " +
        "$(ConvertTo-SqlText $row.description), $mrp, $sellingPrice, $rating, $reviews, $stock)"
}

$sql = @"
-- Generated from facile_151_mapped_products_inr.csv.
-- Safe to rerun: products are matched by title + brand, and inventory by product_id.
-- CSV product_id is a source identifier only because values 1-5 and 15 already exist
-- in Supabase. Database product IDs are assigned by the products identity sequence.
-- CSV discount_percent is derived from prices; sku and slug have no destination columns.
-- image, color, size, delivery_days, seller_email stay NULL because the CSV has no values.

BEGIN;

CREATE TEMP TABLE facile_product_seed (
    source_product_id BIGINT PRIMARY KEY,
    title TEXT NOT NULL,
    brand TEXT NOT NULL,
    category_name TEXT NOT NULL,
    subcategory_name TEXT NOT NULL,
    description TEXT,
    mrp NUMERIC NOT NULL CHECK (mrp >= 0),
    selling_price NUMERIC NOT NULL CHECK (selling_price >= 0 AND selling_price <= mrp),
    rating DOUBLE PRECISION NOT NULL CHECK (rating BETWEEN 0 AND 5),
    reviews INTEGER NOT NULL CHECK (reviews >= 0),
    stock INTEGER NOT NULL CHECK (stock >= 0)
) ON COMMIT DROP;

INSERT INTO facile_product_seed (
    source_product_id, title, brand, category_name, subcategory_name,
    description, mrp, selling_price, rating, reviews, stock
)
VALUES
$($values -join ",`n");

-- All CSV categories currently exist, but this keeps the seed valid if one is removed.
INSERT INTO public.categories (name, description)
SELECT DISTINCT seed.category_name, 'Products in ' || seed.category_name
FROM facile_product_seed seed
WHERE NOT EXISTS (
    SELECT 1 FROM public.categories category WHERE category.name = seed.category_name
);

-- A subcategory name is resolved within its parent category.
INSERT INTO public.sub_categories (name, category_id)
SELECT DISTINCT seed.subcategory_name, category.id
FROM facile_product_seed seed
JOIN public.categories category ON category.name = seed.category_name
WHERE NOT EXISTS (
    SELECT 1
    FROM public.sub_categories subcategory
    WHERE subcategory.name = seed.subcategory_name
      AND subcategory.category_id = category.id
);

-- Do not use the CSV IDs: they collide with existing catalog product IDs.
INSERT INTO public.products (
    title, description, mrp, selling_price, image, category_id, sub_category_id,
    rating, reviews, brand, color, delivery_days, size, max_order_quantity, seller_email
)
SELECT
    seed.title,
    seed.description,
    seed.mrp,
    seed.selling_price,
    NULL,
    category.id,
    subcategory.id,
    seed.rating,
    seed.reviews,
    seed.brand,
    NULL,
    NULL,
    NULL,
    10,
    NULL
FROM facile_product_seed seed
JOIN public.categories category
  ON category.name = seed.category_name
JOIN public.sub_categories subcategory
  ON subcategory.name = seed.subcategory_name
 AND subcategory.category_id = category.id
WHERE NOT EXISTS (
    SELECT 1
    FROM public.products product
    WHERE product.title = seed.title
      AND COALESCE(product.brand, '') = seed.brand
);

-- Update mapped CSV fields on rerun, so a stopped or corrected import converges.
UPDATE public.products product
SET description = seed.description,
    mrp = seed.mrp,
    selling_price = seed.selling_price,
    rating = seed.rating,
    reviews = seed.reviews,
    category_id = category.id,
    sub_category_id = subcategory.id
FROM facile_product_seed seed
JOIN public.categories category
  ON category.name = seed.category_name
JOIN public.sub_categories subcategory
  ON subcategory.name = seed.subcategory_name
 AND subcategory.category_id = category.id
WHERE product.title = seed.title
  AND COALESCE(product.brand, '') = seed.brand;

INSERT INTO public.inventories (product_id, stock, sold)
SELECT product.id, seed.stock, 0
FROM facile_product_seed seed
JOIN public.products product
  ON product.title = seed.title
 AND COALESCE(product.brand, '') = seed.brand
ON CONFLICT (product_id) DO UPDATE SET stock = EXCLUDED.stock;

-- Keep identity sequences ahead of explicit IDs that may already exist.
SELECT setval(
    pg_get_serial_sequence('public.categories', 'id'),
    COALESCE((SELECT MAX(id) FROM public.categories), 1),
    true
);
SELECT setval(
    pg_get_serial_sequence('public.sub_categories', 'id'),
    COALESCE((SELECT MAX(id) FROM public.sub_categories), 1),
    true
);
SELECT setval(
    pg_get_serial_sequence('public.products', 'id'),
    COALESCE((SELECT MAX(id) FROM public.products), 1),
    true
);
SELECT setval(
    pg_get_serial_sequence('public.inventories', 'id'),
    COALESCE((SELECT MAX(id) FROM public.inventories), 1),
    true
);

DO `$facile_validation`$
DECLARE
    missing_products INTEGER;
    missing_inventory INTEGER;
BEGIN
    SELECT COUNT(*) INTO missing_products
    FROM facile_product_seed seed
    WHERE NOT EXISTS (
        SELECT 1 FROM public.products product
        WHERE product.title = seed.title
          AND COALESCE(product.brand, '') = seed.brand
    );

    SELECT COUNT(*) INTO missing_inventory
    FROM facile_product_seed seed
    WHERE NOT EXISTS (
        SELECT 1
        FROM public.products product
        JOIN public.inventories inventory ON inventory.product_id = product.id
        WHERE product.title = seed.title
          AND COALESCE(product.brand, '') = seed.brand
    );

    IF missing_products > 0 OR missing_inventory > 0 THEN
        RAISE EXCEPTION 'Seed validation failed: % products and % inventories missing',
            missing_products, missing_inventory;
    END IF;
END
`$facile_validation`$;

COMMIT;
"@

[System.IO.File]::WriteAllText(
    [System.IO.Path]::GetFullPath($OutputPath),
    $sql,
    [System.Text.UTF8Encoding]::new($false)
)

Write-Output "Generated $OutputPath with $($rows.Count) products."
