# Sabrvalues

A web platform providing valuation data, statistics, and trading utilities for the Roblox game **Steal a Brainrot**. Players can check item values, track traits and mutations, evaluate trades, and participate in a community trading ecosystem.

## Features

- **Brainrot Valuation Index** — Browse the complete catalog of all Brainrots with images, stats, and current market values
- **Individual Detail View** — Deep-dive into any Brainrot with full metadata, trait/mutation selectors, and dynamic value recalculation
- **Trait & Mutation System** — Apply modifiers (Gold, Diamond, Candy, Lava, Strawberry, Rainbow mutations + stackable traits) to see real-time value adjustments
- **Trade Calculator** — Evaluate trade fairness by comparing total values on both sides with Win/Loss/Fair results
- **Trading Feed** — Community marketplace with live trade posts, W/L/F status, and trade history

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI:** React 19, Tailwind CSS 4, DaisyUI 5
- **Authentication:** NextAuth
- **Database:** Firebase / Firestore
- **Storage:** AWS S3
- **Rich Text:** Tiptap
- **Animations:** Lenis (smooth scroll)
- **Icons:** Lucide React
- **Testing:** Playwright

## Getting Started

### Prerequisites

- Node.js 18+
- npm, yarn, pnpm, or bun

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/sabrvalues.git
cd sabrvalues

# Install dependencies
npm install

# Copy environment variables
cp env.example .env.local
# Fill in your Firebase, AWS, and NextAuth credentials
```

### Development

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

### Build & Production

```bash
npm run build
npm start
```

### Linting

```bash
npm run lint
```

## Project Structure

```
src/
├── app/           # Next.js App Router pages & API routes
├── components/    # Reusable UI components (prefixed by type)
├── context/       # React context providers
├── hooks/         # Custom React hooks
└── lib/           # Utilities, Firebase config, helpers
public/
├── fonts/         # Custom fonts (PP Mori)
└── images/        # Static assets (brainrots, hero images)
```

## Value System

Values are expressed relative to **LGC (La Grande Combinasion)** — a Secret-rarity brainrot costing $1B with $10M/s income.

**Mutation Multipliers:** Gold (1.25x), Diamond (1.5x), Candy (4x), Lava (6x), Strawberry (8x), Rainbow (10x)

**Traits:** Stackable modifiers from events that add to the final multiplier.

**Formula:** `Final Value = Base Value × (Mutation Multiplier + Traits Multiplier - 1)`

## Environment Variables

See `env.example` for required configuration:

- Firebase credentials
- NextAuth secret & providers
- AWS S3 configuration

## License

Private project — All rights reserved.

Yay!