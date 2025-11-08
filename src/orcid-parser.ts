/**
 * ORCID Parser - A TypeScript library for fetching and parsing ORCID publication data
 * 
 * @packageDocumentation
 * @license BSD-3-Clause
 * @author Sira Pornsiriprasert <code@psira.me>
 * @module orcid-parser
 */

// #region Type Definitions

/**
 * Represents an external identifier associated with a work (e.g., DOI, ISBN, arXiv ID).
 * 
 * @example
 * ```ts
 * const doi: ExternalId = {
 *   type: 'doi',
 *   value: '10.1234/example',
 *   url: 'https://doi.org/10.1234/example',
 *   relationship: 'self'
 * };
 * ```
 */
export type ExternalId = {
  /** The type of external identifier (e.g., 'doi', 'isbn', 'arxiv') */
  type: string;
  /** The identifier value */
  value: string;
  /** Optional URL for the identifier */
  url?: string;
  /** Relationship of the identifier to the work (e.g., 'self', 'part-of') */
  relationship?: string;
};

/**
 * Represents a contributor to a work (author, editor, etc.).
 * 
 * @example
 * ```ts
 * const author: Contributor = {
 *   name: 'Jane Doe',
 *   role: 'author',
 *   sequence: 'first'
 * };
 * ```
 */
export type Contributor = {
  /** The contributor's name */
  name?: string;
  /** The role of the contributor (e.g., 'author', 'editor') */
  role?: string;
  /** The sequence/order of the contributor (e.g., 'first', 'additional') */
  sequence?: string;
};

/**
 * Basic representation of an ORCID work with summary information.
 * 
 * @remarks
 * This type contains core metadata available from the API endpoint "/works".
 * Use {@link Work} for complete work information including citation and contributors.
 */
export type WorkSummary = {
  /** Unique identifier for this work record in ORCID */
  putCode: number;
  /** Date when this work record was created */
  createdDate: Date;
  /** Date when this work record was last modified */
  lastModifiedDate: Date;
  /** Source system that provided this work record */
  source?: string;
  /** Main title of the work */
  title: string;
  /** Subtitle of the work */
  subtitle?: string;
  /** Translated title in another language */
  translatedTitle?: string;
  /** Array of external identifiers (DOI, ISBN, etc.) */
  externalIds: ExternalId[];
  /** Year of publication */
  publicationYear?: number;
  /** Month of publication (1-12) */
  publicationMonth?: number;
  /** Day of publication (1-31) */
  publicationDay?: number;
  /** Title of the journal/venue where published */
  journalTitle?: string;
  /** URL to the work */
  url?: string;
};

/**
 * Detailed representation of an ORCID work, extending {@link WorkSummary}.
 * 
 * @remarks
 * Includes all summary fields plus detailed information like citation,
 * contributors, and descriptive metadata.
 */
export type Work = WorkSummary & {
  /** Short description or abstract of the work */
  shortDescription?: string;
  /** Citation information for the work */
  citation?: {
    /** Citation format type (e.g., 'bibtex', 'ris') */
    type?: string;
    /** Citation text content */
    value?: string;
  };
  /** Type of work (e.g., 'journal-article', 'book', 'conference-paper') */
  type: string | null;
  /** List of contributors (authors, editors, etc.) */
  contributors?: Contributor[];
  /** ISO language code (e.g., 'en', 'fr') */
  languageCode?: string;
  /** Country code where published */
  country?: string;
};

/**
 * Unified type representing either a {@link Work} or {@link WorkSummary}.
 * 
 * @remarks
 * Used for functions that can accept either detailed or summary work objects.
 */
export type AnyWork = Work | WorkSummary;

/**
 * Statistical information about a collection of works.
 * 
 * @example
 * ```ts
 * const stats: OrcidStats = {
 *   total: 42,
 *   byType: { 'journal-article': 30, 'conference-paper': 12 },
 *   byYear: { 2023: 15, 2024: 27 },
 *   yearRange: { min: 2020, max: 2024 }
 * };
 * ```
 */
