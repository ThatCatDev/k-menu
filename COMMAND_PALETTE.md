# Command Palette (K-Menu)

This Freelens extension adds a command palette that can be triggered with **Cmd+K** (Mac) or **Ctrl+K** (Windows/Linux).

## Features

- **Global Keyboard Shortcut**: Press `Cmd+K` / `Ctrl+K` from anywhere in a cluster context
- **Real-time Resource Search**: Search across all Kubernetes resources as you type (150ms debounce)
- **Cluster-Specific Caching**: Resources are cached per cluster for fast subsequent searches
- **21 Resource Types Supported**: Pods, Deployments, Services, ConfigMaps, Secrets, and more
- **Fuzzy Matching**: Smart search that matches partial names and kinds
- **Quick Navigation**: Click any result to navigate to that resource's detail page
- **Keyboard Controls**:
  - `Cmd+K` / `Ctrl+K`: Toggle the command palette
  - `Esc`: Close the palette
  - Click on any result to navigate

## Usage

1. Navigate to any cluster in Freelens
2. Press `Cmd+K` (or `Ctrl+K`) to open the command palette
3. Start typing to search for resources (e.g., "nginx", "pod", "deployment")
4. Click on any result to navigate to that resource's detail page
5. Press `Esc` or `Cmd+K` again to close

## Implementation

The command palette is implemented using vanilla JavaScript (no React dependencies):

- **KMenuPalette** (`src/renderer/components/k-menu-palette.ts`): Main implementation with:
  - Kubernetes API resource fetching
  - Cluster-specific in-memory caching
  - Debounced search (150ms)
  - Fuzzy matching algorithm
  - Resource navigation
- **Integration** (`src/renderer/index.tsx`): Lifecycle management in the extension's `onActivate`/`onDeactivate` hooks

## How It Works

### Resource Loading

When you open the command palette in a cluster:

1. **Cluster Detection**: Checks if the current URL is in a cluster context (hostname matches `*.renderer.freelens.app`)
2. **Cache Check**: Looks for cached resources for the current cluster ID
3. **API Fetching**: If not cached, fetches resources from 21 different Kubernetes API endpoints in parallel:
   - Core resources: Pods, Services, ConfigMaps, Secrets, Namespaces, etc.
   - Apps: Deployments, StatefulSets, DaemonSets, ReplicaSets
   - Networking: Ingresses, NetworkPolicies
   - RBAC: Roles, RoleBindings, ClusterRoles, ClusterRoleBindings
   - Storage: PersistentVolumes, PersistentVolumeClaims, StorageClasses
   - Jobs: Jobs, CronJobs
4. **Caching**: Stores all resources in memory per cluster for instant subsequent searches
5. **Resource Breakdown**: Displays count by resource type (e.g., "5 Pods, 3 Deployments")

### Search Algorithm

The fuzzy matching algorithm searches for your query in:
- Resource name
- Resource namespace
- Resource kind

It performs case-insensitive substring matching and ranks results by relevance.

### Navigation

When you click a result, the extension:
1. Constructs the correct Freelens URL for that resource
2. Updates `window.location.pathname` to navigate
3. Closes the command palette

## Customization

### Adding More Resource Types

Edit the `resourceTypes` array in `src/renderer/components/k-menu-palette.ts`:

```typescript
const resourceTypes = [
  { kind: 'Pod', apiVersion: 'v1', plural: 'pods', namespaced: true },
  { kind: 'CustomResource', apiVersion: 'example.com/v1', plural: 'customresources', namespaced: true },
  // Add your custom resource types here
];
```

### Modifying the Search Algorithm

The `searchResources` method in `KMenuPalette` can be customized for different matching strategies:

```typescript
private searchResources(query: string): KubeResource[] {
  const lowerQuery = query.toLowerCase();
  return this.allResources.filter(resource => {
    // Customize your search logic here
    return resource.name.toLowerCase().includes(lowerQuery) ||
           resource.namespace?.toLowerCase().includes(lowerQuery) ||
           resource.kind.toLowerCase().includes(lowerQuery);
  });
}
```

## Architecture

### Vanilla JavaScript Implementation

The K-Menu palette is built with vanilla JavaScript and DOM manipulation to avoid dependencies on Freelens's global React instance. This ensures:
- No conflicts with Freelens's internal React version
- Predictable behavior across Freelens versions
- Minimal bundle size impact

### State Management

The `KMenuPalette` class manages all state internally:
- `isOpen`: Boolean flag for modal visibility
- `resourceCache`: Map of cluster ID → resources array
- `currentClusterId`: Active cluster identifier
- `allResources`: Flattened array of all resources for current cluster
- `searchDebounceTimer`: Timer ID for debounced search

### Lifecycle

1. **Initialization** (`src/renderer/index.tsx`):
   - Extension activates via `onActivate()` hook
   - Creates `KMenuPalette` instance
   - Waits for DOM ready state
   - Registers global keyboard listener

2. **Cleanup** (`src/renderer/index.tsx`):
   - Extension deactivates via `onDeactivate()` hook
   - Calls `kMenuPalette.destroy()`
   - Removes all event listeners
   - Cleans up DOM elements

## Future Enhancements

Potential features to add:

1. **Keyboard Navigation**: Arrow keys (↑/↓) to navigate search results, Enter to select
2. **Command Actions**: Multi-action support (e.g., "delete pod nginx", "restart deployment api")
3. **Recent Items**: Track and show recently accessed resources at the top
4. **Namespace Filtering**: Quick filter by namespace (e.g., "ns:default pod")
5. **Better Fuzzy Matching**: Implement Levenshtein distance or other advanced fuzzy algorithms
6. **Resource Actions Menu**: Right-click or hover to show quick actions (delete, edit, describe)
7. **CRD Support**: Dynamically discover and search Custom Resource Definitions
8. **Cross-Cluster Search**: Search across multiple connected clusters
9. **Result Ranking**: Score results by relevance (exact match > prefix > substring)
10. **Resource Icons**: Show resource type icons next to results
11. **Syntax Highlighting**: Highlight matched portions of the search query in results

## Development

To modify the command palette:

1. Edit the components in `src/renderer/components/`
2. Build: `pnpm build`
3. Install: `pnpm install:freelens`
4. Restart Freelens to see changes

For development with live reload:
```bash
pnpm dev
# Make changes, restart Freelens to see updates
```
