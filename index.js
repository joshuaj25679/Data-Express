const { urlencoded } = require('express');
const express = require('express'), 
    pug = require('pug'),
    path = require('path'),
    routes = require('./routes/routes.js'),
    bcrypt = reqire('bcryptjs');

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, '/public')));

const urlencodedParser = express.urlencoded({
    extended: false
})

app.get('/', routes.index);
app.get('/create', routes.create);
app.post('/create', urlencodedParser, routes.createPerson);
app.get('/edit/:id', routes.edit);
app.post('/edit/:id', urlencodedParser, routes.editPerson);
app.get('/delete/:id', routes.delete);
app.get('/details/:id', routes.details);

app.listen(3000);