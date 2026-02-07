# FoodieExpress - Order Management System

A full-stack food delivery order management application built with Next.js and Express.

## Tech Stack

**Frontend:** Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, React Query, React Hook Form, Zod

**Backend:** Express 5, TypeScript, Prisma 7, PostgreSQL (Neon), Zod

**Testing:** Vitest, Supertest

## Features

- Browse menu items grouped by category with search and filtering
- Add items to cart with quantity controls (persisted in localStorage)
- Checkout with validated delivery details form
- Real-time order status tracking with simulated progress
- Dark mode support
- Responsive design with mobile-optimized bottom cart bar
- Input validation on both client and server
- Forward-only order status transitions

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (or a Neon account)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file based on `env.template`:

```
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
FRONTEND_URL="http://localhost:3000"
```

Generate Prisma client and push schema:

```bash
npx prisma generate
npx prisma db push
npm run seed
```

Start the dev server:

```bash
npm run dev
```

The API runs at `http://localhost:3001`.

### Frontend Setup

```bash
cd frontend
npm install
```

Create a `.env.local` file:

```
NEXT_PUBLIC_API_URL=http://localhost:3001
```

Start the dev server:

```bash
npm run dev
```

The app runs at `http://localhost:3000`.

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/api/menu` | Get all menu items (optional `?category=` filter) |
| GET | `/api/menu/:id` | Get a single menu item |
| POST | `/api/orders` | Create a new order |
| GET | `/api/orders` | List all orders |
| GET | `/api/orders/:id` | Get order by ID |
| PATCH | `/api/orders/:id/status` | Update order status (forward-only) |
| POST | `/api/orders/:id/simulate` | Simulate next status progression |

## Running Tests

```bash
cd backend
npm test
```

70 tests across 3 test files covering validation schemas, API endpoints, status transitions, and error handling.

## Project Structure

```
├── backend/
│   ├── src/
│   │   ├── app.ts              # Express app setup
│   │   ├── index.ts            # Server entry point
│   │   ├── seed.ts             # Database seeder
│   │   ├── lib/
│   │   │   ├── prisma.ts       # Prisma client
│   │   │   ├── validation.ts   # Zod schemas
│   │   │   └── validation.test.ts
│   │   └── routes/
│   │       ├── menu.ts         # Menu API routes
│   │       ├── menu.test.ts
│   │       ├── orders.ts       # Orders API routes
│   │       └── orders.test.ts
│   └── prisma/
│       └── schema.prisma       # Database schema
├── frontend/
│   ├── app/
│   │   ├── page.tsx            # Home page (menu)
│   │   ├── order/[id]/page.tsx # Order tracking page
│   │   ├── layout.tsx
│   │   ├── providers.tsx
│   │   └── globals.css
│   ├── components/
│   │   ├── menu/               # Menu display components
│   │   ├── cart/               # Cart sheet and items
│   │   ├── checkout/           # Checkout form
│   │   ├── order/              # Order status tracking
│   │   └── theme-toggle.tsx    # Dark mode toggle
│   ├── hooks/
│   │   └── use-cart.ts         # Cart state management
│   └── lib/
│       ├── api.ts              # API client functions
│       ├── queries.ts          # React Query hooks
│       └── utils.ts
└── README.md
```
