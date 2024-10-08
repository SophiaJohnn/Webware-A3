require('dotenv').config();

let accountDatabase = null;
let collectionJD = null;

const express = require("express"),
      cookie  = require( 'cookie-session' ),
      hbs     = require( 'express-handlebars' ).engine,
      { MongoClient, ObjectId } = require("mongodb"),
      app = express()

app.engine( 'handlebars',  hbs() )
app.set(    'view engine', 'handlebars' )
app.set(    'views',       './views' )

app.use( express.urlencoded({ extended:true }) )

app.use( cookie({
  name: 'session',
  keys: ['key1', 'key2']
}))


app.post( '/login', async (req,res)=> {

  let u = req.body.username;
  let p = req.body.password;
  const collectionD = await client.db("Journals").collection("Accounts");
  const account = await collectionD.findOne({username: u, password: p});
  const onlyUsername = await collectionD.findOne({username: u});

  if(account) {
    req.session.login = true
    accountDatabase = u
    collectionJD = await client.db("Journals").collection(accountDatabase)
    res.redirect( 'loggedIn.html' )
  }
  if(onlyUsername && !account)
  {
    return res.render('LoginFailed', { msg:'Wrong Password Try Again', layout:false })
  }
  else if(!account)
  {
    const newAccount = { username: u, password: p };
    await collectionD.insertOne(newAccount);
    client.db("Journals").createCollection(u) 
    return res.render('AccountCreated', { msg:'Account Created Login Again', layout:false })

  }
 
})

// add some middleware that always sends unauthenicaetd users to the login page
app.use( function( req,res,next) {
  if( req.session.login === true )
    next()
  else
    res.sendFile( __dirname + '/public/index.html' )
})



app.use(express.static("public") )

app.use(express.json() )

const uri = `mongodb+srv://${process.env.USER}:${process.env.PASSWORD}@cluster0.vjt7o.mongodb.net/`
const client = new MongoClient( uri )

async function run() {
  await client.connect()
}

run()

app.use( (req,res,next) => {
  if( collectionJD !== null ) {
    next()
  }else{
    res.status( 503 ).send()
  }
})

 // route to get all docs
 app.get('/docs', async (req, res) => {
  console.log("CollectionJD:", collectionJD);
  if (collectionJD !== null) {
    const docs = await collectionJD.find({}).toArray()
    res.json( docs )
    console.log(docs)
  }
})

app.post( '/add', async (req,res) => {
  const result = await collectionJD.insertOne( req.body )
})

// assumes req.body takes form { _id:5d91fb30f3f81b282d7be0dd } etc.
app.post( '/remove', async (req,res) => { 
  console.log( req.body.deleteID)
  const result = await collectionJD.deleteOne({ 
    _id: new ObjectId(req.body.deleteID)
  })
  res.json( result )
})

app.post( '/update', async (req,res) => { 
  console.log(req.body.updateIDIdentifier)
  const result = await collectionJD.updateOne(
    { _id: new ObjectId( req.body.updateIDIdentifier)},

    { $set:
      { date: req.body.updateDate,
      entry: req.body.updateEntry,
      happiness: req.body.updateHappiness,
      motivation: req.body.updateMotivation,
      goodDay: req.body.updateGoodDay } 
    }
  )
  console.log(result)
  res.json( result )
})
app.listen(3000)