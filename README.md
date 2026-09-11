# Transaction report

A React and Express application that joins transactions to providers, filters and
sorts the result, and displays a paginated table with net-spend summaries.

## Attribution and data

This solution builds on the **Nous transaction report programming exercise** and
its supplied starter project (`project-nous/transaction-report-exercise`). The
implementation and maintenance changes in this repository are distinct from the
original exercise materials; their attribution is retained.

`data/providers.json` and `data/transactions.json` are the supplied exercise
fixtures, retained from the original submission. They are not obtained from a
live banking integration. Their independent source and licensing have not been
verified. The regression tests use small, explicitly synthetic records created
within the test file. This repository does not claim a new license over the
original exercise or its data.

## Run locally

Use Node.js 22. Enable Corepack if needed (`corepack enable`), then:

```sh
yarn install
cd web && yarn install && cd ..
yarn dev
```

The backend listens on `http://localhost:3001`; open the Vite URL printed by the
frontend. Provider changes are kept in memory and reset when the server restarts.

## Verify and build

```sh
yarn test
yarn build
cd web && yarn build && cd ..
yarn serve
```

The API tests launch an isolated server on a local ephemeral port and use
synthetic data. No external services or database are required. The backend build
copies the JSON fixtures alongside the compiled server under `dist/`.

## Behavior

- A provider's search query is matched as a case-sensitive substring of the
  original transaction description. The first matching provider wins.
- Adding or deleting a provider rebuilds the join from those descriptions.
  Unmatched transactions appear as `Unknown`, which is a reserved provider name.
- Debit amounts are positive spend and credits are negative spend. Totals are
  accumulated in integer pence; the average is rounded to the nearest penny.
- Summaries cover the entire filtered set, even when only one page is displayed.
  An empty set returns zero total, zero average, zero count, and an empty list.
- Pagination is zero-based. `pageSize` must be an integer from 1 to 100.
- Provider mutation and sorting are implemented in the API; the UI currently
  exposes provider filtering and pagination.

## API

| Method | Path | Purpose |
|---|---|---|
| GET | `/providers` | Provider names and logos, including Unknown |
| POST | `/providers/add` | Add `{name, transactionSearchQuery, logo?}` |
| DELETE | `/providers/delete/:name` | Delete by URL-encoded name; no body required |
| GET | `/transactions?page=0&pageSize=10` | Paginated transactions and summaries |

The transaction endpoint accepts `provider`, `sortBy` (`date`, `spend`, `name`),
and `order` (`asc`, `desc`). Invalid parameters return HTTP 400.

This is a local exercise application, with no authentication or persistent writes.
It assumes the supplied GBP dataset; multi-currency accounting is outside its scope.
