const express = require("express");
const bodyParser = require("body-parser"); /* deprecated */
const cors = require("cors");

const app = express();

// var corsOptions = {
//   origin: "http://localhost:4200"
// };

app.use(cors());

// app.use(bodyParser.json({limit: '0.650mb'}));

app.use(bodyParser.json({limit: '10mb'}));
app.use(bodyParser.urlencoded({limit: '10mb', extended: true}));

app.use('/images', express.static('images'));  

// parse requests of content-type - application/json
app.use(express.json());  /* bodyParser.json() is deprecated */

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));   /* bodyParser.urlencoded() is deprecated */

const db = require("./app/models");
const Role = db.role;

db.mongoose.connect('mongodb://127.0.0.1:27017/travelbyrec_db', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
    .then(() => {
      console.log("Connected to the database!");
      initial();
    })
    .catch(err => {
      console.log("Cannot connect to the database!", err);
      process.exit();
    });


// simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to travelbyrec application." });
});

// routes
require("./app/routes/auth.routes")(app);
require("./app/routes/service.routes")(app);
require("./app/routes/category.routes")(app);
require("./app/routes/equipement.routes")(app);
require("./app/routes/logement.routes")(app);
require("./app/routes/contact.routes")(app);
require("./app/routes/reservation.routes")(app);
require("./app/routes/avis.routes")(app);
require("./app/routes/paiement.routes")(app);

// set port, listen for requests
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running.`);
});

function initial() {
  Role.collection.estimatedDocumentCount((err, count) => {
    if (!err && count === 0) {
      new Role({
        name: "user"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("add 'user' to roles collection");
      });

      new Role({
        name: "admin"
      }).save(err => {
        if (err) {
          console.log("error", err);
        }

        console.log("add 'admin' to roles collection");
      });
    }
  });
}

