import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import customerRoutes from "./routes/customerRoutes.js";
import menuRoutes from "./routes/menuRoutes.js";
import organizationRoutes from "./routes/organizationRoutes.js";
import superAdminRoutes from "./routes/superAdminRoutes.js"; // *** ШИНЭ ***
import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

dotenv.config();
const app = express();

app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", customerRoutes);
app.use("/api", menuRoutes);
app.use("/api", organizationRoutes);
app.use("/api", superAdminRoutes); // *** ШИНЭ ***

app.get("/health", (req, res) => {
  res.json({ status: "OK", timestamp: new Date() });
});

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: "Серверт алдаа гарлаа",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

// DB
mongoose
  .connect(process.env.MONGO_URL)
  .then(() => console.log("✅ MongoDB холбогдлоо"))
  .catch((err) => console.log("❌ MongoDB алдаа:", err));

// Server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`✅ Server: http://localhost:${PORT}`);
});
