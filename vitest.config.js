// Minimal Vitest config
export default {
  test: {
    environment: 'node',
    include: ['tests/**/*.test.js'],
    coverage: {
      enabled: true,
      reporter: ['text', 'html']
    }
  }
};


