**The Logic of Claims: Why Validation Is Broken, and What Replaces It**

*Moving from ad-hoc boolean checks to first-class propositions. How Howard transforms the way we think about data correctness.*

---

## The Problem That Kept Recurring

Every codebase I've worked on has the same pattern hiding in plain sight. Somewhere, scattered across utility files and service layers, there's a growing collection of functions that answer the same question: "Is this data what I think it is?"

```typescript
function isValidUser(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) return false
  if (!('id' in obj) || typeof obj.id !== 'number') return false
  if (!('email' in obj) || typeof obj.email !== 'string') return false
  return true
}
```

It starts simple. One check. Then another. Then the checks start composing—but not cleanly. You call `isValidUser` and then separately check `hasCart`. You write wrapper functions that combine them. You duplicate logic because the original function didn't quite fit the new context.

Philip Greenspun once observed:

> Any sufficiently complicated C or Fortran program contains an ad hoc, informally-specified, bug-ridden, slow implementation of half of Common Lisp.
>
> — Philip Greenspun

The same principle applies to validation. Any sufficiently complex application contains an ad hoc, informally-specified, bug-ridden, slow implementation of half of a type system. We call this "defensive coding." The reality is less flattering: it's *semantic drift*.

The original intent—a simple assertion about data—fragments across the codebase. It gets duplicated with slight variations. It becomes entirely disconnected from the type system that could enforce it.

This isn't a failure of discipline. It's a failure of abstraction.

---

## Why Validation Isn't Enough

The fundamental problem is that validation logic has no first-class representation. It exists as an operational side-effect, not as a structural element. The code answers "does this pass?" but never captures "what does passing mean?"

Consider what happens when you write a validation function:

- It returns a boolean
- The meaning of that boolean is implicit
- The logic is opaque from the outside
- Every consumer must re-run it to get the answer
- Composition requires manual wiring

Now consider what you actually want:

- A proposition about data that can be named
- Meaning that is explicit and inspectable
- Logic that can be composed with other logic
- Results that can be cached and queried
- A structure the type system understands

The gap between these two is the gap between *validation* and *claims*.

| Validation | Claim |
| --- | --- |
| A procedure that returns boolean | A proposition that establishes truth |
| Coupled to execution context | Independent of execution context |
| Repeatable (must re-run) | Verifiable (can be proven once) |
| Implicit meaning | Explicit semantics |

When you write a validation function, you create an action. When you define a Claim, you create a *kind of truth*. The former exists only at runtime. The latter exists in your type system, your documentation, and your architecture.

---

## The Correspondence That Changes Everything

In 1969, William Alvin Howard circulated a privately distributed paper titled *"The Formulae-as-Types Notion of Construction."* The insight was profound:

**Programs and proofs are the same thing. Types and propositions are the same thing.**

This became known as the Curry-Howard correspondence, building on earlier work by Haskell Curry. As Xavier Leroy later reflected:

> Rarely have photocopies had such an impact: the Curry-Howard correspondence started to resonate with the renewal of logics and the boom of computer science of the 1970s, then established itself in the 1980s as a deep structural connection between languages and logics, between programming and proving.
>
> — Xavier Leroy

The implication is direct: satisfying a type is the same as constructing a proof. When your program type-checks, you've provided a formal proof that it has certain properties. Your type system is a theorem prover in disguise.

Most developers experience this unconsciously. They know that "if TypeScript accepts this, it probably works," but they don't know *why* that intuition is mathematically justified. The Curry-Howard correspondence is the answer.

The tragedy is that we use this proof system only at the type level—for structural shape—while leaving semantic truth to ad-hoc runtime checks. What if we could bring the same rigour to the semantics of our data?

That's what Howard is for.

---

## Howard: Claims as First-Class Citizens

Howard is named after William Alvin Howard. It embodies the correspondence he helped formalise, making it practical for runtime logic.

The architecture is deliberately minimal:

### The Core Primitives

1. **Claim definition** via deterministic predicates
2. **Claim composition** via logical operators (and, or, on)
3. **Claim binding** via conditional reference to external state
4. **Proof generation** for comprehensive evaluation records

Instead of writing imperative validation:

```typescript
function validateUserWithCart(user: unknown): boolean {
  if (typeof user !== 'object' || user === null) return false
  if (!('id' in user) || typeof user.id !== 'number') return false
  if (!('email' in user) || typeof user.email !== 'string') return false
  if (!('cart' in user) || typeof user.cart !== 'object') return false
  return true
}
```

Howard expresses the same logic as composable structure:

