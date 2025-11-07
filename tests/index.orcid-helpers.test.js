/*
 * ORCID Parser is licensed under The 3-Clause BSD, see LICENSE.
 * Copyright 2025 Sira Pornsiriprasert <code@psira.me>
 */

import { describe, it, expect } from 'vitest';
import path from 'node:path';

// eslint-disable-next-line no-undef
const { Orcid } = require(path.resolve('dist/index.mjs'));

describe('ORCID helpers', () => {
  it('sanitizes ORCID URLs to bare IDs', () => {
    const client = new Orcid('https://orcid.org/0000-0002-1825-0097');
    expect(client.orcidId).toBe('0000-0002-1825-0097');
  });
});


