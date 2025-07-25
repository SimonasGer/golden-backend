const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const app = require("./app");
const pool = require("./db");
const port = process.env.PORT || 8080;

// Test the connection
pool.connect()
    .then(client => {
        console.log("Connected to PostgreSQL (Neon)");
        client.release(); // release the client back to the pool
    })
    .catch(err => {
        console.error("PostgreSQL connection error:", err.stack);
});

// Start the server
app.listen(port, () => {
    console.log(`Express started; see http://localhost:${port}/`);
});