const express = require('express');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const cors = require('cors');
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

    app.get('/reviews',async(req, res) => {
      let query = {};
      if(req.query.email){
        query = { userEmail: req.query.email};
      }
      const cursor = reviewCollection.find(query);
      const reviews = (await cursor.toArray()).reverse();
      res.send(reviews);
    })

    app.get('/review/:id', async(req, res) => {
      const id = req.params.id;
      const query = { serviceId: id};
      const cursor = reviewCollection.find(query);
      const reviews = await cursor.toArray();
      res.send(reviews);
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