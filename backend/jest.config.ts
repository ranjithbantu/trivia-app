import type { Config } from 'jest';

const config: Config = {
  preset         : 'ts-jest',
  testEnvironment: 'node',
  roots          : ['<rootDir>/src/tests'],
  setupFilesAfterEnv: ['<rootDir>/src/tests/setup.ts']
};

export default config;