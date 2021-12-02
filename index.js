const { urlencoded } = require('express');
const express = require('express'), 
    pug = require('pug'),
    path = require('path'),
    routes = require('./routes/routes.js'),
    expressSession = require('express-session'); 
    cookieParser = require('cookie-parser');

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

//check admin Auth makes sure the user is an admin 
const checkAdminAuth = (req, res, next) => {
    if(req.session.user && req.session.user.accountType == 'ADMIN') {
        next();
    }
    else {
        res.redirect('/loggedIn');
    }
}

app.get('/', routes.login);
app.post('/', urlencodedParser, routes.loginUser);
app.get('/loggedIn', routes.details);
app.get('/create', routes.create);
app.post('/create', urlencodedParser, routes.createPerson);
app.get('/edit/:username', checkAuth, routes.edit);
app.post('/edit/:username', checkAuth, urlencodedParser, routes.editPerson);
app.get('/details/:username', checkAuth, routes.details);
app.get('/logout', checkAuth, routes.logout);
app.get('/admin', checkAdminAuth, routes.admin);
app.post('/addAdmin', checkAdminAuth, urlencodedParser, routes.addAdmin);


app.listen(3000);