```typescript
import { claims } from 'howard'

const { aUser, HasCart } = claims({
  types: { isUser, hasCart }
})

const AUserWithCart = aUser.and(HasCart)
```

The difference isn't merely syntactic. `AUserWithCart` is a first-class object. It has identity. It can be inspected. It can be composed into larger claims. It can generate proofs of its evaluation.

### Decoupling as First Principle

The critical property is **decoupling**. The claim exists independently of:

- The data it will evaluate
- The context in which it will be applied
- The system that will interpret its results

This independence is the source of Howard's power. Claims compose because they are self-contained. They can be cached because their evaluation is deterministic. They can generate proofs because their structure is explicit.

Howard doesn't integrate with your validation layer. It *replaces* the concept of a validation layer with something more principled: a claim layer, where propositions about data are first-class citizens.

---

## Building a Fabric of Knowledge

When claims compose, they form a rich fabric of knowledge:

```typescript
const AUserWithCart = aUser.and(HasCart)
const UserWithEmptyCart = AUserWithCart.on('cart', IsEmpty)
const CurrentlyLoggedInWithEmptyCart = LoggedInUser.and(UserWithEmptyCart)
```

Each claim builds on the previous. Each is independently verifiable. Each carries explicit semantic meaning that can be queried, cached, and reasoned about.

This isn't inheritance. It isn't configuration. It's *logical composition*—the same kind of composition that underlies mathematical proof. When you establish that `CurrentlyLoggedInWithEmptyCart` holds, you've simultaneously established `aUser`, `HasCart`, `IsEmpty`, and the binding to the current user reference.

The proof propagates. The semantics compound. The knowledge accumulates.

In a traditional codebase, these relationships are implicit—scattered across conditionals, hidden in control flow. In a Howard-based system, they're explicit—declared, composed, and verifiable.

---

## The Next Problem: Making Truth Stick

There's a question that follows naturally: what's the cost of re-verification?

Consider a data object that's been validated. It satisfies a complex claim. The claim is proven. But now you pass that object to another function. And another. And another.

At each boundary, the receiving code faces a choice:

1. **Trust** that the previous layer validated correctly (fragile, breaks encapsulation)
2. **Re-validate** with the same checks (expensive, redundant)

Neither is satisfactory. The first sacrifices correctness. The second sacrifices performance and clarity.

This is the **object metadata problem**. How do we make truths "stick" to data without incurring the cost of re-verification?

### Proofs as Persistent Annotations

The answer lies in treating proofs as **persistent annotations**. When a claim is proven against an object, the proof becomes metadata attached to that object. Subsequent checks query this metadata rather than re-executing the predicate. If the object's content hasn't changed—verifiable via content-based hashing—the proof remains valid.

This transforms claims from expensive runtime guards into cheap lookups. The first verification pays the cost. All subsequent queries benefit from the cached proof.

But this pattern requires infrastructure: content-based hashing, metadata attachment, cache invalidation, proof serialisation. It requires what we call the **Structural Integrity Engine**—a companion primitive that manages hash-to-proof mappings across your data system.

That infrastructure is the subject of subsequent work. Here, it's enough to note that Howard provides the logical foundation on which such infrastructure can be built. Without first-class claims, there's nothing to cache. Without deterministic predicates, there's no stable truth to store. Without composable proofs, there's no semantic structure to persist.

Howard solves the *logical* problem. The metadata problem—how to make that logic persist efficiently—is the next frontier.

---

## The Vision: Semantic Integrity

The goal is a software ecosystem where:

- Data carries verifiable claims about its own correctness
- Business logic operates on proven propositions, not hopeful assumptions
- The gap between "what the type says" and "what the data is" closes to zero
- Re-verification becomes unnecessary, not because we trust blindly, but because proofs persist

This is **semantic integrity**: a state where the meaning of your data is explicitly represented, rigorously verified, and structurally enforced.

The path begins with claims. It continues with proofs. It culminates in a relational fabric where every data object knows what it is, what has been proven about it, and what can be inferred from its relationships.

Howard is our contribution to that path. It's the logical engine for a truly relational world.

---

## Getting Started

Howard is available as part of the Relational Fabric ecosystem:

```bash
npm install @relational-fabric/howard
```

Full documentation and examples are available at [the Howard repository](https://github.com/RelationalFabric/howard).

---

*The author is the architect of [Relational Fabric](https://github.com/RelationalFabric)—a family of libraries for building semantically-aware, structurally-verified data systems. For teams struggling with data integrity, validation complexity, or systemic fragility, I'm available for high-level advisory and architectural review. Reach out via the project's official channels.*

*Howard is open source and part of the Relational Fabric ecosystem. Feedback and contributions welcome.*
