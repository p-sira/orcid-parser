/*
 * ORCID Parser is licensed under The 3-Clause BSD, see LICENSE.
 * Copyright 2025 Sira Pornsiriprasert <code@psira.me>
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';

// eslint-disable-next-line no-undef
const { ORCID } = require(path.resolve('dist/orcid-parser.js'));

const sampleWorksResponse = {
  group: [
    {
      'work-summary': [
        {
          'put-code': 123,
          title: { title: { value: 'Paper A' } },
          type: 'journal-article',
          'publication-date': { year: { value: 2021 }, month: { value: 6 }, day: { value: 1 } },
          'journal-title': { value: 'Journal X' },
          url: { value: 'https://example.com/a' },
          'external-ids': { 'external-id': [] },
          source: { 'source-name': { value: 'ORCID' } }
        }
      ]
    }
  ]
};

const sampleWorkDetailResponse = {
  'put-code': 123,
  title: { title: { value: 'Paper A' }, subtitle: { value: 'Sub' }, 'translated-title': { value: 'Papier A' } },
  type: 'journal-article',
  'publication-date': { year: { value: 2021 }, month: { value: 6 }, day: { value: 1 } },
  'journal-title': { value: 'Journal X' },
  'short-description': 'desc',
  citation: { 'citation-type': 'bibtex', 'citation-value': '@article{...}' },
  url: { value: 'https://example.com/a' },
  contributors: { contributor: [] },
  'external-ids': { 'external-id': [] },
  'language-code': 'en',
  country: { value: 'US' },
  source: { 'source-name': { value: 'ORCID' } }
};

describe('ORCID fetch methods', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  it('fetchWorks returns parsed list', async () => {
    const client = new ORCID('0000-0002-1825-0097', { timeout: 5000, baseURL: 'https://pub.orcid.org/v3.0' });

    // mock global fetch
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(sampleWorksResponse) });

    const works = await client.fetchWorks();
    expect(works).toHaveLength(1);
    expect(works[0]).toMatchObject({
      title: 'Paper A',
      type: 'journal-article',
      journalTitle: 'Journal X'
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://pub.orcid.org/v3.0/0000-0002-1825-0097/works',
      { headers: { Accept: 'application/json' } }
    );
  });

  it('fetchWorkDetails returns parsed object', async () => {
    const client = new ORCID('0000-0002-1825-0097');
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(sampleWorkDetailResponse) });

    const detail = await client.fetchWorkDetails(123);
    expect(detail).toMatchObject({ putCode: 123, title: 'Paper A', subtitle: 'Sub', translatedTitle: 'Papier A' });
  });

  it('throws on non-ok HTTP status', async () => {
    const client = new ORCID('0000-0002-1825-0097');
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await expect(client.fetchWorks()).rejects.toThrow('HTTP error! status: 500');
  });

  it('rejects with timeout error when exceeding timeout', async () => {
    // Use real timers to avoid unhandled rejection warnings with fake timers
    vi.useRealTimers();
    const client = new ORCID('0000-0002-1825-0097', { timeout: 5 });
    global.fetch = vi.fn(() => new Promise(() => { })); // never resolves

    const promise = client.fetchWorks();
    await expect(promise).rejects.toThrow(ORCID.TIMEOUT_ERROR);
  });
});


