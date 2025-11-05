## API Reference

### Types

```ts
type ExternalId = {
  type: string;
  value: string;
  url?: string;
  relationship?: string;
};

type Contributor = {
  name?: string;
  role?: string;
  sequence?: string;
};

type WorkSummary = {
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

type Work = WorkSummary & {
  shortDescription?: string;
  citation?: {
    type?: string;
    value?: string;
  };
  type: WorkType;
  contributors?: Contributor[];
  languageCode?: string;
  country?: string;
};

type WorkType = typeof WORK_TYPES[keyof typeof WORK_TYPES];

type WorksStatistics = {
  total: number;
  byType: Record<string, number>;
  byYear: Record<number, number>;
  yearRange: { min: number | null; max: number | null };
};

type OrcidClientConfig = {
  baseURL?: string;
  timeout?: number;
};
```

### Constants

```ts
const WORK_TYPES: {
  ARTICLE: 'journal-article';
  BOOK: 'book';
  BOOK_CHAPTER: 'book-chapter';
  CONFERENCE_PAPER: 'conference-paper';
  CONFERENCE_ABSTRACT: 'conference-abstract';
  DISSERTATION: 'dissertation-thesis';
  PREPRINT: 'preprint';
  REPORT: 'report';
  DATASET: 'data-set';
  SOFTWARE: 'research-software';
  PATENT: 'patent';
  REVIEW: 'review';
  WORKING_PAPER: 'working-paper';
  OTHER: 'other';
} as const;
```

### Class ORCID

```ts
class ORCID {
  static DEFAULT_HEADERS: Record<string, string>;
  static TIMEOUT_ERROR: string;

  constructor(orcidId: string, config?: OrcidClientConfig);

  fetchWorkSummaries(): Promise<WorkSummary[]>;
  fetchWorks(): Promise<Work[]>;
  fetchWork(putCode: number | string): Promise<Work>;
  fetchWithCodes(putCodes: number[]): Promise<Work[]>;
  getOrcidId(): string;

  filterByType(works: Work[], types: WorkType | WorkType[]): Work[];
  filterByYearRange(works: Work[], start: number, end: number): Work[];
  sortByDate(works: Work[], order?: 'asc' | 'desc'): Work[];
  getStatistics(works: Work[]): WorksStatistics;
  groupBy(works: Work[], property: keyof Work | string): Record<string, Work[]>;
}
```

#### Constructor

- `orcidId` (string, required): The ORCID identifier. Can be a bare ID (e.g., `'0000-0002-1825-0097'`) or a full URL (e.g., `'https://orcid.org/0000-0002-1825-0097'`). The URL prefix will be automatically removed.
- `config` (OrcidClientConfig, optional): Configuration options
  - `baseURL` (string, optional): Base URL for ORCID API requests. Defaults to `'https://pub.orcid.org/v3.0'`.
  - `timeout` (number, optional): Request timeout in milliseconds. Defaults to `10000` (10 seconds).

#### Instance Methods

- `fetchWorkSummaries(): Promise<WorkSummary[]>` - Fetches all work summaries associated with the ORCID ID. Returns a list of `WorkSummary` objects.

- `fetchWorks(): Promise<Work[]>` - Fetches detailed information for the first 100 works of the ORCID profile. Returns a list of `Work` objects.

- `fetchWork(putCode: number | string): Promise<Work>` - Fetches detailed information about a specific work by its putCode. Returns a `Work` object.

- `fetchWithCodes(putCodes: number[]): Promise<Work[]>` - Fetches detailed information for multiple works by their putCodes. Maximum of 100 putCodes allowed. Returns a list of `Work` objects.

- `getOrcidId(): string` - Returns the sanitized ORCID ID (without URL prefix).

The following utility methods are convenience wrappers around the standalone utility functions:

- `filterByType(works: Work[], types: WorkType | WorkType[]): Work[]` - Filters works by one or more types.

- `filterByYearRange(works: Work[], start: number, end: number): Work[]` - Filters works to include only those within the specified publication year range (inclusive).

- `sortByDate(works: Work[], order?: 'asc' | 'desc'): Work[]` - Sorts works by publication year. Defaults to descending order (newest first).

- `getStatistics(works: Work[]): WorksStatistics` - Computes statistics about a list of works (count by type, by year, and year range).

- `groupBy(works: Work[], property: keyof Work | string): Record<string, Work[]>` - Groups works by a specified property key (e.g., `'type'`, `'journalTitle'`). Works with missing values are grouped under `'unknown'`.

### Standalone Utilities

These utility functions can be used independently of the `ORCID` class:

```ts
function filterByType<T extends { type?: string }>(
  works: T[],
  types: string | string[]
): T[];

function filterByYearRange<T extends { publicationYear?: number }>(
  works: T[],
  startYear: number,
  endYear: number
): T[];

function sortByDate<T extends { publicationYear?: number }>(
  works: T[],
  order?: 'asc' | 'desc'
): T[];

function getStatistics(
  works: Array<{ type?: string; publicationYear?: number }>
): WorksStatistics;

function groupBy<T extends Record<string, any>>(
  works: T[],
  property: keyof T | string
): Record<string, T[]>;
```

### Errors

- `Error('ORCID ID is required')` - Thrown when constructing an `ORCID` instance with an empty or falsy `orcidId`.
- `Error('HTTP error! status: <code>')` - Thrown for non-OK HTTP responses.
- `Error('Request timeout')` - Thrown when the configured timeout elapses.
- `Error('fetchWithCodes: Too many put codes (max 100)')` - Thrown when `fetchWithCodes` is called with more than 100 putCodes.
