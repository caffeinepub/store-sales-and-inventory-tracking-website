import Map "mo:core/Map";
import Time "mo:core/Time";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import Migration "migration";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

(with migration = Migration.run)
actor {
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Product
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

  // SaleLineItem
  type SaleLineItem = {
    productId : Nat;
    quantity : Nat;
    unitPriceAtSale : Nat;
  };

  // ContactInfo
  type ContactInfo = {
    name : Text;
    email : ?Text;
    phone : ?Text;
    address : ?Text;
  };

  // PaymentInfo
  type PaymentInfo = {
    paymentMethod : Text;
    paymentReference : ?Text;
    paymentStatus : Text; // "Paid", "Pending", etc.
  };

  // BuyerInfo
  type BuyerInfo = {
    contact : ContactInfo;
    payment : PaymentInfo;
  };

  // Sale
  type Sale = {
    id : Nat;
    timestamp : Int;
    lineItems : [SaleLineItem];
    notes : ?Text;
    totalAmount : Nat;
    buyerInfo : BuyerInfo;
    createdBy : Text;
  };

  // DashboardSummary
  type DashboardSummary = {
    totalProducts : Nat;
    lowStockProducts : [Product];
    todaysSalesAmount : Int;
  };

  // Stable persistent data structures
  let products = Map.empty<Nat, Product>();
  let sales = Map.empty<Nat, Sale>();
  var lastProductId = 0;
  var lastSaleId = 0;
  var lowStockThreshold = 5;

  // Product CRUD APIs
  public shared ({ caller }) func createProduct(name : Text, sku : ?Text, description : ?Text, unitPrice : Nat, unitCost : ?Nat, quantityOnHand : Nat) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can create products");
    };

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

  public query ({ caller }) func getProduct(productId : Nat) : async ?Product {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get products");
    };

    products.get(productId);
  };

  public query ({ caller }) func getAllProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get products");
    };

    products.values().toArray();
  };

  public shared ({ caller }) func recordSale(lineItems : [SaleLineItem], notes : ?Text, buyerInfo : BuyerInfo) : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can record sales");
    };

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
    let callerId = caller.toText();
    let sale : Sale = {
      id = lastSaleId;
      timestamp = Time.now();
      lineItems;
      notes;
      totalAmount;
      buyerInfo;
      createdBy = callerId;
    };
    sales.add(sale.id, sale);
    sale.id;
  };

  public shared ({ caller }) func updateSale(saleId : Nat, lineItems : [SaleLineItem], notes : ?Text, buyerInfo : BuyerInfo) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can update sales");
    };

    let existingSale = switch (sales.get(saleId)) {
      case (null) { Runtime.trap("Sale not found") };
      case (?sale) { sale };
    };

    let totalAmount = lineItems.foldLeft(0, func(acc, item) { acc + (item.quantity * item.unitPriceAtSale) });
    let updatedSale : Sale = {
      existingSale with
      lineItems;
      notes;
      totalAmount;
      buyerInfo;
    };
    sales.add(saleId, updatedSale);
  };

  public shared ({ caller }) func deleteSale(saleId : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can delete sales");
    };

    sales.remove(saleId);
  };

  public query ({ caller }) func getSale(saleId : Nat) : async ?Sale {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get sales");
    };

    sales.get(saleId);
  };

  public query ({ caller }) func getAllSales() : async [Sale] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get sales");
    };

    sales.values().toArray();
  };

  // Utility APIs
  public query ({ caller }) func getTodaysSales() : async [Sale] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get sales");
    };

    let now = Time.now();
    let dayInNano = 86_400_000_000_000;
    let startOfDay = now - (now % dayInNano);

    let todaysSales = sales.values().toArray().filter(func(sale) { sale.timestamp >= startOfDay });
    todaysSales;
  };

  public query ({ caller }) func getProductSales(productId : Nat) : async [Sale] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get sales");
    };

    let productSales = sales.values().toArray().filter(func(sale) {
      sale.lineItems.findIndex(func(item) { item.productId == productId }) != null;
    });
    productSales;
  };

  // Dashboard API
  public query ({ caller }) func getDashboardSummary() : async DashboardSummary {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get dashboard summary");
    };

    let allProducts = products.values().toArray();
    let lowStockProducts = allProducts.filter(func(p) { p.quantityOnHand <= lowStockThreshold });

    // Calculate today's sales amount
    let now = Time.now();
    let dayInNano = 86_400_000_000_000;
    let startOfDay = now - (now % dayInNano);
    let todaysSales = sales.values().toArray().filter(func(sale) { sale.timestamp >= startOfDay });
    let todaysSalesAmount = todaysSales.foldLeft(0, func(acc, sale) { acc + sale.totalAmount });

    {
      totalProducts = products.size();
      lowStockProducts;
      todaysSalesAmount;
    };
  };

  public query ({ caller }) func getLowStockProducts() : async [Product] {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get low stock products");
    };

    let allProducts = products.values().toArray();
    let lowStockProducts = allProducts.filter(func(p) { p.quantityOnHand <= lowStockThreshold });
    lowStockProducts;
  };

  public shared ({ caller }) func setLowStockThreshold(threshold : Nat) : async () {
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can set low stock threshold");
    };

    lowStockThreshold := threshold;
  };

  public query ({ caller }) func getLowStockThreshold() : async Nat {
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only users can get low stock threshold");
    };

    lowStockThreshold;
  };
};
