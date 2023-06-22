const express = require("express");
const app = express();
const PORT = 3001; // port number

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = (longURL) => {
  let shortUrl = ''
  let str = 'gsD5d37g1t'
  // console.log(longURL.le);
  for (let i = 6; i > 0; i--) {
    shortUrl  += str[Math.floor(Math.random() * str.length)]
  }
  return shortUrl
}

app.get("/", (req, res) => {
  console.log(req.url)
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase}
  res.render('urls_index', templateVars)
});

app.get("/urls/new", (req, res) => {
  res.render('urls_new');
});

app.post("/urls", (req, res) => {
  const shortUrl = generateRandomString(req.body.longURL)
  urlDatabase[shortUrl] = req.body.longURL
  res.redirect('/urls')
  //res.redirect(`/urls/${shortUrl}`)
});

app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  for (const id in urlDatabase) {
    console.log(id, req.params.id);
    if(id === req.params.id) {
      const longURL = urlDatabase[req.params.id]
      res.redirect(longURL);
      return;
    }
  }

  res.send('404 Page Not Found')
  
});

//route updates url
app.post('/urls/:id', (req, res) => {
  const updatedURL = req.body.url
  const id = req.params.id 
  urlDatabase[id] = updatedURL
  
  res.redirect('/urls')
})

//rout handling for deleting an specific url
app.post('/urls/:id/delete', (req, res) => {
  for (const id in urlDatabase) {
    if(id === req.params.id) {
      delete urlDatabase[id]
    }
  }

  res.redirect('/urls')
})


app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

