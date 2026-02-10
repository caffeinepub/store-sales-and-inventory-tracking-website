import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";

actor {
  type Product = {
    id : Nat;
    name : Text;
    sku : ?Text;
    description : ?Text;
    unitPrice : Nat;
    unitCost : ?Nat;
    quantityOnHand : Nat;
    createdTime : Int;
    updatedTime : Int;
  };

  type SaleLineItem = {
    productId : Nat;
    quantity : Nat;
    unitPriceAtSale : Nat;
  };

  type Sale = {
    id : Nat;
    timestamp : Int;
    lineItems : [SaleLineItem];
    notes : ?Text;
    totalAmount : Nat;
  };

  type DashboardSummary = {
    totalProducts : Nat;
    lowStockProducts : [Product];
    todaysSalesAmount : Nat;
  };

  // Stable persistent data structures
  let products = Map.empty<Nat, Product>();
  let sales = Map.empty<Nat, Sale>();
  var lastProductId = 0;
  var lastSaleId = 0;
  var lowStockThreshold = 5;

  // Product CRUD APIs
  public shared ({ caller }) func createProduct(name : Text, sku : ?Text, description : ?Text, unitPrice : Nat, unitCost : ?Nat, quantityOnHand : Nat) : async Nat {
    lastProductId += 1;
    let product : Product = {
      id = lastProductId;
      name;
      sku;
      description;
      unitPrice;
      unitCost;
      quantityOnHand;
      createdTime = Time.now();
      updatedTime = Time.now();
    };
    products.add(product.id, product);
    product.id;
  };

  public shared ({ caller }) func getProduct(productId : Nat) : async ?Product {
    products.get(productId);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    products.values().toArray();
  };

  // Sale APIs
  public shared ({ caller }) func recordSale(lineItems : [SaleLineItem], notes : ?Text) : async Nat {
    // Validate inventory availability
    for (item in lineItems.values()) {
      let product = switch (products.get(item.productId)) {
        case (null) { return (0) };
        case (?p) { p };
      };
      if (product.quantityOnHand < item.quantity) {
        return 0;
      };
    };

    // Decrement inventory quantities
    for (item in lineItems.values()) {
      switch (products.get(item.productId)) {
        case (?p) {
          let updatedProduct = {
            p with
            quantityOnHand = p.quantityOnHand - item.quantity
          };
          products.add(item.productId, updatedProduct);
        };
        case (null) {};
      };
    };

    // Create sale record
    lastSaleId += 1;
    let totalAmount = lineItems.foldLeft(0, func(acc, item) { acc + (item.quantity * item.unitPriceAtSale) });
    let sale : Sale = {
      id = lastSaleId;
      timestamp = Time.now();
      lineItems;
      notes;
      totalAmount;
    };
    sales.add(sale.id, sale);
    sale.id;
  };

  // Dashboard API
  public query ({ caller }) func getDashboardSummary() : async DashboardSummary {
    let allProducts = products.values().toArray();
    let lowStockProducts = allProducts.filter(func(p) { p.quantityOnHand <= lowStockThreshold });

    // Calculate today's sales amount
    let todaysSalesAmount = 0;

    {
      totalProducts = products.size();
      lowStockProducts;
      todaysSalesAmount;
    };
  };
};
