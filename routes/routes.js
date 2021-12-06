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
            
            //makes the session with the account type 
            req.session.user = {
                isAuthenticated: true,
                username: req.body.username,
                accountType: filteredDocs.accountType
            }

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
    if (ans1 == null || ans2 == null || ans3 == null) {
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
        question3: ans3,
        accountType: 'USER'
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
    await client.connect();
    console.log(ans1, ans2, ans3);
    if (ans1 == undefined || ans2 == undefined || ans3 == undefined) {
        res.redirect('/edit/' + req.session.user.username);
    }
    let password = req.body.password;
    if (password == '') {
        const filteredDocs = await collection.findOne({ 'username': req.body.username });
        res.redirect('/edit/' + req.session.user.username);
        password = filteredDocs.password;
    }else{
        password = bcrypt.hashSync(req.body.password, salt);
    }
    let username = req.body.username;
    let age = req.body.age;
    let email = req.body.email;
    if (username == '' || age == '' || email == '') {
        res.redirect('/edit/' + req.session.user.username);
    }
    const typeDocs = await collection.findOne({ 'username': req.body.username });
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
                question3: ans3,
                accountType: typeDocs.accountType
            }
        }
    );
    req.session.user = {
        isAuthenticated: true,
        username: username,
        accountType: typeDocs.accountType
    }
    console.log('the new username is: ' + username)
    res.redirect('/loggedIn');
    client.close();
};

//Display User Details
exports.details = async (req, res) => {
    console.log(req.session.user.username);
    await client.connect();
    const filteredDocs = await collection.findOne({ 'username': req.session.user.username});
    console.log("Document: " + filteredDocs);
    client.close();
    res.render('details', {
        title: filteredDocs.username + "'s Details",
        person: filteredDocs
    });
}

exports.api = async (req, res) => {
    //Get Data for each question from the DB
    await client.connect();
    //Data to be filled
    const data = [
        {
            //Query for Question 1
            question1:"Are uncrustables a calzone or ravioli?",
            calzoneAmount: await collection.find({question1:'Calzone'}).count(),
            ravioliAmount: await collection.find({question1:'Ravioli'}).count()
        },
        {
            //Query for Question 2
            question2:"Who should narrate your life?",
            freemanAmount: await collection.find({question2:'Morgan Freeman'}).count(),
            jonesAmount: await collection.find({question2:'James Earl Jones'}).count(), 
            carreyAmount: await collection.find({question2:'Jim Carrey'}).count(),
            reynoldsAmount: await collection.find({question2:'Ryan Reynolds'}).count()
        },
        {
            //Query for Question 3
            question3:"Which superpower would you most want to have?",
            speedAmount: await collection.find({question3:'Super Speed'}).count(),
            flightAmount: await collection.find({question3:'Flight'}).count(), 
            strengthAmount: await collection.find({question3:'Super Strength'}).count(),
            telekinesisAmount: await collection.find({question3:'Telekinesis'}).count()
        }
    ]
    client.close();
    res.json(data);
    console.log(data[0].calzoneAmount);
    console.log(data[0].ravioliAmount);
//loads in admin page 
exports.admin = (req, res) => {
    res.render('admin', {
        title: "ADMIN PAGE",
        status: "",
        admin: req.session.user.username
    })
}

//finds the user by username to update to admin
exports.addAdmin = async (req, res) => {
    await client.connect();
    const filteredDocs = await collection.findOne({ 'username': req.body.regularUser});

    //updates the user to set the accountType to ADMIN
    const updateResult = await collection.updateOne(
        { 'username': req.body.regularUser},
        {
            $set: {
                username: filteredDocs.username,
                password: filteredDocs.password,
                email: filteredDocs.email,
                age: filteredDocs.age,
                question1: filteredDocs.question1,
                question2: filteredDocs.question2,
                question3: filteredDocs.question3,
                accountType: "ADMIN"
            }
        }
    );

    // renders the admin page again with the updated status of what happened 
    client.close();
    res.render('admin', {
        title: "ADMIN PAGE",
        status: "User: " + filteredDocs.username + ", changed to ADMIN account",
        admin: req.session.user.username
    })
}

//gets the username and deletes a user with that username
exports.deleteUser = async (req, res) =>{
    await client.connect();
    await collection.deleteOne({'username': req.body.deleteUsername})
    client.close();

    // renders the admin page again with the updated status of what happened 
    res.render('admin', {
        title: "ADMIN PAGE",
        status: "User: " + req.body.deleteUsername + ", deleted",
        admin: req.session.user.username
    })
}