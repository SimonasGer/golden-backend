const express = require("express")
const app = express()
const cors = require("cors")
const userRoutes = require("./routes/userRoutes")
const mercRouter = require("./routes/mercRoutes")
const missionRouter = require("./routes/missionRoutes")
app.use(express.json());

app.use(cors({
  origin: ["http://localhost:3000", "https://golden-scorpion.vercel.app"]
}));


app.use("/users", userRoutes)
app.use("/mercs", mercRouter)
app.use("/missions", missionRouter)

module.exports = app;
