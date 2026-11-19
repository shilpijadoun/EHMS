import "dotenv/config";
import connectDB from "./config/db.js";
import app from "./app.js";
try {
  await connectDB();
  app.listen(process.env.PORT || 5000, "127.0.0.1", () =>
    console.log("EHMS API ready"),
  );
} catch (error) {
  console.error(error.message);
  process.exit(1);
}
