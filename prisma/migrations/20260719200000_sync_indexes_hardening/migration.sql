-- Release 0.2.1: indexes for mobile incremental sync (updatedSince filters)

CREATE INDEX IF NOT EXISTS "products_company_id_updated_at_idx" ON "products"("company_id", "updated_at");
CREATE INDEX IF NOT EXISTS "inventories_company_id_updated_at_idx" ON "inventories"("company_id", "updated_at");
CREATE INDEX IF NOT EXISTS "suppliers_company_id_updated_at_idx" ON "suppliers"("company_id", "updated_at");
CREATE INDEX IF NOT EXISTS "customers_company_id_updated_at_idx" ON "customers"("company_id", "updated_at");
CREATE INDEX IF NOT EXISTS "purchases_company_id_updated_at_idx" ON "purchases"("company_id", "updated_at");
CREATE INDEX IF NOT EXISTS "sales_company_id_updated_at_idx" ON "sales"("company_id", "updated_at");
