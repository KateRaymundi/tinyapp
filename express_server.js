const express = require("express");
const app = express();
const PORT = 8080;
const cookieParser = require('cookie-parser');
app.use(cookieParser());
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { getUserByEmail } = require('./helpers');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

app.set('views', './view');
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "4thgth" },
  i3BoGr: { longURL: "https://www.google.ca", userId: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },

  "aJ48lW": {
    id: "aJ48lW",
    email: "test@test",
    password: bcrypt.hashSync("123", 10)
  }
};

const urlsForUser = (id) => {
  let result = {};
  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === id) {
      result[url] = urlDatabase[url];
    }
  }
  return result;
};

// Random String used for userID
const generateRandomString = () => {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < 7; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// Displays all URLS
app.get("/urls", (req, res) => {
  let filteredDatabase = urlsForUser(req.session["userId"]);
  let templateVars = {urls: filteredDatabase, user: users[req.session["userId"]]};
  res.render("urls_index", templateVars);
});

// CREATES new ShortURL
app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase, user: users[req.session["userId"]]};
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// SHOW specific URL page
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    user: users[req.session["userId"]],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL
  };
  if (urlDatabase[req.params.shortURL].userId !== req.session["userId"]) {
    templateVars.user = undefined;
  }
  res.render("urls_show", templateVars);
});

// CREATES new ShortURL
app.post("/urls", (req, res) => {
  let newKey = generateRandomString();
  urlDatabase[newKey] = { longURL: req.body.longURL, userId: req.session["userId"] };
  res.redirect(`/urls/${newKey}`);
});

// REDIRECT for ShortURL >> LongURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// DELETE ShortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userId === req.session["userId"]) {
    delete urlDatabase[req.params.shortURL];
  }
  res.redirect('/urls');
});

// EDIT ShortURL
app.post("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL].userId === req.session["userId"]) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
  }
  res.redirect('/urls');
});
 
// LOGIN - Access page (GET)
app.get('/login', (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.session["userId"]]};
  res.render("urls_login", templateVars);
});

// LOGIN - Action (POST)
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let userId = getUserByEmail(email, users);
  if (userId) {
    if (bcrypt.compareSync(password, users[userId].password)) {
      req.session.userId = userId;
    } else {
      res.statusCode = 403.;
      res.send(res.statusCode);
    }
  } else {
    res.statusCode = 403.;
    res.send(res.statusCode);
  }
  res.redirect('/urls');
});

// LOGOUT
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Open REGISTER page (GET)
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session["userId"]]};
  res.render('urls_user_registration', templateVars);
});

// REGISTER Action (POST)
app.post("/register", (req, res) => {
  let { email, password } = req.body;
  if (email === "" || password === "") {
    res.statusCode = 400.;
    res.send(res.statusCode);
  } else if (getUserByEmail(email, users)) {
    res.statusCode = 404.;
    res.send(res.statusCode);
  } else {
    let id = generateRandomString();
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
      id: id,
      email: email,
      password: hashedPassword
    };
    req.session.userId = users[id].id;
    res.redirect('/urls');
  }
});

// SERVER LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
