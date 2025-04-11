// Learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock FormData as it's not available in jsdom
global.FormData = class FormData {
  constructor() {
    this.data = new Map();
  }
  append(key, value) {
    this.data.set(key, value);
  }
  get(key) {
    return this.data.get(key);
  }
};

// Mock Blob as it's not fully implemented in jsdom
global.Blob = class Blob {
  constructor(content, options = {}) {
    this.content = content;
    this.type = options.type || '';
  }
};
