import type { Router } from 'express';
import type { AppContainer } from '../container';
import { authenticate } from '../middleware/authenticate';
import { requirePermissions } from '../middleware/authorize';
import { validate } from '../middleware/validate';
import { asyncHandler } from '../utils/asyncHandler';

import { productCategoryListQuerySchema, createProductCategorySchema, updateProductCategorySchema } from '../validators/productCategory.schemas';
import { productAttributeListQuerySchema, createProductAttributeSchema, updateProductAttributeSchema } from '../validators/productAttribute.schemas';
import { unitListQuerySchema, createUnitSchema, updateUnitSchema } from '../validators/unit.schemas';
import { taxMasterListQuerySchema, createTaxMasterSchema, updateTaxMasterSchema } from '../validators/taxMaster.schemas';
import { supplierListQuerySchema, createSupplierSchema, updateSupplierSchema } from '../validators/supplier.schemas';
import { customerGroupListQuerySchema, createCustomerGroupSchema, updateCustomerGroupSchema } from '../validators/customerGroup.schemas';
import { customerListQuerySchema, createCustomerSchema, updateCustomerSchema } from '../validators/customer.schemas';
import { createProductSchema, updateProductSchema, productListQuerySchema } from '../validators/product.schemas';
import { createProductVariantSchema, updateProductVariantSchema, productVariantListQuerySchema } from '../validators/productVariant.schemas';
import { inventoryListQuerySchema, adjustStockSchema } from '../validators/inventory.schemas';
import { stockMovementListQuerySchema, createStockMovementSchema } from '../validators/stockMovement.schemas';
import { openingStockListQuerySchema, createOpeningStockSchema } from '../validators/openingStock.schemas';
import { purchaseListQuerySchema, createPurchaseSchema, updatePurchaseSchema } from '../validators/purchase.schemas';
import { purchaseReturnListQuerySchema, createPurchaseReturnSchema, updatePurchaseReturnSchema } from '../validators/purchaseReturn.schemas';
import { saleListQuerySchema, createSaleSchema, updateSaleSchema } from '../validators/sale.schemas';
import { holdBillListQuerySchema, createHoldBillSchema } from '../validators/holdBill.schemas';
import { paymentListQuerySchema, createPaymentSchema } from '../validators/payment.schemas';
import { businessSettingListQuerySchema, createBusinessSettingSchema, updateBusinessSettingSchema } from '../validators/businessSetting.schemas';
import { upsertReceiptSettingSchema } from '../validators/receiptSetting.schemas';
import { idParamSchema, branchIdQuerySchema } from '../validators/common.schemas';
import { z } from 'zod';

const resumeHoldSchema = z.object({
  payments: z
    .array(
      z.object({
        method: z.enum(['CASH', 'CARD', 'UPI', 'CREDIT', 'OTHER']),
        amount: z.coerce.number().positive(),
        referenceNo: z.string().max(100).optional(),
        notes: z.string().max(500).optional(),
      }),
    )
    .min(1),
});

const completeSaleSchema = z.object({
  payments: z
    .array(
      z.object({
        method: z.enum(['CASH', 'CARD', 'UPI', 'CREDIT', 'OTHER']),
        amount: z.coerce.number().positive(),
        referenceNo: z.string().max(100).optional(),
        notes: z.string().max(500).optional(),
      }),
    )
    .optional(),
});

