import "dotenv/config";
import connectDB from "./config/db.js";
import app from "./app.js";
try {
  await connectDB();
  app.listen(process.env.PORT || 5000, process.env.HOST || "0.0.0.0", () =>
    console.log("EHMS API ready"),
  );
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
