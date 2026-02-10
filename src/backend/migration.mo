import Map "mo:core/Map";
import Nat "mo:core/Nat";

module {
  type OldSale = {
    id : Nat;
    timestamp : Int;
    lineItems : [OldSaleLineItem];
    notes : ?Text;
    totalAmount : Nat;
  };

  type OldSaleLineItem = {
    productId : Nat;
    quantity : Nat;
    unitPriceAtSale : Nat;
  };

  type OldActor = {
    products : Map.Map<Nat, OldProduct>;
    sales : Map.Map<Nat, OldSale>;
    lastProductId : Nat;
    lastSaleId : Nat;
    lowStockThreshold : Nat;
  };

  type OldProduct = {
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

  type NewSaleLineItem = OldSaleLineItem;

  type NewProduct = OldProduct;

  type ContactInfo = {
    name : Text;
    email : ?Text;
    phone : ?Text;
    address : ?Text;
  };

  type PaymentInfo = {
    paymentMethod : Text;
    paymentReference : ?Text;
    paymentStatus : Text;
  };

  type BuyerInfo = {
    contact : ContactInfo;
    payment : PaymentInfo;
  };

  type NewSale = {
    id : Nat;
    timestamp : Int;
    lineItems : [NewSaleLineItem];
    notes : ?Text;
    totalAmount : Nat;
    buyerInfo : BuyerInfo;
    createdBy : Text;
  };

  type NewActor = {
    products : Map.Map<Nat, NewProduct>;
    sales : Map.Map<Nat, NewSale>;
    lastProductId : Nat;
    lastSaleId : Nat;
    lowStockThreshold : Nat;
  };

  public func run(old : OldActor) : NewActor {
    let newSales = old.sales.map<Nat, OldSale, NewSale>(
      func(_id, oldSale) {
        {
          oldSale with
          buyerInfo = {
            contact = {
              name = "";
              email = null;
              phone = null;
              address = null;
            };
            payment = {
              paymentMethod = "";
              paymentReference = null;
              paymentStatus = "";
            };
          };
          createdBy = "";
        };
      }
    );

    {
      products = old.products;
      sales = newSales;
      lastProductId = old.lastProductId;
      lastSaleId = old.lastSaleId;
      lowStockThreshold = old.lowStockThreshold;
    };
  };
};
