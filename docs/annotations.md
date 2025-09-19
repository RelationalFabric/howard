# Annotations: Intelligent Claims and Implicit Proofs

## The Basis for Intelligent Claims

In most applications, every time a logical check is run, the entire process is re-executed, regardless of whether the underlying data has changed. This leads to redundant and computationally expensive work, especially for deeply nested objects. 

Howard solves this problem by using a powerful combination of:
- **Value semantics**
- **Hashing** 
- **Object metadata**

This system allows Howard to implicitly store and retrieve runtime data about an object, turning claims from simple functions into state-aware assertions.

## Proofs as Implicit Metadata

The core principle behind Howard's performance is simple: the act of checking a claim automatically generates a **proof**, and this proof is stored as a piece of metadata on the object itself. There is no extra ceremony. When you run `claim(value)`, Howard not only gives you the result but also leaves behind an immutable record of that evaluation on the object.

### Key Concepts

This is made possible by two fundamental concepts:

1. **Value Semantics:** Howard considers two objects equal if their contents are the same, regardless of their location in memory. This is critical because it means a claim's result for a given object should only change if the object's value changes.

2. **Hashing:** To make the process of checking for changes in an object's value incredibly fast, Howard uses a hash. A hash is a unique, fixed-size fingerprint of an object's content. If the object's content changes, its hash will change. This gives Howard a powerful, near-instantaneous way to determine if a cached result is still valid.

### How It Works

The caching mechanism follows this process:

1. When a claim is evaluated for the first time on an object, Howard computes a hash of that object's value.
2. The claim's result (a proof) is stored in the object's metadata, along with the hash.
3. The next time the same claim is evaluated on the same object, Howard first computes the object's current hash.
4. If the new hash matches the cached hash, Howard knows the object hasn't changed. It returns the cached result immediately, skipping the full evaluation. If the hashes don't match, the claim is re-evaluated, and the cache is updated.

## Querying the Implicit Proofs

The metadata Howard attaches to an object is not a black box; it's a valuable, queryable runtime cache. You can retrieve a proof from an object's metadata without having to re-run the check. This is particularly useful for performing quick lookups in performance-critical code.

### Using `queryClaims`

The `queryClaims` function is used to check if a specific claim has a cached proof on an object:

```javascript
import { claims, prove, queryClaims } from 'howard';

// Assume 'aUser', 'HasCart', and 'IsEmpty' already exist.
const { aUser, HasCart, IsEmpty } = claims({ /* ... */ });

// We define a base object
const myUser = { id: 1, email: 'test@example.com', cart: { items: {} } };
const myOtherUser = { id: 2, email: 'another@example.com' };

// The act of proving the claim automatically caches the proof on `myUser`.
prove(aUser.and(HasCart), myUser);

// We can now query the claim metadata directly.
const cachedProof = queryClaims(aUser.and(HasCart), myUser);

// `cachedProof` is the proof object from the previous check.
console.log(cachedProof.result); // true

// This next check returns `undefined` because the claim has not yet been run on `myOtherUser`.
console.log(queryClaims(aUser.and(HasCart), myOtherUser)); // undefined
```

### Using `proofs`

You can also use the `proofs` function to retrieve all proofs that have been stored on an object:

```javascript
import { proofs } from 'howard';

// `myUser` already has a cached proof from the previous example.
console.log(proofs(myUser)); // Returns an array containing the cached proof.
```

## Summary

By leveraging these concepts, you turn claims from simple logical assertions into intelligent pieces of runtime metadata. This not only makes your code more expressive but also ensures that your application scales efficiently, as Howard avoids redundant work by leveraging the concepts of value semantics and hashing.