export type OrcidStats = {
  /** Total number of works */
  total: number;
  /** Count of works grouped by type */
  byType: Record<string, number>;
  /** Count of works grouped by publication year */
  byYear: Record<number, number>;
  /** Range of publication years */
  yearRange: { 
    /** Earliest publication year, or null if no years available */
    min: number | null; 
    /** Latest publication year, or null if no years available */
    max: number | null 
  };
};

/**
 * Configuration options for the ORCID API client.
 * 
 * @example
 * ```ts
 * const config: OrcidClientConfig = {
 *   baseURL: 'https://pub.orcid.org/v3.0',
 *   timeout: 10000
 * };
 * ```
 */
export type OrcidClientConfig = {
  /** Base URL for the ORCID API (defaults to 'https://pub.orcid.org/v3.0') */
  baseURL?: string;
  /** Request timeout in milliseconds (defaults to 10000) */
  timeout?: number;
};

// #region Pure Functions

/**
 * Filters works by their type.
 * 
 * @param works - Array of works to filter
 * @param types - Single type string or array of type strings to match
 * @returns Filtered array of works matching the specified type(s)
 * 
 * @example
 * ```ts
 * const articles = filterByType(works, 'journal-article');
 * const publications = filterByType(works, ['journal-article', 'conference-paper']);
 * ```
 */
export function filterByType(works: Work[], types: string | string[]): Work[] {
  const typeArray = Array.isArray(types) ? types : [types];
  return works.filter(work => !!work.type && typeArray.includes(work.type));
}

/**
 * Filters works by publication year range (inclusive).
 * 
 * @param works - Array of works to filter
 * @param startYear - Start year of the range (inclusive)
 * @param endYear - End year of the range (inclusive)
 * @returns Filtered array of works published within the specified year range
 * 
 * @example
 * ```ts
 * const recent = filterByYearRange(works, 2020, 2024);
 * ```
 */
export function filterByYearRange(works: AnyWork[], startYear: number, endYear: number): AnyWork[] {
  return works.filter(work => {
    const year = work.publicationYear;
    return typeof year === 'number' && year >= startYear && year <= endYear;
  });
}

/**
 * Sorts works by publication date.
 * 
 * @param works - Array of works to sort
 * @param order - Sort order: 'asc' for ascending, 'desc' for descending (default: 'desc')
 * @returns New array of works sorted by publication date
 * 
 * @remarks
 * This function creates a new array and does not modify the original.
 * Works without publication dates are sorted to the beginning (asc) or end (desc).
 * 
 * @example
 * ```ts
 * const newest = sortByDate(works, 'desc');
 * const oldest = sortByDate(works, 'asc');
 * ```
 */
export function sortByDate(works: AnyWork[], order: 'asc' | 'desc' = 'desc'): AnyWork[] {
  return [...works].sort((a, b) => {
    const timeA = _getPublicationTime(a);
    const timeB = _getPublicationTime(b);
    return order === 'desc' ? timeB - timeA : timeA - timeB;
  });
}

/**
 * Computes comprehensive statistics about a collection of works.
 * 
 * @param works - Array of works to analyze
 * @returns Statistics object containing counts by type, year, and year range
 * 
 * @example
 * ```ts
 * const stats = getStats(works);
 * console.log(`Total publications: ${stats.total}`);
 * console.log(`Journal articles: ${stats.byType['journal-article']}`);
 * console.log(`Publications in 2024: ${stats.byYear[2024]}`);
 * ```
 */
