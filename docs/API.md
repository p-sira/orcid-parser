## API Reference

### Types

```ts
type ExternalId = { type: string; value: string; url?: string; relationship?: string };
type Contributor = { name?: string; role?: string; sequence?: string };

type ParsedWork = {
  putCode: number;
  title: string;
  type: string;
  publicationYear?: number;
  publicationMonth?: number;
  publicationDay?: number;
  journalTitle?: string;
  url?: string;
  externalIds: ExternalId[];
  source?: string;
};

type ParsedWorkDetail = ParsedWork & {
  subtitle?: string;
  translatedTitle?: string;
  shortDescription?: string;
  citation?: { type: string; value: string } | null;
  contributors: Contributor[];
  languageCode?: string;
  country?: string;
};

type WorksStatistics = {
  total: number;
  byType: Record<string, number>;
  byYear: Record<number, number>;
  yearRange: { min: number | null; max: number | null };
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
}
```

### Class ORCID

```ts
class ORCID {
  constructor(orcidId: string, config?: { baseURL?: string; timeout?: number });

  fetchWorks(): Promise<ParsedWork[]>;
  fetchWorkDetails(putCode: number | string): Promise<ParsedWorkDetail>;
  getOrcidId(): string;

  filterByType(works: ParsedWork[], types: string | string[]): ParsedWork[];
  filterByYearRange(works: ParsedWork[], start: number, end: number): ParsedWork[];
  sortByDate(works: ParsedWork[], order?: 'asc' | 'desc'): ParsedWork[];
  getStatistics(works: ParsedWork[]): WorksStatistics;
  groupBy(works: ParsedWork[], property: keyof ParsedWork | string): Record<string, ParsedWork[]>;
}
```

### Standalone utilities

```ts
filterByType<T extends { type?: string }>(works: T[], types: string | string[]): T[];
filterByYearRange<T extends { publicationYear?: number }>(works: T[], startYear: number, endYear: number): T[];
sortByDate<T extends { publicationYear?: number }>(works: T[], order?: 'asc' | 'desc'): T[];
getStatistics(works: Array<{ type?: string; publicationYear?: number }>): WorksStatistics;
groupBy<T extends Record<string, any>>(works: T[], property: keyof T | string): Record<string, T[]>;
```

### Errors

- `Error('HTTP error! status: <code>')` for non-OK responses
- `Error('Request timeout')` when the configured timeout elapses


