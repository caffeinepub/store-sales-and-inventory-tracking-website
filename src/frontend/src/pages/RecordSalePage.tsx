import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useProducts } from '@/hooks/useProducts';
import { useRecordSale } from '@/hooks/useSales';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { SaleLineItem, BuyerInfo } from '@/backend';

interface LineItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export default function RecordSalePage() {
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<string>('1');
  const [notes, setNotes] = useState('');
  
  // Buyer information
  const [buyerName, setBuyerName] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [buyerAddress, setBuyerAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('Paid');

  const { data: products, isLoading: productsLoading } = useProducts();
  const recordSaleMutation = useRecordSale();

  const addLineItem = () => {
    if (!selectedProductId || !quantity || Number(quantity) <= 0) {
      toast.error('Please select a product and enter a valid quantity');
      return;
    }

    const product = products?.find((p) => p.id.toString() === selectedProductId);
    if (!product) {
      toast.error('Product not found');
      return;
    }

    if (Number(quantity) > Number(product.quantityOnHand)) {
      toast.error(`Only ${product.quantityOnHand} units available in stock`);
      return;
    }

    const existingItem = lineItems.find((item) => item.productId === selectedProductId);
    if (existingItem) {
      const totalQuantity = existingItem.quantity + Number(quantity);
      if (totalQuantity > Number(product.quantityOnHand)) {
        toast.error(`Only ${product.quantityOnHand} units available in stock`);
        return;
      }
      setLineItems(
        lineItems.map((item) =>
          item.productId === selectedProductId
            ? { ...item, quantity: totalQuantity }
            : item
        )
      );
    } else {
      setLineItems([
        ...lineItems,
        {
          productId: selectedProductId,
          productName: product.name,
          quantity: Number(quantity),
          unitPrice: Number(product.unitPrice),
        },
      ]);
    }

    setSelectedProductId('');
    setQuantity('1');
  };

  const removeLineItem = (productId: string) => {
    setLineItems(lineItems.filter((item) => item.productId !== productId));
  };

  const calculateSubtotal = (item: LineItem) => {
    return (item.quantity * item.unitPrice) / 100;
  };

  const calculateTotal = () => {
    return lineItems.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0) / 100;
  };

  const handleSubmit = async () => {
    if (lineItems.length === 0) {
      toast.error('Please add at least one item to the sale');
      return;
    }

    if (!buyerName.trim()) {
      toast.error('Please enter buyer name');
      return;
    }

    if (!paymentMethod.trim()) {
      toast.error('Please enter payment method');
      return;
    }

    const saleLineItems: SaleLineItem[] = lineItems.map((item) => ({
      productId: BigInt(item.productId),
      quantity: BigInt(item.quantity),
      unitPriceAtSale: BigInt(item.unitPrice),
    }));

    const buyerInfo: BuyerInfo = {
      contact: {
        name: buyerName,
        email: buyerEmail.trim() || undefined,
        phone: buyerPhone.trim() || undefined,
        address: buyerAddress.trim() || undefined,
      },
      payment: {
        paymentMethod,
        paymentReference: paymentReference.trim() || undefined,
        paymentStatus,
      },
    };

    try {
      await recordSaleMutation.mutateAsync({
        lineItems: saleLineItems,
        notes: notes || null,
        buyerInfo,
      });
      toast.success('Sale recorded successfully!');
      setLineItems([]);
      setNotes('');
      setBuyerName('');
      setBuyerEmail('');
      setBuyerPhone('');
      setBuyerAddress('');
      setPaymentMethod('');
      setPaymentReference('');
      setPaymentStatus('Paid');
    } catch (error) {
      toast.error('Failed to record sale. Please check inventory and try again.');
    }
  };

  if (productsLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-32" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Alert>
        <AlertDescription>
          No products available. Please add products to your inventory first.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Record Sale</h2>
        <p className="text-muted-foreground">Create a new sales transaction</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Add Items */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Add Items</CardTitle>
            <CardDescription>Select products and quantities for this sale</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-3">
              <div className="sm:col-span-2 space-y-2">
                <Label htmlFor="product">Product</Label>
                <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                  <SelectTrigger id="product">
                    <SelectValue placeholder="Select a product" />
                  </SelectTrigger>
                  <SelectContent>
                    {products.map((product) => (
                      <SelectItem key={product.id.toString()} value={product.id.toString()}>
                        {product.name} - ${(Number(product.unitPrice) / 100).toFixed(2)} ({product.quantityOnHand.toString()} in stock)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    min="1"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <Button onClick={addLineItem} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {lineItems.length > 0 && (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Product</TableHead>
                      <TableHead className="text-right">Qty</TableHead>
                      <TableHead className="text-right">Price</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lineItems.map((item) => (
                      <TableRow key={item.productId}>
                        <TableCell className="font-medium">{item.productName}</TableCell>
                        <TableCell className="text-right">{item.quantity}</TableCell>
                        <TableCell className="text-right">
                          ${(item.unitPrice / 100).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${calculateSubtotal(item).toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeLineItem(item.productId)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}

            {lineItems.length === 0 && (
              <div className="text-center py-8 text-muted-foreground border border-dashed rounded-lg">
                <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No items added yet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Summary & Buyer Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Sale Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Items</span>
                  <span>{lineItems.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Quantity</span>
                  <span>{lineItems.reduce((sum, item) => sum + item.quantity, 0)}</span>
                </div>
                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes (optional)</Label>
                <Textarea
                  id="notes"
                  placeholder="Add any notes about this sale..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Buyer Information</CardTitle>
              <CardDescription>Customer and payment details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="buyerName">Customer Name *</Label>
                <Input
                  id="buyerName"
                  placeholder="Enter customer name"
                  value={buyerName}
                  onChange={(e) => setBuyerName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerEmail">Email</Label>
                <Input
                  id="buyerEmail"
                  type="email"
                  placeholder="customer@example.com"
                  value={buyerEmail}
                  onChange={(e) => setBuyerEmail(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerPhone">Phone</Label>
                <Input
                  id="buyerPhone"
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={buyerPhone}
                  onChange={(e) => setBuyerPhone(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="buyerAddress">Address</Label>
                <Textarea
                  id="buyerAddress"
                  placeholder="Enter customer address"
                  value={buyerAddress}
                  onChange={(e) => setBuyerAddress(e.target.value)}
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentMethod">Payment Method *</Label>
                <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cash">Cash</SelectItem>
                    <SelectItem value="Credit Card">Credit Card</SelectItem>
                    <SelectItem value="Debit Card">Debit Card</SelectItem>
                    <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                    <SelectItem value="Mobile Payment">Mobile Payment</SelectItem>
                    <SelectItem value="Check">Check</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentReference">Payment Reference</Label>
                <Input
                  id="paymentReference"
                  placeholder="Transaction ID, check number, etc."
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="paymentStatus">Payment Status</Label>
                <Select value={paymentStatus} onValueChange={setPaymentStatus}>
                  <SelectTrigger id="paymentStatus">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Partial">Partial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={lineItems.length === 0 || recordSaleMutation.isPending}
              >
                {recordSaleMutation.isPending ? 'Recording...' : 'Record Sale'}
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
