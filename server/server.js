import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

app.use(cors({ origin: FRONTEND_URL }));
app.use(express.json());

const supabase =
  process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY
    ? createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)
    : null;

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

app.get("/", (_req, res) => {
  res.send("API running");
});

app.get("/healthz", (_req, res) => {
  res.json({ ok: true, service: "tree-tekfl-api" });
});

app.get("/api/test", (_req, res) => {
  res.json({ ok: true, message: "Backend connected" });
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

void supabase;
void stripe;
