# VaultBudget

A full-stack personal finance application built to help users organize spending, review imported transactions, assign categories, and track category-based goals over time.

This project is designed around a practical budgeting workflow: upload transaction data, review and categorize spending, monitor top spending categories, and set goals to stay on track.

## Overview

The Budgeting App gives users a structured way to manage transaction data and turn it into useful financial insights. Users can import CSV files, categorize transactions, and view a dashboard that summarizes spending activity across different time ranges. Over time, a built-in rule engine learns user behavior to auto-categorize future transactions. When complete, this app will provide a free-tier account and offer premium subscriptions.

## Features

- Secure user authentication with email and password
- Dashboard and budgeting analytics
- CSV transaction upload with configurable column mapping
- Transaction review for assigning categories
- Category management for organizing spending
- Top spending category insights
- Category-based budgeting and goal tracking

## Stack Summary

- Next.js
- React
- TypeScript
- Better Auth
- PostgreSQL
- Prisma ORM

## Current Budgeting Workflow

1. A user signs up or logs in
2. The user uploads a CSV file of transaction data
3. The app normalizes the file and allows column selection for merchant, amount, and date
4. Transactions are stored and reviewed - rule engine auto categorizes if rules exist
5. The user assigns or updates categories and improve auto-categorizaton with the rule engine.
6. The dashboard summarizes spending patterns
7. The user can define category goals and track spending against them

## Local Development

### Prerequisites

- Node.js
- PostgreSQL
- npm

### Run the app

```bash
npm run dev
```

### Lint the project

```bash
npm run lint
```

### Build for production

```bash
npm run build
```

## Future Improvements

- Smarter automatic transaction categorization rules
- More advanced charts and visual reporting
- Recurring transaction detection
- Budget alerts and notifications
- Expanded account and transaction filtering
- Improved settings and profile management
- Improved UI and UX
- Account subscriptions through Stripe's API
