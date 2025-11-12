/**
 * Utility types for Howard
 */

/**
 * Represents a constructor function (class).
 * This is the only place where `any` is permitted, as TypeScript requires it
 * for generic constructor signatures that can accept any number/type of arguments.
 *
 * @template T - The instance type that the constructor produces
 */
export type Constructor<T> = new (...args: any[]) => T

/**
 * Alias for a constructor that produces any type.
 * Use this when you need to reference constructors without caring about their specific instance type.
 */
export type AnyConstructor = Constructor<unknown>
