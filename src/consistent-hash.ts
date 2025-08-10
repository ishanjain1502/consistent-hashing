/**
 * Problem: map keys to nodes so that when nodes are added/removed only a small fraction of keys move.
 * 
 * Classic approach: place nodes on a hash ring (0..2^64-1). Hash each key and walk clockwise to the first node hash — that's the node responsible.
 * Virtual nodes: each physical node is represented by many points on the ring (reduces variance).
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 */

import crypto from 'crypto';
import { RingEntry, ConsistentHashRingOptions, RingSnapshot  } from './types';

export class ConsistentHashRing {

  private replicas: number;
  private hashFn: string;
  private ring: RingEntry[];
  private nodeMap: Map<string, Set<string>>;

  constructor({ replicas = 100, hashFn = 'md5' }: ConsistentHashRingOptions = {}) {
    this.replicas = replicas;
    this.hashFn = hashFn;
    // ring is an array of { hash: BigInt, vnode: string, node: string }
    this.ring = [];
    // map physical node -> Set of vnode identifiers (for removal)
    this.nodeMap = new Map();
  }

  private _hashToBigInt(input: string): bigint {
    // produce hex digest, take first 16 hex chars (64 bits) to BigInt
    const h = crypto.createHash(this.hashFn).update(String(input)).digest('hex');
    // take first 16 hex chars for a 64-bit value (BigInt)
    const hex64 = h.slice(0, 16);
    return BigInt('0x' + hex64);
  }
  private _binarySearch(hash: bigint): number {
    // returns index of first ring entry with hash >= given hash
    let lo = 0, hi = this.ring.length - 1;
    if (this.ring.length === 0) return -1;
    if (hash <= this.ring[0].hash) return 0;
    if (hash > this.ring[hi].hash) return 0; // wrap-around -> first index
    while (lo <= hi) {
      const mid = Math.floor((lo + hi) / 2);
      if (this.ring[mid].hash === hash) return mid;
      if (this.ring[mid].hash < hash) lo = mid + 1;
      else hi = mid - 1;
    }
    return lo; // first greater
  }
  addNode(nodeId: string, weight = 1): void {
    if (this.nodeMap.has(nodeId)) {
      throw new Error(`Node ${nodeId} already exists`);
    }
    const vnodeSet = new Set<string>();
    const replicasForNode = Math.max(1, Math.round(this.replicas * weight));
    for (let i = 0; i < replicasForNode; i++) {
      const vnodeId = `${nodeId}#${i}`;
      const h = this._hashToBigInt(vnodeId);
      // insert in sorted manner (push then sort is simpler; but efficient insertion is possible)
      this.ring.push({ hash: h, vnode: vnodeId, node: nodeId });
      vnodeSet.add(vnodeId);
    }
    // sort ring by hash numeric ascending
    this.ring.sort((a, b) => (a.hash < b.hash ? -1 : a.hash > b.hash ? 1 : 0));
    this.nodeMap.set(nodeId, vnodeSet);
  }

  removeNode(nodeId: string): boolean {
    const vnodeSet = this.nodeMap.get(nodeId);
    if (!vnodeSet) return false;
    // filter out ring entries belonging to the node
    this.ring = this.ring.filter(entry => entry.node !== nodeId);
    this.nodeMap.delete(nodeId);
    return true;
  }

  getNode(key: string): string | null {
    if (this.ring.length === 0) return null;
    const h = this._hashToBigInt(key);
    const idx = this._binarySearch(h);
    if (idx === -1) return null;
    return this.ring[idx].node;
  }

  getNodes(key: string, count = 1): string[] {
    // return up to `count` distinct physical nodes for replication/failover
    const result: string[] = [];
    if (this.ring.length === 0 || count <= 0) return result;
    const h = this._hashToBigInt(key);
    let idx = this._binarySearch(h);
    if (idx === -1) return result;
    const seen = new Set();
    let i = idx;
    while (result.length < count) {
      const node = this.ring[i].node;
      if (!seen.has(node)) {
        result.push(node);
        seen.add(node);
      }
      i = (i + 1) % this.ring.length;
      // safety: if we've looped all ring and can't find more distinct nodes, break
      if (i === idx) break;
    }
    return result;
  }

  getRingSnapshot(): RingSnapshot[] {
    // useful for testing/observability: returns array of {hash, vnode, node} as strings
    return this.ring.map(e => ({ hash: e.hash.toString(), vnode: e.vnode, node: e.node }));
  }
}

export default ConsistentHashRing;