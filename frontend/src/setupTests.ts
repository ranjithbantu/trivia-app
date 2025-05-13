// Mock testing-library
import '@testing-library/jest-dom';
import './env.d.ts';

// Mock config for API URL
(window as any).import = { meta: { env: { VITE_API_URL: 'http://localhost:4000' } } };

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock fetch globally
const fetchMock = jest.fn();
window.fetch = fetchMock;

// Mock URL.createObjectURL
if (typeof window.URL.createObjectURL === 'undefined') {
  Object.defineProperty(window.URL, 'createObjectURL', { value: jest.fn() });
}

// Export the fetch mock for tests to use
export { fetchMock };
