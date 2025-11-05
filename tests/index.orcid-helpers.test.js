/*
 * ORCID Parser is licensed under The 3-Clause BSD, see LICENSE.
 * Copyright 2025 Sira Pornsiriprasert <code@psira.me>
 */

import { describe, it, expect } from 'vitest';
import path from 'node:path';

// eslint-disable-next-line no-undef
const { ORCID } = require(path.resolve('dist/index.mjs'));

describe('ORCID helpers', () => {
  it('sanitizes ORCID URLs to bare IDs', () => {
    const client = new ORCID('https://orcid.org/0000-0002-1825-0097');
    expect(client.getOrcidId()).toBe('0000-0002-1825-0097');
  });

  it('parses external IDs and contributors structures', () => {
    const client = new ORCID('0000-0002-1825-0097');
    const externalIds = (/** @type {any} */ (client))._parseExternalIds({
      'external-id': [
        { 'external-id-type': 'doi', 'external-id-value': '10.1000/xyz', 'external-id-url': { value: 'https://doi.org/10.1000/xyz' }, 'external-id-relationship': 'self' }
      ]
    });
    expect(externalIds[0]).toEqual({
      type: 'doi', value: '10.1000/xyz', url: 'https://doi.org/10.1000/xyz', relationship: 'self'
    });

    const contributors = (/** @type {any} */ (client))._parseContributors({
      contributor: [
        { 'credit-name': { value: 'Alice' }, 'contributor-attributes': { 'contributor-role': 'author', 'contributor-sequence': 'first' } }
      ]
    });
    expect(contributors[0]).toEqual({ name: 'Alice', role: 'author', sequence: 'first' });
  });
});


