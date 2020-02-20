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
      return true
    }
  }
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

// Random String used for userID
function generateRandomString() {
  var result           = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     for ( var i = 0; i < 7; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

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
  let username = req.body.username;
  res.cookie('username', username); // ess configuracao vai gravar o cookie do usuario no servidor
  res.redirect('/urls')
})
 
// LOGIN - Access page (GET)
app.get('/login', (req, res) => {
  let templateVars = { user: 'x' }
  res.render("/urls_login")
})

// LOGOUT
app.post("/logout", (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
})

// Open REGISTER page (GET)
app.get("/register", (req, res) => {
res.render('urls_user_registration')
})

// REGISTER Action (POST)
app.post("/register", (req, res) => {
  let { email, password } = req.body // aqui eu solicitei o email e o password do user_registration
  if(email === "" || password === "") {
    res.statusCode = 404.
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
    res.cookie("user_id", users[id])
    res.redirect('/urls')
  }
})

// SERVER LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

/* TO DO 
Errors >> Linha 138 - Status code deveria ser 400 / Linha 113 - Username agora deve ser user_id
0 - Testar se user esta sendo adicionado apos Register
00 - Testar se o cookie gerado eh correto (linha 44)
1 - adicionar Register link on header
2 - revisar Register form
3 - ajustar Login form
4 - revisar Login JS 

// const menu = {
//   "fries" : 2.99,
//   "burger": 3.99
// }

// app.get('/menu/:item', (req, res) => {
// res.send(`${menu[req.params.item]}`) // O req params eh so uma configuracao do que o servidor vai trazer, esse parametro eh padrao 
// ele so vai ser utilizado quando quando receber um id:(que para este caso eh depois do)
// menu/:item) nesse caso ele vai trazer as informacoes do item 
//}