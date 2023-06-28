const express = require("express");
const uid = require("uid");
const cookieParser = require("cookie-parser");
const app = express();
const PORT = 3000; // port number

app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

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

// const urlDatabase = {
//   "b2xVn2": "http://www.lighthouselabs.ca",
//   "9sm5xK": "http://www.google.com"
// };

const users = {
  dt1tg: { id: 'dt1tg', email: 'moha@12', password: '1' },
  d2ateg: { id: 'd2ateg', email: 'moha@1', password: '2' }
}

const generateRandomString = () => {
  let shortUrl = '';
  let str = 'gsD5d37g1t';
  for (let i = 6; i > 0; i--) {
    shortUrl  += str[Math.floor(Math.random() * str.length)];
  }
  return shortUrl;
};

const urlsForUser = (id) => {
  const urls = {}
  for (const urlId in urlDatabase) {
    if(urlDatabase[urlId].userID === id) {
      urls[urlId]  = urlDatabase[urlId].longURL
    }
   }

   return urls? urls : null
}

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
  const user_id = req.cookies.user_id
  if(!user_id) {
    res.send("<h4> You haven't sign in yet. please login first!</h4> <br> <a href = '/login'> sign in </a>")
    return;
  }

  const urls =  urlsForUser(user_id)
 
  
  const templateVars = {
    urls: urls,
    user: users[req.cookies.user_id],
  };
  res.render('urls_index', templateVars);
});

//route for handling for rendering urls_new page
app.get("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id
  if(!user_id) {
    res.redirect('/login')
    return;
  }
  const templateVars = {   user: users[user_id] };
  res.render('urls_new', templateVars);
});

//route for handling new URL and shortenning
app.post("/urls/new", (req, res) => {
  const user_id = req.cookies.user_id
  if(!user_id) {
   res.send("<h4> You haven't sign in yet. please sign in first!</h4> <br> <a href = '/login'> sign in </a>")
   return;
  }
  const id = generateRandomString();
  urlDatabase[id] = { 
    longURL: req.body.longURL,
    userID: user_id 
  };
  
  res.redirect('/urls');
});

//handling request the edit page (url_show)
app.get("/urls/:id", (req, res) => {
  const id = req.params.id;
  const user_id = req.cookies.user_id

  if(!user_id) {
   res.send("<h4> You haven't sign in yet. please sign in first!</h4> <br> <a href = '/login'> sign in </a>")
   return;
  }
  if(!urlDatabase[id]) {
    res.send('<h5>URL does not exist!</h5>')
    return
  }
  const templateVars = {
    id: id,
    longURL: urlDatabase[req.params.id].longURL,
    user: users[req.cookies.user_id],
  };
  res.render("urls_show", templateVars);
});

//route for redirecting shortURL to its own website/realURL
app.get("/u/:id", (req, res) => {
  if (!urlDatabase[req.params.id].longURL) {
    res.send('<h2>The short URL is not exist </h2>');
    return;
  }

  const longURL = urlDatabase[req.params.id].longURL;
  res.redirect(longURL);
    
});

//route updates url
app.post('/urls/:id', (req, res) => {
  const updatedURL = req.body.url;
  const id = req.params.id;
  const user_id = req.cookies.user_id
  if(!user_id) {
  res.send('<h5>you cannot update before you sign in!</h5>')
  return;
  }

  if(!urlDatabase[id]) {
    res.send('<h5>URL does not exist!</h5>')
    return
  }
  if(urlDatabase[id].userID === user_id) {
    urlDatabase[id].longURL = updatedURL;
    res.redirect('/urls');
    return;
  }


  res.send('<h5>it is not your own URL!</h5>')
  
});

//rout handling for deleting an specific url
app.post('/urls/:id/delete', (req, res) => {
  const id = req.params.id;
  const user_id = req.cookies.user_id

  if(!user_id) {
    res.send('<h5>you cannot update before you sign in!</h5>')
    return;
  }

  if(!urlDatabase[id]) {
    res.send('<h5>URL does not exist!</h5>')
    return
  }

  if(urlDatabase[id].userID === user_id) {
    delete urlDatabase[id] ;
    res.redirect('/urls');
    return;
  }

  res.send('<h5>seems you don\'t own that URL!</h5>')

});



//clear the cookie and redirect when request post at /logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});


app.get('/register', (req, res) => {
  const user_id = req.cookies.user_id
  if(user_id) {
    res.redirect('/urls')
    return;
  }

  res.render('registration')
})

app.get('/login', (req, res) => {
  const user_id = req.cookies.user_id
  if(user_id) {
    res.redirect('/urls')
    return;
  }
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

