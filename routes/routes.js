const {MongoClient, ObjectId} = require("mongodb"),
    bcrypt = require('bcryptjs');

const url = 'mongodb+srv://teammates:hello@cluster0.4tguq.mongodb.net/DataExpress?retryWrites=true&w=majority';
const client = new MongoClient(url);

const dbName = 'DataExpress';
const db = client.db(dbName);
const collection = db.collection('People');

let salt = bcrypt.genSaltSync(10);

//Default Page
//TODO Make This the Login Page
exports.index = async (req, res) => {
    await client.connect();
    const findResult = await collection.find({}).toArray();
    console.log("Found Documents => ", findResult);
    client.close();
    res.render('index', {
        title: 'People List',
        people: findResult
    })
    
}

exports.create = (req, res) => {
    res.render('create', {
        title: 'Registration'
    });
}

exports.createPerson = async (req, res) => {
    let ans1 = req.body.q1Answers;
    let ans2 = req.body.q2Answers;
    let ans3 = req.body.q3Answers;
    if(ans1 == undefined || ans2 == undefined || ans3 == undefined){
        res.redirect('/create');
    }
    let password = req.body.password;
    if(password == ''){
        res.redirect('/create');
    }
    let username = req.body.username;
    password = bcrypt.hashSync(req.body.password, salt);
    let age = req.body.age;
    let email = req.body.email;

    if(username == '' || age == '' || email == ''){
        res.redirect('/create');
    }

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
    const insertResult = await collection.insertOne(person);
    client.close();
    console.log(req.body.name + ' added');
    res.redirect('/loggedIn');
}

//Main Page for User
exports.edit = async (req, res) =>{
    await client.connect();
    const filterDocs = await collection.find(ObjectId(req.params.id)).toArray();
    client.close();
    res.render('edit', {
        title:'Edit Profile',
        person: filterDocs[0]
    });
};

exports.editPerson = async (req, res) =>{

    let ans1 = req.body.quest1;
    let ans2 = req.body.quest2;
    let ans3 = req.body.quest3;
    if(ans1 == undefined || ans2 == undefined || ans3 == undefined){
        res.redirect('/edit/' + req.session.user.username);
    }
    let password = req.body.password;
    if(password == ''){
        res.redirect('/edit/' + req.session.user.username);
    }
    let username = req.body.username;
    password = bcrypt.hashSync(req.body.password, salt);
    let age = req.body.age;
    let email = req.body.email;

    if(username == '' || age == '' || email == ''){
        res.redirect('/edit/' + req.session.user.username);
    }

    await client.connect();
    const updateResult = await collection.updateOne(
        {'username':req.session.user.username},
        {$set: {
            username,
            password,
            email,
            age,
            question1: ans1,
            question2: ans2,
            question3: ans3
            
        }}
    );
    client.close();
    res.redirect('/loggedIn');
};

exports.delete = async (req, res) =>{
    await client.connect();
    const deleteResult = await collection.deleteOne({_id: ObjectId(req.params.id)});
    client.close();
    res.redirect('/loggedIn');
}

exports.details = async (req, res) =>{
    await client.connect();
    const filteredDocs = await collection.findOne({'username' : req.params.username});
    client.close();
    res.render('details', {
        title: filteredDocs.username + "'s Details",
        person: filteredDocs
    });
}
