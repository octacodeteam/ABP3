import express from "express";
import cors from "cors";
import morgan from "morgan";
import apiRoutes from "./routes/api";

const app = express();

// Middlewares seguros para dev/prod
app.use(cors());
app.use(express.json());
app.use(morgan("tiny"));

// Health-check simples
app.get("/health", (_req, res) => res.json({ ok: true }));

// Rotas da API
app.use("/api", apiRoutes);

// Porta
const PORT = process.env.PORT ? Number(process.env.PORT) : 3000;
app.listen(PORT, () => {
  console.log(`[server] API ouvindo em http://localhost:${PORT}`);
});
