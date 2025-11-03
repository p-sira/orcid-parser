## ORCID Parser
Lightweight ORCID fetching and parsing for JS. Includes helpers to filter, sort, group, and summarize works, plus a simple timeout-enabled fetch layer.

### Install & build

```bash
npm install
npm run build
```

The compiled CommonJS output is emitted to `dist/` with type declarations.

### Quick start

Local usage (from this repo):

```js
const { ORCID, WORK_TYPES } = require('./dist/orcid-parser.js');

(async () => {
  const client = new ORCID('0000-0002-1825-0097');
  const works = await client.fetchWorks();
  const articles = client.filterByType(works, WORK_TYPES.ARTICLE);
  console.log(articles);
})();
```

### API

- **Class `ORCID`**
  - `constructor(orcidId, config?)`
    - `orcidId`: string; bare ID or full URL (e.g., `https://orcid.org/0000-...`).
    - `config.baseURL`: defaults to `https://pub.orcid.org/v3.0`.
    - `config.timeout`: request timeout in ms (default: `10000`).
  - `fetchWorks(): Promise<ParsedWork[]>`
  - `fetchWorkDetails(putCode: number|string): Promise<ParsedWorkDetail>`
  - `getOrcidId(): string`
  - Utility proxies: `filterByType`, `filterByYearRange`, `sortByDate`, `getStatistics`, `groupBy`

- **Constants**: `WORK_TYPES`

- **Standalone utilities**: `filterByType`, `filterByYearRange`, `sortByDate`, `getStatistics`, `groupBy`

For detailed signatures and shapes, see [docs/API.md](docs/API.md).

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