export function registerBusinessRoutes(router: Router, container: AppContainer): void {
  const c = container;

  // Product Categories
  router.get('/product-categories', authenticate, requirePermissions('catalog.view'), validate(productCategoryListQuerySchema, 'query'), asyncHandler(c.productCategoryController.list));
  router.get('/product-categories/:id', authenticate, requirePermissions('catalog.view'), validate(idParamSchema, 'params'), asyncHandler(c.productCategoryController.getById));
  router.post('/product-categories', authenticate, requirePermissions('catalog.manage'), validate(createProductCategorySchema), asyncHandler(c.productCategoryController.create));
  router.patch('/product-categories/:id', authenticate, requirePermissions('catalog.manage'), validate(updateProductCategorySchema), validate(idParamSchema, 'params'), asyncHandler(c.productCategoryController.update));
  router.delete('/product-categories/:id', authenticate, requirePermissions('catalog.manage'), validate(idParamSchema, 'params'), asyncHandler(c.productCategoryController.remove));

  // Product Attributes
  router.get('/product-attributes', authenticate, requirePermissions('catalog.view'), validate(productAttributeListQuerySchema, 'query'), asyncHandler(c.productAttributeController.list));
  router.get('/product-attributes/:id', authenticate, requirePermissions('catalog.view'), validate(idParamSchema, 'params'), asyncHandler(c.productAttributeController.getById));
  router.post('/product-attributes', authenticate, requirePermissions('catalog.manage'), validate(createProductAttributeSchema), asyncHandler(c.productAttributeController.create));
  router.patch('/product-attributes/:id', authenticate, requirePermissions('catalog.manage'), validate(updateProductAttributeSchema), validate(idParamSchema, 'params'), asyncHandler(c.productAttributeController.update));
  router.delete('/product-attributes/:id', authenticate, requirePermissions('catalog.manage'), validate(idParamSchema, 'params'), asyncHandler(c.productAttributeController.remove));

  // Units
  router.get('/units', authenticate, requirePermissions('catalog.view'), validate(unitListQuerySchema, 'query'), asyncHandler(c.unitController.list));
  router.get('/units/:id', authenticate, requirePermissions('catalog.view'), validate(idParamSchema, 'params'), asyncHandler(c.unitController.getById));
  router.post('/units', authenticate, requirePermissions('catalog.manage'), validate(createUnitSchema), asyncHandler(c.unitController.create));
  router.patch('/units/:id', authenticate, requirePermissions('catalog.manage'), validate(updateUnitSchema), validate(idParamSchema, 'params'), asyncHandler(c.unitController.update));
  router.delete('/units/:id', authenticate, requirePermissions('catalog.manage'), validate(idParamSchema, 'params'), asyncHandler(c.unitController.remove));

  // Tax Master
  router.get('/tax-masters', authenticate, requirePermissions('catalog.view'), validate(taxMasterListQuerySchema, 'query'), asyncHandler(c.taxMasterController.list));
  router.get('/tax-masters/:id', authenticate, requirePermissions('catalog.view'), validate(idParamSchema, 'params'), asyncHandler(c.taxMasterController.getById));
  router.post('/tax-masters', authenticate, requirePermissions('catalog.manage'), validate(createTaxMasterSchema), asyncHandler(c.taxMasterController.create));
  router.patch('/tax-masters/:id', authenticate, requirePermissions('catalog.manage'), validate(updateTaxMasterSchema), validate(idParamSchema, 'params'), asyncHandler(c.taxMasterController.update));
  router.delete('/tax-masters/:id', authenticate, requirePermissions('catalog.manage'), validate(idParamSchema, 'params'), asyncHandler(c.taxMasterController.remove));

  // Suppliers
  router.get('/suppliers', authenticate, requirePermissions('supplier.view'), validate(supplierListQuerySchema, 'query'), asyncHandler(c.supplierController.list));
  router.get('/suppliers/:id', authenticate, requirePermissions('supplier.view'), validate(idParamSchema, 'params'), asyncHandler(c.supplierController.getById));
  router.post('/suppliers', authenticate, requirePermissions('supplier.manage'), validate(createSupplierSchema), asyncHandler(c.supplierController.create));
  router.patch('/suppliers/:id', authenticate, requirePermissions('supplier.manage'), validate(updateSupplierSchema), validate(idParamSchema, 'params'), asyncHandler(c.supplierController.update));
  router.delete('/suppliers/:id', authenticate, requirePermissions('supplier.manage'), validate(idParamSchema, 'params'), asyncHandler(c.supplierController.remove));

  // Customer Groups
  router.get('/customer-groups', authenticate, requirePermissions('customer.view'), validate(customerGroupListQuerySchema, 'query'), asyncHandler(c.customerGroupController.list));
  router.get('/customer-groups/:id', authenticate, requirePermissions('customer.view'), validate(idParamSchema, 'params'), asyncHandler(c.customerGroupController.getById));
  router.post('/customer-groups', authenticate, requirePermissions('customer.manage'), validate(createCustomerGroupSchema), asyncHandler(c.customerGroupController.create));
  router.patch('/customer-groups/:id', authenticate, requirePermissions('customer.manage'), validate(updateCustomerGroupSchema), validate(idParamSchema, 'params'), asyncHandler(c.customerGroupController.update));
  router.delete('/customer-groups/:id', authenticate, requirePermissions('customer.manage'), validate(idParamSchema, 'params'), asyncHandler(c.customerGroupController.remove));

  // Customers
  router.get('/customers', authenticate, requirePermissions('customer.view'), validate(customerListQuerySchema, 'query'), asyncHandler(c.customerController.list));
  router.get('/customers/:id', authenticate, requirePermissions('customer.view'), validate(idParamSchema, 'params'), asyncHandler(c.customerController.getById));
  router.post('/customers', authenticate, requirePermissions('customer.manage'), validate(createCustomerSchema), asyncHandler(c.customerController.create));
  router.patch('/customers/:id', authenticate, requirePermissions('customer.manage'), validate(updateCustomerSchema), validate(idParamSchema, 'params'), asyncHandler(c.customerController.update));
  router.delete('/customers/:id', authenticate, requirePermissions('customer.manage'), validate(idParamSchema, 'params'), asyncHandler(c.customerController.remove));

  // Products
  router.get('/products', authenticate, requirePermissions('catalog.view'), validate(productListQuerySchema, 'query'), asyncHandler(c.productController.list));
  router.get('/products/:id', authenticate, requirePermissions('catalog.view'), validate(idParamSchema, 'params'), asyncHandler(c.productController.get));
  router.post('/products', authenticate, requirePermissions('catalog.manage'), validate(createProductSchema), asyncHandler(c.productController.create));
  router.patch('/products/:id', authenticate, requirePermissions('catalog.manage'), validate(updateProductSchema), validate(idParamSchema, 'params'), asyncHandler(c.productController.update));
  router.delete('/products/:id', authenticate, requirePermissions('catalog.manage'), validate(idParamSchema, 'params'), asyncHandler(c.productController.remove));

  // Product Variants
  router.get('/product-variants', authenticate, requirePermissions('catalog.view'), validate(productVariantListQuerySchema, 'query'), asyncHandler(c.productVariantController.list));
  router.get('/product-variants/:id', authenticate, requirePermissions('catalog.view'), validate(idParamSchema, 'params'), asyncHandler(c.productVariantController.get));
  router.post('/product-variants', authenticate, requirePermissions('catalog.manage'), validate(createProductVariantSchema), asyncHandler(c.productVariantController.create));
  router.patch('/product-variants/:id', authenticate, requirePermissions('catalog.manage'), validate(updateProductVariantSchema), validate(idParamSchema, 'params'), asyncHandler(c.productVariantController.update));
  router.delete('/product-variants/:id', authenticate, requirePermissions('catalog.manage'), validate(idParamSchema, 'params'), asyncHandler(c.productVariantController.remove));

  // Inventory
  router.get('/inventories', authenticate, requirePermissions('inventory.view'), validate(inventoryListQuerySchema, 'query'), asyncHandler(c.inventoryController.list));
  router.get('/inventories/value', authenticate, requirePermissions('inventory.view'), validate(branchIdQuerySchema, 'query'), asyncHandler(c.inventoryController.value));
  router.get('/inventories/low-stock', authenticate, requirePermissions('inventory.view'), validate(inventoryListQuerySchema, 'query'), asyncHandler(c.inventoryController.lowStock));
  router.get('/inventories/:id', authenticate, requirePermissions('inventory.view'), validate(idParamSchema, 'params'), asyncHandler(c.inventoryController.getById));
  router.post('/inventories/adjust', authenticate, requirePermissions('inventory.manage'), validate(adjustStockSchema), asyncHandler(c.inventoryController.adjust));

  // Stock Movements
  router.get('/stock-movements', authenticate, requirePermissions('inventory.view'), validate(stockMovementListQuerySchema, 'query'), asyncHandler(c.stockMovementController.list));
  router.get('/stock-movements/:id', authenticate, requirePermissions('inventory.view'), validate(idParamSchema, 'params'), asyncHandler(c.stockMovementController.getById));
  router.post('/stock-movements', authenticate, requirePermissions('inventory.manage'), validate(createStockMovementSchema), asyncHandler(c.stockMovementController.create));

  // Opening Stock
  router.get('/opening-stocks', authenticate, requirePermissions('inventory.view'), validate(openingStockListQuerySchema, 'query'), asyncHandler(c.openingStockController.list));
  router.get('/opening-stocks/:id', authenticate, requirePermissions('inventory.view'), validate(idParamSchema, 'params'), asyncHandler(c.openingStockController.getById));
  router.post('/opening-stocks', authenticate, requirePermissions('inventory.manage'), validate(createOpeningStockSchema), asyncHandler(c.openingStockController.create));
  router.post('/opening-stocks/:id/post', authenticate, requirePermissions('inventory.manage'), validate(idParamSchema, 'params'), asyncHandler(c.openingStockController.post));
  router.delete('/opening-stocks/:id', authenticate, requirePermissions('inventory.manage'), validate(idParamSchema, 'params'), asyncHandler(c.openingStockController.remove));

  // Purchases
  router.get('/purchases', authenticate, requirePermissions('purchase.view'), validate(purchaseListQuerySchema, 'query'), asyncHandler(c.purchaseController.list));
  router.get('/purchases/:id', authenticate, requirePermissions('purchase.view'), validate(idParamSchema, 'params'), asyncHandler(c.purchaseController.getById));
  router.post('/purchases', authenticate, requirePermissions('purchase.manage'), validate(createPurchaseSchema), asyncHandler(c.purchaseController.create));
  router.patch('/purchases/:id', authenticate, requirePermissions('purchase.manage'), validate(updatePurchaseSchema), validate(idParamSchema, 'params'), asyncHandler(c.purchaseController.update));
  router.post('/purchases/:id/receive', authenticate, requirePermissions('purchase.manage'), validate(idParamSchema, 'params'), asyncHandler(c.purchaseController.receive));
  router.delete('/purchases/:id', authenticate, requirePermissions('purchase.manage'), validate(idParamSchema, 'params'), asyncHandler(c.purchaseController.remove));

  // Purchase Returns
  router.get('/purchase-returns', authenticate, requirePermissions('purchase.view'), validate(purchaseReturnListQuerySchema, 'query'), asyncHandler(c.purchaseReturnController.list));
  router.get('/purchase-returns/:id', authenticate, requirePermissions('purchase.view'), validate(idParamSchema, 'params'), asyncHandler(c.purchaseReturnController.getById));
  router.post('/purchase-returns', authenticate, requirePermissions('purchase.manage'), validate(createPurchaseReturnSchema), asyncHandler(c.purchaseReturnController.create));
  router.patch('/purchase-returns/:id', authenticate, requirePermissions('purchase.manage'), validate(updatePurchaseReturnSchema), validate(idParamSchema, 'params'), asyncHandler(c.purchaseReturnController.update));
  router.post('/purchase-returns/:id/complete', authenticate, requirePermissions('purchase.manage'), validate(idParamSchema, 'params'), asyncHandler(c.purchaseReturnController.complete));
  router.delete('/purchase-returns/:id', authenticate, requirePermissions('purchase.manage'), validate(idParamSchema, 'params'), asyncHandler(c.purchaseReturnController.remove));

  // Sales
  router.get('/sales', authenticate, requirePermissions('sales.view'), validate(saleListQuerySchema, 'query'), asyncHandler(c.saleController.list));
  router.get('/sales/:id', authenticate, requirePermissions('sales.view'), validate(idParamSchema, 'params'), asyncHandler(c.saleController.getById));
  router.post('/sales', authenticate, requirePermissions('sales.manage'), validate(createSaleSchema), asyncHandler(c.saleController.create));
  router.patch('/sales/:id', authenticate, requirePermissions('sales.manage'), validate(updateSaleSchema), validate(idParamSchema, 'params'), asyncHandler(c.saleController.update));
  router.post('/sales/:id/complete', authenticate, requirePermissions('sales.manage'), validate(completeSaleSchema), validate(idParamSchema, 'params'), asyncHandler(c.saleController.complete));
  router.delete('/sales/:id', authenticate, requirePermissions('sales.manage'), validate(idParamSchema, 'params'), asyncHandler(c.saleController.remove));

  // Hold Bills
  router.get('/hold-bills', authenticate, requirePermissions('sales.view'), validate(holdBillListQuerySchema, 'query'), asyncHandler(c.holdBillController.list));
  router.get('/hold-bills/:id', authenticate, requirePermissions('sales.view'), validate(idParamSchema, 'params'), asyncHandler(c.holdBillController.getById));
  router.post('/hold-bills', authenticate, requirePermissions('sales.manage'), validate(createHoldBillSchema), asyncHandler(c.holdBillController.create));
  router.post('/hold-bills/:id/resume', authenticate, requirePermissions('sales.manage'), validate(resumeHoldSchema), validate(idParamSchema, 'params'), asyncHandler(c.holdBillController.resume));
  router.post('/hold-bills/:id/cancel', authenticate, requirePermissions('sales.manage'), validate(idParamSchema, 'params'), asyncHandler(c.holdBillController.cancel));

  // Payments
  router.get('/payments', authenticate, requirePermissions('sales.view'), validate(paymentListQuerySchema, 'query'), asyncHandler(c.paymentController.list));
  router.get('/payments/:id', authenticate, requirePermissions('sales.view'), validate(idParamSchema, 'params'), asyncHandler(c.paymentController.getById));
  router.post('/payments', authenticate, requirePermissions('sales.manage'), validate(createPaymentSchema), asyncHandler(c.paymentController.create));
  router.delete('/payments/:id', authenticate, requirePermissions('sales.manage'), validate(idParamSchema, 'params'), asyncHandler(c.paymentController.remove));

  // Business Settings
  router.get('/business-settings', authenticate, requirePermissions('settings.view'), validate(businessSettingListQuerySchema, 'query'), asyncHandler(c.businessSettingController.list));
  router.get('/business-settings/:id', authenticate, requirePermissions('settings.view'), validate(idParamSchema, 'params'), asyncHandler(c.businessSettingController.getById));
  router.post('/business-settings', authenticate, requirePermissions('settings.manage'), validate(createBusinessSettingSchema), asyncHandler(c.businessSettingController.create));
  router.patch('/business-settings/:id', authenticate, requirePermissions('settings.manage'), validate(updateBusinessSettingSchema), validate(idParamSchema, 'params'), asyncHandler(c.businessSettingController.update));
  router.delete('/business-settings/:id', authenticate, requirePermissions('settings.manage'), validate(idParamSchema, 'params'), asyncHandler(c.businessSettingController.remove));

  // Receipt Settings
  router.get('/receipt-settings', authenticate, requirePermissions('settings.view'), validate(branchIdQuerySchema, 'query'), asyncHandler(c.receiptSettingController.get));
  router.put('/receipt-settings', authenticate, requirePermissions('settings.manage'), validate(upsertReceiptSettingSchema), asyncHandler(c.receiptSettingController.upsert));
  router.delete('/receipt-settings', authenticate, requirePermissions('settings.manage'), validate(branchIdQuerySchema, 'query'), asyncHandler(c.receiptSettingController.remove));
}
