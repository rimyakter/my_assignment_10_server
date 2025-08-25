const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const port = process.env.PORT || 5000;

//middleware
app.use(cors());
app.use(express.json());

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

    // Home page (only 6 limited post will appear)
    app.get("/roommates", async (req, res) => {
      try {
        const { email, limit } = req.query;

        let query = {};
        if (email) query.email = email; // filter by email if provided
        if (!email) query.availability = "yes"; // default for home page

        let cursor = roommatesCollection.find(query);

        if (limit) cursor = cursor.limit(parseInt(limit));

        const roommates = await cursor.toArray();
        res.send(roommates);
      } catch (err) {
        console.error(err);
        res.status(500).send({ error: "Server error" });
      }
    });

    // Delete roommate by ID
    app.delete("/roommates/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const query = { _id: new ObjectId(id) };
        const result = await roommatesCollection.deleteOne(query);

        res.send(result); // contains deletedCount
      } catch (error) {
        res.status(500).send({ message: "Error deleting roommate", error });
      }
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

    // Get single roommate by ID (for Update form)
    app.get("/roommates/:id", async (req, res) => {
      try {
        const id = req.params.id;
        if (!ObjectId.isValid(id)) {
          return res.status(400).send({ message: "Invalid ID" });
        }

        const query = { _id: new ObjectId(id) };
        const roommate = await roommatesCollection.findOne(query);

        if (!roommate) {
          return res.status(404).send({ message: "Roommate not found" });
        }

        res.send(roommate);
      } catch (err) {
        res
          .status(500)
          .send({ message: "Error fetching roommate", error: err });
      }
    });

    // ✅ Update by ID
    app.put("/roommates/:id", async (req, res) => {
      const id = req.params.id;
      const updatedData = req.body;
      const filter = { _id: new ObjectId(id) };
      const updateDoc = { $set: updatedData };
      const result = await roommatesCollection.updateOne(filter, updateDoc);
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

    //Like button API

    // PATCH /posts/:id/like
    app.patch("/roommates/:id/like", async (req, res) => {
      const { id } = req.params;
      const { userEmail } = req.body;

      try {
        const result = await roommatesCollection.updateOne(
          { _id: new ObjectId(id) },
          { $inc: { likes: 1 } } // creates `likes` if not exist
        );

        res.send({ success: true, result });
      } catch (error) {
        res.status(500).send({ error: "Failed to like post and increment" });
      }
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

app.get("/", (req, res) => {
  res.send("Welcome to assignment 10");
});

app.listen(port, () => {
  console.log(`my_assignment_10 app listening on port ${port}`);
});
