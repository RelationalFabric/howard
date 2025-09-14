# Howard: The logical engine for a truly relational world.
## What is Howard?
Howard is a self-contained, foundational primitive for building truly relational data systems. It is a computable truth engine that provides the logical backbone for making data meaningful.
Howard is named after William Alvin Howard (1926-2014), the American mathematician and logician who helped formalize the correspondence between logic and computing. This profound insight, published in his 1969 paper, "The Formulae-as-Types Notion of Construction," became a cornerstone of modern computer science.

## The Correspondence
The Curry-Howard correspondence is the deep, elegant idea that programs are proofs, and types are propositions. It establishes a direct and structural connection between formal systems of logic and computational calculi. As a modern summary puts it:

> "A proof is a program, and the formula it proves is the type for the program."

This principle means that writing a program to satisfy a type is, in essence, the same as constructing a logical proof for a proposition.

# How Howard Works

Howard embodies this principle by giving you the ability to define, compose, and incrementally infer Claims about data. It provides the foundational tools to:

 * Add value semantics to any data type, making a new kind of equality and truth verifiable.
 * Define claims that are backed by pure, deterministic predicates.
 * Compose claims into richer, more complex propositions, mirroring the very relationships that define your domain.
 * Decouple the claim (what a piece of data is) from its implementation (how you prove it), enabling a flexible and extensible architecture.

By providing this logical backbone, Howard frees the higher-level components of your application to focus on their core responsibilities.

> "Rarely have photocopies had such an impact: the Curry-Howard correspondence started to resonate with the renewal of logics and the boom of computer science of the 1970s, then established itself in the 1980s as a deep structural connection between languages and logics, between programming and proving."
> — Xavier Leroy, on the impact of Howard's privately circulated 1969 paper.

## The Why
In modern software development, we often find ourselves building intricate data systems from scratch, only to discover we've reinvented the same foundational primitives over and over. Developers piece together complex networks of disparate data, custom logic, and inconsistent abstractions, creating fragile, difficult-to-maintain systems. We believe there is a more elegant, unified approach.
As Philip Greenspun famously observed,

> "Any sufficiently complicated C or Fortran program contains an ad hoc, informally-specified, bug-ridden, slow implementation of half of Common Lisp."

Howard is our definitive and elegant solution. It is the engine that transforms simple data into a rich fabric of meaningful, composable knowledge. It's our promise to you: a more connected, intelligent, and sane digital world.
