require('dotenv').config();

let accountDatabase = null

const express = require("express"),
      cookie  = require( 'cookie-session' ),
      { MongoClient, ObjectId } = require("mongodb"),
      app = express()

app.use( express.urlencoded({ extended:true }) )

app.use( cookie({
  name: 'session',
  keys: ['key1', 'key2']
}))


app.post( '/login', async (req,res)=> {
  // console.log("hi")
  // express.urlencoded will put your key value pairs 
  // into an object, where the key is the name of each
  // form field and the value is whatever the user entered
  console.log( req.body )
  let u = req.body.username;
  let p = req.body.password;
  const collectionD = await client.db("Journals").collection("Accounts");
  const account = await collectionD.findOne({username: u, password: p});
  const onlyUsername = await collectionD.findOne({username: u});

  if(account) {
    req.session.login = true
    res.redirect( 'loggedIn.html' )
    accountDatabase = u
    collectionJD = await client.db("Journals").collection(accountDatabase)
    console.log("hi")
  }
  if(onlyUsername && !account)
  {
    //print wrong password
  }
  else
  {
    const newAccount = { username: u, password: p };
    await collectionD.insertOne(newAccount);
    client.db("Journals").createCollection(u) 
    //say account created login again

  }

  // else{
    
  //   res.sendFile( __dirname + '/public/index.html' )
  // }
 
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

let collectionJD = null

async function run() {
  await client.connect()
  collectionJD = await client.db("Journals").collection(accountDatabase)
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
  res.json( result )
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



// app.post("/login", async (req, res) => {
  
//   let username = req.body.enteredUsername;
//   let password = req.body.enteredPassword;

//   const collection = await client.db("Journals").collection("Accounts");
//   const account = await collection.findOne({ username, password });
//   if (account)
//   {
//     accountDatabase = username;
//     // window.location.href = '/loggedIn.html';
//     res.redirect('/loggedIn.html');
//   }
//   else{
//     if(await collection.findOne({ username})) {
//       //say cannot create an account
//  }
//     else{
//       const newAccount = { username, password };
//       await collection.insertOne(newAccount);
//       client.db("Journals").createCollection(username)
//       res.json(account); //MIGHT NEED
//       //say account created login again
//     }
//   }
// })




app.listen(3000)