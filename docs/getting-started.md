### **Howard: Getting Started**

This guide will walk you through the core concepts and API of Howard. Our goal is to make sophisticated logical reasoning feel as simple as using standard data structures.

### **Installation**

Howard is available as a lightweight, framework-agnostic package.

```bash
npm install howard
```

### **Core Concepts**

Howard's power comes from three core primitives that define its logical engine:

* A **Predicate** is a pure function that evaluates to a boolean.  
* A **Type Guard** is a special function that narrows a variable's type.  
* A **Claim** is a first-class object that formalizes a predicate's or type guard's assertion.

### **The Power of Claims**

Claims are our primary interface for logic. The **Curry-Howard correspondence** tells us that proofs are programs and propositions are types. In our world, a claim is a formal, verifiable proposition. This is how we can transform ad-hoc logic into a clean, claim-driven system.

### **1. Defining Claims**

The primary entry point to Howard is the declarative **claims** function, which takes a single object with three optional keys: predicates, guards, and classes. This makes your intent explicit and ensures consistency across different language environments.

```typescript
import { claims, condition, conditionalClaims } from 'howard';

// A complete type system for our examples  
interface Cart {  
  items: { [key: string]: number };  
}

interface HasCart {  
  cart?: Cart;  
}

interface User extends HasCart {  
  id: number;  
  email: string;  
  name?: string;  
}

// Our core predicates and type guards  
function isObject<T extends Record<string, unknown>>(value: T | unknown): value is T {  
  return typeof value === 'object' && value !== null && !Array.isArray(value);  
}

function isEmpty(value: unknown): boolean {  
  if (Array.isArray(value) || typeof value === 'string') {  
    return value.length === 0;  
  }  
  if (isObject(value)) {  
    return Object.keys(value).length === 0;  
  }  
  return false;  
}

function isUser<T extends User>(obj: T | unknown): obj is T {  
  return !!(isObject(obj) && 'id' in obj && 'email' in obj);  
}

function hasCart<T extends HasCart>(user: T | unknown): user is T {  
  return !!(isObject(user) && isObject(user.cart));  
}

// We use the `claims` function to transform our functions into verifiable claims.  
// The `is` prefix results in an `a` claim, and `has` results in a `Has` claim.  
const { aUser, HasCart, IsEmpty } = claims({  
  predicates: { isEmpty },  
  guards: { hasCart, isUser },  
});

// A claim about an object that is both a User and has a Cart.  
const AUserWithACart = aUser.and(HasCart);

// We can create a claim that checks a nested property using the `on()` operator.  
const UserWithEmptyCart = AUserWithACart.on('cart', IsEmpty);

// We can use these claims to check our data.  
const myUserWithCart: User = { id: 1, email: 'test@example.com', cart: { items: {} } };  
const myUserWithoutCart: User = { id: 2, email: 'another@example.com' };

console.log(AUserWithACart.check(myUserWithCart)); // true  
console.log(UserWithEmptyCart.check(myUserWithCart)); // true  
console.log(UserWithEmptyCart.check(myUserWithoutCart)); // false
```

### **2. Defining Conditions**

A **Condition** is a declarative, immutable coupling of a claim and a reference function. A **Conditional** is the dynamic, stateful result of applying a **Strategy** to a **Condition**. The conditionalClaims object provides high-level helpers for common strategies.

```typescript
// Our external, mutable state, often a global app state.  
const appState = {  
  currentUser: null as User | null  
};

// We define a reference function to provide a consistent reference to the app state.  
function currentUser() {  
   return appState.currentUser;  
}

// We define our claim and then apply the `given` operator.  
const LoggedInUser = aUser.given(currentUser);

// We then apply a strategy to the claim to make it a callable Conditional.  
// The `.eager()` strategy creates a callable that ticks before it checks.  
const CurrentlyLoggedIn = LoggedInUser.eager();

// Demonstrate the behavior with the new conditional claim.  
// User logged out  
appState.currentUser = null;  
console.log(CurrentlyLoggedIn()); // false

// User logs in - with idiomatic syntax  
appState.currentUser = { id: 1, email: 'user@test.com', cart: { items: {} } };  
console.log(CurrentlyLoggedIn()); // true
```

### **3\. Composing Claims**

The true power of Howard lies in its ability to compose claims using intuitive operators. This allows you to build a rich ontology from simple, reusable parts.

```typescript
// We can compose a conditional claim with a pure claim.  
const AUserWithACart = aUser.and(HasCart);  
const UserWithEmptyCart = AUserWithACart.on('cart', IsEmpty);  
const CurrentlyLoggedInAndEmptyCart = CurrentlyLoggedIn.and(UserWithEmptyCart);

// Check our composed claim  
appState.currentUser = { id: 1, email: 'user@test.com', cart: { items: {} } };  
console.log(CurrentlyLoggedInAndEmptyCart()); // true
```  

## What's Next?
This guide has covered the fundamental principles of Howard. In the following documents, we'll explore how to use these primitives to build powerful, maintainable systems:

- Claims for Better Errors: Learn how to leverage [proofs](./proofs.md) to generate human-readable error messages automatically, making your application's feedback loops clear and precise.

- Type Annotations: Discover how Howard can [attach claims to your objects](./annotations.md) and values, creating a system where type checks are composable and only what's needed is computed.

- Claim-Based Dispatch: Dive into the ultimate goal of Howard: choosing the right implementation or function based on a set of active claims, allowing for powerful, flexible, and context-aware logic.