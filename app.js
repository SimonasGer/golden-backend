const express = require("express")
const app = express()
const cors = require("cors")
const userRoutes = require("./routes/userRoutes")
const postRouter = require("./routes/mercRoutes")
app.use(express.json());
app.use(cors());

app.use("/users", userRoutes)
app.use("/posts", postRouter)

module.exports = app;
