const config = {
    testMatch: ['**/test/**/*.+(ts|tsx)', '**/src/**/(*.)+(spec|test).+(ts|tsx)'],
    transform: {
      '^.+\\.(ts|tsx)$': ['ts-jest', {
        useESM: true,
        tsconfig: { types: ['node', 'jest'] },
      }],
    },
    extensionsToTreatAsEsm: ['.ts'],
    moduleNameMapper: {
      '^@actions/core$': '<rootDir>/src/__mocks__/@actions/core.ts',
      '^@actions/exec$': '<rootDir>/src/__mocks__/@actions/exec.ts',
    },
  }
  export default config