export function getStats(works: Work[]): OrcidStats {
  const stats: OrcidStats = {
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
 * Groups works by a specified property key.
 * 
 * @param works - Array of works to group
 * @param key - Property key to group by (e.g., 'type', 'publicationYear')
 * @returns Object mapping group keys to arrays of works
 * 
 * @remarks
 * Works with undefined values for the grouping key are placed in the 'unknown' group.
 * 
 * @example
 * ```ts
 * const byType = groupBy(works, 'type');
 * const byYear = groupBy(works, 'publicationYear');
 * ```
 */
export function groupBy(works: AnyWork[], key: keyof AnyWork): Record<string, AnyWork[]> {
  return works.reduce<Record<string, AnyWork[]>>((groups, work) => {
    const value = work[key];
    const groupKey = value != null ? String(value) : 'unknown';
    (groups[groupKey] ||= []).push(work);
    return groups;
  }, {});
}

// #region Orcid Class

/**
 * ORCID API client for fetching and parsing works and work details.
 * 
 * @remarks
 * This class provides methods to interact with the ORCID public API,
 * fetch publication data, and perform various filtering and analysis operations.
 * 
 * @example
 * Basic usage:
 * ```ts
 * const client = new Orcid('0000-0002-1825-0097');
 * const works = await client.fetchWorks();
 * console.log(`Found ${works.length} publications`);
 * ```
 * 
 * @example
 * With custom configuration:
 * ```ts
 * const client = new Orcid('0000-0002-1825-0097', {
 *   timeout: 15000,
 *   baseURL: 'https://pub.orcid.org/v3.0'
 * });
 * ```
 */
export class Orcid {
  /** 
   * Default headers for all ORCID API requests.
   * @readonly
   */
  static DEFAULT_HEADERS: Record<string, string> = { Accept: 'application/json' };

  private works: Work[];
  
  /** The ORCID identifier for this client instance */
  orcidId: string;
  
  /** Base URL for API requests */
  baseURL: string;
  
  /** Request timeout in milliseconds */
  timeout: number;

  /**
   * Creates a new ORCID API client.
   * 
   * @param orcidId - ORCID identifier (can include or omit the full URL)
   * @param config - Optional client configuration
   * @throws {Error} If orcidId is empty or invalid
   * 
   * @example
   * ```ts
   * // With just ORCID ID
   * const client1 = new Orcid('0000-0002-1825-0097');
   * 
   * // With full URL
   * const client2 = new Orcid('https://orcid.org/0000-0002-1825-0097');
   * 
   * // With configuration
   * const client3 = new Orcid('0000-0002-1825-0097', { timeout: 20000 });
   * ```
   */
  constructor(orcidId: string, config: OrcidClientConfig = {}) {
    if (!orcidId) throw new Error('ORCID ID is required');
    this.orcidId = _sanitizeOrcidId(orcidId);
    this.baseURL = config.baseURL || 'https://pub.orcid.org/v3.0';
    this.timeout = config.timeout || 10000;
    this.works = [];
  }

  /**
   * Fetches all work summaries associated with this ORCID ID.
   * 
   * @returns Promise resolving to array of work summaries
   * @throws {Error} If the API request fails or times out
   * 
   * @remarks
   * Work summaries contain basic metadata without full details like citations or contributors.
   * 
   * @example
   * ```ts
   * const summaries = await client.fetchWorkSummaries();
   * summaries.forEach(s => console.log(s.title));
   * ```
   */
  async fetchWorkSummaries(): Promise<WorkSummary[]> {
    const data = await _fetchJson(`${this.baseURL}/${this.orcidId}/works`, this.timeout);
    return (data.group || [])
      .map((g: any) => g['work-summary']?.[0])
      .filter(Boolean)
      .map((ws: any) => _parseWorkSummary(ws));
  }

  /**
   * Fetches detailed work records for specified put codes.
   * 
   * @param putCodes - Array of put codes to fetch (maximum 100)
   * @returns Promise resolving to array of detailed work objects
   * @throws {Error} If more than 100 put codes are provided or API request fails
   * 
   * @remarks
   * Put codes are unique identifiers for work records in ORCID.
   * This method uses the bulk API endpoint for efficiency.
   * 
   * @example
   * ```ts
   * const works = await client.fetchWithCodes([12345, 67890]);
   * ```
   */
  async fetchWithCodes(putCodes: number[]): Promise<Work[]> {
    if (putCodes.length > 100) {
      throw new Error("fetchWithCodes: Too many put codes (max 100)");
    }
    const data = await _fetchJson(`${this.baseURL}/${this.orcidId}/works/${putCodes.join(',')}`, this.timeout);
    return (data.bulk || [])
      .map((entry: any) => _parseWork(entry.work))
  }

  /**
   * Fetches detailed work records for given put codes.
   * 
   * @param putCodes - Put code(s) to fetch, or null/empty to fetch first 100 works
   * @returns Promise resolving to array of detailed work objects
   * @throws {Error} If API request fails
   * 
   * @remarks
   * - If no codes provided: fetches first 100 works
   * - If single code: fetches that work
   * - If array of codes: fetches all specified works (max 100)
   * 
   * @example
   * ```ts
   * // Fetch first 100 works
   * const all = await client.fetchWorks();
   * 
   * // Fetch specific work
   * const one = await client.fetchWorks(12345);
   * 
   * // Fetch multiple works
   * const some = await client.fetchWorks([12345, 67890]);
   * ```
   */
  async fetchWorks(putCodes?: number | number[] | string | string[] | null): Promise<Work[]> {
    let codes;

    if (putCodes == null || putCodes === '') {
      const data = await _fetchJson(`${this.baseURL}/${this.orcidId}/works`, this.timeout);
      codes = (data.group || [])
        .flatMap((g: any) => g['work-summary'] || [])
        .map((ws: any) => Number(ws['put-code'])).slice(0, 100);
    } else if (Array.isArray(putCodes)) {
      codes = putCodes.map(Number);
    } else {
      codes = [Number(putCodes)];
    }

    return this.fetchWithCodes(codes);
  }

  /**
   * Gets works associated with the ORCID, with automatic caching.
   * 
   * @returns Promise resolving to array of works
   * @throws {Error} If API request fails
   * 
   * @remarks
   * This method caches the results. First call fetches from API,
   * subsequent calls return cached data. Use {@link fetchWorks} to bypass cache.
   * 
   * @example
   * ```ts
   * const works = await client.getWorks();
   * const sameWorks = await client.getWorks(); // Returns cached data
   * ```
   */
  async getWorks(): Promise<Work[]> {
    if (this.works.length < 1) {
      this.works = await this.fetchWorks();
    }
    return this.works;
  }

  /**
   * Groups cached works by a specified property.
   * 
   * @param property - Property key to group by
   * @returns Promise resolving to object mapping group keys to work arrays
   * 
   * @remarks
   * Uses cached works from {@link getWorks}.
   * 
   * @example
   * ```ts
   * const byType = await client.groupBy('type');
   * const byYear = await client.groupBy('publicationYear');
   * ```
   */
  async groupBy(property: keyof Work): Promise<Record<string, Work[]>> {
    return groupBy(await this.getWorks(), property as keyof AnyWork) as Record<string, Work[]>;
  }

  /**
   * Filters cached works by type.
   * 
   * @param types - Single type or array of types to match
   * @returns Promise resolving to filtered array of works
   * 
   * @remarks
   * Uses cached works from {@link getWorks}.
   * 
   * @example
   * ```ts
   * const articles = await client.filterByType('journal-article');
   * const pubs = await client.filterByType(['journal-article', 'conference-paper']);
   * ```
   */
  async filterByType(types: string | string[]): Promise<Work[]> {
    return filterByType(await this.getWorks(), types);
  }

  /**
   * Filters cached works by publication year range.
   * 
   * @param start - Start year (inclusive)
   * @param end - End year (inclusive)
   * @returns Promise resolving to filtered array of works
   * 
   * @remarks
   * Uses cached works from {@link getWorks}.
   * 
   * @example
   * ```ts
   * const recent = await client.filterByYearRange(2020, 2024);
   * ```
   */
  async filterByYearRange(start: number, end: number): Promise<Work[]> {
    return filterByYearRange(await this.getWorks(), start, end) as Work[];
  }

  /**
   * Sorts cached works by publication date.
   * 
   * @param order - Sort order: 'asc' or 'desc' (default: 'desc')
   * @returns Promise resolving to sorted array of works
   * 
   * @remarks
   * Uses cached works from {@link getWorks}.
   * 
   * @example
   * ```ts
   * const newest = await client.sortByDate('desc');
   * const oldest = await client.sortByDate('asc');
   * ```
   */
  async sortByDate(order: 'asc' | 'desc' = 'desc'): Promise<Work[]> {
    return sortByDate(await this.getWorks(), order) as Work[];
  }

  /**
   * Computes statistics for cached works.
   * 
   * @returns Promise resolving to statistics object
   * 
   * @remarks
   * Uses cached works from {@link getWorks}.
   * 
   * @example
   * ```ts
   * const stats = await client.getStats();
   * console.log(`Total: ${stats.total}`);
   * console.log(`Types:`, stats.byType);
   * console.log(`Year range: ${stats.yearRange.min}-${stats.yearRange.max}`);
   * ```
   */
  async getStats(): Promise<OrcidStats> {
    return getStats(await this.getWorks());
  };
}

// #region Internal Helpers

/**
 * Converts work publication date fields to milliseconds timestamp.
 * @internal
 */
function _getPublicationTime(work: AnyWork): number {
  return new Date(work.publicationYear ?? 0, (work.publicationMonth ?? 1) - 1, work.publicationDay ?? 1).getTime();
}

/**
 * Fetches and parses JSON from a URL with timeout.
 * @internal
 */
async function _fetchJson(url: string, timeout: number): Promise<any> {
  const response = await _fetchWithTimeout(url, { headers: Orcid.DEFAULT_HEADERS }, timeout);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

/**
 * Fetches a URL with timeout handling.
 * @internal
 */
function _fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]) as Promise<Response>;
}

