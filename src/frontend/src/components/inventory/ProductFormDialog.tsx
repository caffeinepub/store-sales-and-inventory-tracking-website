import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useCreateProduct } from '@/hooks/useProducts';
import { toast } from 'sonner';
import type { Product } from '@/backend';

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
}

export default function ProductFormDialog({ open, onOpenChange, product }: ProductFormDialogProps) {
  const [name, setName] = useState('');
  const [sku, setSku] = useState('');
  const [description, setDescription] = useState('');
  const [unitPrice, setUnitPrice] = useState('');
  const [unitCost, setUnitCost] = useState('');
  const [quantityOnHand, setQuantityOnHand] = useState('');

  const createProductMutation = useCreateProduct();

  useEffect(() => {
    if (product) {
      setName(product.name);
      setSku(product.sku || '');
      setDescription(product.description || '');
      setUnitPrice((Number(product.unitPrice) / 100).toString());
      setUnitCost(product.unitCost ? (Number(product.unitCost) / 100).toString() : '');
      setQuantityOnHand(product.quantityOnHand.toString());
    } else {
      setName('');
      setSku('');
      setDescription('');
      setUnitPrice('');
      setUnitCost('');
      setQuantityOnHand('0');
    }
  }, [product, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error('Product name is required');
      return;
    }

    if (!unitPrice || Number(unitPrice) < 0) {
      toast.error('Please enter a valid unit price');
      return;
    }

    if (!quantityOnHand || Number(quantityOnHand) < 0) {
      toast.error('Please enter a valid quantity');
      return;
    }

    if (product) {
      toast.error('Product update requires backend method: updateProduct()');
      return;
    }

    try {
      await createProductMutation.mutateAsync({
        name: name.trim(),
        sku: sku.trim() || null,
        description: description.trim() || null,
        unitPrice: BigInt(Math.round(Number(unitPrice) * 100)),
        unitCost: unitCost ? BigInt(Math.round(Number(unitCost) * 100)) : null,
        quantityOnHand: BigInt(quantityOnHand),
      });
      toast.success('Product created successfully!');
      onOpenChange(false);
    } catch (error) {
      toast.error('Failed to create product');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>{product ? 'Edit Product' : 'Add Product'}</DialogTitle>
            <DialogDescription>
              {product ? 'Update product details' : 'Add a new product to your inventory'}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Product name"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                placeholder="Stock keeping unit"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Product description"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="unitPrice">Unit Price ($) *</Label>
                <Input
                  id="unitPrice"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitPrice}
                  onChange={(e) => setUnitPrice(e.target.value)}
                  placeholder="0.00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="unitCost">Unit Cost ($)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  step="0.01"
                  min="0"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantity on Hand *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                value={quantityOnHand}
                onChange={(e) => setQuantityOnHand(e.target.value)}
                placeholder="0"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createProductMutation.isPending}>
              {createProductMutation.isPending ? 'Saving...' : product ? 'Update' : 'Create'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
