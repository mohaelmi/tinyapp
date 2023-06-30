//func generate random string for urls and users
const generateRandomString = () => {
  let shortUrl = '';
  let str = 'gsD5d37g1t';
  for (let i = 6; i > 0; i--) {
    shortUrl  += str[Math.floor(Math.random() * str.length)];
  }
  return shortUrl;
};

//find urls related for an specific user
const urlsForUser = (id, urlDatabase) => {
  const urls = {};
  for (const urlId in urlDatabase) {
    if (urlDatabase[urlId].userID === id) {
      urls[urlId]  = urlDatabase[urlId].longURL;
    }
  }

  return urls ? urls : null;
};

//find a user by their email
const getUserByEmail = (email, usersData) => {
  let user;
  for (const userId in usersData) {
    if (usersData[userId].email === email) {
      user = usersData[userId];
    }
  }

  if (user) {
    return user;
  }

  return null;
};


module.exports = {
  generateRandomString,
  urlsForUser,
  getUserByEmail
};