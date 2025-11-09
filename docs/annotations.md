# Annotations: Intelligent Claims and Metadata

## The Basis for Intelligent Claims

In most applications, every time a logical check is run, the entire process is re-executed, regardless of whether the underlying data has changed. This leads to redundant and computationally expensive work, especially for deeply nested objects.

Howard solves this problem by using a powerful combination of:

- **Value semantics**
- **Hashing**
- **Object metadata**

This system allows Howard to implicitly store and retrieve runtime data about an object, turning claims from simple functions into state-aware assertions.

---

## Caching as a Transparent, Queryable Side-Effect

The core principle behind Howard's performance is simple: the act of running a claim on a value automatically, and silently, caches a proof of that claim's evaluation. This proof is then stored as a piece of metadata on the object itself. There is no extra ceremony; the caching happens transparently as a side-effect of your code.

### Key Concepts

This is made possible by two key concepts:

1. **Value Semantics:** Howard considers two objects equal if their contents are the same, regardless of their location in memory. This is critical because it means a claim's result for a given object should only change if the object's value changes.

2. **Hashing:** To make the process of checking for changes in an object's value incredibly fast, Howard uses a hash. A hash is a unique, fixed-size fingerprint of an object's content. If the object's content changes, its hash will also change. This gives Howard a powerful, near-instantaneous way to determine if a cached result is still valid.

### How It Works

Here's the step-by-step process:

1. When you run a claim for the first time on a value (e.g., `aUser.check(myUser)`), Howard computes a hash of that value.
2. The claim's proof and the hash are stored as metadata on the object.
3. The next time the same claim is run on the same object, Howard first computes the object's current hash.
4. If the new hash matches the cached hash, Howard knows the object hasn't changed. It returns the cached result immediately, skipping the full evaluation. If the hashes don't match, the claim is re-evaluated, and the cache is updated.

---

## Querying the Implicit Metadata

The metadata Howard attaches to an object is not a black box; it's a valuable, queryable runtime cache. You can retrieve a proof from an object's metadata without having to re-run the check. This is particularly useful for performing quick lookups in performance-critical code.

### Using `queryClaim`

The `queryClaim` function is used to check if a specific claim has a cached proof on an object:

```javascript
import { claims, queryClaim, queryProofs } from 'howard'

// Assume 'aUser', 'HasCart', and 'IsEmpty' already exist.
const { aUser, HasCart } = claims({ /* ... */ })

// We define a base object
const myUser = { id: 1, email: 'test@example.com', cart: { items: {} } }
const myOtherUser = { id: 2, email: 'another@example.com' }

// The act of running the claim automatically caches the result on `myUser`.
aUser.and(HasCart).check(myUser)

// We can now query the metadata directly.
// The return type is a Proof object or undefined.
const cachedProof = queryClaim(aUser.and(HasCart), myUser)

console.log(cachedProof.result) // true

// This next check returns `undefined` because the claim has not yet been run on `myOtherUser`.
console.log(queryClaim(aUser.and(HasCart), myOtherUser)) // undefined
```

### Using `queryProofs`

You can also use the `queryProofs` function to retrieve all proofs that have been stored on an object:

```javascript
import { queryProofs } from 'howard'

// `myUser` already has a cached proof from the previous example.
// The return type is an array of Proof objects.
const allProofs = queryProofs(myUser)
console.log(allProofs.length) // 1
```

---

## Summary

By leveraging these concepts, you turn claims from simple logical assertions into intelligent pieces of runtime metadata. This not only makes your code more expressive but also ensures that your application scales efficiently, as Howard avoids redundant work by leveraging the concepts of value semantics and hashing.
