import { Router, Request, Response } from "express";
import { transactionsWithProviders } from "./providers";

const router = Router();

router.get("/", (req: Request<{}, {}, {}, {provider?: string, sortBy?: string, order?: string, page: string, pageSize: string}>, res: Response) => {
    const { provider, sortBy, order, page, pageSize } = req.query;
    const pageNum = parseInt(page);
    const pageSizeNum = parseInt(pageSize);

    let filteredTransactions = [...transactionsWithProviders];

    if (provider) {
        filteredTransactions = filteredTransactions.filter((transaction) => transaction.providerName === provider)
    }

    if (sortBy) {
        filteredTransactions.sort((a, b) => {
            if (sortBy === "date") {
                return new Date(a.date).getTime() - new Date(b.date).getTime();
            } else if (sortBy === "spend") {
                return a.spend - b.spend;
            } else if (sortBy === "name") {
                return a.providerName.localeCompare(b.providerName);
            }
            return 0;
        });

        if (order === "desc") {
            filteredTransactions.reverse();
        }
    }

    const totalTransactionCount = filteredTransactions.length;

    const totalSpend = Math.round(filteredTransactions.reduce((total, transaction) => total + transaction.spend, 0) * 100) / 100;

    const averageSpend = Math.round((totalSpend / totalTransactionCount) * 100) / 100;

    filteredTransactions = filteredTransactions.slice(pageSizeNum * pageNum, pageSizeNum * (pageNum + 1));

    res.status(200).json({
        success: true,
        transactions: filteredTransactions,
        totalSpend,
        averageSpend,
        totalTransactionCount
    });
});

export default router;
