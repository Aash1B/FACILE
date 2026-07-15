@echo off
set PGPASSWORD=Dhoomchutads@2026
echo ====================================================================
echo             FACILE CLOUD (SUPABASE) DATABASE TABLES VIEW
echo ====================================================================
echo.
echo ----------------------- 1. CATEGORIES TABLE -----------------------
docker exec -i postgres psql -h db.vvakqdswljajctulrdrb.supabase.co -U postgres -d postgres -c "SELECT * FROM categories;"
echo.
echo --------------------- 2. SUBCATEGORIES TABLE ----------------------
docker exec -i postgres psql -h db.vvakqdswljajctulrdrb.supabase.co -U postgres -d postgres -c "SELECT * FROM sub_categories;"
echo.
echo ------------------------ 3. PRODUCTS TABLE ------------------------
docker exec -i postgres psql -h db.vvakqdswljajctulrdrb.supabase.co -U postgres -d postgres -c "SELECT id, title, mrp, selling_price, category_id, sub_category_id FROM products;"
echo.
echo ----------------------- 4. INVENTORIES TABLE ----------------------
docker exec -i postgres psql -h db.vvakqdswljajctulrdrb.supabase.co -U postgres -d postgres -c "SELECT * FROM inventories;"
echo.
echo ====================================================================
pause
