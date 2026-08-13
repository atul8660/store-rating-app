const express = require("express");

const app = express();

const PORT = 5000;

// It is a middleware to understand json data
app.use(express.json());

app.get("/", (re,res) => {
    res.json({
        message: "Store Rating API is running"
    });
})

app.get("/api/health", (req,res) => {
    res.json({
        success: true,
        message: "API is healthy"
    });
});

app.listen(PORT, () =>{
    console.log(`Server is running on port ${PORT}`);
});