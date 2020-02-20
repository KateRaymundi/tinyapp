const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser')
app.use(cookieParser())

app.set('views', './view'); // esse codigo pode me dar problema no futuroviews
app.set("view engine", "ejs");

const bodyParser = require("body-parser");       // converts the body from POST into a string
app.use(bodyParser.urlencoded({extended: true}));

const users = {
    "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "purple-monkey-dinosaur"
  },
    "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

const matchUsers = (email) => {
  for (let valEmailId in users){
    if (users[valEmailId].email === email){
      return users[valEmailId].id
    }
  }
}

// Random String used for userID
function generateRandomString() {
  var result           = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     for ( var i = 0; i < 7; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// Displays all URLS
app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_index", templateVars);
});

// CREATES new ShortURL
app.get("/urls/new", (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_new", templateVars);
});

// SHOW specific URL page
app.get("/urls/:shortURL", (req, res) => { //shortURL is id in this case
  let templateVars = { 
    user: users[req.cookies["user_id"]],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  
  res.render("urls_show", templateVars);
});

// CREATES new ShortURL
app.post("/urls", (req, res) => { // long URL referes do the body to the request 
  console.log(req.body);  // Log the POST request body to the console
  let newKey = generateRandomString()
  urlDatabase[newKey] = req.body.longURL
  //console.log(urlDatabase)
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${newKey}`)
});

// REDIRECT for ShortURL >> LongURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

// DELETE ShortURL
app.post("/urls/:shortURL/delete", (req, res) => { // Essa parte aqui foi criada para poder deletar as shorts URL
  console.log(urlDatabase[req.params.shortURL]) // que ficam no site. Junto com isso eu tambem preciso acrescentar o form no urls_index 
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls')
})

// EDIT ShortURL
app.post("/urls/:shortURL", (req, res) => { // cria um novo field para o usuario poder editar um novo 
  console.log(urlDatabase[req.params.shortURL]) // endereco de web. 
  urlDatabase[req.params.shortURL] = req.body.longURL // a variable usada aqui eh o object shortURL que passa como variavel a longo URL
  res.redirect('/urls')
})

// LOGIN - Action (POST)
app.post("/login", (req, res) => {
  let email = req.body.email
  let password = req.body.password
  let user_id = matchUsers(email)
  if (user_id) {
    if (password === users[user_id].password){
      res.cookie('user_id', user_id)
    } else {
      res.statusCode = 403.
      res.send(res.statusCode)
    }
  } else {
    res.statusCode = 403.
    res.send(res.statusCode)
  }
    res.redirect('/urls')
})
 
// LOGIN - Access page (GET)
app.get('/login', (req, res) => {
  let templateVars = { urls: urlDatabase, user: users[req.cookies["user_id"]]};
  res.render("urls_login", templateVars)
})

// LOGOUT
app.post("/logout", (req, res) => { 
  res.clearCookie('user_id')
  res.redirect('/urls')
})

// Open REGISTER page (GET)
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]}
  res.render('urls_user_registration', templateVars)
})

// REGISTER Action (POST)
app.post("/register", (req, res) => {
  let { email, password } = req.body // aqui eu solicitei o email e o password do user_registration
  if(email === "" || password === "") {
    res.statusCode = 400.
    res.send(res.statusCode)
  } else if (matchUsers(email)) {
    res.statusCode = 404.
    res.send(res.statusCode)
  } else { 
    let id = generateRandomString() 
    users[id] = {
    id: id,                   //puxou da formula acima
    email: email,             //puxou do file users_registration   
    password: password        //puxou do file users_registration
    }
    res.cookie("user_id", users[id].id)
    res.redirect('/urls')
    console.log(users)
  }
})

// SERVER LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
