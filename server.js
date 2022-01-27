const express = require("express");
const { MongoClient } = require("mongodb");
const cors = require("cors");
const ObjectId = require("mongodb").ObjectId;

require("dotenv").config();
const fileupload = require("express-fileupload");
const port = process.env.PORT || 5000;

const app = express();
//middleware
app.use(cors());
app.use(express.json());
app.use(fileupload());

//database
const uri = `mongodb+srv://droneShop:lMOWCEwvJUM8FyXa@cluster0.hoxgz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const run = async () => {
  try {
    await client.connect();
    const database = client.db("Travel_Agency");
    const BlogsCollection = database.collection("Blogs");
    const reviewsCollection = database.collection("Reviews");
    const usersCollection = database.collection("Users");

    // blogs
    app.get("/blogs", async (req, res) => {
      const result = await BlogsCollection.find({}).toArray();
      res.send(result);
    });
    app.get("/blogs/status", async (req, res) => {
      const query = { status: "pending" };
      const result = await BlogsCollection.find(query).toArray();
      res.send(result);
    });
    app.get("/blogs/edit/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: ObjectId(id) };
      const result = await BlogsCollection.findOne(query);
      res.send(result);
    });
    app.get("/blogs/:email", async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const result = await BlogsCollection.find(query).toArray();
      res.send(result);
    });
    app.post("/blogs", async (req, res) => {
      //   console.log(req.body);
      const blog = req.body;
      const title = blog.title;
      const description = blog.description;
      const status = blog.status;
      const date = blog.date;
      const email = blog.email;
      const author = blog.author;
      const authorImg = blog.authorImg;

      const image = req.files.image;
      const imgBase64 = image.data.toString("base64");
      const bufferedImg = Buffer.from(imgBase64, "base64");

      const doc = {
        title,
        description,
        status,
        date,
        email,
        author,
        authorImg,
        img: bufferedImg,
      };
      const result = await BlogsCollection.insertOne(doc);
      res.json(result);
      //   res.json({ messafe: "hello" });
    });

    app.put("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      console.log("cekied");

      const blog = req.body;
      const title = blog.title;
      const description = blog.description;
      const status = blog.status;
      const date = blog.date;
      const email = blog.email;
      const author = blog.author;
      const authorImg = blog.authorImg;

      const image = req.files.image;
      const imgBase64 = image.data.toString("base64");
      const bufferedImg = Buffer.from(imgBase64, "base64");

      const doc = {
        title,
        description,
        status,
        date,
        email,
        author,
        authorImg,
        img: bufferedImg,
      };
      const filter = { _id: ObjectId(id) };
      const updatedDoc = { $set: doc };
      const result = await BlogsCollection.updateOne(filter, updatedDoc);
      res.json(result);
    });

    app.put("/blogs", async (req, res) => {
      const doc = req.body;
      const id = doc._id;
      const filter = { _id: ObjectId(id) };
      const updateDoc = {
        $set: {
          status: doc.status,
        },
      };
      const result = await BlogsCollection.updateOne(filter, updateDoc);
      res.json(result);
    });
    //delete blogs using id
    app.delete("/blogs/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: ObjectId(id) };
      const result = await BlogsCollection.deleteOne(filter);
      res.json(result);
    });

    //users
    app.get("/users", async (req, res) => {
      const result = await usersCollection.find({}).toArray();
      res.send(result);
    });
    //check admin
    app.get("/users/:email", async (req, res) => {
      const email = req.params.email;
      const filter = { email: email };
      const user = await usersCollection.findOne(filter);
      // console.log(user.role);
      let admin;
      if (user?.role === "admin") {
        admin = true;
      } else {
        admin = false;
      }
      res.json({ isAdmin: admin });
    });
    app.post("/users", async (req, res) => {
      const doc = req.body;
      console.log(doc);
      const result = await usersCollection.insertOne(doc);
      res.json(result);
    });
    app.put("/users", async (req, res) => {
      const user = req.body;
      // console.log(user);
      const query = { email: user?.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(query, updateDoc, options);
      res.json(result);
    });
    //make admin
    app.put("/users/:email", async (req, res) => {
      const email = req.params.email;

      const query = { email: email };
      const doc = { $set: { role: "admin" } };
      const result = await usersCollection.updateOne(query, doc);
      res.json(result);
    });

    //Review
    app.get("/reviews", async (req, res) => {
      res.send("from review");
    });
    app.post("/reviews", async (req, res) => {
      const reviewDoc = req.body;
      const result = await reviewsCollection.insertOne(reviewDoc);
      res.json(result);
    });
  } finally {
    // await client.close();
  }
};
run().catch(console.dir);

//home page
app.get("/", (req, res) => {
  res.send("Travel Agency Server is Running.....");
});
app.listen(port, () => {
  console.log("running on ", port);
});
