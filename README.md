# Nous transaction report exercise

### How to run the App (same as before)

- Install NodeJS
- Enable Corepack to add [`yarn`](https://yarnpkg.com/getting-started/install) to your path `$ corepack enable`
- Install server dependencies `$ yarn`
- Install client dependences `$ cd web && yarn`
- Run the app from the root of this repository with `$ yarn dev`. The server will reload when any files in [src/](src/) are changed.

## Approach

My solution is based off of the original [repository](https://github.com/project-nous/transaction-report-exercise)) provided. However, in addition to React and Express, I am also using the [MUI](https://mui.com/material-ui/getting-started/) component library as part of my stack to create the frontend.

The solution allows the user to view a table containing all their transactions (paginated such that either 10, 25 or 100 rows are fetched and displayed at a time), displaying the date, provider name, logo and spend amount per transaction. This table can then be filtered by provider using a dropdown, where by default the transactions for all providers are shown, but a specific provider can be chosen for filtration. At the top a summary card is also displayed, showing the total and average spend on transactions made with the selected provider (or all providers by default). This total and average is calculated taking into account the **DEBIT/CREDIT type in `transactions.json`**; that is, a transaction of type DEBIT is treated as a positive value (an outgoing expenditure) and a transaction of type CREDIT is treated as a negative value (an incoming amount, hence negative spend), with the sum hence being the net spend (net outgoing expenditure) and the average being the average outgoing expenditure. From the Notion page I initially thought all the transactions were outgoing since it asks to summarise specifically spend, but after reviewing the JSON file I assume this is the correct interpretation. Note also that these total and average summaries are for _all_ transactions made specifically with the selected provider (or all providers by default), not just the current page on the table.

In this implementation, I have also opted to show transactions that do not match with any of the providers in `providers.json` as having an `Unknown` provider; the provider dropdown also allows the user to choose `Unknown` as an option in order to view these unmatched transactions. In the backend API, I have further provided routes to allow the user to both add and delete providers; in this solution this has not been implemented in the client yet, but this API should allow a client to do so and then subsequently fetch transactions/providers that reflect this update. Finally, I have also provided a route in the API to sort the list of transactions get returned by date, spend or provider name (in alphabetical order) by providing appropriate query parameters in the URL.

## Implementation

### Backend

For the Express backend implementation, I have used a fairly straightforward structure of maintaining several routes in `transactions.ts` and `providers.ts` for the various operations required by the client, where the logic for each route is just placed in the route itself since the project is relatively small, and I have made use of a simple error handling middleware to catch any unexpected exceptions.

In `providers.ts`, I first load the providers and transactions from the respective JSON files, and then export an object array `transactionsWithProviders`, which contains the transactions dataset joined to the providers dataset with a join key of `transactionSearchQuery` being a substring of the `description` in the transaction object. For any transactions that do not match any provider, it is given a provider name of `Unknown` instead. This joined dataset forms the basis for the data that gets returned by the transactions route. I then provide several routes for the various provider related operations.

The first route, `/providers`, accepts a GET request and simply returns all the providers from the reference variable `providers`, along with the `Unknown` provider so that it can be displayed in the dropdown. Since in this project the endpoints are only being used by the frontend client, I do not include the `transactionSearchQuery` field in the results since the client does not need it, but of course dependent on the usage of the API it could also make sense to return this field as well anyway.

The second route, `/providers/add`, accepts a POST request with a JSON provider object, and adds this provider to the `providers` array as long as its (unique) name is not already present. Note that this is just held in the server memory in this implementation, but in a production implementation this should be persisted (in a database ideally but technically writing to the JSON file would work in a 1 user and 1 server situation). It then calls a function `refreshTransactionsWithProviders` to mutably update `transactionsWithProviders` so that the transactions routes are able incorporate this new provider.

The third route `/providers/delete` accepts a DELETE request with a URl parameter of the provider name, and removes this provider from `providers` (as long as it exists) as well as calls `refreshTransactionsWithProviders` to mutably remove the provider from any of the transactions.

In `transactions.ts`, I provide a single route `/transactions` for the primary transactions operation. Note that the file uses the `transactionsWithProviders` object created in `providers.ts`.

This route accepts a GET request with the URL query parameters `provider`, `sortBy`, `order`, `page` (required) and `pageSize` (required). `provider` is used to filter the transactions according to the selected provider (all transactions if it is left undefined by default), and `sortBy` and `order` are used to sort these filtered transactions. Then, the route calculates the total and average spend of all the transactions filtered by provider (or all if unspecified). Finally, `page` and `pageSize` are used for the pagination step I have chosen to implement as part of this solution. Since the total number of transactions is quite large (1504), rather than sending all these transactions all at once to the frontend and letting the client handle/render all this data, I instead send out a slice of the data determined by the specified `page` number and `pageSize`. In the current implementation, the client UI gives the user the option to choose between 10, 25 or 100. 
The route then returns the specified page of the filtered/sorted transactions, along with the total and average spend, and total number of transactions in this filtered dataset.

### Frontend

For the frontend client implementation, I am also using a fairly straightforward structure of `App.tsx` representing the main (and only) page, which then houses the controller component `TransactionsController`. This component then contains the various API operations, and houses the presentational components `ProviderDropdown` and `TransactionsTable`. `ProviderDropdown` renders a dropdown that allows the user to filter by provider, and `TransactionsTable` renders the main table that allows the user to see all their filtered transactions, and step through the various pages.

In `TransactionsController`, there are 2 API functions, `fetchTransactionsLabelledWithProviders` and `fetchProviders`. The first function calls the `/transactions` endpoint to obtain all the provider-filtered transactions that are paginated to the currrent stateful page variable, and updates the corresponding associated state variables. The second function fetches all the current providers from the `/providers` endpoint, to be used by the dropdown. A simple toast is used in the event of an error.

The `useEffect` hook is then used in 2 instances to make these calls on the initial render, and then on subsequent rerenders, fetch the transactions only if the page, pageSize or selected provider changes, and then fetch the providers _only_ if the selected provider changes, since a page update does not require an unnecessary provider API call.

The child component `TransactionsTable` then accepts the fetched transactions as a prop, along with the current page, pageSize, total number of filtered transactions (for displaying in the table how many pages of filtered data there are), and then the state setter functions `setPage` and `setPageSize`. It then renders a `TableContainer` component from the MUI library to display a single page of transactions data at a time. Upon the user navigating to the next page, the `setPage` state setter triggers a rerender and thus a fetch of the next page of data to be displayed. Similarly, changing the page size, ie the number of records shown on each page in the table, calls `setPageSize` to trigger a rerender and fetch, from page 0, the filtered transactions of the appropriate size.

The final child component `ProviderDropdown` utilises the `Select` component from the MUI library to display the list of providers for the user to select from. The provider data is passed by a `providers` prop, along with the `selectedProvider` and `setSelectedProvider` state setter function. A `defaultValue` prop is also passed for the unmatched provider name (in this case `TransactionsController` sets this as `Unknown`, and the `setPage` state setter function is also passed to reset the page to 0 when the selected provider is changed. `selectedProvider` is used as the value for the dropdown, which gets changed via `setSelectedProvider` when the user interacts with it. The component is also **memoized** to only rerender when its props change, since the user tabbing through the different pages of the table should not trigger an unnecessary rerender.

## Future Improvements

Given more time, I would also like to:

- Implement requirements 3, 4, and the optional requirement in the client UI as well. Potentially this could be done by having an Add Provider button to navigate the user to an extra form to input a new provider, and also by providing delete buttons next to each provider in the dropdown to remove them. An additional dropdown could also be used to apply sorting to the fetched transactions.
- Enable the backend to persist changes to provider data, ideally by moving the provider and transaction data into a separate database so that it can work in a distributed environment and actually be stateless.
- I realised after completing the implementation that the `status` field in `transactions.json` can be either BOOKED or PENDING; a better implementation could involve separating out these two types of transactions for the UI client, for example if they wish to understand which transactions have not been fully processed yet.
- I think it could be useful to provide further analysis of the transaction data to the user; for example, which providers the users spend on the most/least, and the ability to filter transactions by date range.
- Add proper testing to the implementation.
- Some more experimentation/analysis of the UX flow of the implementation could be made; for example, using accordions to separate providers rather than a dropdown.
