const app = require("./app");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config({path: "./config.env"});
const port = process.env.PORT;
const DB = process.env.DATABASE.replace("<password>", process.env.DATABASE_PASSWORD);

mongoose
    .connect(DB)
    .then((con) => {
        console.log("Connected");
    })
    .catch((err) => {
        console.log(err);
    });

app.listen(port, () => {
    console.log("Express started; see http://localhost:8080/");
});


