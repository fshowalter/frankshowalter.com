# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `npm run dev` or `npm start` - Start development server
- `npm run build` - Build production site
- `npm run preview` - Preview production build locally

### Testing & Quality

- `npm test` - Run all tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:update` - Update test snapshots

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Check Prettier formatting
- `npm run format:fix` - Fix Prettier formatting
- `npm run stylelint` - Run Stylelint for CSS
- `npm run stylelint:fix` - Fix Stylelint issues
- `npm run lint:spelling` - Check spelling with cspell
- `npm run knip` - Check for unused dependencies/exports

### Additional Tools

- `npm run check` - Run Astro type checking
- `npm run update:data` - Update content data (requires Node --experimental-strip-types)

## Architecture Overview

### Tech Stack

- **Framework**: Astro 5.x with React integration
- **Styling**: TailwindCSS 4.x with custom CSS variables
- **Testing**: Vitest with Istanbul coverage
- **Content**: JSON-based content management in `/content` directory
- **Images**: Sharp for image processing, Satori for Open Graph images

### Project Structure

```
src/
├── api/           # Data access layer and content parsing
├── astro/         # Astro-specific components (layouts, shells)
├── components/    # Shared React components organized by purpose
├── css/           # Global CSS and styles
├── features/      # Feature-specific components and logic
├── pages/         # Astro pages and API routes
└── utils/         # Shared utility functions

content/
├── data/          # JSON data files (booklog, movielog)
└── assets/        # Static images and media files
```

### Key Patterns

**Content Management**: Content is stored as JSON files in `/content/data/` and parsed through the API layer using Zod schemas. The `getContentPath` utility handles path resolution.

**Component Architecture**:

- Shared components live in `/components/` organized by purpose (e.g., update-list, grade, sub-heading)
- Feature-specific components are in `/features/` (e.g., home, recent-updates) with co-located getProps functions
- Astro-specific components (layouts, shells) are in `/astro/`
- Components follow a props-based pattern with TypeScript interfaces

**Image Handling**: Images are processed through the `/src/api/images.ts` system with automatic optimization. Open Graph images are generated dynamically using Satori.

**Testing Strategy**: Tests use snapshot testing for page outputs and unit testing for utilities. The setup includes mocking for content path resolution.

### Configuration Details

**Path Aliases**: `~/*` maps to `src/*` for clean imports

**Vitest Setup**:

- Global teardown enabled for testing-library
- Istanbul coverage provider
- Separate project config for pages with Node environment
- Setup file handles content path mocking

**ESLint Config**: Comprehensive setup including Astro, React, TypeScript, Unicorn, and Perfectionist plugins with custom rule overrides

**Build Optimization**: Astro configured with inlined stylesheets and React compiler babel plugin for performance

## Development Notes

- The site focuses on movie and book reviews with a content-driven architecture
- Custom HMR plugin reloads when content files change
- All imports use TypeScript path aliases (`~/`)
- Content data updates require running the `update:data` script
- Tests include snapshot testing for rendered HTML output
