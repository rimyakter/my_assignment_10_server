const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.bzeuzal.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();
    const roommatesCollection = client.db("RoommateDB").collection("roommates");
    const usersCollection = client.db("RoommateDB").collection("users");

    // app.get("/roommates", async (req, res) => {
    //   const result = await roommatesCollection.find().toArray();
    //   res.send(result);
    // });

    // Home page (only 6 available)
    app.get("/roommates", async (req, res) => {
      const result = await roommatesCollection
        .find({ availability: "yes" })
        .limit(6)
        .toArray();
      res.send(result);
    });

    // All available roommates
    app.get("/roommates/browse-listing", async (req, res) => {
      const result = await roommatesCollection.find().toArray();
      res.send(result);
    });

    //Insert or Add Roommates
    app.post("/roommates", async (req, res) => {
      const newRoommate = req.body;
      console.log(newRoommate);
      const result = await roommatesCollection.insertOne(newRoommate);
      res.send(result);
    });

    //Detail of Single Roommates
    app.get("/roommates/browse-listing/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await roommatesCollection.findOne(query);

      res.send(result);
    });

    //User related API Information
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find().toArray();
      res.send(result);
    });

    app.post("/users", async (req, res) => {
      const usersProfile = req.body;
      console.log(usersProfile);
      const result = await usersCollection.insertOne(usersProfile);
      res.send(result);
    });

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCollection.deleteOne(query);
      res.send(result);
    });

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

//middleware
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Welcome to assignment 10");
});

app.listen(port, () => {
  console.log(`my_assignment_10 app listening on port ${port}`);
});
