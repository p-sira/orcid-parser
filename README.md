# ORCID Parser
Lightweight ORCID fetching and parsing for JS. Includes helpers to filter, sort, group, and summarize works, plus a simple timeout-enabled fetch layer.

## Quick start

Install with NPM,

```shell
npm install orcid-parser
```

or Yarn,

```shell
yarn add orcid-parser
```

### Fetching works

```js
import { ORCID, WORK_TYPES } from 'orcid-parser';

// Create a client instance
const client = new ORCID('0000-0002-1825-0097');

// Fetch all works
const works = await client.fetchWorks();
console.log(works);
```

Output:
```js
[
  {
    putCode: 4562453,
    createdDate: 2013-02-17T20:00:56.538Z,
    lastModifiedDate: 2017-05-05T20:31:53.836Z,
    source: 'Josiah Carberry',
    title: 'Developing Thin Clients Using Amphibious Epistemologies',
    subtitle: 'Journal of Psychoceramics',
    translatedTitle: undefined,
    externalIds: [ [Object], [Object] ],
    publicationYear: 2008,
    publicationMonth: NaN,
    publicationDay: NaN,
    journalTitle: undefined,
    url: undefined,
    shortDescription: null,
    citation: {
      type: 'bibtex',
      value: '@article{Carberry_2008, title={Developing Thin Clients Using Amphibious Epistemologies}, volume={5}, url={http://dx.doi.org/10.5555/12345679}, DOI={10.5555/12345679}, number={11}, journal={Journal of Psychoceramics}, publisher={CrossRef test user}, author={Carberry, Josiah}, year={2008}, month={Feb}, pages={1-3}}'
    },
    type: 'journal-article',
    contributors: [],
    languageCode: null,
    country: undefined
  },
  ...
  {
    putCode: 19980729,
    createdDate: 2015-11-04T18:52:26.999Z,
    lastModifiedDate: 2022-05-24T17:38:28.337Z,
    source: 'Scopus - Elsevier',
    title: 'Bulk and surface plasmons in artificially structured materials',
    subtitle: undefined,
    translatedTitle: undefined,
    externalIds: [ [Object], [Object] ],
    publicationYear: 1987,
    publicationMonth: NaN,
    publicationDay: NaN,
    journalTitle: 'IEEE Transactions on Plasma Science',
    url: 'http://www.scopus.com/inward/record.url?eid=2-s2.0-0023398608&partnerID=MN8TOARS',
    shortDescription: null,
    citation: {
      type: 'bibtex',
      value: '@article{Carberry1987,title = {Bulk and surface plasmons in artificially structured materials},journal = {IEEE Transactions on Plasma Science},year = {1987},volume = {15},number = {4},pages = {394-410},author = {Quinn, J.J. and Carberry, J.S.}}'
    },
    type: 'journal-article',
    contributors: [ [Object], [Object] ],
    languageCode: null,
    country: undefined
  }
]
```

### Filtering and sorting

```js
// Filter works by type
const articles = client.filterByType(works, WORK_TYPES.ARTICLE);
const papers = client.filterByType(works, [WORK_TYPES.ARTICLE, WORK_TYPES.PREPRINT]);

// Filter by publication year range
const recentWorks = client.filterByYearRange(works, 2020, 2024);

// Sort works by publication date (newest first by default)
const sorted = client.sortByDate(works, 'desc');
const oldestFirst = client.sortByDate(works, 'asc');
```

#### Statistics and grouping

```js
// Get statistics about works
const stats = client.getStatistics(works);
console.log(stats);

// {
//   total: 7,
//   byType: { 'journal-article': 7 },
//   byYear: { '1987': 1, '2008': 2, '2011': 1, '2012': 3 },
//   yearRange: { min: 1987, max: 2012 }
// }

// Group works by property
const byType = client.groupBy(works, 'type');
const byJournal = client.groupBy(works, 'journalTitle');
```

#### Standalone utilities

You can also use the utility functions independently:

```js
import { filterByType, sortByDate, getStatistics, WORK_TYPES } from 'orcid-parser';

const articles = filterByType(works, WORK_TYPES.ARTICLE);
const sorted = sortByDate(articles, 'desc');
const stats = getStatistics(works);
```

#### Configuration

```js
const client = new ORCID('0000-0002-1825-0097', {
  baseURL: 'https://pub.orcid.org/v3.0',  // default
  timeout: 10000  // 10 seconds (default)
});
```

### API

- **Class `ORCID`**
  - `constructor(orcidId, config?)`
    - `orcidId`: string; bare ID or full URL (e.g., `https://orcid.org/0000-...`).
    - `config.baseURL`: defaults to `https://pub.orcid.org/v3.0`.
    - `config.timeout`: request timeout in ms (default: `10000`).
  - `fetchWorkSummaries(): Promise<WorkSummary[]>` - Fetches all work summaries
  - `fetchWorks(): Promise<Work[]>` - Fetches detailed information for the first 100 works
  - `fetchWork(putCode: number|string): Promise<Work>` - Fetches detailed information for a specific work
  - `fetchWithCodes(putCodes: number[]): Promise<Work[]>` - Fetches detailed information for multiple works (max 100)
  - `getOrcidId(): string`
  - Utility proxies: `filterByType`, `filterByYearRange`, `sortByDate`, `getStatistics`, `groupBy`

- **Constants**: `WORK_TYPES`

- **Standalone utilities**: `filterByType`, `filterByYearRange`, `sortByDate`, `getStatistics`, `groupBy`

For detailed signatures and shapes, see [docs/API.md](docs/API.md).

### Types

```ts
type ExternalId = { type: string; value: string; url?: string; relationship?: string };
type Contributor = { name?: string; role?: string; sequence?: string };
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
  citation?: { type?: string; value?: string };
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
```

### Testing

Run the test suite using Vitest:

```bash
npm test
```

Open coverage report:

```bash
xdg-open coverage/index.html || open coverage/index.html
```
