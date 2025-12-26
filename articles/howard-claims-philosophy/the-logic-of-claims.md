# The Logic of Claims: Why Validation Is Broken, and What Replaces It

*Every application you write manages truth. The question is whether you manage it explicitly, or allow it to scatter across your codebase like debris after a storm.*

---

## The Crisis of the Ad-Hoc

Philip Greenspun famously observed:

> "Any sufficiently complicated C or Fortran program contains an ad hoc, informally-specified, bug-ridden, slow implementation of half of Common Lisp."

The same principle applies to data validity. Any sufficiently complex application contains an ad hoc, informally-specified, bug-ridden, slow implementation of half of a type system. We call this pattern "defensive coding," but the reality is less flattering: it is *semantic drift*.

Consider the lifecycle of a typical data check in a commercial application. It begins as an `if` statement. When the logic grows complex, it becomes a function. When reuse is needed, it migrates to a utility file. When edge cases multiply, it fragments into multiple conditional branches scattered across modules. The original intent—a simple assertion about data—is now distributed across the codebase, duplicated with slight variations, and entirely disconnected from the type system that could enforce it.

This is not a failure of discipline. It is a failure of abstraction. The fundamental problem is that *validation logic has no first-class representation in most programming models*. It exists as an operational side-effect, not as a structural element. The code answers "does this pass?" but never captures "what does passing mean?"

The consequence is a codebase where truth is procedural rather than declarative. Every function re-interrogates data it should already trust. Every layer re-validates what the previous layer claimed to guarantee. The computational cost is significant, but the cognitive cost is worse: developers cannot reason about data state without tracing execution paths.

This is the crisis of the ad-hoc.

---

## The Logical Shift

The alternative is to treat assertions about data as *first-class citizens*—objects that exist independently of the code that evaluates them.

A **Claim** is a verifiable proposition about data. Unlike a validation function, which is merely procedural, a Claim is a structural element with identity, composition rules, and semantic meaning. It answers not just "does this pass?" but "what truth does passing establish?"

The distinction is subtle but fundamental:

| Validation                        | Claim                                    |
| --------------------------------- | ---------------------------------------- |
| A procedure that returns boolean  | A proposition that establishes truth     |
| Coupled to execution context      | Independent of execution context         |
| Repeatable (must re-run)          | Verifiable (can be proven once)          |
| Implicit meaning                  | Explicit semantics                       |

When you write a validation function, you create an action. When you define a Claim, you create a *kind of truth*. The former exists only at runtime; the latter exists in your type system, your documentation, and your architecture.

This is not merely a stylistic preference. It is a shift in the ontological status of your assertions. Validation asks: "Is this data okay *right now*?" A Claim asks: "What category of correctness does this data inhabit?"

The former is a question. The latter is a statement.

---

## The Correspondence: Why Programs Are Proofs

In 1969, William Alvin Howard circulated a privately distributed paper titled *"The Formulae-as-Types Notion of Construction."* It would take decades for the computer science community to fully appreciate its implications, but the core insight was immediate and profound:

**Programs and proofs are the same thing. Types and propositions are the same thing.**

This became known as the Curry-Howard correspondence, building on earlier work by Haskell Curry. As Xavier Leroy later reflected:

> "Rarely have photocopies had such an impact: the Curry-Howard correspondence started to resonate with the renewal of logics and the boom of computer science of the 1970s, then established itself in the 1980s as a deep structural connection between languages and logics, between programming and proving."

The implication for software engineering is direct: *satisfying a type is the same as constructing a proof*. When you write a program that type-checks, you have—whether you know it or not—provided a formal proof that your program has certain properties.

This is the intellectual foundation on which Howard rests. A Claim is a proposition. When data satisfies a Claim, it has *proven* that proposition. The predicate is not merely a filter; it is a proof witness. The type system does not merely catch errors; it establishes theorems.

Most developers experience this correspondence unconsciously. They know that "if TypeScript accepts this, it probably works," but they do not know *why* this intuition is mathematically justified. The Curry-Howard correspondence is the answer. Your type system is a theorem prover in disguise.

The tragedy of modern development is that we use this proof system only at the type level—for structural shape—while leaving semantic truth to the ad-hoc chaos of runtime validation. Howard changes this equation. It brings the rigour of the type system to the semantics of your data.

---

## Howard as the Engine

Howard is a **self-contained primitive** for building semantically aware data systems. It is named after William Alvin Howard, and it embodies the correspondence he helped formalise.

The architecture is deliberately minimal. Howard provides:

1. **Claim definition** via deterministic predicates
2. **Claim composition** via logical operators (and, or, on)
3. **Claim binding** via conditional reference to external state
4. **Proof generation** for comprehensive evaluation records

Consider a simple example. Rather than writing:

```typescript
function validateUserWithCart(user: unknown): boolean {
  if (typeof user !== 'object' || user === null) return false
  if (!('id' in user) || typeof user.id !== 'number') return false
  if (!('email' in user) || typeof user.email !== 'string') return false
  if (!('cart' in user) || typeof user.cart !== 'object') return false
  return true
}
```

