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

app.get('/', (req, res) => {
    res.render('loginPlaceHolder');
});
app.post('/', urlencodedParser, (req, res) => {
    console.log(req.body.username);
    if(req.body.username == 'user' && req.body.password == 'pass'){
        req.session.user = {
            isAuthenticated: true,
            username: req.body.username
        }
        //res.cookie('Login', req.session.user, {maxAge: 999999999999999999999999});
        res.redirect('/details/req.body.username');
    }
    else {
        res.redirect('/');
    }
});

app.get('/loggedIn', routes.index);
app.get('/create', routes.create);
app.post('/create', checkAuth, urlencodedParser, routes.createPerson);
app.get('/edit/:username', checkAuth, routes.edit);
app.post('/edit/:username', checkAuth, urlencodedParser, routes.editPerson);
app.get('/delete/:id', checkAuth, routes.delete);
app.get('/details/:username', checkAuth, routes.details);

app.get('/logout', checkAuth, (req, res) => {
    req.session.destroy(err => {
        if(err){
            console.log(err);
        }
        else {
            res.redirect('/');
        }
    });
});

app.listen(3000);