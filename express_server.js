const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set('views', './view'); // esse codigo pode me dar problema no futuroviews
app.set("view engine", "ejs");

const bodyParser = require("body-parser");       // converts the body from POST into a string
app.use(bodyParser.urlencoded({extended: true}));

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

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => { //shortURL is id in this case
  let templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]};
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => { // long URL referes do the body to the request 
  console.log(req.body);  // Log the POST request body to the console
  newKey = generateRandomString()
  urlDatabase[newKey] = req.body.longURL
  //console.log(urlDatabase)
  //res.send("Ok");         // Respond with 'Ok' (we will replace this)
  res.redirect(`/urls/${newKey}`)
});

function generateRandomString() {
  var result           = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
     for ( var i = 0; i < 7; i++ ) {
     result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post("/urls/:shortURL/delete", (req, res) => { // Essa parte aqui foi criada para poder deletar as shorts URL
  console.log(urlDatabase[req.params.shortURL]) // que ficam no site. Junto com isso eu tambem preciso 
                                                // acrescentar o form no urls_index 
  delete urlDatabase[req.params.shortURL]
  res.redirect('/urls')

})

app.post("/urls/:shortURL", (req, res) => { // cria um novo field para o usuario poder editar um novo 
  console.log(urlDatabase[req.params.shortURL]) // endereco de web. 

  urlDatabase[req.params.shortURL] = req.body.longURL // a variable usada aqui eh o object shortURL que passa como variavel a longo URL
  res.redirect('/urls')

})

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});