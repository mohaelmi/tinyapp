const express = require("express");
const uid = require("uid");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 3000; // port number

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  dt1tg: { id: 'dt1tg', email: 'moha@12', password: '1' }
}

const generateRandomString = () => {
  let shortUrl = '';
  let str = 'gsD5d37g1t';
  for (let i = 6; i > 0; i--) {
    shortUrl  += str[Math.floor(Math.random() * str.length)];
  }
  return shortUrl;
};

app.get('/', (req, res) => {
  res.redirect('/urls')
})

const getUserByEmail = (email) => {
  let user;
  for (const userId in users) {
    if(users[userId].email === email){
      user = users[userId]
    }
  }

  if(user) {
    return user
  }

  return null
}

//route for showing urls_index page
app.get("/urls", (req, res) => {
  // console.log();
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.user_id],
  };
  res.render('urls_index', templateVars);
});

//route for handling for rendering urls_new page
app.get("/urls/new", (req, res) => {
  const templateVars = {   user: users[req.cookies.user_id] };
  res.render('urls_new', templateVars);
});

//route for handling new URL
app.post("/urls/new", (req, res) => {
  const shortUrl = generateRandomString();
  urlDatabase[shortUrl] = req.body.longURL;
  res.redirect('/urls');
});

//handling request the edit page (url_show)
app.get("/urls/:id", (req, res) => {
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});

//route for redirecting shortURL to its own website/realURL
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id]) res.send('404 Page Not Found');

  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
    
});

//route updates url
app.post('/urls/:id', (req, res) => {
  const updatedURL = req.body.url;
  const id = req.params.id;
  urlDatabase[id] = updatedURL;
  
  res.redirect('/urls');
});

//rout handling for deleting an specific url
app.post('/urls/:id/delete', (req, res) => {
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});



//clear the cookie and redirect when request post at /logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});


app.get('/register', (req, res) => {
  res.render('registration')
})

app.get('/login', (req, res) => {
  res.render('login')
})


//login
app.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  const user = getUserByEmail(email)

   if(!user) {
    res.status(403).send('user does not exist or incorrect email')
    return;
  }

  if(user.password !== password) {
    res.status(403).send('Incorrect password')
    return;
  }

  res.cookie('user_id', user.id);
  res.redirect('/urls');
});

app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password
  const userExists = getUserByEmail(email)
  if(!email || !password) {
    res.status(400).send('please provide full information!')
    return;
  }
  
  if (userExists) {
    res.status(400).send('email already exists')
    return;
  }
   
  const user = { 
    id: generateRandomString(),
    email,
    password 
  }
    users[user.id] = user
    res.cookie('user_id', user.id);
    res.redirect('/urls')
  
})



//server listening at specific port
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

