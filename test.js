import { ConsistentHashRing } from './dist/index.js';

const start = () => {
    const hashRing = new ConsistentHashRing({ replicas: 100, hashFn: 'md5' });
    hashRing.addNode('node1', 1);
    hashRing.addNode('node2', 1);
    hashRing.addNode('node3', 1);
    console.log(hashRing.getNode('key1'));
    console.log(hashRing.getNode('key2'));
    console.log(hashRing.getNode('key3'));
    console.log(hashRing.getNode('key4'));
    console.log(hashRing.getNode('key5'));
    console.log(hashRing.getNode('key6'));
    console.log(hashRing.getNode('key7'));
    console.log(hashRing.getNode('key8'));
    console.log(hashRing.getNode('key9'));
    console.log(hashRing.getNode('key10'));
    console.log(hashRing.getRingSnapshot());
}

start();