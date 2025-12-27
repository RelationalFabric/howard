**The Logic of Claims: Why Validation Is Broken, and What Replaces It**

*Moving from ad-hoc boolean checks to first-class propositions. How Howard transforms the way we think about data correctness.*

---

## The Category Error We Keep Making

Every codebase I've worked on has the same pattern hiding in plain sight. Somewhere, scattered across utility files and service layers, there's a growing collection of functions that answer the same question: "Is this data what I think it is?"

But here's the problem we rarely articulate: **we are treating identity as a check when it should be a proof.**

Validation is something we *do*. A claim is something the data *possesses*. The difference isn't semantic hairsplitting; it's a category error that shapes how we architect systems. When correctness is a process rather than a property, we build infrastructures of suspicion: every layer re-interrogates what the previous layer already established.

```typescript
function isValidUser(obj: unknown): boolean {
  if (typeof obj !== 'object' || obj === null) {
    return false
  }
  if (!('id' in obj) || typeof obj.id !== 'number') {
    return false
  }
  if (!('email' in obj) || typeof obj.email !== 'string') {
    return false
  }
  return true
}
```

It starts simple. One check. Then another. Then the checks start composing, but not cleanly. You call `isValidUser` and then separately check `hasVerifiedEmail`. You write wrapper functions that combine them. You duplicate logic because the original function didn't quite fit the new context.

Philip Greenspun once observed:

