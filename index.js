const express = require("express");
const app = express();
const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Działa na Azure!");
});

app.listen(port, () => {
  console.log(`Serwer działa na porcie ${port}`);
});
