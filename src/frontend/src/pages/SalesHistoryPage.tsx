import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Receipt, Calendar } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function SalesHistoryPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Sales History</h2>
        <p className="text-muted-foreground">View past transactions</p>
      </div>

      <Alert>
        <AlertDescription>
          Sales history feature requires additional backend methods (getAllSales, getSale). 
          This view will be available once the backend is updated.
        </AlertDescription>
      </Alert>

      <Card>
        <CardHeader>
          <CardTitle>Recent Sales</CardTitle>
          <CardDescription>Transaction history will appear here</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 text-muted-foreground">
            <Receipt className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p className="mb-1">No sales history available</p>
            <p className="text-sm">Backend methods needed: getAllSales(), getSale(id)</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
