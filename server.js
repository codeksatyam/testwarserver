const express = require("express");
const app = express();
require("./db/conn");
const port = 8009;
const cors = require("cors");
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const userRoutes = require("./Routes/router");

// CORS Configuration
app.use(cors({
    origin: ["http://localhost:3000", "https://test-war.netlify.app/"],
    credentials: true,
}));

// Handle preflight requests
app.options('*', cors());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

app.use(userRoutes);
app.use("/uploads", express.static("uploads"));

app.listen(port, () => {
    console.log(`Server started at port no: ${port}`);
});
