-- Release 0.2.0 — Enterprise Business Core

-- CreateEnum
CREATE TYPE "CustomerType" AS ENUM ('WALK_IN', 'RETAIL', 'WHOLESALE');

-- CreateEnum
CREATE TYPE "AttributeDataType" AS ENUM ('TEXT', 'NUMBER', 'BOOLEAN', 'SELECT');

-- CreateEnum
CREATE TYPE "StockMovementType" AS ENUM ('OPENING', 'PURCHASE', 'PURCHASE_RETURN', 'SALE', 'SALE_RETURN', 'ADJUSTMENT', 'TRANSFER_IN', 'TRANSFER_OUT');

-- CreateEnum
CREATE TYPE "PurchaseStatus" AS ENUM ('DRAFT', 'ORDERED', 'PARTIAL', 'RECEIVED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PurchaseReturnStatus" AS ENUM ('DRAFT', 'COMPLETED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "SaleStatus" AS ENUM ('DRAFT', 'HELD', 'COMPLETED', 'CANCELLED', 'RETURNED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('CASH', 'CARD', 'UPI', 'CREDIT', 'OTHER');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentTarget" AS ENUM ('SALE', 'PURCHASE');

-- CreateTable
CREATE TABLE "product_categories" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "parent_id" UUID,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "image_url" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_attributes" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "data_type" "AttributeDataType" NOT NULL DEFAULT 'TEXT',
    "options" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_attributes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "name" VARCHAR(100) NOT NULL,
    "code" VARCHAR(30) NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "is_base" BOOLEAN NOT NULL DEFAULT false,
    "conversion_factor" DECIMAL(18,6) NOT NULL DEFAULT 1,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tax_masters" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "hsn_sac" VARCHAR(20),
    "rate" DECIMAL(8,4) NOT NULL,
    "cgst_rate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "sgst_rate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "igst_rate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "tax_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "suppliers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "contact_person" VARCHAR(150),
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "gstin" VARCHAR(20),
    "pan" VARCHAR(20),
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pincode" VARCHAR(20),
    "payment_terms" VARCHAR(200),
    "outstanding_balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" VARCHAR(1000),

    CONSTRAINT "suppliers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_groups" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "name" VARCHAR(150) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "description" VARCHAR(500),
    "discount_percent" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "price_list_type" VARCHAR(30) NOT NULL DEFAULT 'RETAIL',
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "customer_groups_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "name" VARCHAR(200) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "customer_type" "CustomerType" NOT NULL DEFAULT 'RETAIL',
    "customer_group_id" UUID,
    "email" VARCHAR(255),
    "phone" VARCHAR(30),
    "gstin" VARCHAR(20),
    "address" VARCHAR(500),
    "city" VARCHAR(100),
    "state" VARCHAR(100),
    "pincode" VARCHAR(20),
    "credit_limit" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "outstanding_balance" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "loyalty_points" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "loyalty_ready" BOOLEAN NOT NULL DEFAULT true,
    "is_walk_in" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "notes" VARCHAR(1000),

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "name" VARCHAR(255) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "barcode" VARCHAR(100),
    "qr_code" VARCHAR(255),
    "description" VARCHAR(2000),
    "category_id" UUID,
    "tax_master_id" UUID,
    "supplier_id" UUID,
    "base_unit_id" UUID,
    "brand" VARCHAR(150),
    "manufacturer" VARCHAR(150),
    "purchase_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "mrp" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "selling_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "wholesale_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "image_url" VARCHAR(500),
    "thumbnail_url" VARCHAR(500),
    "minimum_stock" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "maximum_stock" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reorder_level" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "expiry_enabled" BOOLEAN NOT NULL DEFAULT false,
    "batch_enabled" BOOLEAN NOT NULL DEFAULT false,
    "serial_number_enabled" BOOLEAN NOT NULL DEFAULT false,
    "track_inventory" BOOLEAN NOT NULL DEFAULT true,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "search_keywords" VARCHAR(1000),
    "attributes" JSONB,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_variants" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "product_id" UUID NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "sku" VARCHAR(100) NOT NULL,
    "barcode" VARCHAR(100),
    "qr_code" VARCHAR(255),
    "purchase_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "mrp" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "selling_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "wholesale_price" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "image_url" VARCHAR(500),
    "thumbnail_url" VARCHAR(500),
    "attribute_values" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_variants_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "product_units" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "product_id" UUID NOT NULL,
    "unit_id" UUID NOT NULL,
    "conversion_factor" DECIMAL(18,6) NOT NULL DEFAULT 1,
    "selling_price" DECIMAL(18,4),
    "barcode" VARCHAR(100),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "product_units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inventories" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "stock_key" VARCHAR(255) NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reserved_qty" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "average_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "batch_number" VARCHAR(100),
    "serial_number" VARCHAR(100),
    "expiry_date" DATE,
    "last_movement_at" TIMESTAMPTZ(3),

    CONSTRAINT "inventories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stock_movements" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "movement_type" "StockMovementType" NOT NULL,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "reference_type" VARCHAR(50),
    "reference_id" UUID,
    "batch_number" VARCHAR(100),
    "serial_number" VARCHAR(100),
    "notes" VARCHAR(1000),
    "occurred_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "opening_stocks" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_cost" DECIMAL(18,4) NOT NULL DEFAULT 0,
    "batch_number" VARCHAR(100),
    "serial_number" VARCHAR(100),
    "expiry_date" DATE,
    "notes" VARCHAR(1000),
    "stocked_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_posted" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "opening_stocks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchases" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "supplier_id" UUID NOT NULL,
    "invoice_number" VARCHAR(100) NOT NULL,
    "invoice_date" DATE NOT NULL,
    "status" "PurchaseStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "notes" VARCHAR(1000),
    "received_at" TIMESTAMPTZ(3),

    CONSTRAINT "purchases_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_items" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "purchase_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "unit_id" UUID,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "discount_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "batch_number" VARCHAR(100),
    "serial_number" VARCHAR(100),
    "expiry_date" DATE,

    CONSTRAINT "purchase_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "purchase_returns" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "purchase_id" UUID NOT NULL,
    "return_number" VARCHAR(100) NOT NULL,
    "status" "PurchaseReturnStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "reason" VARCHAR(1000),
    "returned_at" TIMESTAMPTZ(3),
    "items" JSONB NOT NULL,

    CONSTRAINT "purchase_returns_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sales" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "customer_id" UUID,
    "bill_number" VARCHAR(100) NOT NULL,
    "status" "SaleStatus" NOT NULL DEFAULT 'DRAFT',
    "subtotal" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "discount_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "total_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "paid_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "notes" VARCHAR(1000),
    "held_at" TIMESTAMPTZ(3),
    "completed_at" TIMESTAMPTZ(3),

    CONSTRAINT "sales_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sale_items" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "sale_id" UUID NOT NULL,
    "product_id" UUID NOT NULL,
    "variant_id" UUID,
    "unit_id" UUID,
    "quantity" DECIMAL(18,4) NOT NULL,
    "unit_price" DECIMAL(18,4) NOT NULL,
    "discount_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "tax_rate" DECIMAL(8,4) NOT NULL DEFAULT 0,
    "tax_amount" DECIMAL(18,2) NOT NULL DEFAULT 0,
    "line_total" DECIMAL(18,2) NOT NULL DEFAULT 0,

    CONSTRAINT "sale_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hold_bills" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "sale_id" UUID NOT NULL,
    "customer_id" UUID,
    "hold_number" VARCHAR(100) NOT NULL,
    "reference_note" VARCHAR(255),
    "held_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMPTZ(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "hold_bills_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "target_type" "PaymentTarget" NOT NULL,
    "sale_id" UUID,
    "purchase_id" UUID,
    "method" "PaymentMethod" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'COMPLETED',
    "amount" DECIMAL(18,2) NOT NULL,
    "reference_no" VARCHAR(100),
    "paid_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "notes" VARCHAR(500),

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_settings" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "key" VARCHAR(100) NOT NULL,
    "value" JSONB NOT NULL,
    "description" VARCHAR(500),
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "business_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "receipt_settings" (
    "id" UUID NOT NULL,
    "company_id" UUID NOT NULL,
    "branch_id" UUID NOT NULL,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL,
    "deleted_at" TIMESTAMPTZ(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_by" UUID,
    "updated_by" UUID,
    "header_text" VARCHAR(500),
    "footer_text" VARCHAR(500),
    "show_logo" BOOLEAN NOT NULL DEFAULT true,
    "logo_url" VARCHAR(500),
    "show_gstin" BOOLEAN NOT NULL DEFAULT true,
    "show_address" BOOLEAN NOT NULL DEFAULT true,
    "show_customer_info" BOOLEAN NOT NULL DEFAULT true,
    "paper_width_mm" INTEGER NOT NULL DEFAULT 80,
    "copies" INTEGER NOT NULL DEFAULT 1,
    "extra_settings" JSONB,
    "is_active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "receipt_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "product_categories_company_id_branch_id_deleted_at_idx" ON "product_categories"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "product_categories_company_id_parent_id_idx" ON "product_categories"("company_id", "parent_id");

-- CreateIndex
CREATE INDEX "product_categories_company_id_is_active_idx" ON "product_categories"("company_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "product_categories_company_id_code_key" ON "product_categories"("company_id", "code");

-- CreateIndex
CREATE INDEX "product_attributes_company_id_branch_id_deleted_at_idx" ON "product_attributes"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "product_attributes_company_id_is_active_idx" ON "product_attributes"("company_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "product_attributes_company_id_code_key" ON "product_attributes"("company_id", "code");

-- CreateIndex
CREATE INDEX "units_company_id_branch_id_deleted_at_idx" ON "units"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "units_company_id_is_active_idx" ON "units"("company_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "units_company_id_code_key" ON "units"("company_id", "code");

-- CreateIndex
CREATE INDEX "tax_masters_company_id_branch_id_deleted_at_idx" ON "tax_masters"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "tax_masters_company_id_is_active_idx" ON "tax_masters"("company_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "tax_masters_company_id_code_key" ON "tax_masters"("company_id", "code");

-- CreateIndex
CREATE INDEX "suppliers_company_id_branch_id_deleted_at_idx" ON "suppliers"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "suppliers_company_id_is_active_idx" ON "suppliers"("company_id", "is_active");

-- CreateIndex
CREATE INDEX "suppliers_company_id_gstin_idx" ON "suppliers"("company_id", "gstin");

-- CreateIndex
CREATE UNIQUE INDEX "suppliers_company_id_code_key" ON "suppliers"("company_id", "code");

-- CreateIndex
CREATE INDEX "customer_groups_company_id_branch_id_deleted_at_idx" ON "customer_groups"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "customer_groups_company_id_is_active_idx" ON "customer_groups"("company_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "customer_groups_company_id_code_key" ON "customer_groups"("company_id", "code");

-- CreateIndex
CREATE INDEX "customers_company_id_branch_id_deleted_at_idx" ON "customers"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "customers_company_id_customer_type_idx" ON "customers"("company_id", "customer_type");

-- CreateIndex
CREATE INDEX "customers_company_id_phone_idx" ON "customers"("company_id", "phone");

-- CreateIndex
CREATE INDEX "customers_company_id_is_active_idx" ON "customers"("company_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "customers_company_id_code_key" ON "customers"("company_id", "code");

-- CreateIndex
CREATE INDEX "products_company_id_branch_id_deleted_at_idx" ON "products"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "products_company_id_barcode_idx" ON "products"("company_id", "barcode");

-- CreateIndex
CREATE INDEX "products_company_id_category_id_idx" ON "products"("company_id", "category_id");

-- CreateIndex
CREATE INDEX "products_company_id_is_active_idx" ON "products"("company_id", "is_active");

-- CreateIndex
CREATE INDEX "products_company_id_brand_idx" ON "products"("company_id", "brand");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_sku_key" ON "products"("company_id", "sku");

-- CreateIndex
CREATE UNIQUE INDEX "products_company_id_code_key" ON "products"("company_id", "code");

-- CreateIndex
CREATE INDEX "product_variants_company_id_product_id_deleted_at_idx" ON "product_variants"("company_id", "product_id", "deleted_at");

-- CreateIndex
CREATE INDEX "product_variants_company_id_barcode_idx" ON "product_variants"("company_id", "barcode");

-- CreateIndex
CREATE INDEX "product_variants_company_id_is_active_idx" ON "product_variants"("company_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "product_variants_company_id_sku_key" ON "product_variants"("company_id", "sku");

-- CreateIndex
CREATE INDEX "product_units_company_id_product_id_deleted_at_idx" ON "product_units"("company_id", "product_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "product_units_company_id_product_id_unit_id_key" ON "product_units"("company_id", "product_id", "unit_id");

-- CreateIndex
CREATE INDEX "inventories_company_id_branch_id_deleted_at_idx" ON "inventories"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "inventories_company_id_product_id_idx" ON "inventories"("company_id", "product_id");

-- CreateIndex
CREATE INDEX "inventories_company_id_quantity_idx" ON "inventories"("company_id", "quantity");

-- CreateIndex
CREATE UNIQUE INDEX "inventories_company_id_branch_id_stock_key_key" ON "inventories"("company_id", "branch_id", "stock_key");

-- CreateIndex
CREATE INDEX "stock_movements_company_id_branch_id_deleted_at_idx" ON "stock_movements"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "stock_movements_company_id_product_id_occurred_at_idx" ON "stock_movements"("company_id", "product_id", "occurred_at");

-- CreateIndex
CREATE INDEX "stock_movements_company_id_movement_type_idx" ON "stock_movements"("company_id", "movement_type");

-- CreateIndex
CREATE INDEX "stock_movements_company_id_reference_type_reference_id_idx" ON "stock_movements"("company_id", "reference_type", "reference_id");

-- CreateIndex
CREATE INDEX "opening_stocks_company_id_branch_id_deleted_at_idx" ON "opening_stocks"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "opening_stocks_company_id_product_id_idx" ON "opening_stocks"("company_id", "product_id");

-- CreateIndex
CREATE INDEX "opening_stocks_company_id_is_posted_idx" ON "opening_stocks"("company_id", "is_posted");

-- CreateIndex
CREATE INDEX "purchases_company_id_branch_id_deleted_at_idx" ON "purchases"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "purchases_company_id_supplier_id_idx" ON "purchases"("company_id", "supplier_id");

-- CreateIndex
CREATE INDEX "purchases_company_id_status_idx" ON "purchases"("company_id", "status");

-- CreateIndex
CREATE INDEX "purchases_company_id_invoice_date_idx" ON "purchases"("company_id", "invoice_date");

-- CreateIndex
CREATE UNIQUE INDEX "purchases_company_id_invoice_number_key" ON "purchases"("company_id", "invoice_number");

-- CreateIndex
CREATE INDEX "purchase_items_company_id_purchase_id_deleted_at_idx" ON "purchase_items"("company_id", "purchase_id", "deleted_at");

-- CreateIndex
CREATE INDEX "purchase_items_company_id_product_id_idx" ON "purchase_items"("company_id", "product_id");

-- CreateIndex
CREATE INDEX "purchase_returns_company_id_branch_id_deleted_at_idx" ON "purchase_returns"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "purchase_returns_company_id_purchase_id_idx" ON "purchase_returns"("company_id", "purchase_id");

-- CreateIndex
CREATE INDEX "purchase_returns_company_id_status_idx" ON "purchase_returns"("company_id", "status");

-- CreateIndex
CREATE UNIQUE INDEX "purchase_returns_company_id_return_number_key" ON "purchase_returns"("company_id", "return_number");

-- CreateIndex
CREATE INDEX "sales_company_id_branch_id_deleted_at_idx" ON "sales"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "sales_company_id_customer_id_idx" ON "sales"("company_id", "customer_id");

-- CreateIndex
CREATE INDEX "sales_company_id_status_idx" ON "sales"("company_id", "status");

-- CreateIndex
CREATE INDEX "sales_company_id_created_at_idx" ON "sales"("company_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "sales_company_id_bill_number_key" ON "sales"("company_id", "bill_number");

-- CreateIndex
CREATE INDEX "sale_items_company_id_sale_id_deleted_at_idx" ON "sale_items"("company_id", "sale_id", "deleted_at");

-- CreateIndex
CREATE INDEX "sale_items_company_id_product_id_idx" ON "sale_items"("company_id", "product_id");

-- CreateIndex
CREATE UNIQUE INDEX "hold_bills_sale_id_key" ON "hold_bills"("sale_id");

-- CreateIndex
CREATE INDEX "hold_bills_company_id_branch_id_deleted_at_idx" ON "hold_bills"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "hold_bills_company_id_is_active_idx" ON "hold_bills"("company_id", "is_active");

-- CreateIndex
CREATE UNIQUE INDEX "hold_bills_company_id_hold_number_key" ON "hold_bills"("company_id", "hold_number");

-- CreateIndex
CREATE INDEX "payments_company_id_branch_id_deleted_at_idx" ON "payments"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE INDEX "payments_company_id_sale_id_idx" ON "payments"("company_id", "sale_id");

-- CreateIndex
CREATE INDEX "payments_company_id_purchase_id_idx" ON "payments"("company_id", "purchase_id");

-- CreateIndex
CREATE INDEX "payments_company_id_method_paid_at_idx" ON "payments"("company_id", "method", "paid_at");

-- CreateIndex
CREATE INDEX "business_settings_company_id_branch_id_deleted_at_idx" ON "business_settings"("company_id", "branch_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "business_settings_company_id_branch_id_key_key" ON "business_settings"("company_id", "branch_id", "key");

-- CreateIndex
CREATE INDEX "receipt_settings_company_id_deleted_at_idx" ON "receipt_settings"("company_id", "deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "receipt_settings_company_id_branch_id_key" ON "receipt_settings"("company_id", "branch_id");

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_categories" ADD CONSTRAINT "product_categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_attributes" ADD CONSTRAINT "product_attributes_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_masters" ADD CONSTRAINT "tax_masters_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tax_masters" ADD CONSTRAINT "tax_masters_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "suppliers" ADD CONSTRAINT "suppliers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_groups" ADD CONSTRAINT "customer_groups_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customer_groups" ADD CONSTRAINT "customer_groups_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_customer_group_id_fkey" FOREIGN KEY ("customer_group_id") REFERENCES "customer_groups"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_tax_master_id_fkey" FOREIGN KEY ("tax_master_id") REFERENCES "tax_masters"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "products" ADD CONSTRAINT "products_base_unit_id_fkey" FOREIGN KEY ("base_unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_variants" ADD CONSTRAINT "product_variants_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "product_units" ADD CONSTRAINT "product_units_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventories" ADD CONSTRAINT "inventories_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stock_movements" ADD CONSTRAINT "stock_movements_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_stocks" ADD CONSTRAINT "opening_stocks_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_stocks" ADD CONSTRAINT "opening_stocks_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_stocks" ADD CONSTRAINT "opening_stocks_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "opening_stocks" ADD CONSTRAINT "opening_stocks_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchases" ADD CONSTRAINT "purchases_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "suppliers"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_items" ADD CONSTRAINT "purchase_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "purchase_returns" ADD CONSTRAINT "purchase_returns_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sales" ADD CONSTRAINT "sales_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_variant_id_fkey" FOREIGN KEY ("variant_id") REFERENCES "product_variants"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sale_items" ADD CONSTRAINT "sale_items_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hold_bills" ADD CONSTRAINT "hold_bills_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hold_bills" ADD CONSTRAINT "hold_bills_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hold_bills" ADD CONSTRAINT "hold_bills_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hold_bills" ADD CONSTRAINT "hold_bills_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_sale_id_fkey" FOREIGN KEY ("sale_id") REFERENCES "sales"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_purchase_id_fkey" FOREIGN KEY ("purchase_id") REFERENCES "purchases"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_settings" ADD CONSTRAINT "business_settings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_settings" ADD CONSTRAINT "receipt_settings_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "receipt_settings" ADD CONSTRAINT "receipt_settings_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
