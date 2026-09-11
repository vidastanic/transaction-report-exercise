import express from 'express';
import cors from 'cors';
import providers from '../data/providers.json';
import transactions from '../data/transactions.json';
import { ReportStore } from './report-store';
import { createProviderRouter } from './routes/providers';
import { createTransactionRouter } from './routes/transactions';
import errorHandler from './middlewares/errorHandlerMiddleware';

export function createApp(store = new ReportStore(providers, transactions)) {
  const app = express();
  app.use(cors());
  app.use(express.json());
  app.use('/transactions', createTransactionRouter(store));
  app.use('/providers', createProviderRouter(store));
  app.use(errorHandler);
  return app;
}
