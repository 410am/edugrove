const express = require("express");
const app = express();
const port = 5173; // 또는 다른 포트

app.get("/", (req, res) => {
  res.send("Hello from Express!");
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
