const {MongoClient, ObjectId} = require("mongodb");

const url = 'mongodb+srv://bestTeam:bestTeamPass@cluster0.gduyu.mongodb.net/myData?retryWrites=true&w=majority';
//const url = 'mongodb+srv://jojohnson:republic1776@cluster0.4tguq.mongodb.net/myData?retryWrites=true&w=majority';
// const url = 'mongodb://localhost:27017';
const client = new MongoClient(url);

const dbName = 'myData';
const db = client.db(dbName);
const collection = db.collection('People');

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
        title: 'Add Person'
    });
}

exports.createPerson = async (req, res) => {
    await client.connect();
    let person = {
        name: req.body.name,
        age: req.body.age,
        species: req.body.species,
        image: req.body.image
    };
    const insertResult = await collection.insertOne(person);
    client.close();
    console.log(req.body.name + ' added');
    res.redirect('/');
}

exports.edit = async (req, res) =>{
    await client.connect();
    const filterDocs = await collection.find(ObjectId(req.params.id)).toArray();
    client.close();
    res.render('edit', {
        title:'Edit Person',
        person: filterDocs[0]
    });
};

exports.editPerson = async (req, res) =>{
    await client.connect();
    const updateResult = await collection.updateOne(
        {_id:ObjectId(req.params.id)},
        {$set: {
            name: req.body.name,
            age: req.body.age,
            species: req.body.species,
            image: req.body.image
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