---
applyTo: '**'
---
Provide project context and coding guidelines that AI should follow when generating code, answering questions, or reviewing changes.

# Project Context and Coding Guidelines
Sabrvalues — Project Overview & Technical Brief
Project Purpose

Sabrvalues is a web platform designed to provide valuation data, statistics, and trading utilities for the Roblox game Steal a Brainrot. The platform centralizes information about every “Brainrot” item in the game, allowing players to check values, track traits and mutations, evaluate trades, and participate in a trade-posting ecosystem.

The project aims to deliver a clean, performant, production-ready web app that integrates with Roblox Cloud APIs and supports real-time gameplay-adjacent activity.

Core Features
1. Brainrot Valuation Index

A complete listing of all Brainrots available in the game.
The valuation list should display:

The name and image of each Brainrot.

Core statistics and metadata (definitions to be finalized later).

Current valuation metrics.

Users should be able to browse the entire catalog and quickly access individual details.

2. Individual Brainrot Detail View

When selecting a Brainrot from the valuation index, users access a dedicated detail page that includes:

Full stats and metadata.

Current market valuation.

Trait and mutation selectors.

Dynamic value adjustment based on applied traits/mutations.

The valuation engine will recalculate the value in real time based on the selected attributes.

3. Trait & Mutation Value Adjustment

Brainrots have modifiers (traits, mutations) that increase or decrease their worth.
The app must provide:

A clear UI for selecting one or more modifiers.

Defined value adjustments per modifier.

A recalculated final value presented to the user.

4. Trade Calculator

A utility for checking the fairness of a trade between two parties.
The calculator will:

Allow selection of multiple Brainrots for each side.

Apply trait/mutation adjustments as needed.

Display the total value for each side.

Output a win, loss, or fair result depending on valuation difference.

5. Trading Feed & Posts

A dedicated trading page acting as a community marketplace.
The page includes:

A live feed of recently posted trade ads.

Per-post detail view, showing:

W/L/F (win/loss/fair) status.

Valuation totals for each side.

All items involved and their modifiers.

Ability to opt into a trade.

Users should also be able to:

Create new trade posts.

View their own posting history.

Track previously completed trades (their own or public).

Inspect historical trades between other users.

Project Scope (Current Phase)

This document summarizes the high-level goals and primary structure of the Sabrvalues platform.
Feature definitions, data schemas, valuation formulas, trait modifiers, UI design systems, and API endpoints will be expanded in future technical documents.

The immediate goal is establishing the conceptual framework and core screens required for the application.

You are an expert in Web Development using the ShipFast boilerplate stack: JavaScript, Node.js, React, Next.js App Router, Tailwind CSS, NextAuth, Firebase and Firestore Database and Roblox Cloud APIs for the web.

Code Style and Structure

Write concise, technical JavaScript code with accurate examples.
Use functional and declarative programming patterns; avoid classes.
Prefer iteration and modularization over code duplication.
Use descriptive variable names with auxiliary verbs (e.g., isLoading, hasError).
Structure files: exported component, subcomponents, helpers, static content.

Naming Conventions

Use kebab-case for directories.
Use camelCase for variables and functions.
Use PascalCase for components.
File names for components should be in PascalCase. Rest of the files in kebab-case.
Prefix component names with their type (e.g. ButtonAccount.jsx and ButtonSignin.jsx, CardAnalyticsMain.jsx and CardAnalyticsData.jsx, etc.)

Syntax and Formatting

Use the "function" keyword for pure functions.
Avoid unnecessary curly braces in conditionals; use concise syntax for simple statements.
Use declarative JSX.

UI and Styling

Use DaisyUI and Tailwind CSS for components and styling.
Implement responsive design with Tailwind CSS; use a mobile-first approach.

Performance Optimization

Minimize 'use client', 'useState', and 'useEffect'; favor React Server Components (RSC).
Wrap client components in Suspense with fallback.
Use dynamic loading for non-critical components.
Optimize images: use WebP format, include size data, implement lazy loading.

Key Conventions

Optimize Web Vitals (LCP, CLS, FID).
Limit 'use client':
Favor server components and Next.js SSR.
Use only for Web API access in small components.
Avoid for data fetching or state management.
If absolutely necessary, you can use 'swr' library for client-side data fetching.
When using client-side hooks (useState and useEffect) in a component that's being treated as a Server Component by Next.js, always add the "use client" directive at the top of the file.
Follow Next.js docs for Data Fetching, Rendering, and Routing.

Design:
For all designs I ask you to make, have them be beautiful, not cookie cutter. Make webpages that are fully featured and worthy for production.
Do not install other packages for UI themes, icons, etc unless absolutely necessary or I request them.  