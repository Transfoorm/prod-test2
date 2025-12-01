/**──────────────────────────────────────────────────────────────────────┐
│  🚀 TRUE WARP - Finance Data Preload API                             │
│  /src/app/api/warp/finance/route.ts                                   │
│                                                                        │
│  Server-side endpoint for Finance domain preloading                   │
│  Called by PRISM when user opens Finance dropdown                     │
│                                                                        │
│  Data: accounts, transactions, invoices, customers, etc.              │
│  Access: Captain+ (org-scoped)                                        │
│                                                                        │
│  PLUMBING: Add Convex queries here when Finance has real data.        │
└────────────────────────────────────────────────────────────────────────┘ */

import { auth } from '@clerk/nextjs/server';

export async function GET() {
  const { userId } = await auth();

  if (!userId) {
    return new Response('Unauthorized', { status: 401 });
  }

  try {
    // 🔮 FUTURE: Add Convex queries when Finance domain has data
    // const { getToken } = await auth();
    // const token = await getToken({ template: 'convex' });
    // const [accounts, transactions, invoices, customers] = await Promise.all([
    //   fetchQuery(api.domains.finance.api.getAccounts, {}, { token }),
    //   fetchQuery(api.domains.finance.api.getTransactions, {}, { token }),
    //   fetchQuery(api.domains.finance.api.getInvoices, {}, { token }),
    //   fetchQuery(api.domains.finance.api.getCustomers, {}, { token }),
    // ]);

    console.log('🚀 WARP API: Finance data ready (plumbing)');

    return Response.json({
      businessProfile: null,
      categories: [],
      accounts: [],
      transactions: [],
      patterns: [],
      customers: [],
      quotes: [],
      invoices: [],
      suppliers: [],
      purchases: [],
      bills: [],
      chartOfAccounts: [],
      fixedAssets: [],
      employees: [],
      payrollRuns: []
    });
  } catch (error) {
    console.error('❌ WARP API: Failed to fetch finance data:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
