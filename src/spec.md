# Specification

## Summary
**Goal:** Build a store back-office website to record products (inventory) and sales, automatically updating stock levels and providing basic dashboards and history views.

**Planned changes:**
- Implement a single Motoko-actor backend with stable data models and CRUD APIs for products (id, name, optional SKU/description, unit price, optional unit cost, quantity on hand, timestamps).
- Implement backend APIs to create and query sales (id, timestamp, line items, optional notes) with backend-computed totals.
- Enforce atomic inventory decrements on sale creation and reject sales that would drive any product quantity negative.
- Create frontend pages for Dashboard, Inventory management (add/edit/delete, adjust stock, search/filter), Record Sale (build line items, running total, submit), and Sales History (list + detail).
- Use React Query for all reads/mutations with loading/error states and cache invalidation after mutations.
- Apply a consistent retail back-office theme (non-blue/purple primary palette).
- Add and display generated static image assets from `frontend/public/assets/generated`.

**User-visible outcome:** Users can manage an inventory catalog, adjust stock, record sales that automatically decrement inventory, view sales history and sale details, and see a dashboard with product counts, low-stock items (with adjustable threshold), and today’s total sales.
