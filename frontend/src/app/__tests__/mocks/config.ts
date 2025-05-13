// Extend the window interface to include import.meta
declare global {
  interface Window {
    import: {
      meta: {
        env: {
          VITE_API_URL: string;
        };
      };
    };
  }
}

Object.defineProperty(window, 'import', {
  value: { meta: { env: { VITE_API_URL: 'http://localhost:4000' } } }
});

// Mock the config module with a fixed API URL for tests
jest.mock('../../lib/config', () => ({
  API_BASE_URL: 'http://localhost:4000'
}));

export {};
