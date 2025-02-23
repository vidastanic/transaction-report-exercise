import { Router, Request, Response } from "express";
import providers from "../../data/providers.json";
import transactions from "../../data/transactions.json";

const router = Router();

const unknownProviderName = "Unknown";
const unknownProviderLogo = "";

export const transactionsWithProviders = transactions.map((transaction) => {
    let providerName = unknownProviderName;
    let providerLogo = unknownProviderLogo;

    for (const provider of providers) {
        if (transaction.description.includes(provider.transactionSearchQuery)) {
            providerName = provider.name;
            providerLogo = provider.logo;
            break;
        }
    }

    return {
        id: transaction.id,
        date: transaction.dates.value,
        spend: Number(transaction.amount.value),
        providerName: providerName,
        providerLogo: providerLogo
    }
});

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
        res.status(400).json({
            success: false,
            message: "Provider name already exists"
        })
    }

    const newProvider = {
        logo: req.body.logo ?? "",
        ...req.body,
    }
    providers.push(newProvider);

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

    res.status(200).json({
        success: true,
        message: "Provider deleted successfully",
        provider: deletedProvider,
    });
});

export default router;
export { providers };