> Any sufficiently complicated C or Fortran program contains an ad hoc, informally-specified, bug-ridden, slow implementation of half of Common Lisp.
>
> ([Philip Greenspun](https://en.wikipedia.org/wiki/Greenspun%27s_tenth_rule))

The same principle applies to validation. Any sufficiently complex application contains an ad hoc, informally-specified, bug-ridden, slow implementation of half of a type system. We call this "defensive coding." The reality is less flattering: it's *semantic drift*.

And semantic drift accumulates into **semantic debt**, the hidden liability that bankrupts large-scale projects. Every scattered validation is a future inconsistency. Every duplicated check is a future divergence. The codebase doesn't just become messy; it becomes *untrustworthy*.

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
> ([Xavier Leroy, "From Curry-Howard to Certified Compilation"](https://xavierleroy.org/CdF/2018-2019/))

The implication is direct: satisfying a type is the same as constructing a proof. When your program type-checks, you've provided a formal proof that it has certain properties. Your type system is a theorem prover in disguise.

### What This Means for TypeScript Developers

Here's what most developers don't realise: **when you write a type guard, you are already doing manual theorem proving**, just without a formal framework.

```typescript
function isUser(value: unknown): value is User {
  return typeof value === 'object'
    && value !== null
    && 'id' in value
    && 'email' in value
}
```

This function is a proof constructor. When it returns `true`, you've constructed evidence that `value` satisfies the `User` proposition. TypeScript's type narrowing is the compiler accepting your proof.

But the proof is informal. It exists only in the moment of execution. It cannot be composed, cached, or inspected. The reasoning evaporates as soon as the function returns.

Howard gives that process a name and a home. It transforms ephemeral boolean checks into durable, composable propositions.

---

## The Aha Moment: Thinking in Propositions

There's a shift that happens when you stop thinking in booleans and start thinking in claims.

With validation, your mental model is: "I need to check if this data is okay before I use it."

With claims, your mental model becomes: "This data either *is* or *is not* a member of a category, and I can know which category by inspecting its proofs."

The difference is subtle but transformative. In the first model, you're a gatekeeper, constantly suspicious and constantly re-checking. In the second model, you're an archivist; data arrives with its credentials already established, and your job is to read them.

This shift changes how you design APIs, structure modules, and reason about data flow. Functions stop asking "is this valid?" and start asking "what has been proven about this?" The defensive crouch relaxes into confident composition.

The economics are stark: in an infrastructure of suspicion, you pay for the same check a thousand times across a thousand services. In a claim-based architecture, you pay for the proof once. The result is a massive reduction in the semantic noise that clogs modern distributed systems.

---

## Howard: Claims as First-Class Citizens

Howard is named after William Alvin Howard. It embodies the correspondence he helped formalise, making it practical for runtime logic.

(A note on nomenclature: Haskell Curry achieved immortality in programming vernacular twice over (once as a language, once as a verb). We curry functions without a second thought. Howard, despite contributing equally to one of computer science's most profound insights, received no such honour. There is no "to howard" in our lexicon. This engine is a small corrective.)

The architecture is deliberately minimal:

### The Core Primitives

1. **Claim definition** via deterministic predicates
2. **Claim composition** via logical operators (and, or, on)
3. **Claim binding** via conditional reference to external state
4. **Proof generation** for comprehensive evaluation records

Instead of writing imperative validation, Howard expresses logic as composable structure:

```typescript
import { claims } from 'howard'

const { aUser, HasVerifiedEmail, HasActiveSubscription } = claims({
  relations: { hasVerifiedEmail, hasActiveSubscription },
  types: { isUser }
})
```

Each claim is a first-class object. It has identity. It can be inspected. It can be composed into larger claims. It can generate proofs of its evaluation.

### Decoupling as First Principle

The critical property is **decoupling**. The claim exists independently of:

- The data it will evaluate
- The context in which it will be applied
- The system that will interpret its results

This independence is the source of Howard's power. Claims compose because they are self-contained. They can be cached because their evaluation is deterministic. They can generate proofs because their structure is explicit.

Howard doesn't integrate with your validation layer. It *replaces* the concept of a validation layer with something more principled: a claim layer, where propositions about data are first-class citizens.

---

## Composition in Practice: Building Relational Claims

The real power emerges when claims compose into complex propositions that reflect genuine business logic.

Consider a sales system where a "Qualified Lead" isn't just a user with an email; it's a user with a *verified* email, an *active* subscription, and engagement within the last 30 days:

```typescript
// Atomic claims from predicates and type guards
const { aUser, HasVerifiedEmail, HasActiveSubscription, HasRecentEngagement } = claims({
  relations: { hasVerifiedEmail, hasActiveSubscription, hasRecentEngagement },
  types: { isUser }
})

// Compose into relational claims
const AVerifiedUser = aUser.and(HasVerifiedEmail)
const AnActiveCustomer = AVerifiedUser.and(HasActiveSubscription)
const AQualifiedLead = AnActiveCustomer.and(HasRecentEngagement)

// Claims can inspect nested properties
const AQualifiedLeadWithHighValue = AQualifiedLead.on('subscription', HasHighLifetimeValue)
```

Notice what's happening here: the `QualifiedLead` claim doesn't just check a single object; it establishes a *relational state* across multiple concerns. The user's identity, their email verification status, their subscription state, and their engagement history are woven into a single verifiable proposition.

This isn't just validation with better syntax. It's a **fabric of knowledge**, a graph where each node is a proposition and each edge is a logical relationship.

Picture it: `aUser` sits at the foundation. `HasVerifiedEmail` and `HasActiveSubscription` branch from it. `AQualifiedLead` sits at the intersection, representing the conjunction of all three. When you prove `AQualifiedLead`, you've simultaneously proven every claim in its ancestry.

The proof propagates. The semantics compound. The knowledge accumulates.

### When Proofs Fail: Debugging Gold

Here's where Howard pays dividends that ad-hoc validation never can.

In traditional code, when a complex validation fails, you get `false`. That's it. You're left to trace through nested conditionals, console-logging your way to the offending check. The more complex the validation, the more opaque the failure.

In Howard, when a claim fails, you get a **Proof**, an immutable record of the entire evaluation. The proof contains not just the result, but the *reasoning*:

```typescript
const proof = prove(AQualifiedLead, suspectUser)

if (!proof.result) {
  console.error(proof.explanation.human())
  // "AQualifiedLead failed: HasRecentEngagement returned false
  //  (last engagement: 47 days ago, threshold: 30 days)"
}
```

The proof traces back through the composition graph, pinpointing exactly which atomic claim failed and why. For a claim like `AQualifiedLead` that composes four distinct predicates, this is the difference between "it didn't work" and "the user's last engagement was 47 days ago, which exceeds the 30-day threshold."

This is the debugging experience that senior engineers dream of: failures that explain themselves.

In a traditional codebase, these relationships are implicit, scattered across conditionals and hidden in control flow. In a Howard-based system, they're explicit: declared, composed, and verifiable.

---

## The Next Problem: Making Truth Stick

There's a question that follows naturally: what's the cost of re-verification?

Picture the flow: a request enters your system. At the boundary, you prove `AQualifiedLead` against the incoming user object. The proof succeeds. Now that object travels through your service layer, your domain logic, your persistence layer. At each boundary, the receiving code doesn't re-run the predicate; it queries the proof. "Has this been proven as a QualifiedLead?" Yes. Move on. The verification happened once; every downstream consumer benefits.

But today, that's not how it works. At each boundary, the receiving code faces a choice:

1. **Trust** that the previous layer validated correctly (fragile, breaks encapsulation)
2. **Re-validate** with the same checks (expensive, redundant)

Neither is satisfactory. The first sacrifices correctness. The second sacrifices performance and clarity.

This is the **object metadata problem**. How do we make truths "stick" to data without incurring the cost of re-verification?

### Proofs as Persistent Annotations

The answer lies in treating proofs as **persistent annotations**. Once proven, a claim isn't just a result; it's a *certificate*. It travels with the data, ending the need for defensive re-interrogation at every boundary.

When a claim is proven against an object, the proof becomes metadata attached to that object. Subsequent checks query this metadata rather than re-executing the predicate. If the object's content hasn't changed (verifiable via content-based hashing), the proof remains valid.

This transforms claims from expensive runtime guards into cheap lookups. The first verification pays the cost. All subsequent queries benefit from the cached proof.

But this pattern requires infrastructure: content-based hashing, metadata attachment, cache invalidation, proof serialisation. It requires what we call the **Structural Integrity Engine**, a companion primitive that manages hash-to-proof mappings across your data system.

### The Logical Tax

Here's the uncomfortable truth: **verifying a complex claim is computationally expensive**. A claim like `AQualifiedLead` might involve database lookups, date comparisons, and nested property traversals. Running it on every function boundary is a tax your system pays continuously.

But a logical world isn't free. The elegance of composable claims comes with a cost. I call this the **Logical Tax**, the computational overhead of proving complex propositions at runtime. Every composed claim, every nested property check, every conditional binding adds cycles. At scale, the tax becomes untenable.

The next two articles in this series will track Howard's evolution as we build exactly this: **Fast Value Hashing** to eliminate the Logical Tax, and **Object Metadata** to make proofs persist. The logical foundation is laid. Making it fast, and making it stick, comes next.

---

## The Vision: Semantic Integrity

The goal is a software ecosystem where:

- Data carries verifiable claims about its own correctness
- Business logic operates on proven propositions, not hopeful assumptions
- The gap between "what the type says" and "what the data is" closes to zero
- Re-verification becomes unnecessary, not because we trust blindly, but because proofs persist. Once we solve the **Logical Tax**, constructing those proofs becomes virtually zero-cost.

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

*If your team is drowning in ad-hoc validation debt, if your data checks have scattered across services, your type guards have drifted out of sync, and your business logic has become a maze of defensive conditionals, I've been there. I'm the architect of [Relational Fabric](https://github.com/RelationalFabric), and I'm available for high-level advisory and architectural review for teams facing these exact challenges. Reach out via the project's official channels.*

*Howard is open source and part of the Relational Fabric ecosystem. Feedback and contributions welcome.*
