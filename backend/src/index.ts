import "dotenv/config";
import app from "./app.js";

const PORT = process.env.PORT || 3001;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Menu API: http://localhost:${PORT}/api/menu`);
  console.log(`Orders API: http://localhost:${PORT}/api/orders`);
});

export default app;
