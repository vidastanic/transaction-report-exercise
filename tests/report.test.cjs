const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { createApp } = require('../src/app');
const { ReportStore } = require('../src/report-store');

const providers = [{ name: 'Example Store', logo: '', transactionSearchQuery: 'EXAMPLE' }];
const transaction = (id, description, value, type = 'DEBIT') => ({
  id, description, amount: { value }, types: { type }, dates: { value: `2025-01-0${id}` },
});
const transactions = [
  transaction('1', 'EXAMPLE purchase', '10.10'),
  transaction('2', 'EXAMPLE refund', '2.10', 'CREDIT'),
  transaction('3', 'NEW MERCHANT purchase', '5.00'),
];

async function withApp(fn) {
  const server = createApp(new ReportStore(providers, transactions)).listen(0, '127.0.0.1');
  await once(server, 'listening');
  const base = `http://127.0.0.1:${server.address().port}`;
  const request = async (path, options = {}) => {
    const response = await fetch(base + path, options);
    return { status: response.status, body: await response.json() };
  };
  try { await fn(request); }
  finally { await new Promise(resolve => server.close(resolve)); }
}

const jsonPost = body => ({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('provider creation rematches original descriptions, deletion needs no body', () => withApp(async request => {
  const name = 'New Merchant & Co';
  assert.equal((await request('/providers/add', jsonPost({ name, transactionSearchQuery: 'NEW MERCHANT' }))).status, 201);
  const result = await request(`/transactions?page=0&pageSize=10&provider=${encodeURIComponent(name)}`);
  assert.equal(result.body.transactions[0].id, '3');
  assert.equal((await request(`/providers/delete/${encodeURIComponent(name)}`, { method: 'DELETE' })).status, 200);
  const after = await request('/transactions?page=0&pageSize=10&provider=Unknown');
  assert.deepEqual(after.body.transactions.map(item => item.id), ['3']);
}));

test('deletion rematches an overlapping provider', () => withApp(async request => {
  await request('/providers/add', jsonPost({ name: 'Fallback', transactionSearchQuery: 'EXAMPLE' }));
  await request('/providers/delete/Example%20Store', { method: 'DELETE' });
  const result = await request('/transactions?page=0&pageSize=10&provider=Fallback');
  assert.equal(result.body.totalTransactionCount, 2);
}));

test('totals include debits and credits across the full filtered set, not just one page', () => withApp(async request => {
  const { body } = await request('/transactions?page=0&pageSize=1&provider=Example%20Store');
  assert.equal(body.transactions.length, 1);
  assert.equal(body.totalSpend, 8);
  assert.equal(body.averageSpend, 4);
  assert.equal(body.totalTransactionCount, 2);
}));

test('empty filters return finite zero summaries', () => withApp(async request => {
  const { body } = await request('/transactions?page=0&pageSize=10&provider=Absent');
  assert.equal(body.totalSpend, 0);
  assert.equal(body.averageSpend, 0);
  assert.equal(body.totalTransactionCount, 0);
  assert.deepEqual(body.transactions, []);
}));

test('sort happens before pagination and out-of-range pages retain totals', () => withApp(async request => {
  const result = await request('/transactions?page=1&pageSize=1&sortBy=spend&order=desc');
  assert.equal(result.body.transactions[0].id, '3');
  const empty = await request('/transactions?page=100&pageSize=10');
  assert.deepEqual(empty.body.transactions, []);
  assert.equal(empty.body.totalSpend, 13);
}));

test('invalid pagination and sort parameters return 400', () => withApp(async request => {
  for (const query of ['', 'page=-1&pageSize=10', 'page=1.5&pageSize=10', 'page=2x&pageSize=10',
    'page=0&pageSize=0', 'page=0&pageSize=101', 'page=0&pageSize=10&sortBy=bad',
    'page=0&pageSize=10&order=bad', 'page=0&pageSize=10&provider=x&provider=y']) {
    assert.equal((await request('/transactions?' + query)).status, 400, query);
  }
}));

test('invalid, duplicate and reserved providers are rejected', () => withApp(async request => {
  for (const body of [{}, { name: 'Unknown', transactionSearchQuery: 'x' },
    { name: 'Example Store', transactionSearchQuery: 'x' }, { name: 'New', transactionSearchQuery: '' }]) {
    assert.equal((await request('/providers/add', jsonPost(body))).status, 400);
  }
  assert.equal((await request('/providers/delete/Absent', { method: 'DELETE' })).status, 404);
}));
