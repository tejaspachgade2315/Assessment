import cookieParser from "cookie-parser";
import cors from "cors";
import express, { Application, Request, Response } from "express";
import connect from "./config/db";

const app: Application = express();

// Import routes
import homeRoutes from "./routes/homeRoutes";
import sessionRoutes from "./routes/sessionRoutes";
import userRoutes from "./routes/userRoutes";

// Middlewares
app.use(cors({ origin: "*", credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Connect to database
connect();

// Setup Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Welcome to the Assessment API");
});

// Start Server
app.use("/api", homeRoutes);
app.use("/api/user", userRoutes);
app.use("/api/session", sessionRoutes);

export default app;
