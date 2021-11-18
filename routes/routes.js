const {MongoClient, ObjectId} = require("mongodb");

const url = 'mongodb+srv://teammates:hello@cluster0.4tguq.mongodb.net/DataExpress?retryWrites=true&w=majority';
const client = new MongoClient(url);

const dbName = 'DataExpress';
const db = client.db(dbName);
const collection = db.collection('People');

const makeHash = the_str => {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(the_str, salt, (err, my_hash) => {
            console.log('\nAsynchronous')
            console.log(salt);
            console.log(my_hash);
            hashComplete(my_hash);
        })
    });
};

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
    await client.connect();
    let person = {
        username: req.body.username,
        password: makeHash(req.body.password),
        email: req.body.email,
        age: req.body.age,
        question1: req.body.answer1,
        question2: req.body.answer2,
        question3: req.body.answer3
    };
    const insertResult = await collection.insertOne(person);
    client.close();
    console.log(req.body.name + ' added');
    res.redirect('/');
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
    await client.connect();
    const updateResult = await collection.updateOne(
        {_id:ObjectId(req.params.id)},
        {$set: {
            username: req.body.username,
            password: makeHash(req.body.password),
            email: req.body.email,
            age: req.body.age,
            question1: req.body.answer1,
            question2: req.body.answer2,
            question3: req.body.answer3
        }}
    );
    client.close();
    res.redirect('/');
};

exports.delete = async (req, res) =>{
    await client.connect();
    const deleteResult = await collection.deleteOne({_id: ObjectId(req.params.id)});
    client.close();
    res.redirect('/');
}

exports.details = async (req, res) =>{
    await client.connect();
    const filteredDocs = await collection.findOne({_id: ObjectId(req.params.id)});
    client.close();
    res.render('details', {
        title: filteredDocs.name + "'s Details",
        person: filteredDocs
    });
}