const express = require("express");
const app = express();
const PORT = 3000; // port number

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  console.log(req.url)
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  
  res.send(JSON.parse(urlDatabase));
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});