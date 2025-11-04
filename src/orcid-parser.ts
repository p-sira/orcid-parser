/*
 * ORCID Parser is licensed under The 3-Clause BSD, see LICENSE.
 * Copyright 2025 Sira Pornsiriprasert <code@psira.me>
 */

/**
 * Represents an external identifier associated with a work
 * (e.g., DOI, ISBN, arXiv ID, etc.).
 */
export type ExternalId = {
  type: string;
  value: string;
  url?: string;
  relationship?: string;
};

/**
 * Represents a contributor to a work (author, editor, etc.).
 */
export type Contributor = {
  name?: string;
  role?: string;
  sequence?: string;
};

/**
 * Basic representation of a parsed ORCID work entry.
 */
export type ParsedWork = {
  putCode: number;
  title: string;
  type: string;
  publicationYear?: number;
  journalTitle?: string;
  contributors: Contributor[];
  url?: string;
  source?: string;
};

/**
 * Detailed representation of an ORCID work,
 * including citation info, identifiers, and metadata.
 */
export type ParsedWorkDetail = ParsedWork & {
  publicationMonth?: number;
  publicationDay?: number;
  externalIds: ExternalId[];
  subtitle?: string;
  translatedTitle?: string;
  shortDescription?: string;
  citation?: { type: string; value: string } | null;
  languageCode?: string;
  country?: string;
};

/**
 * Aggregated statistics for a list of works.
 */
export type WorksStatistics = {
  total: number;
  byType: Record<string, number>;
  byYear: Record<number, number>;
  yearRange: { min: number | null; max: number | null };
};

/**
 * Filters works by one or more types.
 */
export function filterByType<T extends { type?: string }>(works: T[], types: string | string[]): T[] {
  const typeArray = Array.isArray(types) ? types : [types];
  return works.filter(work => !!work.type && typeArray.includes(work.type));
}

/**
 * Filters works to include only those within the specified publication year range.
 */
export function filterByYearRange<T extends { publicationYear?: number }>(
  works: T[],
  startYear: number,
  endYear: number
): T[] {
  return works.filter(work => {
    const year = work.publicationYear;
    return typeof year === 'number' && year >= startYear && year <= endYear;
  });
}

/**
 * Sorts works by publication year in ascending or descending order.
 */
export function sortByDate<T extends { publicationYear?: number }>(
  works: T[],
  order: 'asc' | 'desc' = 'desc'
): T[] {
  return [...works].sort((a, b) => {
    const yearA = a.publicationYear ?? 0;
    const yearB = b.publicationYear ?? 0;
    return order === 'desc' ? yearB - yearA : yearA - yearB;
  });
}

/**
 * Computes statistics about a list of works (count by type, by year, and year range).
 */
export function getStatistics(works: Array<{ type?: string; publicationYear?: number }>): WorksStatistics {
  const stats: WorksStatistics = {
    total: works.length,
    byType: {},
    byYear: {},
    yearRange: { min: null, max: null }
  };

  for (const work of works) {
    const type = work.type ?? 'unknown';
    const year = work.publicationYear;

    // Count by type
    stats.byType[type] = (stats.byType[type] || 0) + 1;

    // Count by year and update year range
    if (typeof year === 'number') {
      stats.byYear[year] = (stats.byYear[year] || 0) + 1;
      stats.yearRange.min = stats.yearRange.min !== null ? Math.min(stats.yearRange.min, year) : year;
      stats.yearRange.max = stats.yearRange.max !== null ? Math.max(stats.yearRange.max, year) : year;
    }
  }

  return stats;
}

/**
 * Groups works by a specified property key (e.g., "type", "journalTitle").
 */
export function groupBy<T extends Record<string, any>>(works: T[], property: keyof T | string): Record<string, T[]> {
  return works.reduce<Record<string, T[]>>((groups, work) => {
    const keyVal = (work as any)[property as string];
    const key = keyVal ?? 'unknown';
    (groups[key] ||= []).push(work);
    return groups;
  }, {});
}

/**
 * Enumerated constants for ORCID work types.
 */
export const WORK_TYPES = {
  ARTICLE: 'journal-article',
  BOOK: 'book',
  BOOK_CHAPTER: 'book-chapter',
  CONFERENCE_PAPER: 'conference-paper',
  CONFERENCE_ABSTRACT: 'conference-abstract',
  DISSERTATION: 'dissertation-thesis',
  PREPRINT: 'preprint',
  REPORT: 'report',
  DATASET: 'data-set',
  SOFTWARE: 'research-software',
  PATENT: 'patent',
  REVIEW: 'review',
  WORKING_PAPER: 'working-paper',
  OTHER: 'other'
} as const;

export type WorkType = typeof WORK_TYPES[keyof typeof WORK_TYPES];

/**
 * Configuration options for the ORCID API client.
 */
export type OrcidClientConfig = {
  baseURL?: string;
  timeout?: number;
};

/**
 * ORCID API client for fetching and parsing works and work details.
 */
export class ORCID {
  /** Default headers for all ORCID API requests. */
  static DEFAULT_HEADERS: Record<string, string> = { Accept: 'application/json' };

  /** Standardized timeout error message. */
  static TIMEOUT_ERROR = 'Request timeout';

  private orcidId: string;
  private baseURL: string;
  private timeout: number;

