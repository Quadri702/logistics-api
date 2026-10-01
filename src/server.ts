import "dotenv/config";
import app from "./app.js";
import connectDatabase from "./config/database.js";

const PORT = 5000;

await connectDatabase();

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
