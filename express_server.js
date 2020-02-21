const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
var cookieParser = require('cookie-parser');
app.use(cookieParser());
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))

app.set('views', './view'); // esse codigo pode me dar problema no futuroviews
app.set("view engine", "ejs");

const bodyParser = require("body-parser");       // converts the body from POST into a string
app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {   // essa database foi alterada para que somente as pessoas registradas na pagina tenham acesso a shortURL
  b6UTxQ: { longURL: "https://www.tsn.ca", userId: "4thgth" },  // a shortURL agora virou uma key que recebe um objeto que tem como valor 
  i3BoGr: { longURL: "https://www.google.ca", userId: "aJ48lW" } // uma long URL e uma chave idd 
  // "b2xVn2": "http://www.lighthouselabs.ca",
  // "9sm5xK": "http://www.google.com"
};

const users = {       // isso eh como se fosse a minha database
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
}

const getUserByEmail = (email) => { // this function was created to ckeck if the user is in the data
  for (let userId in users){
    if (users[userId].email === email){
      return users[userId].id
    }
  }
}

const urlsForUser = (id) => {
  let result = {}
  for (let url in urlDatabase){
    if (urlDatabase[url].userId === id) {
      result[url] = urlDatabase[url]
    }
  }
  return result
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

app.get("/urls.json", (req, res) => { 
  res.json(urlDatabase);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

// Displays all URLS
app.get("/urls", (req, res) => {
  let filteredDatabase = urlsForUser(req.session["user_id"])
  let templateVars = {urls: filteredDatabase, user: users[req.session["user_id"]]};
  res.render("urls_index", templateVars);
  console.log(templateVars)
});

// CREATES new ShortURL
app.get("/urls/new", (req, res) => {
  let templateVars = {urls: urlDatabase, user: users[req.session["user_id"]]};
  if (templateVars.user) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login")
  }
});

// SHOW specific URL page
app.get("/urls/:shortURL", (req, res) => { //shortURL is id in this case
  let templateVars = { 
    user: users[req.session["user_id"]],
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL
    };
  if (urlDatabase[req.params.shortURL].userId !== req.session["user_id"]){
    templateVars.user = undefined
  }
  res.render("urls_show", templateVars);
});

// CREATES new ShortURL
app.post("/urls", (req, res) => { // long URL referes do the body to the request 
  let newKey = generateRandomString()
  urlDatabase[newKey] = {longURL: req.body.longURL, userId: req.session["user_id"] }
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${newKey}`)
});

// REDIRECT for ShortURL >> LongURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

// DELETE ShortURL
app.post("/urls/:shortURL/delete", (req, res) => {
  if (urlDatabase[req.params.shortURL].userId === req.session["user_id"]) { // verifica se o ID do usuario da URL eh igual ao ID do usuario logado
  delete urlDatabase[req.params.shortURL]
  }
  res.redirect('/urls')
})

// EDIT ShortURL
app.post("/urls/:shortURL", (req, res) => { // cria um novo field para o usuario poder editar um novo 
  if (urlDatabase[req.params.shortURL].userId === req.session["user_id"]) {
  urlDatabase[req.params.shortURL].longURL = req.body.longURL // a variable usada aqui eh o object shortURL que passa como variavel a longo URL
  }
  res.redirect('/urls')
})
 
// LOGIN - Access page (GET)        //criado para o usuario poder fazer o registro dele na pagina. Cada vez que o usuario se registra o browse manda as informacoes 
app.get('/login', (req, res) => {   //para o server atraves do POST  abaixo
  let templateVars = { urls: urlDatabase, user: users[req.session["user_id"]]};
  res.render("urls_login", templateVars)
})

// LOGIN - Action (POST)
app.post("/login", (req, res) => {  // Nesse step aqui nos ja adicionamos um novo usuario no register / eh o mesmo processo de login  
  let email = req.body.email        //a funcao getUserByEmail pega esse email aqui 
  let password = req.body.password  
  let userId = getUserByEmail(email)   
  if (userId) {
    if (bcrypt.compareSync(password, users[userId].password)) { // se o usuario for encontrado a pagina ira dar um match com o password do usuario  
      req.session.user_id = userId   
      res                          // que ira chamar o cookie e logar o usuario sem ele precisar colocar os dados dele 
    } else {
      res.statusCode = 403.         // se o usuario nao pode ser encontrado apos o match da data base 
      res.send(res.statusCode)      // entao ele vai ser direcionado para o status code 403 (Proibido)
    }
  } else {                          
    res.statusCode = 403.
    res.send(res.statusCode)
  }
    res.redirect('/urls') // depois que o novo usario foi criado, e o cookie foi salvo o usuario eh direcionado para a URL
})

// LOGOUT
app.post("/logout", (req, res) => { //limpa o cookie e direciona para a webpage 
  req.session = null    // isso antes era o username e foi passado o cookie novamente 
  res.redirect('/urls')
})

// Open REGISTER page (GET)
app.get("/register", (req, res) => {
  let templateVars = { user: users[req.session["user_id"]]} // isso era antes o username req.cookies["username"]
  res.render('urls_user_registration', templateVars) // esse foi o caminho que eu fiz essa configuracao 
})

// REGISTER Action (POST)
app.post("/register", (req, res) => {
  let { email, password } = req.body // aqui eu solicitei o email e o password do user_registration
  if(email === "" || password === "") { // se o usuario retornar com o username and login vazios ele vai receber o 
    res.statusCode = 400.               //status code de "BAD REQUEST" 
    res.send(res.statusCode)
  } else if (getUserByEmail(email)) {         // se o usuario tentar registrar algo um email que ja existe na database. ai a webpage
    res.statusCode = 404.                 // vai direcionar o cliente para o status code 404 "NOT FOUND"
    res.send(res.statusCode)             
  } else {                               //se nenhuma das opcoes acima forem verdadeiras o usuario esta livre para se registrar
    let id = generateRandomString()      //na pagina. Apos o registro ele eh direcionado para a url principal    
    const hashedPassword = bcrypt.hashSync(password, 10);
    users[id] = {
    id: id,                   
    email: email,              
    password: hashedPassword        
    }
    req.session.user_id = users[id].id 
    res.redirect('/urls')
    console.log(users)
  }
})

// SERVER LISTEN
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