  /**
   * Creates a new ORCID API client.
   * @param orcidId ORCID identifier (can include or omit the full URL)
   * @param config Optional client configuration
   */
  constructor(orcidId: string, config: OrcidClientConfig = {}) {
    if (!orcidId) throw new Error('ORCID ID is required');
    this.orcidId = this._sanitizeOrcidId(orcidId);
    this.baseURL = config.baseURL || 'https://pub.orcid.org/v3.0';
    this.timeout = config.timeout || 10000;
  }

  /**
   * Fetches all works associated with this ORCID ID.
   */
  async fetchWorks(): Promise<ParsedWork[]> {
    const data = await this._fetchJson(`${this.baseURL}/${this.orcidId}/works`);
    return this._parseWorks(data);
  }

  /**
   * Fetches detailed information about a specific work by its putCode.
   */
  async fetchWorkDetails(putCode: number | string): Promise<ParsedWorkDetail> {
    const data = await this._fetchJson(`${this.baseURL}/${this.orcidId}/work/${putCode}`);
    return this._parseWorkDetail(data);
  }

  /** Returns the sanitized ORCID ID. */
  getOrcidId(): string {
    return this.orcidId;
  }

  /** Convenience wrappers around global utility functions for this instance. */
  filterByType(works: ParsedWork[], types: WorkType | WorkType[]): ParsedWork[] { return filterByType(works, types as string | string[]); }
  filterByYearRange(works: ParsedWork[], start: number, end: number): ParsedWork[] { return filterByYearRange(works, start, end); }
  sortByDate(works: ParsedWork[], order?: 'asc' | 'desc'): ParsedWork[] { return sortByDate(works, order); }
  getStatistics(works: ParsedWork[]): WorksStatistics { return getStatistics(works); }
  groupBy(works: ParsedWork[], property: keyof ParsedWork | string): Record<string, ParsedWork[]> { return groupBy(works, property); }

  /**
   * Internal helper for fetching JSON data with timeout and error handling.
   */
  private async _fetchJson(url: string): Promise<any> {
    const response = await this._fetchWithTimeout(url, { headers: ORCID.DEFAULT_HEADERS });
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return response.json();
  }

  /**
   * Wraps the fetch() API with a timeout mechanism.
   */
  private _fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    return Promise.race([
      fetch(url, options),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error(ORCID.TIMEOUT_ERROR)), this.timeout)
      )
    ]) as Promise<Response>;
  }

  /**
   * Normalizes an ORCID ID by removing the URL prefix if present.
   */
  private _sanitizeOrcidId(id: string): string {
    return id.replace(/^https?:\/\/orcid\.org\//, '');
  }

  /**
   * Parses a list of works from ORCID API response data.
   */
  private _parseWorks(data: any): ParsedWork[] {
    return (data.group || [])
      .map((g: any) => g['work-summary']?.[0])
      .filter(Boolean)
      .map((ws: any) => ({
        putCode: ws['put-code'],
        title: this._extractTitle(ws.title),
        type: ws.type || 'unknown',
        publicationYear: ws['publication-date']?.year?.value,
        journalTitle: ws['journal-title']?.value,
        contributors: this._parseContributors(ws.contributors),
        url: ws.url?.value,
        source: ws.source?.['source-name']?.value
      }));
  }

  /**
   * Parses detailed work information from an ORCID API response.
   */
  private _parseWorkDetail(data: any): ParsedWorkDetail {
    return {
      putCode: data['put-code'],
      title: this._extractTitle(data.title),
      subtitle: data.title?.subtitle?.value,
      translatedTitle: data.title?.['translated-title']?.value,
      type: data.type || 'unknown',
      publicationYear: data['publication-date']?.year?.value,
      publicationMonth: data['publication-date']?.month?.value,
      publicationDay: data['publication-date']?.day?.value,
      journalTitle: data['journal-title']?.value,
      shortDescription: data['short-description'],
      citation: this._parseCitation(data.citation),
      url: data.url?.value,
      contributors: this._parseContributors(data.contributors),
      externalIds: this._parseExternalIds(data['external-ids']),
      languageCode: data['language-code'],
      country: data.country?.value,
      source: data.source?.['source-name']?.value
    };
  }

  /**
   * Extracts a title string from a possibly nested ORCID title object.
   */
  private _extractTitle(titleObj: any): string {
    return titleObj?.title?.value || 'Untitled';
  }

  /**
   * Parses external identifiers (e.g., DOI, ISBN) from an ORCID response.
   */
  private _parseExternalIds(externalIds: any): ExternalId[] {
    return externalIds?.['external-id']?.map((id: any) => ({
      type: id['external-id-type'],
      value: id['external-id-value'],
      url: id['external-id-url']?.value,
      relationship: id['external-id-relationship']
    })) || [];
  }

  /**
   * Parses contributor information from an ORCID response.
   */
  private _parseContributors(contributors: any): Contributor[] {
    return contributors?.contributor?.map((c: any) => ({
      name: c['credit-name']?.value,
      role: c['contributor-attributes']?.['contributor-role'],
      sequence: c['contributor-attributes']?.['contributor-sequence']
    })) || [];
  }

  /**
   * Parses citation metadata from an ORCID work entry.
   */
  private _parseCitation(citation: any): { type: string; value: string } | null {
    return citation
      ? { type: citation['citation-type'], value: citation['citation-value'] }
      : null;
  }
}

/**
 * Adds CommonJS module export compatibility for Node environments.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(function attachCJS(exportsObj: any) {
  if (typeof module !== 'undefined' && (module as any).exports) {
    (module as any).exports = {
      ORCID,
      WORK_TYPES,
      filterByType,
      filterByYearRange,
      sortByDate,
      getStatistics,
      groupBy
    };
  }
})(undefined as unknown as any);
