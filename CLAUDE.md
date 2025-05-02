# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Freelens extension that demonstrates how to build extensions for the Freelens Kubernetes IDE. It provides example implementations of custom Kubernetes resources (CRDs), UI components, preferences, and menus.

## Development Commands

### Building
```bash
pnpm build              # Build the extension (runs type:check first)
pnpm build:production   # Production build (no module preservation)
pnpm build:force        # Force build without prebuild checks
```

### Linting
```bash
pnpm lint:check         # Check code style with Biome and Prettier
pnpm lint:fix           # Auto-fix linting issues
pnpm trunk:check        # Run Trunk checks
pnpm trunk:fix          # Auto-fix Trunk issues
```

### Type Checking
```bash
pnpm type:check         # TypeScript type checking (automatically run before build)
```

### Dependency Analysis
```bash
pnpm knip:check         # Check for unused dependencies (both dev and prod)
pnpm knip:development   # Check development dependencies only
pnpm knip:production    # Check production dependencies (strict mode)
```

### Development Workflow
```bash
pnpm dev                # Watch mode with auto-build (symlinks to Freelens)
pnpm install:freelens   # Build and install to local Freelens instance
```

### Packaging
```bash
pnpm pack:dev           # Bump version, build, and pack for testing
pnpm pack              # Create tarball for distribution
```

### Cleaning
```bash
pnpm clean              # Clean build output
pnpm clean:all          # Clean all generated files (out/, *.tgz, *.d.ts, node_modules)
```

## Architecture

### Extension Structure

This extension follows Freelens's dual-process architecture:

1. **Main Process** (`src/main/`): Node.js context with full system access
   - Entry: `src/main/index.ts`
   - Extends `Main.LensExtension`
   - Initializes stores during activation
   - Output: `out/main/index.js` (CommonJS)

2. **Renderer Process** (`src/renderer/`): UI context running in browser environment
   - Entry: `src/renderer/index.tsx`
   - Extends `Renderer.LensExtension`
   - Registers UI components, pages, menus, and preferences
   - Output: `out/renderer/index.js` (CommonJS)

3. **Common Code** (`src/common/`): Shared between main and renderer
   - State management with MobX stores
   - Utilities and shared types

### Key Concepts

**Multi-Version CRD Support**: The extension demonstrates handling multiple API versions (v1alpha1, v1alpha2) of the same resource. Each version has:
- Separate Kubernetes object classes (`Example` in `example-v1alpha1.ts` and `example-v1alpha2.ts`)
- Dedicated detail components
- Version-specific pages
- An "available version" selector that shows the appropriate UI based on what's available in the cluster

**Externalized Dependencies**: Critical dependencies are provided by Freelens as globals and must NOT be bundled:
- `@freelensapp/extensions` → `global.LensExtensions`
- `mobx` → `global.Mobx`
- `mobx-react` → `global.MobxReact`
- `react` → `global.React`
- `react-dom` → `global.ReactDom`
- `react-router-dom` → `global.ReactRouterDom`

This is configured in `electron.vite.config.js` using `externalizeDepsPlugin` and `vite-plugin-external`.

**Extension Registration Pattern**: The renderer's `index.tsx` exports arrays that declaratively register:
- `appPreferences`: Extension settings in Freelens preferences
- `kubeObjectDetailItems`: Custom detail views for CRD instances
- `clusterPages`: Full-page views accessible from sidebar
- `clusterPageMenus`: Sidebar menu items
- `kubeObjectMenuItems`: Context menu items for resources

**MobX State Management**: Uses MobX with TypeScript decorators (version 2023-05) configured via Babel. Stores extend `Common.Store.ExtensionStore` and implement:
- `fromStore()`: Load persisted state
- `toJSON()`: Serialize state for persistence
- Observable properties with `@observable accessor`

### File Organization

```
src/
├── main/           # Main process code
│   └── index.ts    # Main extension class
├── renderer/       # Renderer process UI
│   ├── components/ # Reusable UI components
│   ├── details/    # CRD detail views (per API version)
│   ├── icons/      # Custom icons
│   ├── k8s/        # Kubernetes object definitions
│   ├── menus/      # Context menu items (per API version)
│   ├── pages/      # Full-page cluster views (per API version)
│   ├── preferences/# Settings UI
│   └── index.tsx   # Renderer extension class
└── common/         # Shared code
    ├── store/      # MobX stores
    └── utils.ts    # Shared utilities
```

## Build Configuration

**TypeScript**: Uses `@electron-toolkit/tsconfig` with Node 10 module resolution and React JSX transform.

**Vite**: Configured via `electron-vite`:
- Main process: Single entry CommonJS module
- Renderer process: CommonJS module with CSS modules (camelCaseOnly convention)
- Both use `preserveModules: true` by default (can be disabled with `VITE_PRESERVE_MODULES=false`)
- SCSS modules generate `.d.ts` files via `vite-plugin-sass-dts`

**Linting**: Dual setup with Biome (primary) and Prettier (fallback). Import organization enforces specific grouping:
1. Type imports (excluded)
2. Node.js built-ins
3. `@freelensapp/**` packages
4. Other packages
5. Relative path imports

## Testing the Extension

### Quick Development (Recommended)

For active development with automatic rebuilds:

```bash
pnpm dev
```

This creates a symlink from your project to Freelens's extension directory and starts watch mode. After making changes:
1. Wait for the build to complete
2. Restart Freelens (`Cmd+R` / `Ctrl+R`)
3. Your changes will be loaded

### One-Time Install

To build and install to your local Freelens:

```bash
pnpm install:freelens
```

Then restart Freelens to load the extension.

### Manual Installation (Legacy)

1. Build and pack: `pnpm pack:dev`
2. In Freelens, go to Extensions (`Ctrl+Shift+E` / `Cmd+Shift+E`)
3. Drag and drop the `.tgz` file into Freelens

### Testing with Kubernetes Resources

1. Apply example CRDs: `kubectl apply -f examples/crds/customresourcedefinition.yaml`
2. Create test resources: `kubectl apply -f examples/test/example.yaml`
3. The extension's UI will appear in Freelens sidebar

## Working with Freelens API

The extension uses `@freelensapp/extensions` which provides:
- `Main.LensExtension`: Base class for main process
- `Renderer.LensExtension`: Base class for renderer process
- `Renderer.K8sApi.LensExtensionKubeObject`: Base for custom resource classes
- `Renderer.K8sApi.KubeApi`: API client for resources
- `Renderer.K8sApi.KubeObjectStore`: Store for resource instances
- `Common.Store.ExtensionStore`: Persisted configuration store

For creating new CRD support, define:
1. TypeScript interfaces for `spec` and `status`
2. Class extending `LensExtensionKubeObject` with static metadata
3. Corresponding `KubeApi` and `KubeObjectStore` classes
4. Detail component implementing `Renderer.Component.KubeObjectDetailsProps`
5. Registration in renderer's `kubeObjectDetailItems`
