# ORCID Parser
[![License: BSD-3-Clause](https://img.shields.io/badge/License-BSD--3--Clause-brightgreen.svg)](https://opensource.org/license/BSD-3-clause)
[![NPM Package Version](https://img.shields.io/npm/v/orcid-parser)](https://www.npmjs.com/package/orcid-parser)
[![Package Yearly Downloads](https://img.shields.io/npm/dy/orcid-parser)](https://www.npmjs.com/package/orcid-parser)
[![Minizipped Size](https://img.shields.io/bundlephobia/minzip/orcid-parser?label=size)](https://bundlephobia.com/package/orcid-parser)
[![Documentation](https://img.shields.io/badge/Docs-github.io-lightgrey)](https://p-sira.github.io/orcid-parser)

Lightweight ORCID fetcher and parser. Includes helpers to filter, sort, group, and summarize works, plus a simple timeout-enabled fetch layer.

## Quick start

### Installation
Install with your favorite package manager:

```bash
# npm
npm install orcid-parser

# yarn
yarn add orcid-parser
```

### Importing

The default import (index) is standalone. The `constants` module is distributed separately for performance. Import `constants` module if you need definitions such as `WORK_TYPES`.

Use in the browser via CDN:

```html
<script type="module">
  import { Orcid } from 'https://cdn.jsdelivr.net/npm/orcid-parser@latest/dist/index.mjs';
  import { WORK_TYPES } from 'https://cdn.jsdelivr.net/npm/orcid-parser@latest/dist/constants.mjs';
</script>
```

Use in Node.js/modern bundlers (ESM):

```js
import { Orcid } from 'orcid-parser';
import { WORK_TYPES } from 'orcid-parser/constants';
```

Use in CommonJS (Node.js require):

```js
const { Orcid } = require('orcid-parser');
const { WORK_TYPES } = require('orcid-parser/constants');
```

### Fetching works

```js
// Create a client instance
const client = new Orcid('0000-0002-1825-0097');

// Fetch all works associated with the ORCID ID.
const works = await client.fetchWorks();

// This will return the cache if exists. Otherwise, it will fetch.
const cachedWorks = await client.getWorks();
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
      value: '@article{Carberry_2008, ...}'
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
      value: '@article{Carberry1987, ...}}'
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
const articles = client.filterByType(WORK_TYPES.ARTICLE);
const papers = client.filterByType([WORK_TYPES.ARTICLE, WORK_TYPES.PREPRINT]);

// Filter by publication year range
const recentWorks = client.filterByYearRange(2020, 2024);

// Sort works by publication date
const sorted = client.sortByDate(); // sortByDate('desc'): newest first
const oldestFirst = client.sortByDate('asc');
```

#### Statistics and grouping

```js
// Get statistics about works
const stats = client.getStats(works);
console.log(stats);

>> {
>>   total: 7,
>>   byType: { 'journal-article': 7 },
>>   byYear: { '1987': 1, '2008': 2, '2011': 1, '2012': 3 },
>>   yearRange: { min: 1987, max: 2012 }
>> }

// Group works by property
const byType = client.groupBy('type');
const byJournal = client.groupBy('journalTitle');
```

#### Standalone utilities

You can also use the utility functions independently:

```js
import { Orcid, filterByType, sortByDate, getStats } from 'orcid-parser';

const works = await new Orcid('0000-0002-1825-0097').getWorks();

const articles = filterByType(works, 'journal-article');
const sorted = sortByDate(articles, 'desc');
const stats = getStats(works);
```

#### Configuration

```js
const client = new Orcid('0000-0002-1825-0097', {
  baseURL: 'https://pub.orcid.org/v3.0',  // default
  timeout: 10000  // 10 seconds (default)
});
```
