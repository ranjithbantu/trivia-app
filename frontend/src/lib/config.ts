// Simplified config API to make it easier to mock in tests
let API_URL = 'http://localhost:4000';

// Only use import.meta in a browser environment
if (typeof window !== 'undefined') {
  if ((window as any).import?.meta?.env?.VITE_API_URL) {
    API_URL = (window as any).import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
}

export const API_BASE_URL = API_URL;
