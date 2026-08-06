import { ServiceIdentifier } from './IServiceContainer';
import { CircularDependencyError } from '../error/DIPluginErrors';

export class DependencyGraph {
  private nodes: Set<string> = new Set();
  private edges: Map<string, Set<string>> = new Map();

  addNode(id: ServiceIdentifier): string {
    const key = this.stringifyId(id);
    this.nodes.add(key);
    if (!this.edges.has(key)) {
      this.edges.set(key, new Set());
    }
    return key;
  }

  addEdge(from: ServiceIdentifier, to: ServiceIdentifier): void {
    const fromKey = this.addNode(from);
    const toKey = this.addNode(to);
    this.edges.get(fromKey)!.add(toKey);
  }

  detectCycles(): void {
    const visited = new Set<string>();
    const recStack = new Set<string>();
    const pathStack: string[] = [];

    const dfs = (node: string): boolean => {
      visited.add(node);
      recStack.add(node);
      pathStack.push(node);

      const neighbors = this.edges.get(node) || new Set();
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          if (dfs(neighbor)) return true;
        } else if (recStack.has(neighbor)) {
          pathStack.push(neighbor);
          const cycleStart = pathStack.indexOf(neighbor);
          throw new CircularDependencyError(pathStack.slice(cycleStart));
        }
      }

      recStack.delete(node);
      pathStack.pop();
      return false;
    };

    for (const node of this.nodes) {
      if (!visited.has(node)) {
        dfs(node);
      }
    }
  }

  stringifyId(id: ServiceIdentifier): string {
    if (typeof id === 'string') return id;
    if (typeof id === 'symbol') return id.toString();
    return id.name || 'AnonymousConstructor';
  }

  toDOT(): string {
    const lines = ['digraph DependencyGraph {'];
    for (const [from, neighbors] of this.edges.entries()) {
      for (const to of neighbors) {
        lines.push(`  "${from}" -> "${to}";`);
      }
    }
    lines.push('}');
    return lines.join('\n');
  }
}
