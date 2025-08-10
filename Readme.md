# Consistent Hashing

[![npm version](https://badge.fury.io/js/%40ishanjain1502%2Fconsistent-hashing.svg)](https://badge.fury.io/js/%40ishanjain1502%2Fconsistent-hashing)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://typescriptlang.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](https://opensource.org/licenses/ISC)

A robust TypeScript implementation of consistent hashing for distributed systems. This library provides an efficient way to distribute keys across nodes while minimizing redistribution when nodes are added or removed.

## 🚀 Features

- **Efficient Key Distribution**: Uses a hash ring with virtual nodes to ensure even distribution
- **Minimal Redistribution**: Only a small fraction of keys move when nodes are added/removed
- **TypeScript Support**: Fully typed with comprehensive type definitions
- **Configurable**: Supports custom number of replicas and hash functions
- **Weighted Nodes**: Support for node weights to handle different node capacities
- **Multiple Node Selection**: Get multiple nodes for replication and failover scenarios
- **Zero Dependencies**: Only uses Node.js built-in `crypto` module

## 📦 Installation

```bash
npm install @ishanjain1502/consistent-hashing
```

## 🔧 Usage

### Basic Usage

```typescript
import { ConsistentHashRing } from '@ishanjain1502/consistent-hashing';

// Create a new hash ring
const hashRing = new ConsistentHashRing({
  replicas: 100,  // Number of virtual nodes per physical node
  hashFn: 'md5'   // Hash function to use
});

// Add nodes to the ring
hashRing.addNode('server1');
hashRing.addNode('server2');
hashRing.addNode('server3');

// Get the node responsible for a key
const node = hashRing.getNode('user123');
console.log(`Key 'user123' belongs to: ${node}`);

// Remove a node
hashRing.removeNode('server2');
```

### Advanced Usage

#### Weighted Nodes

```typescript
// Add nodes with different weights
hashRing.addNode('powerful-server', 2.0);  // Gets 2x more keys
hashRing.addNode('regular-server', 1.0);   // Standard capacity
hashRing.addNode('small-server', 0.5);     // Gets 0.5x keys
```

#### Multiple Node Selection (for Replication)

```typescript
// Get multiple nodes for replication
const nodes = hashRing.getNodes('important-data', 3);
console.log(`Replicate to nodes: ${nodes.join(', ')}`);
```

#### Ring Inspection

```typescript
// Get a snapshot of the current ring state
const snapshot = hashRing.getRingSnapshot();
console.log('Ring state:', snapshot);
```

### Configuration Options

```typescript
interface ConsistentHashRingOptions {
  replicas?: number;  // Default: 100 - Number of virtual nodes per physical node
  hashFn?: string;    // Default: 'md5' - Hash function (any supported by Node.js crypto)
}
```

## 🏗️ API Reference

### `ConsistentHashRing`

#### Constructor

```typescript
new ConsistentHashRing(options?: ConsistentHashRingOptions)
```

#### Methods

- **`addNode(nodeId: string, weight?: number): void`**
  - Adds a node to the hash ring
  - `weight` defaults to 1.0 (higher weight = more keys assigned)

- **`removeNode(nodeId: string): boolean`**
  - Removes a node from the hash ring
  - Returns `true` if node was found and removed, `false` otherwise

- **`getNode(key: string): string | null`**
  - Returns the node responsible for the given key
  - Returns `null` if no nodes are available

- **`getNodes(key: string, count?: number): string[]`**
  - Returns up to `count` distinct nodes for the key (for replication)
  - Useful for implementing replication and failover

- **`getRingSnapshot(): RingSnapshot[]`**
  - Returns the current state of the hash ring for debugging/monitoring

## 🧪 Example: Distributed Cache

```typescript
import { ConsistentHashRing } from '@ishanjain1502/consistent-hashing';

class DistributedCache {
  private hashRing: ConsistentHashRing;
  private servers: Map<string, CacheServer>;

  constructor() {
    this.hashRing = new ConsistentHashRing({ replicas: 150 });
    this.servers = new Map();
  }

  addServer(serverId: string, capacity: number = 1.0) {
    this.hashRing.addNode(serverId, capacity);
    this.servers.set(serverId, new CacheServer(serverId));
  }

  removeServer(serverId: string) {
    this.hashRing.removeNode(serverId);
    this.servers.delete(serverId);
  }

  set(key: string, value: any) {
    const serverId = this.hashRing.getNode(key);
    if (serverId) {
      const server = this.servers.get(serverId);
      server?.set(key, value);
    }
  }

  get(key: string) {
    const serverId = this.hashRing.getNode(key);
    if (serverId) {
      const server = this.servers.get(serverId);
      return server?.get(key);
    }
    return null;
  }

  // Implement replication
  setWithReplication(key: string, value: any, replicas: number = 2) {
    const serverIds = this.hashRing.getNodes(key, replicas);
    serverIds.forEach(serverId => {
      const server = this.servers.get(serverId);
      server?.set(key, value);
    });
  }
}
```

## 🔬 How It Works

Consistent hashing solves the problem of distributing keys across nodes in a way that minimizes redistribution when the set of nodes changes.

### The Hash Ring

1. **Virtual Nodes**: Each physical node is represented by multiple virtual nodes (replicas) on a hash ring
2. **Key Mapping**: Keys are hashed and mapped to the first virtual node clockwise on the ring
3. **Even Distribution**: Virtual nodes ensure keys are distributed evenly, even with varying numbers of physical nodes

### Benefits

- **Scalability**: Add/remove nodes with minimal key redistribution
- **Load Balancing**: Virtual nodes provide better key distribution
- **Fault Tolerance**: Easy to implement replication and failover

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run linting
npm run lint

# Format code
npm run format
```

## 🛠️ Development

```bash
# Clone the repository
git clone https://github.com/ishanjain1502/consistent-hashing.git

# Install dependencies
npm install

# Build the project
npm run build

# Watch for changes during development
npm run dev
```

## 📊 Performance

The library is optimized for performance:

- **O(log n)** complexity for key lookups using binary search
- **O(n)** complexity for node addition/removal
- Minimal memory overhead with efficient data structures

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

## 📄 License

This project is licensed under the ISC License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Inspired by the original consistent hashing research
- Built with TypeScript for better developer experience
- Designed for modern distributed systems

---

**Keywords**: consistent hashing, distributed systems, load balancing, TypeScript, hash ring, virtual nodes
