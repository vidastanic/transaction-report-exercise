import {Container, Typography} from "@mui/material";
import TransactionsController from "./controllers/TransactionsController.tsx";

export default function App() {
  return (
    <Container sx={{
      display: "flex",
      flexDirection: "column",
      // justifyContent: "center",
      alignItems: "center",
      minHeight: "100vh",
      gap: "20px",
      padding: "50px",
    }}>
      <Typography variant="h4">Transactions Report</Typography>
      <TransactionsController />
    </Container>
  );
}
