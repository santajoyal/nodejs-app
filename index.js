const express = require("express");
const cors = require("cors");
const mongodb = require("mongodb");
const mongoclient = mongodb.MongoClient;
const app = express();
const dotenv = require("dotenv").config();
// const URL = "mongodb://localhost:27017";
const URL = process.env.DB;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const jwt_secret = process.env.jwt_secret;
//dont use @ symbol in password

//middleware
app.use(
  cors({
    // origin: "http://localhost:3000",
    origin: "https://spiffy-hotteok-37aa4a.netlify.app",
    // origin: "*",
  })
);

app.use(express.json());

let authorize = (req,res,next)=>{
    try {
      //middleware
     //check if authorization token present
     console.log(req.headers);
     if (req.headers.authorization) {
       //check if the token is valid
       let decodedtoken = jwt.verify(req.headers.authorization, jwt_secret);
       if (decodedtoken) {
         next();
       } else {
         res.status(401).json({ message: "unauthorized" });
       }
       //if valid say next()
       //if not valid say unauthorized
     }
    } catch (error) {
     res.status(401).json({ message: "unauthorized" });
    }
  };
    
  

let products = [];

app.post("/user/register", async (req, res) => {
  try {
    //connect the database
    const connection = await mongoclient.connect(URL);

    //select the db
    const db = connection.db("b39wd2");

    //hash the password
    var salt = await bcrypt.genSalt(10);
    var hash = await bcrypt.hash(req.body.password, salt);
    req.body.password = hash;
    //select the collection
    //do operation (CRUD)
    const user = await db.collection("users").insertOne(req.body);

    //close the connection
    await connection.close();

    res.json({ meassage: "product created" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "something went wrong" });
  }
});

app.post("/user/login", async (req, res) => {
  try {
    //connect the database
    const connection = await mongoclient.connect(URL);

    //select the db
    const db = connection.db("b39wd2");

    const user = db.collection("users").findOne({ email: req.body.email });

    if (user) {
      const compare = await bcrypt.compare(req.body.password, user.password);
      if (compare) {
        //issue token
        const token = jwt.sign({ _id: user._id }, jwt_secret, {
          expiresIn: "2m",
        });
        res.json({ message: "sucess", token });
      } else {
        res.json({ message: "incorrect username/password" });
      }
    } else {
      res.status(404).json({ message: "incorrect username/password" });
    }
  } catch (error) {}
});

//create
app.post(
  "/product",
  // (req, res, next) => {
  //  try {
  //    //middleware
  //   //check if authorization token present
  //   console.log(req.headers);
  //   if (req.headers.authorization) {
  //     //check if the token is valid
  //     let decodedtoken = jwt.verify(req.headers.authorization, jwt_secret);
  //     if (decodedtoken) {
  //       next();
  //     } else {
  //       res.status(401).json({ message: "unauthorized" });
  //     }
  //     //if valid say next()
  //     //if not valid say unauthorized
  //   }
  //  } catch (error) {
  //   res.status(401).json({ message: "unauthorized" });
  //  }
  //   res.status(401).json({ message: "unauthorized" });
  // },
  authorize,
  async (req, res) => {
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
  }
);

//read
app.get("/products",authorize, async (req, res) => {
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
app.put("/product/:productId",authorize, async (req, res) => {
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
      delete req.body._id;
      const product = await db
        .collection("products")
        .updateOne(
          { _id: mongodb.ObjectId(req.params.productId) },
          { $set: req.body }
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

app.get("/product/:productId",authorize, async (req, res) => {
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

app.delete("/product/:productId",authorize, async (req, res) => {
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
