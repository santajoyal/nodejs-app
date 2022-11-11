const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const app = express();
const dotenv = require("dotenv").config()
// const URL = "mongodb://localhost:27017";
const URL = process.env.DB;
//dont use @ symbol in password
app.use(
  cors({
    // origin: "http://localhost:3000",
    origin: "https://spiffy-hotteok-37aa4a.netlify.app",
  })
);

app.use(express.json());
let products = [];

//create
app.post("/product", async (req, res) => {
  try {
    //connect the database
    const connection = await mongoclient.connect(URL);

    //select the db
    const db = connection.db("b39wd2");

    //select the collection
    //do operation (CRUD)
    const product = await db.collection("products").insertOne(req.body);

    //close the connection
    await connection.close();

    res.json({ meassage: "product created", id: product.insertedId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ meassage: "something went wrong" });
  }
});

//read
app.get("/products", async (req, res) => {
  try {
    //connect the database
    const connection = await mongoclient.connect(URL);

    //select the db
    const db = connection.db("b39wd2");

    //select the collection
    //do operation(CRUD)
    const product = await db.collection("products").find({}).toArray();

    //close the connection
    await connection.close();

    res.json(product);
  } catch (error) {
    console.log(error);
    res.status(500).json({ meassage: "something went wrong" });
  }
});

//URL parameter
app.put("/product/:productId", async (req, res) => {
  try {
    //connect the database
    const connection = await mongoclient.connect(URL);

    //select the db
    const db = connection.db("b39wd2");

    const productdata = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.params.productId) });

    if (productdata) {
      //select the collection
      //do operation(CRUD)
        delete req.body._id
      const product = await db
        .collection("products")
        .updateOne(
          { _id: mongodb.ObjectId(req.params.productId) },
          {$set:req.body}
        );

      //close the connection
      await connection.close();

      res.json(product);
    } else {
      res.status(404).json({ message: "product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ meassage: "something went wrong" });
  }
});

app.get("/product/:productId", async (req, res) => {
  try {
    //connect the database
    const connection = await mongoclient.connect(URL);

    //select the db
    const db = connection.db("b39wd2");

    //select the collection
    //do operation(CRUD)
    const product = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.params.productId) });

    //close the connection
    await connection.close();

    res.json(product);
    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ meassage: "something went wrong" });
  }
});

app.delete("/product/:productId", async (req, res) => {
  try {
    //connect the database
    const connection = await mongoclient.connect(URL);

    //select the db
    const db = connection.db("b39wd2");

    const productdata = await db
      .collection("products")
      .findOne({ _id: mongodb.ObjectId(req.params.productId) });

    if (productdata) {
      //select the collection
      //do operation(CRUD)
      const product = await db
        .collection("products")
        .deleteOne({ _id: mongodb.ObjectId(req.params.productId) });

      //close the connection
      await connection.close();
      res.json(product);
    } else {
      res.status(404).json({ message: "product not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ meassage: "something went wrong" });
  }
});

app.listen(process.env.PORT || 3004);
