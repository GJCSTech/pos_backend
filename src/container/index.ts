import { prisma } from '../database/prisma';

import { UserRepository } from '../repositories/UserRepository';
import { RefreshTokenRepository } from '../repositories/RefreshTokenRepository';
import { DeviceRepository } from '../repositories/DeviceRepository';
import { HealthRepository } from '../repositories/HealthRepository';
import { ProductCategoryRepository } from '../repositories/ProductCategoryRepository';
import { ProductAttributeRepository } from '../repositories/ProductAttributeRepository';
import { UnitRepository } from '../repositories/UnitRepository';
import { TaxMasterRepository } from '../repositories/TaxMasterRepository';
import { SupplierRepository } from '../repositories/SupplierRepository';
import { CustomerGroupRepository } from '../repositories/CustomerGroupRepository';
import { CustomerRepository } from '../repositories/CustomerRepository';
import { ProductRepository } from '../repositories/ProductRepository';
import { ProductVariantRepository } from '../repositories/ProductVariantRepository';
import { InventoryRepository } from '../repositories/InventoryRepository';
import { StockMovementRepository } from '../repositories/StockMovementRepository';
import { OpeningStockRepository } from '../repositories/OpeningStockRepository';
import { PurchaseRepository } from '../repositories/PurchaseRepository';
import { PurchaseReturnRepository } from '../repositories/PurchaseReturnRepository';
import { SaleRepository } from '../repositories/SaleRepository';
import { HoldBillRepository } from '../repositories/HoldBillRepository';
import { PaymentRepository } from '../repositories/PaymentRepository';
import { BusinessSettingRepository } from '../repositories/BusinessSettingRepository';
import { ReceiptSettingRepository } from '../repositories/ReceiptSettingRepository';

import { AuthService } from '../services/AuthService';
import { DeviceService } from '../services/DeviceService';
import { HealthService } from '../services/HealthService';
import { ProductCategoryService } from '../services/ProductCategoryService';
import { ProductAttributeService } from '../services/ProductAttributeService';
import { UnitService } from '../services/UnitService';
import { TaxMasterService } from '../services/TaxMasterService';
import { SupplierService } from '../services/SupplierService';
import { CustomerGroupService } from '../services/CustomerGroupService';
import { CustomerService } from '../services/CustomerService';
import { ProductService } from '../services/ProductService';
import { ProductVariantService } from '../services/ProductVariantService';
import { InventoryService } from '../services/InventoryService';
import { StockMovementService } from '../services/StockMovementService';
import { OpeningStockService } from '../services/OpeningStockService';
import { PurchaseService } from '../services/PurchaseService';
import { PurchaseReturnService } from '../services/PurchaseReturnService';
import { SaleService } from '../services/SaleService';
import { HoldBillService } from '../services/HoldBillService';
import { PaymentService } from '../services/PaymentService';
import { BusinessSettingService } from '../services/BusinessSettingService';
import { ReceiptSettingService } from '../services/ReceiptSettingService';

import { AuthController } from '../controllers/AuthController';
import { DeviceController } from '../controllers/DeviceController';
import { HealthController } from '../controllers/HealthController';
import { ProductCategoryController } from '../controllers/ProductCategoryController';
import { ProductAttributeController } from '../controllers/ProductAttributeController';
import { UnitController } from '../controllers/UnitController';
import { TaxMasterController } from '../controllers/TaxMasterController';
import { SupplierController } from '../controllers/SupplierController';
import { CustomerGroupController } from '../controllers/CustomerGroupController';
import { CustomerController } from '../controllers/CustomerController';
import { ProductController } from '../controllers/ProductController';
import { ProductVariantController } from '../controllers/ProductVariantController';
import { InventoryController } from '../controllers/InventoryController';
import { StockMovementController } from '../controllers/StockMovementController';
import { OpeningStockController } from '../controllers/OpeningStockController';
import { PurchaseController } from '../controllers/PurchaseController';
import { PurchaseReturnController } from '../controllers/PurchaseReturnController';
import { SaleController } from '../controllers/SaleController';
import { HoldBillController } from '../controllers/HoldBillController';
import { PaymentController } from '../controllers/PaymentController';
import { BusinessSettingController } from '../controllers/BusinessSettingController';
import { ReceiptSettingController } from '../controllers/ReceiptSettingController';

