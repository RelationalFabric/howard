declare module '@relational-fabric/canon/eslint.js' {
  export type EslintConfig = Record<string, unknown>

  const createEslintConfig: (
    options?: EslintConfig,
    ...configs: Record<string, unknown>[]
  ) => Record<string, unknown>

  export default createEslintConfig
}

declare module '@relational-fabric/canon/eslint' {
  export { default } from '@relational-fabric/canon/eslint.js'
}
