# Swappy

Swappy is a peer-to-peer marketplace and classifieds platform designed for buying, selling, and swapping iPhones. Inspired by platforms like Jiji, Swappy provides a focused, streamlined experience tailored specifically for iPhone buyers, sellers, and trade-in deals.

## Features and Vision

- Dedicated iPhone marketplace: Browse, search, and list iPhone models with detailed device conditions, battery health, storage capacities, and carrier status.
- Direct swaps and trade-ins: Connect with users to negotiate device exchanges or trade up to newer models.
- Fast, modern web experience: Built on TanStack Start for server-side rendering, quick page loads, and seamless navigation.

## Tech Stack

- Framework: TanStack Start (React 19)
- Routing: TanStack Router (file-based routing)
- Styling: Tailwind CSS v4 and DaisyUI
- State Management: Jotai and Zustand
- Server Engine: Nitro
- Package Manager and Runtime: Bun

## Getting Started

### Prerequisites

Ensure you have [Bun](https://bun.sh/) installed on your machine.

### Installation

Clone the repository and install the dependencies:

```bash
bun install
```

### Development Server

Start the local development server on port 3001:

```bash
bun run dev
```

The application will be accessible at http://localhost:3001.

### Route Generation

To generate route configurations manually using TanStack Router CLI:

```bash
bun run generate-routes
```

### Type Checking

To verify TypeScript types across the codebase:

```bash
bun run typecheck
```

## Building for Production

To create an optimized production build:

```bash
bun run build
```

To preview the production build locally:

```bash
bun run preview
```

## Deployment

Swappy uses Nitro as a generic server adapter, allowing it to run on any Node-compatible host or modern cloud provider.

```bash
bun run build
node dist/server/index.mjs
```

The build output produces a self-contained server in the `dist/` directory. You can deploy this directory to hosts such as Fly.io, Render, VPS environments, or cloud platforms with Nitro presets (Vercel, Netlify, Cloudflare). For host-specific configuration, refer to the [Nitro documentation](https://v3.nitro.build/deploy).

## Project Structure

- `src/routes/`: File-based route definitions and layouts managed by TanStack Router.
- `src/routes/__root.tsx`: Root route layout containing HTML shell, metadata, and shared wrappers.
- `src/router.tsx`: TanStack Router configuration and initialization.
- `src/styles.css`: Global styles and Tailwind CSS configurations.

## Routing and Navigation

Routing is handled via TanStack Router with file-based routing.

### Adding a Route

To add a new route, create a new file in `src/routes/`. TanStack Router will automatically generate or update the route tree in `src/routeTree.gen.ts`.

### Navigation

For client-side Single Page Application (SPA) navigation, use the `Link` component from `@tanstack/react-router`:

```tsx
import { Link } from "@tanstack/react-router";

export function Nav() {
  return (
    <nav>
      <Link to="/">Home</Link>
      <Link to="/listings">Browse iPhones</Link>
    </nav>
  );
}
```

## Server Functions

TanStack Start provides server functions for server-side operations that integrate cleanly with client components:

```tsx
import { createServerFn } from "@tanstack/react-start";

export const getListings = createServerFn({
  method: "GET",
}).handler(async () => {
  return [{ id: "1", model: "iPhone 15 Pro", price: 850 }];
});
```

## Learn More

- [TanStack Start Documentation](https://tanstack.com/start)
- [TanStack Router Documentation](https://tanstack.com/router)
- [Tailwind CSS Documentation](https://tailwindcss.com/)
- [Nitro Documentation](https://nitro.build/)
