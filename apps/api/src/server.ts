import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { pool } from "./config/database.js";
import tasksRouter from "./routes/tasks.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());
app.use(express.json());
app.use("/tasks", tasksRouter);

app.get("/", (_req, res) => {
  res.json({
    message: "ИКАР API работает!",
  });
});

app.get("/health", async (_req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");

    res.json({
      status: "OK",
      database: "Connected",
      time: result.rows[0].now,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      status: "Error",
      database: "Disconnected",
    });
  }
});

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, () => {
  console.log(`ИКАР API запущен: http://localhost:${PORT}`);
});
