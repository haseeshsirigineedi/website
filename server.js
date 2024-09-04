var express = require('express');
const app = express();
var passwordHash = require("password-hash");
const bodyParser = require('body-parser')
app.use(bodyParser.json());

app.use(bodyParser.urlencoded({extended: false}));


app.use(express.static("public"));
const port = 8000;
const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore, Filter} = require('firebase-admin/firestore');
const products = [
                    { name: "Product 1", price: 10.99, image: "product1.jpg" },
                    { name: "Product 2", price: 19.99, image: "product2.jpg" },
                    // Add more products as needed
                ];

                var serviceAccount = require("./key.json");

                initializeApp({
                  credential: cert(serviceAccount)
                });

                const db = getFirestore();
                app.set("view engine", "ejs");

                app.get("/", (req,res) => {
                    res.render('main');
                })

                app.get("/signin", (req,res) => {
                    res.render('signin');
                })





    app.post("/signupsubmit", function(req, res) {
        console.log(req.body);
        db.collection("users")
            .where(
                Filter.or(
                    Filter.where("email", "==", req.body.email),
                    Filter.where("username", "==", req.body.username)
                )
            )
            .get()
            .then((docs) => {
                if (docs.size > 0) {
                    res.send("Hey, this account already exists with the email and username.");
                } else {
                    db.collection("users")
                        .add({
                            username: req.body.username,
                            email: req.body.email,
                            password: passwordHash.generate(req.body.password),
                        })
                        .then(() => {
                            // // Specify the correct file path to your "signin" page
                            // res.sendFile(__dirname + "/views/signin");

                            // const filePath = path.join(__dirname, "views", "signin");
                            // res.sendFile(filePath);
                            res.redirect("/signin");
                        })
                        .catch(() => {
                            res.send("Something Went Wrong");
                        });
                }
            });
    });

    app.post("/signinsubmit", (req, res) => {
        const email = req.body.email;
        const password = req.body.password;
        console.log(email)
        console.log(password)
      
        db.collection("users")
          .where("email", "==", email)
          .get()
          .then((docs) => {
            if (docs.empty) {
              res.send("User not found");
            } else {
              let verified = false;
              docs.forEach((doc) => {
                verified = passwordHash.verify(password, doc.data().password);
              });
              if (verified) {
                res.redirect('/dashboard1');
              } else {
                res.send("Authentication failed");
              }
            }
          })
          .catch((error) => {
            console.error("Error querying Firestore:", error);
            res.send("Something went wrong.");
          });
      });



                app.get("/signup", (req, res) => {
                    res.render('signup'); 
                });

                  const userData = [];


                app.get("/products", (req, res) => {
                    res.render('products'); 
                });
                const cart = []; // Initialize an empty cart array to store products

                app.post("/addToCart", (req, res) => {
                    const productId = req.body.productId; // Get the product ID from the request
                    // Find the product in your products array based on the ID
                    const product = products.find((p) => p.id === productId);
                    if (product) {
                      cart.push(product); // Add the product to the cart array
                      res.send("Product added to the cart.");
                    } else {
                      res.status(404).send("Product not found.");
                    }
                  });

                app.get("/main", (req, res) => {
                    res.render('main'); 
                });
                app.get("/dashboard1", (req, res) => {
                    res.render('dashboard1'); 
                });
                app.get('/cart', (req, res) => {
                    res.render('cart'); 
                });
                app.get("/account", (req, res) => {
                    res.render('account');
                })


                app.listen(port, () => {
                    console.log(`Server is running on port ${port}`);
                });