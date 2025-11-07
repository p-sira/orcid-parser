/*
 * ORCID Parser is licensed under The 3-Clause BSD, see LICENSE.
 * Copyright 2025 Sira Pornsiriprasert <code@psira.me>
 */

// Represents an external identifier associated with a work
// (e.g., DOI, ISBN, arXiv ID, etc.).
export type ExternalId = {
  type: string;
  value: string;
  url?: string;
  relationship?: string;
};

export type Contributor = {
  name?: string;
  role?: string;
  sequence?: string;
};

// Basic representation of an ORCID work.
export type WorkSummary = {
  putCode: number;
  createdDate: Date;
  lastModifiedDate: Date;
  source?: string;
  title: string;
  subtitle?: string;
  translatedTitle?: string;
  externalIds: ExternalId[];
  publicationYear?: number;
  publicationMonth?: number;
  publicationDay?: number;
  journalTitle?: string;
  url?: string;
};

// Detailed representation of an ORCID work.
export type Work = WorkSummary & {
  shortDescription?: string;
  citation?: {
    type?: string;
    value?: string;
  };
  type: string | null;
  contributors?: Contributor[];
  languageCode?: string;
  country?: string;
};

// Unified type for work or work summary
export type AnyWork = Work | WorkSummary;

export type OrcidStats = {
  total: number;
  byType: Record<string, number>;
  byYear: Record<number, number>;
  yearRange: { min: number | null; max: number | null };
};

export function filterByType(works: Work[], types: string | string[]): Work[] {
  const typeArray = Array.isArray(types) ? types : [types];
  return works.filter(work => !!work.type && typeArray.includes(work.type));
}

export function filterByYearRange(works: AnyWork[], startYear: number, endYear: number): AnyWork[] {
  return works.filter(work => {
    const year = work.publicationYear;
    return typeof year === 'number' && year >= startYear && year <= endYear;
  });
}

export function sortByDate(works: AnyWork[], order: 'asc' | 'desc' = 'desc'): AnyWork[] {
  return [...works].sort((a, b) => {
    const timeA = _getPublicationTime(a);
    const timeB = _getPublicationTime(b);
    return order === 'desc' ? timeB - timeA : timeA - timeB;
  });
}

// Computes statistics about a list of works (count by type, by year, and year range).
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

export function groupBy(works: AnyWork[], key: keyof AnyWork): Record<string, AnyWork[]> {
  return works.reduce<Record<string, AnyWork[]>>((groups, work) => {
    const value = work[key]; // Try extracting the value from the field 'key'
    const groupKey = value != null ? String(value) : 'unknown'; // If the value is undefined, then fallback to the key 'unknown'
    (groups[groupKey] ||= []).push(work); // Otherwise, push the work to the group with the name of the key
    return groups;
  }, {});
}

export type OrcidClientConfig = {
  baseURL?: string;
  timeout?: number;
};

/**
 * ORCID API client for fetching and parsing works and work details.
 */
export class Orcid {
  /** Default headers for all ORCID API requests. */
  static DEFAULT_HEADERS: Record<string, string> = { Accept: 'application/json' };

  private works: Work[];
  orcidId: string;
  baseURL: string;
  timeout: number;

  /**
   * Creates a new ORCID API client.
   * @param orcidId ORCID identifier (can include or omit the full URL)
   * @param config Optional client configuration
   */
  constructor(orcidId: string, config: OrcidClientConfig = {}) {
    if (!orcidId) throw new Error('ORCID ID is required');
    this.orcidId = _sanitizeOrcidId(orcidId);
    this.baseURL = config.baseURL || 'https://pub.orcid.org/v3.0';
    this.timeout = config.timeout || 10000;
    this.works = [];
  }

  // Fetches all work summaries associated with this ORCID ID.
  async fetchWorkSummaries(): Promise<WorkSummary[]> {
    const data = await _fetchJson(`${this.baseURL}/${this.orcidId}/works`, this.timeout);
    return (data.group || [])
      .map((g: any) => g['work-summary']?.[0])
      .filter(Boolean)
      .map((ws: any) => _parseWorkSummary(ws));
  }

  // Fetch detailed work records with putCodes. Max = 100.
  async fetchWithCodes(putCodes: number[]): Promise<Work[]> {
    if (putCodes.length > 100) {
      throw new Error("fetchWithCodes: Too many put codes (max 100)");
    }
    const data = await _fetchJson(`${this.baseURL}/${this.orcidId}/works/${putCodes.join(',')}`, this.timeout);
    return (data.bulk || [])
      .map((entry: any) => _parseWork(entry.work))
  }

  // Fetch detailed work records for given putCodes (single, multiple, or none). 
  // If no codes are provided, retrieves and returns details for the first 100 works.
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

  // Get works associated with the ORCID. Fetch the works if not cached. 
  async getWorks(): Promise<Work[]> {
    if (this.works.length < 1) {
      this.works = await this.fetchWorks();
    }
    return this.works;
  }

  async groupBy(property: keyof Work): Promise<Record<string, Work[]>> {
    return groupBy(await this.getWorks(), property as keyof AnyWork) as Record<string, Work[]>;
  }

  async filterByType(types: string | string[]): Promise<Work[]> {
    return filterByType(await this.getWorks(), types);
  }

  async filterByYearRange(start: number, end: number): Promise<Work[]> {
    return filterByYearRange(await this.getWorks(), start, end) as Work[];
  }

  async sortByDate(order: 'asc' | 'desc' = 'desc'): Promise<Work[]> {
    return sortByDate(await this.getWorks(), order) as Work[];
  }

  async getStats(): Promise<OrcidStats> {
    return getStats(await this.getWorks());
  };
}

function _getPublicationTime(work: AnyWork): number {
  return new Date(work.publicationYear ?? 0, (work.publicationMonth ?? 1) - 1, work.publicationDay ?? 1).getTime();
}

async function _fetchJson(url: string, timeout: number): Promise<any> {
  const response = await _fetchWithTimeout(url, { headers: Orcid.DEFAULT_HEADERS }, timeout);
  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
  return response.json();
}

function _fetchWithTimeout(url: string, options: RequestInit, timeout: number): Promise<Response> {
  return Promise.race([
    fetch(url, options),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Request timeout')), timeout)
    )
  ]) as Promise<Response>;
}

// Normalizes an ORCID ID by removing the URL prefix if present.
function _sanitizeOrcidId(id: string): string {
  return id.replace(/^https?:\/\/orcid\.org\//, '');
}

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

function _parseEpochDate(value: any): Date {
  const ms = typeof value === 'number' ? value : Number(value);
  return Number.isFinite(ms) ? new Date(ms) : new Date(0);
}

function _parseExternalIds(externalIds: any): ExternalId[] {
  return externalIds?.['external-id']?.map((id: any) => ({
    type: id['external-id-type'],
    value: id['external-id-value'],
    url: id['external-id-url']?.value,
    relationship: id['external-id-relationship']
  })) || [];
}

function _parseContributors(contributors: any): Contributor[] {
  return contributors?.contributor?.map((c: any) => ({
    name: c['credit-name']?.value,
    role: c['contributor-attributes']?.['contributor-role'],
    sequence: c['contributor-attributes']?.['contributor-sequence']
  })) || [];
}

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
