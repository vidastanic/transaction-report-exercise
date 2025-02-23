import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    TablePagination
} from "@mui/material";
import React from "react";
import {Transaction} from "../types/transactionTypes.ts";

interface TransactionsTableProps {
    transactions: Transaction[],
    page: number,
    pageSize: number,
    totalTransactionCount: number,
    setPage: React.Dispatch<React.SetStateAction<number>>,
    setPageSize: React.Dispatch<React.SetStateAction<number>>,
}

export default function TransactionsTable({transactions, page, pageSize, totalTransactionCount, setPage, setPageSize}: TransactionsTableProps) {

    return (
        <>
        <TableContainer component={Paper} sx={{height: "60vh"}}>
            <Table stickyHeader sx={{ minWidth: "500px", tableLayout: "fixed" }}>
                <TableHead>
                    <TableRow>
                        <TableCell>Date</TableCell>
                        <TableCell>Spend Amount</TableCell>
                        <TableCell>Provider</TableCell>
                        <TableCell></TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {transactions.map((transaction) => (
                        <TableRow
                            key={transaction.id}
                            sx={{height: "110px"}}
                        >
                            <TableCell>{transaction.date}</TableCell>
                            <TableCell>{new Intl.NumberFormat("en-GB", { style: "currency", currency: "GBP" }).format(transaction.spend)}</TableCell>
                            <TableCell>{transaction.providerName}</TableCell>
                            <TableCell>
                                {transaction.providerLogo && (
                                    <img
                                        src={transaction.providerLogo}
                                        style={{height: "80px"}}
                                    />
                                )}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>

        </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 25, 100]}
                component="div"
                count={totalTransactionCount}
                rowsPerPage={pageSize}
                page={page}
                onPageChange={(_e, page) => setPage(page)}
                onRowsPerPageChange={(e) => {
                    setPageSize(parseInt(e.target.value));
                    setPage(0);
                }}
            />
        </>
    );
}
