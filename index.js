require("dotenv").config();
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const router = require("./router/index");
const errorMiddleware = require("./middlewares/error-middleware");
const {createConnection} = require("./dbConnection");
const path = require("path");

const port = process.env.PORT || 5000;
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({
	credentials: true,
	origin: process.env.CLIENT_URL
}));
app.use("", router);
app.use("/static", express.static(path.resolve(__dirname, "static")));
app.use(errorMiddleware);

const start = async () => {
	try{
		await createConnection();
		app.listen(port, () => {
			console.log(`Server is running on port ${port}`);
		});
	}catch (e){
		console.log(e)
	}
}

start();






