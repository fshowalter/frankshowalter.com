# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

### Core Development

- `npm run dev` or `npm start` - Start development server
- `npm run build` - Build production site
- `npm run preview` - Preview production build locally

### Code Quality

- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint issues
- `npm run format` - Check Prettier formatting
- `npm run format:fix` - Fix Prettier formatting
- `npm run stylelint` - Run Stylelint for CSS
- `npm run stylelint:fix` - Fix Stylelint issues
- `npm run knip` - Check for unused dependencies/exports

### Additional Tools

- `npm run check` - Run Astro type checking
- `npm run update:data` - Update content data

## Architecture Overview

### Tech Stack

- **Framework**: Astro 5.x
- **Styling**: TailwindCSS 4.x with custom CSS variables
- **Images**: Sharp for image processing, Satori for Open Graph images

### Project Structure

```
src/
├── api/           # Data access layer and content parsing
├── components/    # Shared components organized by purpose
├── css/           # Global CSS and styles
├── features/      # Feature-specific components and logic
├── pages/         # Astro pages and API routes
└── utils/         # Shared utility functions

content/
├── data/          # JSON data files (booklog, movielog)
└── assets/        # Static images and media files
```

### Key Patterns

**Component Architecture**:

- Shared components live in `/components/` organized by purpose (e.g., update-list, grade, sub-heading)
- Feature-specific components are in `/features/` (e.g., home) with co-located getProps functions
- Components follow a props-based pattern with TypeScript interfaces

### Configuration Details

**Path Aliases**: `~/*` maps to `src/*` for clean imports

**ESLint Config**: Comprehensive setup including Astro, TypeScript, Unicorn, and Perfectionist plugins with custom rule overrides

**Build Optimization**: Astro configured with inlined stylesheets

## Development Notes

- The site focuses on movie and book reviews with a content-driven architecture
- All imports use TypeScript path aliases (`~/`)
- Content data updates require running the `update:data` script
