import { Router } from 'express';
import { ReportStore, summarize } from '../report-store';

function integer(value: unknown): number | null {
  if (typeof value !== 'string' || !/^\d+$/.test(value)) return null;
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) ? parsed : null;
}

export function createTransactionRouter(store: ReportStore) {
  const router = Router();
  router.get('/', (req, res) => {
    const { provider, sortBy, order } = req.query;
    const page = integer(req.query.page);
    const pageSize = integer(req.query.pageSize);
    if (page === null || pageSize === null || pageSize < 1 || pageSize > 100 ||
        !Number.isSafeInteger(page * pageSize) ||
        (provider !== undefined && typeof provider !== 'string') ||
        (sortBy !== undefined && !['date', 'spend', 'name'].includes(String(sortBy))) ||
        (sortBy !== undefined && typeof sortBy !== 'string') ||
        (order !== undefined && (typeof order !== 'string' || !['asc', 'desc'].includes(order)))) {
      res.status(400).json({ success: false, message: 'Use a non-negative page, pageSize 1-100, and valid filter/sort parameters.' });
      return;
    }
    let transactions = store.getTransactions();
    if (provider) transactions = transactions.filter(item => item.providerName === provider);
    if (sortBy) {
      transactions.sort((a, b) => {
        if (sortBy === 'date') return new Date(a.date).getTime() - new Date(b.date).getTime();
        if (sortBy === 'spend') return a.spend - b.spend;
        return a.providerName.localeCompare(b.providerName);
      });
      if (order === 'desc') transactions.reverse();
    }
    res.json({
      success: true,
      ...summarize(transactions),
      transactions: transactions.slice(page * pageSize, (page + 1) * pageSize),
    });
  });
  return router;
}
