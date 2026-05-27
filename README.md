# Audily Intranet

A transparent budget intranet for Audily. The first page surfaces 2026 forward projections, the talent profit pool, and a what-if simulator for new projects.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000.

## What's here

- **Hero metrics** — projected revenue, expenses, net cash flow, talent pool size
- **Monthly chart** — revenue, expenses, and cash flow side by side
- **Expense breakdown** — donut chart of where money goes
- **Talent profit pool** — total pool is public; individual shares are private to each device
- **What-if simulator** — add a hypothetical project (revenue, cost, start, duration) and see live impact on revenue, cash flow, and pool
- **Full breakdown table** — line-by-line, month-by-month

## Privacy model

The pool size and pool math are visible to everyone. Each person's individual share is kept private:

- "Calculate my share" stores your personal percentage in `localStorage` on your own device
- Other members' amounts are never displayed
- Three anonymous slots (`A`, `B`, `C`) are shown with blurred values to communicate that the pool is split three ways

For a stronger privacy guarantee later we'd add auth and store shares server-side keyed to each user.

## Data source

`lib/budget.ts` carries the May–Dec 2026 projection from *Profit Pool — Audily Forward Projections 2026 (Sheet9)*. Update that file when the master sheet changes.
