const express = require("express");
let methodOverride = require('method-override');
const cookieSession = require('cookie-session');
const bcrypt = require("bcryptjs");
const { generateRandomString, urlsForUser, getUserByEmail } = require('./helpers');
const app = express();
const PORT = 3000; // port number
const SALT_ROUNDS = 10;


//set up middle ware
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: false })); // to be able to use req.body
app.use(cookieSession({
  name: 'userSession',
  keys: ['secret-password'],
}));
app.use(methodOverride('_method'));


//databases
const urlDatabase = {
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "d2ateg"
  },
  "9sm5xK": {
    longURL: "http://www.google.com",
    userID: "dt1tg"
  }
};

const users = {
  dt1tg: {
    id: 'dt1tg',
    email: 'moha@12',
    password: '$2a$10$dRqwPuCdJ/haE.TM/6e5..Cyv8tf9U9.L8oGRBKZRQyHcIE6S8Qra' // 1
  },
  d2ateg: {
    id: 'd2ateg',
    email: 'moha@1',
    password: '$2a$10$5iPNqRo6l6cFzpQ3VRt5bePRmwzJCLdEO2K/I9T1RtZA/GnWHgIna' // 2
  }
};


///////////////////////////////
///routes start from here
////////////////////////////////


// GET / to redirect /urls
app.get('/', (req, res) => {
  res.redirect('/urls');
});


//GET /urls route for showing urls_index page
app.get("/urls", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.send("<h4> You haven't sign in yet. please login first!</h4> <br> <a href = '/login'> sign in </a>");
    return;
  }

  const urls =  urlsForUser(user_id, urlDatabase);
 
  
  const templateVars = {
    urls: urls,
    user: users[user_id],
  };
  res.render('urls_index', templateVars);
});

//GET /urls/new route for rendering urls_new page
app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.redirect('/login');
    return;
  }
  const templateVars = {   user: users[user_id] };
  res.render('urls_new', templateVars);
});

//POST /urls/new route for handling new URL and shortenning using form
app.post("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  if (!user_id) {
    res.send("<h4> You haven't sign in yet. please sign in first!</h4> <br> <a href = '/login'> sign in </a>");
    return;
  }
  const id = generateRandomString();
  urlDatabase[id] = {
    longURL: req.body.longURL,
    userID: user_id
  };
  
  res.redirect('/urls');
});


//GET /urls/:id for request the edit page (url_show)
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;

  if (!user_id) {
    res.send("<h4> You haven't sign in yet. please sign in first!</h4> <br> <a href = '/login'> sign in </a>");
    return;
  }
  if (!urlDatabase[id]) {
    res.send('<h5>URL does not exist!</h5>');
    return;
  }
  const templateVars = {
    id: id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.session.user_id],
  };
  res.render("urls_show", templateVars);
});

//GET /u/:id route for redirecting shortURL to its own website/realURL
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id].longURL) {
    res.send('<h2>The short URL is not exist </h2>');
    return;
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
    
});

//POST /urls/:id route for updating specific url through form
app.put('/urls/:id', (req, res) => {
  const updatedURL = req.body.url;
  const id = req.params.id;
  const user_id = req.session.user_id;
  if (!user_id) {
    res.send('<h5>you cannot update before you sign in!</h5>');
    return;
  }

  if (!urlDatabase[id]) {
    res.send('<h5>URL does not exist!</h5>');
    return;
  }
  if (urlDatabase[id].userID === user_id) {
    urlDatabase[id].longURL = updatedURL;
    res.redirect('/urls');
    return;
  }


  res.send('<h5>it is not your own URL!</h5>');
  
});

//POST /urls/:id/delete rout for deleting an specific url through forms
app.delete('/urls/:id', (req, res) => {
  const id = req.params.id;
  const user_id = req.session.user_id;

  if (!user_id) {
    res.send('<h5>you cannot update before you sign in!</h5>');
    return;
  }

  if (!urlDatabase[id]) {
    res.send('<h5>URL does not exist!</h5>');
    return;
  }

  if (urlDatabase[id].userID === user_id) {
    delete urlDatabase[id];
    res.redirect('/urls');
    return;
  }

  res.send('<h5>seems you don\'t own that URL!</h5>');

});



//POST /logout to clear the cookie and redirect
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/login');
});


//GET /register to render registration form
app.get('/register', (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect('/urls');
    return;
  }

  res.render('registration');
});

// GET login to render login form
app.get('/login', (req, res) => {
  const user_id = req.session.user_id;
  if (user_id) {
    res.redirect('/urls');
    return;
  }
  res.render('login');
});


//POST /login to send login info to the database
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  if (!user) {
    res.status(403).send('user does not exist or incorrect email');
    return;
  }
  const isMatch = bcrypt.compareSync(password, user.password);
  if (!isMatch) {
    res.status(403).send('Incorrect password');
    return;
  }

  req.session.user_id = user.id;
  res.redirect('/urls');
});


//POST /register to send new user info to the database
app.post('/register', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const userExists = getUserByEmail(email, users);
  if (!email || !password) {
    res.status(400).send('please provide full information!');
    return;
  }
  
  if (userExists) {
    res.status(400).send('email already exists');
    return;
  }

  const salt = bcrypt.genSaltSync(SALT_ROUNDS);
  const hashsedPassword = bcrypt.hashSync(password, salt);
   
  const user = {
    id: generateRandomString(),
    email,
    password: hashsedPassword
  };
  console.log(user);
  users[user.id] = user;
  req.session.user_id = user.id;
  res.redirect('/urls');
  
});



//server listening at specific port
app.listen(PORT, () => {
  console.log(`App listening on port ${PORT}`);
});

