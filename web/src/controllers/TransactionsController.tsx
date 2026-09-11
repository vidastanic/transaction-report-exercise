import {useEffect, useState} from "react";
import {Transaction, TransactionsResponse} from "../types/transactionTypes.ts";
import {ProvidersResponse} from "../types/providerTypes.ts";
import {Paper, Stack, Typography} from "@mui/material";
import TransactionsTable from "../components/TransactionsTable.tsx";
import ProviderDropdown from "../components/ProviderDropdown.tsx";
import {toast, ToastContainer} from "react-toastify";

export default function TransactionsController() {
    const defaultProviderDropdownValue = "Default (All Providers)";
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [page, setPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [totalTransactionCount, setTotalTransactionCount] = useState(0);
    const [totalSpend, setTotalSpend] = useState<number | null>(null);
    const [averageSpend, setAverageSpend] = useState<number | null>(null);
    const [selectedProvider, setSelectedProvider] = useState<string>(defaultProviderDropdownValue);
    const [providers, setProviders] = useState<ProvidersResponse[]>([]);

    const fetchTransactionsLabelledWithProviders = async () => {
        try {
            const provider = selectedProvider !== defaultProviderDropdownValue ?  `&provider=${encodeURIComponent(selectedProvider)}` : "";
            const response = await fetch(`http://localhost:3001/transactions?page=${page}&pageSize=${pageSize}` + provider);
            if (!response.ok) throw new Error("Could not load transactions");
            const responseObject = await response.json() as TransactionsResponse;
            setTransactions(responseObject.transactions);
            setTotalSpend(responseObject.totalSpend);
            setAverageSpend(responseObject.averageSpend);
            setTotalTransactionCount(responseObject.totalTransactionCount);
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    const fetchProviders = async () => {
        try {
            const response = await fetch(`http://localhost:3001/providers`);
            if (!response.ok) throw new Error("Could not load providers");
            const providersResponse = await response.json() as ProvidersResponse[];
            setProviders(providersResponse);
        } catch (error) {
            toast.error((error as Error).message);
        }
    }

    useEffect(() => {
        fetchTransactionsLabelledWithProviders();
    }, [page, pageSize, selectedProvider]);

    useEffect(() => {
        fetchProviders();
    }, [selectedProvider]);

    return (
        <>
            <ToastContainer />
            <Stack direction="row" spacing={2} alignItems="center">
                <ProviderDropdown providers={providers} selectedProvider={selectedProvider} setSelectedProvider={setSelectedProvider} setPage={setPage} defaultValue={defaultProviderDropdownValue} />
                <Paper elevation={3} square={false} sx={{padding: "8px"}}>
                    <Typography variant="h6" color="primary" sx={{display: "block"}}>Expenditure Summary</Typography>
                    <Typography variant="button" sx={{display: "block"}}>Total Net Spend: {totalSpend !== null ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(totalSpend) : ""}</Typography>
                    <Typography variant="button">Average Net Spend: {averageSpend !== null ? new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(averageSpend) : ""}</Typography>
                </Paper>
            </Stack>
            <TransactionsTable transactions={transactions} page={page} pageSize={pageSize} totalTransactionCount={totalTransactionCount} setPage={setPage} setPageSize={setPageSize} />
        </>
    );
}