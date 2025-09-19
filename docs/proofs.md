# Claims as Proofs

In most software, a logical check gives you a simple boolean: `true` or `false`. While this is functional, it tells you nothing about *why* a claim failed. This makes debugging a guessing game—you have to manually trace through the code to figure out what went wrong.

Howard solves this by elevating a simple boolean to a full-fledged **proof**. A proof is a first-class, immutable object that provides a complete, verifiable record of a claim's evaluation. This turns debugging into a simple, programmatic inspection.

## From Boolean to Proof

The gateway to this new capability is the `prove` function. Instead of just returning a boolean, it returns a `Proof` object that contains everything you need to know about the evaluation.

A `Proof` object has two key properties:

- **`.result`**: A boolean representing the final outcome of the claim
- **`.explanation`**: A `ClaimInterpretation` object that provides a full, detailed breakdown of every step in the evaluation

The `ClaimInterpretation` object is the heart of the explanation. It provides different methods for different use cases: `raw()`, `json()`, `message()`, and `human()`, so you can choose the right format for logging, a user interface, or debugging.

### Example: Basic Proof Usage

```javascript
import { claims, prove } from 'howard';

// Assume 'aUser', 'HasCart', and 'IsEmpty' already exist from the Getting Started guide.
const { aUser, HasCart, IsEmpty } = claims({ /* ... */ });

// We define a claim that checks if a user has an empty cart.
const HasEmptyCart = aUser.and(HasCart).on('cart', IsEmpty);

// Let's get a proof for a user with a non-empty cart.
const myUser = {
    id: 1,
    email: 'test@example.com',
    cart: { items: { 'item-1': 1 } }
};

// We prove the claim. The result will be false.
const proof = prove(HasEmptyCart, myUser);

console.log(proof.result); // false

// You can now inspect the explanation.
console.log(proof.explanation.human());
```

## The Problem of Conditioned Claims

The true value of a proof becomes clear when you deal with **conditioned claims**. These are claims whose evaluation depends on a value from an external, non-deterministic source, such as a global app state or an API call.

The problem is that the result can change every time you check it. This makes a simple error report unreliable, as the context may have changed between the time of the error and the time you debug it.

## Proofs as Immutable Values

The `prove` function solves this perfectly by treating the proof as a **static, immutable artifact**. When you prove a conditioned claim, Howard captures a snapshot of the claim's evaluation and its state at that exact moment in time. This guarantees that your error report is always accurate to the moment the claim was run, no matter how much the underlying state of your application changes afterward.

### Example: Conditioned Claims with Immutable Proofs

```javascript
import { claims, prove } from 'howard';

// Assume 'aUser' and the `appState` object from the getting started guide.
const { aUser } = claims({ /* ... */ });
const appState = { currentUser: null };

// This is a conditioned claim, as its value comes from an external source.
const LoggedInUser = aUser.given(() => appState.currentUser);

// The claim is false, because the user is not logged in.
appState.currentUser = null;
const failedProof = prove(LoggedInUser);
console.log(failedProof.result); // false

// Now, the user logs in. The app state has changed.
appState.currentUser = { id: 1, email: 'user@test.com' };

// We prove the claim again, and this time it's true.
const successProof = prove(LoggedInUser);
console.log(successProof.result); // true

// The original `failedProof` object is an immutable record of the state when it was created.
// It will always be a reliable record of that moment in time.
console.log(failedProof.explanation.human());
```

This approach brings the power of formal logic to your error handling, providing a consistent and robust way to debug and handle errors across your entire application.

## Proofs as a Foundation for Advanced Logic

Because a `Proof` is a self-contained, verifiable record of an evaluation, it can be serialized and passed to other systems. This creates a powerful foundation for building advanced logical systems. You could, for example, send a proof of a transaction’s validity to an auditing system, or use it to build a system for managing complex business rules without needing to re-execute the original logic.
