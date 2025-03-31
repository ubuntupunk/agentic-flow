// Import Jest DOM matchers for Vitest
import '@testing-library/jest-dom';

// You can add other global test setup here if needed
// For example, mocking global objects like fetch or localStorage

// Example: Mock localStorage if needed globally
// import { vi } from 'vitest';
// const localStorageMock = (() => {
//   let store: { [key: string]: string } = {};
//   return {
//     getItem: (key: string) => store[key] || null,
//     setItem: (key: string, value: string) => { store[key] = value.toString(); },
//     removeItem: (key: string) => { delete store[key]; },
//     clear: () => { store = {}; },
//   };
// })();
// Object.defineProperty(window, 'localStorage', { value: localStorageMock });

// Clean up after each test (optional, but good practice)
// import { afterEach } from 'vitest';
// import { cleanup } from '@testing-library/react';
// afterEach(() => {
//   cleanup(); // Unmounts React trees that were mounted with render
// });
