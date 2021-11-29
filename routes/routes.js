const { MongoClient, ObjectId } = require("mongodb"),
    bcrypt = require('bcryptjs');

const url = 'mongodb+srv://teammates:hello@cluster0.4tguq.mongodb.net/DataExpress?retryWrites=true&w=majority';
const client = new MongoClient(url);

const dbName = 'DataExpress';
const db = client.db(dbName);
const collection = db.collection('People');

let salt = bcrypt.genSaltSync(10);

//Login Page Loader
exports.login = (req, res) => {
    res.render('loginPlaceHolder', {
        title: 'Login'
    });
};

//Login Method
exports.loginUser = async (req, res) => {
    console.log(req.body.username);
    await client.connect();
    const filteredDocs = await collection.findOne({ 'username': req.body.username });
    console.log(filteredDocs);
    client.close();
    if(filteredDocs != null){
        if (req.body.username == filteredDocs.username && bcrypt.compareSync(req.body.password, filteredDocs.password)) {
            req.session.user = {
                isAuthenticated: true,
                username: req.body.username
            }
            //if they have been to the site before it will do this
            if (req.cookies.beenToSiteBefore == 'yes') {
                //nice format for time
                s = (Date.now() - req.cookies.LastVisited)
                var ms = s % 1000;
                s = (s - ms) / 1000;
                var secs = s % 60;
                s = (s - secs) / 60;
                var mins = s % 60;
                var hrs = (s - mins) / 60;
                niceTime = hrs + ':' + mins + ':' + secs + '.' + ms;

                //rewrites the last visited cookie to have this as the new last visited time
                res.cookie('LastVisited', Date.now(), { maxAge: 9999999999999999999 })
            }
            //if its the first time visiting it will make these cookies
            else {
                res.cookie('beenToSiteBefore', 'yes', { maxAge: 9999999999999999999 });
                res.cookie('LastVisited', Date.now(), { maxAge: 9999999999999999999 });
                niceTime = "First Time Here!"
            }
            res.render(`details`, {
                lastVisit: niceTime,
                person: filteredDocs
            })
        }
        else {
            res.redirect('/');
        };
    }
    else {
        res.render('loginPlaceHolder', {
            title: "Login",
            errorMessage: "Invalid Username or Password"
        });
    }
};

//Logout Method
exports.logout = (req, res) => {
    req.session.destroy(err => {
        if (err) {
            console.log(err);
        }
        else {
            //Redirect to Login Page
            res.redirect('/');
        }
    });
}

//Registration Page
exports.create = (req, res) => {
    res.render('create', {
        title: 'Registration'
    });
}

//Registration Method
exports.createPerson = async (req, res) => {
    //Get Registration Data
    let ans1 = req.body.q1Answers;
    let ans2 = req.body.q2Answers;
    let ans3 = req.body.q3Answers;
    if (ans1 == undefined || ans2 == undefined || ans3 == undefined) {
        res.redirect('/create');
    }
    let password = req.body.password;
    if (password == '') {
        res.redirect('/create');
    }
    let username = req.body.username;
    password = bcrypt.hashSync(req.body.password, salt);
    let age = req.body.age;
    let email = req.body.email;

    //If Registration Fields are blank, redirect back to registration page
    if (username == '' || age == '' || email == '') {
        res.redirect('/create');
    }

    //Add Person to Database
    await client.connect();
    let person = {
        username,
        password, //salt and hash this
        email,
        age,
        question1: ans1,
        question2: ans2,
        question3: ans3
    };
    console.log(person);
    const insertResult = await collection.insertOne(person);
    client.close();
    console.log(req.body.name + ' added');
    //Redirect to Details Page after Registration
    res.redirect('/');
}

//User Edit Page
exports.edit = async (req, res) => {
    await client.connect();
    //TODO Change to take in username
    const filterDocs = await collection.find({ 'username': req.params.username }).toArray();
    client.close();
    res.render('edit', {
        title: 'Edit Profile',
        person: filterDocs[0]
    });
};

//Allow User to edit their details
exports.editPerson = async (req, res) => {

    let ans1 = req.body.ans1;
    let ans2 = req.body.ans2;
    let ans3 = req.body.ans3;
    console.log(ans1, ans2, ans3);
    if (ans1 == undefined || ans2 == undefined || ans3 == undefined) {
        res.redirect('/edit/' + req.session.user.username);
    }
    let password = req.body.password;
    if (password == '') {
        res.redirect('/edit/' + req.session.user.username);
    }
    let username = req.body.username;
    password = bcrypt.hashSync(req.body.password, salt);
    let age = req.body.age;
    let email = req.body.email;

    if (username == '' || age == '' || email == '') {
        res.redirect('/edit/' + req.session.user.username);
    }

    await client.connect();
    const updateResult = await collection.updateOne(
        { 'username': req.session.user.username },
        {
            $set: {
                username,
                password,
                email,
                age,
                question1: ans1,
                question2: ans2,
                question3: ans3

            }
        }
    );
    client.close();
    res.redirect('/loggedIn');
};

//Display User Details
exports.details = async (req, res) => {
    console.log(req.session.user.username);
    await client.connect();
    const filteredDocs = await collection.findOne({ 'username': "JoJohnson"});
    console.log("Document: " + filteredDocs);
    client.close();
    res.render('details', {
        title: filteredDocs.username + "'s Details",
        person: filteredDocs
    });
}