export interface AppContainer {
  authController: AuthController;
  deviceController: DeviceController;
  healthController: HealthController;
  productCategoryController: ProductCategoryController;
  productAttributeController: ProductAttributeController;
  unitController: UnitController;
  taxMasterController: TaxMasterController;
  supplierController: SupplierController;
  customerGroupController: CustomerGroupController;
  customerController: CustomerController;
  productController: ProductController;
  productVariantController: ProductVariantController;
  inventoryController: InventoryController;
  stockMovementController: StockMovementController;
  openingStockController: OpeningStockController;
  purchaseController: PurchaseController;
  purchaseReturnController: PurchaseReturnController;
  saleController: SaleController;
  holdBillController: HoldBillController;
  paymentController: PaymentController;
  businessSettingController: BusinessSettingController;
  receiptSettingController: ReceiptSettingController;
}

export function createContainer(): AppContainer {
  const userRepository = new UserRepository(prisma);
  const refreshTokenRepository = new RefreshTokenRepository(prisma);
  const deviceRepository = new DeviceRepository(prisma);
  const healthRepository = new HealthRepository(prisma);
  const productCategoryRepository = new ProductCategoryRepository(prisma);
  const productAttributeRepository = new ProductAttributeRepository(prisma);
  const unitRepository = new UnitRepository(prisma);
  const taxMasterRepository = new TaxMasterRepository(prisma);
  const supplierRepository = new SupplierRepository(prisma);
  const customerGroupRepository = new CustomerGroupRepository(prisma);
  const customerRepository = new CustomerRepository(prisma);
  const productRepository = new ProductRepository(prisma);
  const productVariantRepository = new ProductVariantRepository(prisma);
  const inventoryRepository = new InventoryRepository(prisma);
  const stockMovementRepository = new StockMovementRepository(prisma);
  const openingStockRepository = new OpeningStockRepository(prisma);
  const purchaseRepository = new PurchaseRepository(prisma);
  const purchaseReturnRepository = new PurchaseReturnRepository(prisma);
  const saleRepository = new SaleRepository(prisma);
  const holdBillRepository = new HoldBillRepository(prisma);
  const paymentRepository = new PaymentRepository(prisma);
  const businessSettingRepository = new BusinessSettingRepository(prisma);
  const receiptSettingRepository = new ReceiptSettingRepository(prisma);

  const authService = new AuthService(userRepository, refreshTokenRepository);
  const deviceService = new DeviceService(deviceRepository);
  const healthService = new HealthService(healthRepository);
  const productCategoryService = new ProductCategoryService(productCategoryRepository);
  const productAttributeService = new ProductAttributeService(productAttributeRepository);
  const unitService = new UnitService(unitRepository);
  const taxMasterService = new TaxMasterService(taxMasterRepository);
  const supplierService = new SupplierService(supplierRepository);
  const customerGroupService = new CustomerGroupService(customerGroupRepository);
  const customerService = new CustomerService(customerRepository);
  const productService = new ProductService(productRepository);
  const productVariantService = new ProductVariantService(productVariantRepository);
  const inventoryService = new InventoryService(inventoryRepository);
  const stockMovementService = new StockMovementService(
    stockMovementRepository,
    inventoryService,
  );
  const openingStockService = new OpeningStockService(
    openingStockRepository,
    inventoryService,
  );
  const purchaseService = new PurchaseService(purchaseRepository, inventoryService);
  const purchaseReturnService = new PurchaseReturnService(
    purchaseReturnRepository,
    inventoryService,
  );
  const saleService = new SaleService(saleRepository, inventoryService);
  const holdBillService = new HoldBillService(holdBillRepository, saleService);
  const paymentService = new PaymentService(paymentRepository);
  const businessSettingService = new BusinessSettingService(businessSettingRepository);
  const receiptSettingService = new ReceiptSettingService(receiptSettingRepository);

  return {
    authController: new AuthController(authService),
    deviceController: new DeviceController(deviceService),
    healthController: new HealthController(healthService),
    productCategoryController: new ProductCategoryController(productCategoryService),
    productAttributeController: new ProductAttributeController(productAttributeService),
    unitController: new UnitController(unitService),
    taxMasterController: new TaxMasterController(taxMasterService),
    supplierController: new SupplierController(supplierService),
    customerGroupController: new CustomerGroupController(customerGroupService),
    customerController: new CustomerController(customerService),
    productController: new ProductController(productService),
    productVariantController: new ProductVariantController(productVariantService),
    inventoryController: new InventoryController(inventoryService),
    stockMovementController: new StockMovementController(stockMovementService),
    openingStockController: new OpeningStockController(openingStockService),
    purchaseController: new PurchaseController(purchaseService),
    purchaseReturnController: new PurchaseReturnController(purchaseReturnService),
    saleController: new SaleController(saleService),
    holdBillController: new HoldBillController(holdBillService),
    paymentController: new PaymentController(paymentService),
    businessSettingController: new BusinessSettingController(businessSettingService),
    receiptSettingController: new ReceiptSettingController(receiptSettingService),
  };
}
