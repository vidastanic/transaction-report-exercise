import { Router, Request, Response } from "express";
import providers from "../../data/providers.json";
import transactions from "../../data/transactions.json";

const router = Router();

const unknownProviderName = "Unknown";
const unknownProviderLogo = "";

export const transactionsWithProviders = transactions.map((transaction) => {
    let providerName = unknownProviderName;
    let providerLogo = unknownProviderLogo;
    let providerTransactionSearchQuery = "";

    for (const provider of providers) {
        if (transaction.description.includes(provider.transactionSearchQuery)) {
            providerName = provider.name;
            providerLogo = provider.logo;
            providerTransactionSearchQuery = provider.transactionSearchQuery;
            break;
        }
    }

    return {
        id: transaction.id,
        date: transaction.dates.value,
        spend: transaction.types.type === "DEBIT" ? Number(transaction.amount.value): -Number(transaction.amount.value),
        providerName: providerName,
        providerLogo: providerLogo,
        providerTransactionSearchQuery: providerTransactionSearchQuery
    }
});

const refreshTransactionsWithProviders = (providerName: string, isBeingAdded: boolean, providerTransactionSearchQuery: string, providerLogo?: string) => {
    if (isBeingAdded) {
        transactionsWithProviders.forEach((transaction) => {
            if (transaction.providerName === unknownProviderName && transaction.providerTransactionSearchQuery.includes(providerName)) {
                transaction.providerName = providerName;
                transaction.providerLogo = providerLogo ?? "";
                transaction.providerTransactionSearchQuery = providerTransactionSearchQuery;
            }
        });
    } else {
        transactionsWithProviders.forEach((transaction) => {
            if (transaction.providerTransactionSearchQuery.includes(providerName)) {
                transaction.providerName = unknownProviderName;
                transaction.providerLogo = unknownProviderLogo;
                transaction.providerTransactionSearchQuery = "";
            }
        })
    }
}

router.get("/", (_req: Request, res: Response) => {
    const providersWithoutSearchQuery = providers.map((provider) => {
        return {
            name: provider.name,
            logo: provider.logo
        }
    });

    providersWithoutSearchQuery.push({name: unknownProviderName, logo: unknownProviderLogo});
    res.json(providersWithoutSearchQuery);
});

router.post("/add", (req: Request<{}, {}, {name: string, logo?: string, transactionSearchQuery: string}>, res: Response) => {
    if (providers.some((provider) => provider.name === req.body.name)) {
        return res.status(400).json({
            success: false,
            message: "Provider name already exists"
        })
    }

    const newProvider = {
        logo: req.body.logo ?? "",
        ...req.body,
    }
    providers.push(newProvider);

    refreshTransactionsWithProviders(req.body.name, true, req.body.transactionSearchQuery, req.body.logo)

    res.status(201).json({
        success: true,
        message: "Provider added successfully",
        provider: newProvider
    });
});

router.delete("/delete/:name", (req: Request, res: Response) => {
    const { name } = req.params;

    const index = providers.findIndex((provider) => provider.name === name);

    if (index === -1) {
        return res.status(404).json({
            success: false,
            message: "Provider not found",
        });
    }

    const deletedProvider = providers.splice(index, 1)[0];

    refreshTransactionsWithProviders(req.body.name, false, req.body.transactionSearchQuery, req.body.logo)

    res.status(200).json({
        success: true,
        message: "Provider deleted successfully",
        provider: deletedProvider,
    });
});

export default router;
export { providers };


