export interface Transaction {
    id: string,
    date: string,
    spend: number,
    providerName: string,
    providerLogo: string
}

export interface TransactionsResponse {
    success: boolean,
    transactions: Transaction[],
    totalSpend: number,
    averageSpend: number,
    totalTransactionCount: number
}