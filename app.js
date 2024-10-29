const express = require("express");
const app = express();
const cors = require("cors");
const userRoutes = require("./routes/userRoutes");
const postRouter = require("./routes/postRoutes");
const commentRouter = require("./routes/commentRoutes");
const categoryRouter = require("./routes/categoryRoutes")
app.use(express.json());
app.use(cors());

app.use("/users", userRoutes);
app.use("/posts", postRouter)
app.use("/comments", commentRouter)
app.use("/categories", categoryRouter)

module.exports = app;
