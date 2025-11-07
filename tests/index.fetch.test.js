/*
 * ORCID Parser is licensed under The 3-Clause BSD, see LICENSE.
 * Copyright 2025 Sira Pornsiriprasert <code@psira.me>
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import path from 'node:path';

// eslint-disable-next-line no-undef
const { Orcid } = require(path.resolve('dist/index.mjs'));

const sampleWorksResponse = {
  group: [
    {
      'work-summary': [
        {
          "put-code": 123,
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
    const client = new Orcid('0000-0002-1825-0097', { timeout: 5000, baseURL: 'https://pub.orcid.org/v3.0' });

    // mock two calls: first list (works), then bulk details for putCodes
    const bulkResponse = { bulk: [{ work: sampleWorkDetailResponse }] };
    global.fetch = vi.fn()
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(sampleWorksResponse) })
      .mockResolvedValueOnce({ ok: true, json: () => Promise.resolve(bulkResponse) });

    const works = await client.fetchWorks();
    expect(works).toHaveLength(1);
    expect(works[0]).toMatchObject({
      putCode: 123,
      title: 'Paper A',
      type: 'journal-article',
      journalTitle: 'Journal X',
    });
    expect(global.fetch).toHaveBeenCalledWith(
      'https://pub.orcid.org/v3.0/0000-0002-1825-0097/works',
      { headers: { Accept: 'application/json' } }
    );
  });

  it('fetchWork returns parsed object', async () => {
    const client = new Orcid('0000-0002-1825-0097');
    const bulkResponse = { bulk: [{ work: sampleWorkDetailResponse }] };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(bulkResponse) });

    const details = await client.fetchWorks(123);
    expect(details).toHaveLength(1);
    expect(details[0]).toMatchObject({ putCode: 123, title: 'Paper A', subtitle: 'Sub', translatedTitle: 'Papier A' });
  });

  it('throws on non-ok HTTP status', async () => {
    const client = new Orcid('0000-0002-1825-0097');
    global.fetch = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) });
    await expect(client.fetchWorks()).rejects.toThrow('HTTP error! status: 500');
  });

  it('rejects with timeout error when exceeding timeout', async () => {
    // Use real timers to avoid unhandled rejection warnings with fake timers
    vi.useRealTimers();
    const client = new Orcid('0000-0002-1825-0097', { timeout: 5 });
    global.fetch = vi.fn(() => new Promise(() => { })); // never resolves

    const promise = client.fetchWorks();
    await expect(promise).rejects.toThrow(Orcid.TIMEOUT_ERROR);
  });

  it('fetchWorkSummaries returns parsed summaries', async () => {
    const client = new Orcid('0000-0002-1825-0097');
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(sampleWorksResponse) });

    const summaries = await client.fetchWorkSummaries();
    expect(summaries).toHaveLength(1);
    expect(summaries[0]).toMatchObject({
      putCode: 123,
      title: 'Paper A',
      publicationYear: 2021,
      journalTitle: 'Journal X'
    });
  });

  it('fetchWithCodes returns parsed list', async () => {
    const client = new Orcid('0000-0002-1825-0097');
    const bulkResponse = {
      bulk: [
        { work: sampleWorkDetailResponse }
      ]
    };
    global.fetch = vi.fn().mockResolvedValue({ ok: true, json: () => Promise.resolve(bulkResponse) });

    const works = await client.fetchWithCodes([123]);
    expect(works).toHaveLength(1);
    expect(works[0]).toMatchObject({ putCode: 123, title: 'Paper A', type: 'journal-article' });
  });

  it('fetchWithCodes throws when more than 100 put codes are provided', async () => {
    const client = new Orcid('0000-0002-1825-0097');
    const tooMany = Array.from({ length: 101 }, (_, i) => i + 1);
    await expect(client.fetchWithCodes(tooMany)).rejects.toThrow('fetchWithCodes: Too many put codes (max 100)');
  });
});
