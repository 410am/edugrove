const express = require("express");
const cors = require("cors");

const app = express();
const port = 3001; // 또는 다른 포트

// 모든 origin에 대해 CORS 허용
app.use(cors());
app.use(express.json());

//test
app.post("/api/test", (req, res) => {
  try {
    const message = req.body.message;
    console.log("Message from frontend:", message);
    res.json({ response: "Hello from backend" });
  } catch (error) {
    console.error("An error occurred:", error);
    res.status(500).send("Internal Server Error");
  }
});
//test

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