Howard expresses the same logic as a composable structure:

```typescript
import { claims } from 'howard'

const { aUser, HasCart } = claims({
  types: { isUser, hasCart }
})

const AUserWithCart = aUser.and(HasCart)
```

The difference is not merely syntactic. In the imperative version, the logic is an opaque procedure. In the Howard version, `AUserWithCart` is a first-class object—it has identity, it can be inspected, it can be composed into larger claims, and it can generate proofs of its evaluation.

The critical architectural property is **decoupling**. The claim exists independently of:

- The data it will evaluate
- The context in which it will be applied
- The system that will interpret its results

This independence is not accidental. It is the source of Howard's power. Claims compose because they are self-contained. They can be cached because their evaluation is deterministic. They can generate proofs because their structure is explicit.

Howard does not integrate with your validation layer. It *replaces* the concept of a validation layer with something more principled: a claim layer, where propositions about data are first-class citizens in your architecture.

---

## The Fabric of Knowledge

When claims compose, they form a **rich fabric of knowledge**. Consider:

```typescript
const AUserWithCart = aUser.and(HasCart)
const UserWithEmptyCart = AUserWithCart.on('cart', IsEmpty)
const CurrentlyLoggedInWithEmptyCart = LoggedInUser.and(UserWithEmptyCart)
```

Each claim builds on the previous. Each is independently verifiable. Each carries explicit semantic meaning that can be queried, cached, and reasoned about.

This is not inheritance. It is not configuration. It is *logical composition*—the same kind of composition that underlies mathematical proof. When you establish that `CurrentlyLoggedInWithEmptyCart` holds, you have simultaneously established `aUser`, `HasCart`, `IsEmpty`, and the binding to the current user reference.

The proof propagates. The semantics compound. The knowledge accumulates.

In a traditional codebase, these relationships are implicit—scattered across conditionals, hidden in control flow. In a Howard-based system, they are explicit—declared, composed, and verifiable.

---

## The Metadata Problem: Making Truth Persist

There remains a fundamental question: **what is the cost of re-verification?**

Consider a data object that has been validated. It satisfies a complex claim involving type checks, business rules, and contextual bindings. The claim is proven. But now you pass that object to another function. And another. And another.

At each boundary, the receiving code faces a choice:

1. **Trust** that the previous layer validated correctly (fragile, breaks encapsulation)
2. **Re-validate** with the same checks (expensive, redundant, inelegant)

Neither option is satisfactory. The first sacrifices correctness. The second sacrifices performance and clarity.

This is the **object metadata problem**. How do we make truths "stick" to data without incurring the logical tax of re-verification?

The answer lies in treating proofs as **persistent annotations**. When a claim is proven against an object, the proof becomes metadata attached to that object. Subsequent checks can query this metadata rather than re-executing the predicate. If the object's content has not changed—verifiable via content-based hashing—the proof remains valid.

This transforms claims from expensive runtime guards into cheap lookups. The first verification pays the cost. All subsequent queries benefit from the cached proof.

But this architectural pattern requires infrastructure: content-based hashing, metadata attachment, cache invalidation, and proof serialisation. It requires what we call the **Structural Integrity Engine**—a companion primitive that manages the hash-to-proof mappings across your data system.

That infrastructure is the subject of subsequent work. Here, it is enough to note that Howard provides the logical foundation on which such infrastructure can be built. Without first-class claims, there is nothing to cache. Without deterministic predicates, there is no stable truth to store. Without composable proofs, there is no semantic structure to persist.

Howard solves the *logical* problem. The metadata problem—how to make that logic persist efficiently—is the next frontier.

---

## The Promise of Semantic Integrity

The vision is not modest. It is a software ecosystem where:

- Data carries verifiable claims about its own correctness
- Business logic operates on proven propositions, not hopeful assumptions
- The gap between "what the type says" and "what the data is" closes to zero
- Re-verification becomes unnecessary, not because we trust blindly, but because proofs persist

This is **semantic integrity**: a state where the meaning of your data is explicitly represented, rigorously verified, and structurally enforced.

The path there begins with claims. It continues with proofs. It culminates in a relational fabric where every data object knows what it is, what has been proven about it, and what can be inferred from its relationships.

We believe there is a more elegant, unified approach to building data systems. One that does not repeat the mistakes of ad-hoc validation. One that takes seriously the Curry-Howard correspondence and its implications for software architecture.

Howard is our contribution to that approach. It is the logical engine for a truly relational world.

---

## About the Author

The author is the architect of the **Relational Fabric**—a foundational framework for building semantically-aware, structurally-verified data systems. With deep experience in complex data-driven technologies and systemic architecture, the author is currently open to high-level advisory engagements for teams struggling with data integrity, validation complexity, or systemic fragility.

For inquiries regarding technical advisory, architectural review, or collaborative development on claim-based data systems, please reach out via the project's official channels.

*Howard is open-source and available as part of the Relational Fabric ecosystem.*
