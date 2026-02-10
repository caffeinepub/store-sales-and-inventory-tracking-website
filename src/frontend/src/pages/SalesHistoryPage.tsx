import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Receipt, User, CreditCard, Calendar, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { useAllSales } from '@/hooks/useSales';
import { useProducts } from '@/hooks/useProducts';
import { formatDateTime, formatCurrency } from '@/lib/format';
import { Separator } from '@/components/ui/separator';
import type { Sale } from '@/backend';

export default function SalesHistoryPage() {
  const { data: sales, isLoading, error } = useAllSales();
  const { data: products } = useProducts();
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const sortedSales = sales ? [...sales].sort((a, b) => Number(b.timestamp - a.timestamp)) : [];

  const getProductName = (productId: bigint): string => {
    const product = products?.find((p) => p.id === productId);
    return product?.name || `Product #${productId}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales History</h2>
          <p className="text-muted-foreground">View past transactions</p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-2">
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-64 w-full" />
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Skeleton className="h-6 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-48 w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Sales History</h2>
          <p className="text-muted-foreground">View past transactions</p>
        </div>
        <Alert variant="destructive">
          <AlertDescription>
            Failed to load sales history. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sales History</h2>
        <p className="text-muted-foreground">View past transactions</p>
      </div>

      {sortedSales.length === 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Recent Sales</CardTitle>
            <CardDescription>Transaction history will appear here</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p className="mb-1">No sales recorded yet</p>
              <p className="text-sm">Start recording sales to see them here</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sales List */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>All Sales</CardTitle>
              <CardDescription>{sortedSales.length} transaction(s) recorded</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {sortedSales.map((sale) => (
                  <div
                    key={sale.id.toString()}
                    onClick={() => setSelectedSale(sale)}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedSale?.id === sale.id
                        ? 'border-primary bg-accent'
                        : 'border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1">
                        <div className="flex items-center gap-2">
                          <Receipt className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">Sale #{sale.id.toString()}</span>
                          <Badge variant={sale.buyerInfo.payment.paymentStatus === 'Paid' ? 'default' : 'secondary'}>
                            {sale.buyerInfo.payment.paymentStatus}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <span>{formatDateTime(sale.timestamp)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span>{sale.buyerInfo.contact.name}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(sale.totalAmount)}</div>
                        <div className="text-xs text-muted-foreground">
                          {sale.lineItems.length} item(s)
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sale Details */}
          <Card>
            <CardHeader>
              <CardTitle>Sale Details</CardTitle>
              <CardDescription>
                {selectedSale ? `Sale #${selectedSale.id}` : 'Select a sale to view details'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedSale ? (
                <div className="space-y-4">
                  {/* Customer Info */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Customer
                    </h4>
                    <div className="space-y-1 text-sm">
                      <p className="font-medium">{selectedSale.buyerInfo.contact.name}</p>
                      {selectedSale.buyerInfo.contact.email && (
                        <p className="text-muted-foreground">{selectedSale.buyerInfo.contact.email}</p>
                      )}
                      {selectedSale.buyerInfo.contact.phone && (
                        <p className="text-muted-foreground">{selectedSale.buyerInfo.contact.phone}</p>
                      )}
                      {selectedSale.buyerInfo.contact.address && (
                        <p className="text-muted-foreground text-xs">{selectedSale.buyerInfo.contact.address}</p>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Payment Info */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment
                    </h4>
                    <div className="space-y-1 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method:</span>
                        <span className="font-medium">{selectedSale.buyerInfo.payment.paymentMethod}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Status:</span>
                        <Badge variant={selectedSale.buyerInfo.payment.paymentStatus === 'Paid' ? 'default' : 'secondary'}>
                          {selectedSale.buyerInfo.payment.paymentStatus}
                        </Badge>
                      </div>
                      {selectedSale.buyerInfo.payment.paymentReference && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Reference:</span>
                          <span className="font-mono text-xs">{selectedSale.buyerInfo.payment.paymentReference}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  {/* Line Items */}
                  <div>
                    <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
                      <Package className="h-4 w-4" />
                      Items
                    </h4>
                    <div className="space-y-2">
                      {selectedSale.lineItems.map((item, index) => (
                        <div key={index} className="flex justify-between text-sm">
                          <div className="flex-1">
                            <p className="font-medium">{getProductName(item.productId)}</p>
                            <p className="text-xs text-muted-foreground">
                              {item.quantity.toString()} × {formatCurrency(item.unitPriceAtSale)}
                            </p>
                          </div>
                          <span className="font-medium">
                            {formatCurrency(item.quantity * item.unitPriceAtSale)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Total */}
                  <div className="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>{formatCurrency(selectedSale.totalAmount)}</span>
                  </div>

                  {/* Notes */}
                  {selectedSale.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="text-sm font-medium mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{selectedSale.notes}</p>
                      </div>
                    </>
                  )}

                  {/* Metadata */}
                  <Separator />
                  <div className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between">
                      <span>Date:</span>
                      <span>{formatDateTime(selectedSale.timestamp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Sale ID:</span>
                      <span className="font-mono">#{selectedSale.id.toString()}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a sale to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
