const express = require("express");
const path = require("path");
const PORT = process.env.PORT || 3001;
const app = express();
const mongoose = require("mongoose");
const passport = require("./config/passport");
const session = require("express-session");
const isAuth = require("./config/isAuth");

app.use(session({ secret: "calen", resave: true, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

const db = require("./models");
mongoose.connect("mongodb://localhost/calen", {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	useCreateIndex: true
});

// Define middleware here
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Serve up static assets (usually on heroku)
if (process.env.NODE_ENV === "production") {
	app.use(express.static("client/build"));
}

// Define API routes here
app.post("/api/login", passport.authenticate("local"), function (req, res) {
	res.json(req.user);
});

app.post("/api/createUser", async (req, res) => {
	await db.User.create(req.body).catch(err => {
		res.status(409).json(err);
	});
	res.redirect(307, "/api/login");
});

app.post("/api/newTask", isAuth, async (req, res) => {
	const newTask = await db.Task.create(req.body).catch(err => {
		res.status(422).json(err);
	});
	const user = await db.User.findById(req.user._id);
	user.tasks.push(newTask._id);
	await user.save();
	res.json(newTask);
});

app.get("/api/myTasks", isAuth, async (req, res) => {
	const loggedUser = await db.User.findById(req.user._id).populate("tasks");
	res.json(loggedUser);
});

app.get("/api/myTasks/:month/:year", async (req, res) => {
	const loggedUser = await db.User.findById(
		req.user._id
	).populate({
		path: "tasks",
		match: {
			date: {
				"$gte": new Date(req.params.year, req.params.month, 1),
				"$lte": new Date(req.params.year, req.params.month + 1, 0)
			}
		}
	}).catch((err) => {
		res.status(400).json(err);
	});
	res.json(loggedUser);
});
// Send every other request to the React app
// Define any API routes before this runs
app.get("*", (req, res) => {
	res.sendFile(path.join(__dirname, "./client/build/index.html"));
});

app.listen(PORT, () => {
	console.log(`🌎 ==> API server now on port ${PORT}!`);
});
