import { Router } from 'express';
import { ReportStore, unknownProviderName } from '../report-store';

export function createProviderRouter(store: ReportStore) {
  const router = Router();

  router.get('/', (_req, res) => {
    res.json([
      ...store.providers.map(({ name, logo }) => ({ name, logo })),
      { name: unknownProviderName, logo: '' },
    ]);
  });

  router.post('/add', (req, res) => {
    const { name, logo = '', transactionSearchQuery } = req.body ?? {};
    if (typeof name !== 'string' || !name.trim() || name.trim() === unknownProviderName ||
        typeof transactionSearchQuery !== 'string' || !transactionSearchQuery.trim() ||
        typeof logo !== 'string') {
      res.status(400).json({ success: false, message: 'A name and non-empty search query are required; Unknown is reserved.' });
      return;
    }
    if (store.providers.some(provider => provider.name === name.trim())) {
      res.status(400).json({ success: false, message: 'Provider name already exists' });
      return;
    }
    const provider = { name: name.trim(), logo, transactionSearchQuery: transactionSearchQuery.trim() };
    store.providers.push(provider);
    res.status(201).json({ success: true, message: 'Provider added successfully', provider });
  });

  router.delete('/delete/:name', (req, res) => {
    const index = store.providers.findIndex(provider => provider.name === req.params.name);
    if (index === -1) {
      res.status(404).json({ success: false, message: 'Provider not found' });
      return;
    }
    const [provider] = store.providers.splice(index, 1);
    res.json({ success: true, message: 'Provider deleted successfully', provider });
  });
  return router;
}
