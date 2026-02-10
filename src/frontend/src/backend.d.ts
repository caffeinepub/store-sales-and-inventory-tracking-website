import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface SaleLineItem {
    unitPriceAtSale: bigint;
    productId: bigint;
    quantity: bigint;
}
export interface DashboardSummary {
    totalProducts: bigint;
    todaysSalesAmount: bigint;
    lowStockProducts: Array<Product>;
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
export interface backendInterface {
    createProduct(name: string, sku: string | null, description: string | null, unitPrice: bigint, unitCost: bigint | null, quantityOnHand: bigint): Promise<bigint>;
    getAllProducts(): Promise<Array<Product>>;
    getDashboardSummary(): Promise<DashboardSummary>;
    getProduct(productId: bigint): Promise<Product | null>;
    recordSale(lineItems: Array<SaleLineItem>, notes: string | null): Promise<bigint>;
}
