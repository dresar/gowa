import app from "./app";
import { env } from "./config/env";

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("[Fatal] Unhandled Rejection at:", promise, "reason:", reason);
  // Optional: Send to monitoring service
});

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("[Fatal] Uncaught Exception:", error);
  // Optional: Graceful shutdown or send to monitoring
  // process.exit(1); 
});

app.listen(env.PORT, env.HOST, () => {
  process.stdout.write(`Server listening on http://${env.HOST}:${env.PORT}/api\n`);
});