/**
 * Normalizes an ORCID ID by removing URL prefix if present.
 * @internal
 */
function _sanitizeOrcidId(id: string): string {
  return id.replace(/^https?:\/\/orcid\.org\//, '');
}

/**
 * Parses raw ORCID API work summary data.
 * @internal
 */
function _parseWorkSummary(data: any): WorkSummary {
  const pubDate = data['publication-date'];
  return {
    putCode: Number(data['put-code']),
    createdDate: _parseEpochDate(data['created-date']?.value),
    lastModifiedDate: _parseEpochDate(data['last-modified-date']?.value),
    source: data.source?.['source-name']?.value,
    title: data.title?.title?.value,
    subtitle: data.title?.subtitle?.value,
    translatedTitle: data.title?.['translated-title']?.value,
    externalIds: _parseExternalIds(data['external-ids']),
    publicationYear: Number(pubDate?.year?.value),
    publicationMonth: Number(pubDate?.month?.value),
    publicationDay: Number(pubDate?.day?.value),
    journalTitle: data['journal-title']?.value,
    url: data.url?.value
  };
}

/**
 * Parses raw ORCID API work data (detailed).
 * @internal
 */
function _parseWork(data: any): Work {
  return {
    ..._parseWorkSummary(data),
    shortDescription: data['short-description'],
    citation: _parseCitation(data.citation),
    type: data.type,
    contributors: _parseContributors(data.contributors),
    languageCode: data['language-code'],
    country: data.country?.value
  };
}

/**
 * Parses epoch timestamp to Date object.
 * @internal
 */
function _parseEpochDate(value: any): Date {
  const ms = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(ms) ? new Date(ms) : new Date(0);
}

/**
 * Parses external IDs from ORCID API response.
 * @internal
 */
function _parseExternalIds(externalIds: any): ExternalId[] {
  return externalIds?.['external-id']?.map((id: any) => ({
    type: id['external-id-type'],
    value: id['external-id-value'],
    url: id['external-id-url']?.value,
    relationship: id['external-id-relationship']
  })) || [];
}

/**
 * Parses contributors from ORCID API response.
 * @internal
 */
function _parseContributors(contributors: any): Contributor[] {
  return contributors?.contributor?.map((c: any) => ({
    name: c['credit-name']?.value,
    role: c['contributor-attributes']?.['contributor-role'],
    sequence: c['contributor-attributes']?.['contributor-sequence']
  })) || [];
}

/**
 * Parses citation from ORCID API response.
 * @internal
 */
function _parseCitation(citation: any): { type?: string; value?: string } | undefined {
  return citation
    ? { type: citation['citation-type'], value: citation['citation-value'] }
    : undefined;
}

// CommonJS module export compatibility for Node environments.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(function attachCJS(exportsObj: any) {
  if (typeof module !== 'undefined' && (module as any).exports) {
    (module as any).exports = {
      Orcid,
      filterByType,
      filterByYearRange,
      sortByDate,
      getStats,
      groupBy
    };
  }
})(undefined as unknown as any);