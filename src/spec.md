# Specification

## Summary
**Goal:** Add end-to-end sales history support by extending recorded sale data (including buyer info), exposing backend queries to fetch sales, and displaying recent and historical sales in the UI.

**Planned changes:**
- Extend the backend Sale record to store buyer information and ensure it is persisted when the existing recordSale function is called (while keeping current inventory validation/decrement behavior).
- Update recordSale to accept buyer info (alongside optional notes) and save it on the Sale record.
- Add backend query methods to retrieve sales: getAllSales (list) and getSale(id) (single record).
- Update the Record Sale frontend flow to collect buyer information and submit it when recording a sale, including cache invalidation so views refresh.
- Replace the Sales History placeholder UI with a working list view (getAllSales) and a details view (getSale) showing date/time, total amount, buyer info, line items, and notes.
- Add a “Recent Sales” section to the Dashboard showing the latest sales and a link to the full Sales History page.

**User-visible outcome:** Users can enter buyer information when recording a sale, view a Recent Sales section on the dashboard, and browse a full sales history list with per-sale details (including buyer info, line items, notes, totals, and timestamps).
