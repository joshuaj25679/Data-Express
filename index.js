const { urlencoded } = require('express');
const express = require('express'), 
    pug = require('pug'),
    path = require('path'),
    routes = require('./routes/routes.js'),
    expressSession = require('express-session'), 
    cookieParser = require('cookie-parser'),
    bcrypt = require('bcryptjs');
const {MongoClient, ObjectId} = require("mongodb");

const url = 'mongodb+srv://teammates:hello@cluster0.4tguq.mongodb.net/DataExpress?retryWrites=true&w=majority';
const client = new MongoClient(url);
const dbName = 'DataExpress';
const db = client.db(dbName);
const collection = db.collection('People');

const app = express();

app.set('view engine', 'pug');
app.set('views', __dirname + '/views');
app.use(express.static(path.join(__dirname, '/public')));
app.use(expressSession({
    secret: 'wh4t3v3r',
    saveUninitialized: true,
    resave: true
}));
app.use(cookieParser('whatever'));

const urlencodedParser = express.urlencoded({
    extended: false
})

const checkAuth = (req, res, next) => {
    if(req.session.user && req.session.user.isAuthenticated) {
        next();
    }
    else {
        res.redirect('/');
    }
}

app.get('/', (req, res) => {
    res.render('loginPlaceHolder');
});
app.post('/', urlencodedParser, async (req, res) => {
    console.log(req.body.username);
    //Change user and pass to dynamic db users
    let user = await collection.findOne({username: req.body.username})
    if(bcrypt.compareSync(req.body.password, user.password)){
        req.session.user = {
            isAuthenticated: true,
            username: req.body.username
        }
        //res.cookie('Login', req.session.user, {maxAge: 999999999999999999999999});
        res.redirect('/loggedIn');
    }
    else {
        res.redirect('/');
    }
});

app.get('/loggedIn', routes.index);
app.get('/create', routes.create);
app.post('/create', checkAuth, urlencodedParser, routes.createPerson);
app.get('/edit/:id', checkAuth, routes.edit);
app.post('/edit/:id', checkAuth, urlencodedParser, routes.editPerson);
//app.get('/delete/:id', checkAuth, routes.delete);
//app.get('/details/:id', checkAuth, routes.details);

app.listen(3000);