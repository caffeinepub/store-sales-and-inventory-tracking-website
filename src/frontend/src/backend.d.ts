import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DashboardSummary {
    totalProducts: bigint;
    todaysSalesAmount: bigint;
    lowStockProducts: Array<Product>;
}
export interface BuyerInfo {
    contact: ContactInfo;
    payment: PaymentInfo;
}
export interface SaleLineItem {
    unitPriceAtSale: bigint;
    productId: bigint;
    quantity: bigint;
}
export interface Sale {
    id: bigint;
    lineItems: Array<SaleLineItem>;
    createdBy: string;
    totalAmount: bigint;
    notes?: string;
    timestamp: bigint;
    buyerInfo: BuyerInfo;
}
export interface ContactInfo {
    name: string;
    email?: string;
    address?: string;
    phone?: string;
}
export interface PaymentInfo {
    paymentStatus: string;
    paymentMethod: string;
    paymentReference?: string;
}
export interface Product {
    id: bigint;
    sku?: string;
    updatedTime: bigint;
    name: string;
    description?: string;
    createdTime: bigint;
    quantityOnHand: bigint;
    unitPrice: bigint;
    unitCost?: bigint;
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createProduct(name: string, sku: string | null, description: string | null, unitPrice: bigint, unitCost: bigint | null, quantityOnHand: bigint): Promise<bigint>;
    deleteSale(saleId: bigint): Promise<void>;
    getAllProducts(): Promise<Array<Product>>;
    getAllSales(): Promise<Array<Sale>>;
    getCallerUserRole(): Promise<UserRole>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getLowStockProducts(): Promise<Array<Product>>;
    getLowStockThreshold(): Promise<bigint>;
    getProduct(productId: bigint): Promise<Product | null>;
    getProductSales(productId: bigint): Promise<Array<Sale>>;
    getSale(saleId: bigint): Promise<Sale | null>;
    getTodaysSales(): Promise<Array<Sale>>;
    isCallerAdmin(): Promise<boolean>;
    recordSale(lineItems: Array<SaleLineItem>, notes: string | null, buyerInfo: BuyerInfo): Promise<bigint>;
    setLowStockThreshold(threshold: bigint): Promise<void>;
    updateSale(saleId: bigint, lineItems: Array<SaleLineItem>, notes: string | null, buyerInfo: BuyerInfo): Promise<void>;
}
