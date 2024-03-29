const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { query } = require('express');
require('dotenv').config();
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send("Smart Tutor server is running!!!");
})


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.flsgo3q.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next){
    const authHeader = req.headers.authorization;
    if(!authHeader){
      res.send({massage: "Unauthorized Access"});
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN, function(err, decoded) {
      if(err){
        res.status(401).send(({massage: "Unauthorized Access"}))
      }
      req.decoded = decoded;
      next();
    })
}

async function run(){
  try {
    const serviceCollection = client.db('smartTutor').collection('services');
    const reviewCollection = client.db('smartTutor').collection('reviews');
    
    app.get('/services',async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = (await cursor.limit(3).toArray()).reverse();
      res.send(services);
    })
    app.get('/allservices',async (req, res) => {
      const query = {};
      const cursor = serviceCollection.find(query);
      const services = (await cursor.toArray()).reverse();
      res.send(services);
    })
    app.get('/service/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const service =await serviceCollection.findOne(query);
      res.send(service);
    })

    app.post('/reviews', async(req, res) => {
      const review = req.body;
      const result = await reviewCollection.insertOne(review);
      res.send(result);
    })
    
    app.post('/allservices', async(req, res) => {
      const service = req.body;
      const result = await serviceCollection.insertOne(service);
      res.send(result);
    })

    app.get('/reviews', async(req, res) => {
      // const verifyEmail = req.decoded.email;
      const email = req.query.email;
      if(email){
        let query = {userEmail: email};
        const cursor = reviewCollection.find(query);
        const reviews = (await cursor.toArray()).reverse();
        res.send(reviews);
      } else {
        res.status(403).send({message: "Forbidden Access"});
      }
    })

    app.get('/review/:id', async(req, res) => {
      const id = req.params.id;
      const query = { serviceId: id};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
    })

    app.get('/reviews/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const review = await reviewCollection.findOne(query);
      res.send(review);
    })

    app.patch('/update/:id', async(req, res) => {
      const id = req.params.id;
      const updateReview = req.body;
      const query = { _id: ObjectId(id)};
      const updateDoc = {
        $set : {
          massage : updateReview.review
        }
      }
      const result = await reviewCollection.updateOne(query, updateDoc);

      res.send(result);
    })


    app.post('/jwt', (req, res) => {
      const user = req.body;
      const token = jwt.sign(user, process.env.ACCESS_TOKEN, { expiresIn: '1hr'});
      res.send({token});
    })

    app.delete('/reviews/:id', async(req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id)};
      const result = await reviewCollection.deleteOne(query);
      res.send(result);
    })

  }

  finally{

  }
}
run().catch(error => console.error(error));



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});