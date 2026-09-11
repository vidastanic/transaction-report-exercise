export interface Provider {
  name: string;
  logo: string;
  transactionSearchQuery: string;
}

export interface TransactionInput {
  id: string;
  description: string;
  dates: { value: string };
  types: { type: string };
  amount: { value: string | number };
}

export const unknownProviderName = 'Unknown';

/** Rebuild the join from the original descriptions after every provider change. */
export class ReportStore {
  readonly providers: Provider[];

  constructor(providers: Provider[], private readonly transactions: TransactionInput[]) {
    this.providers = providers.map(provider => ({ ...provider }));
  }

  getTransactions() {
    return this.transactions.map(transaction => {
      const provider = this.providers.find(item =>
        transaction.description.includes(item.transactionSearchQuery));
      return {
        id: transaction.id,
        date: transaction.dates.value,
        spend: (transaction.types.type === 'DEBIT' ? 1 : -1) * Number(transaction.amount.value),
        providerName: provider?.name ?? unknownProviderName,
        providerLogo: provider?.logo ?? '',
      };
    });
  }
}

export function summarize(transactions: { spend: number }[]) {
  const totalPence = transactions.reduce((sum, item) => sum + Math.round(item.spend * 100), 0);
  return {
    totalSpend: totalPence / 100,
    averageSpend: transactions.length ? Math.round(totalPence / transactions.length) / 100 : 0,
    totalTransactionCount: transactions.length,
  };
}
