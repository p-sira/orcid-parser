/*
 * ORCID Parser is licensed under The 3-Clause BSD, see LICENSE.
 * Copyright 2025 Sira Pornsiriprasert <code@psira.me>
 */

import { describe, it, expect } from 'vitest';
import path from 'node:path';

// Import CommonJS module generated from TypeScript build
// eslint-disable-next-line no-undef
const { ORCID, WORK_TYPES, filterByType, filterByYearRange, sortByDate, getStatistics, groupBy } = require(path.resolve('dist/index.mjs'));

describe('Utility functions', () => {
  const sampleWorks = [
    { type: WORK_TYPES.ARTICLE, publicationYear: 2021, journalTitle: 'J1' },
    { type: WORK_TYPES.BOOK, publicationYear: 2019, journalTitle: 'J2' },
    { type: WORK_TYPES.ARTICLE, publicationYear: 2024, journalTitle: 'J3' },
    { type: WORK_TYPES.CONFERENCE_PAPER, publicationYear: 2020, journalTitle: 'J4' },
    { type: WORK_TYPES.OTHER, publicationYear: undefined }
  ];

  it('filterByType supports single type and array of types', () => {
    expect(filterByType(sampleWorks, WORK_TYPES.ARTICLE)).toHaveLength(2);
    expect(filterByType(sampleWorks, [WORK_TYPES.ARTICLE, WORK_TYPES.BOOK])).toHaveLength(3);
  });

  it('filterByYearRange filters inclusively', () => {
    const filtered = filterByYearRange(sampleWorks, 2020, 2021);
    expect(filtered).toEqual([
      { type: WORK_TYPES.ARTICLE, publicationYear: 2021, journalTitle: 'J1' },
      { type: WORK_TYPES.CONFERENCE_PAPER, publicationYear: 2020, journalTitle: 'J4' }
    ]);
  });

  it('sortByDate sorts by year desc by default', () => {
    const sorted = sortByDate(sampleWorks);
    expect(sorted[0].publicationYear).toBe(2024);
    expect(sorted[sorted.length - 1].publicationYear).toBeUndefined();
  });

  it('sortByDate sorts ascending when requested', () => {
    const sorted = sortByDate(sampleWorks, 'asc');
    expect(sorted[0].publicationYear).toBeUndefined();
    expect(sorted[sorted.length - 1].publicationYear).toBe(2024);
  });

  it('getStatistics computes totals, byType, byYear and range', () => {
    const stats = getStatistics(sampleWorks);
    expect(stats.total).toBe(5);
    expect(stats.byType[WORK_TYPES.ARTICLE]).toBe(2);
    expect(stats.byYear[2019]).toBe(1);
    expect(stats.yearRange.min).toBe(2019);
    expect(stats.yearRange.max).toBe(2024);
  });

  it('groupBy groups by property and uses "unknown" when missing', () => {
    const groups = groupBy(sampleWorks, 'journalTitle');
    expect(groups['J1']).toHaveLength(1);
    expect(groups['unknown']).toHaveLength(1);
  });
});


