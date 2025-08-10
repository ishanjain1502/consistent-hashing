/**
 * Type definitions for the consistent hashing library
 */

export interface RingEntry {
  hash: bigint;
  vnode: string;
  node: string;
}

export interface ConsistentHashRingOptions {
  replicas?: number;
  hashFn?: string;
}

export interface RingSnapshot {
  hash: string;
  vnode: string;
  node: string;
}

// Legacy types for backward compatibility
export interface Node {
  id: string;
  weight?: number;
}

export interface HashRingOptions {
  virtualNodes?: number;
  hashFunction?: (key: string) => number;
}

export type HashFunction = (key: string) => number;