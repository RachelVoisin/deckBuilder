// DEPENDENCIES 

var express = require("express");
var app = express();

var bodyParser = require("body-parser"),
    mongoose = require("mongoose"),
    passport = require("passport"),
	LocalStrategy = require("passport-local");
	methodOverride = require("method-override"),
	flash = require("connect-flash"),
	dateFormat = require('dateformat'),
	sanitizer = require("express-sanitizer");
	
// MODELS
var User = require("./models/user"),
    Deck = require("./models/deck"),
	Card = require("./models/card");
	
var middleware = require("./middleware");

	
var seedDB = require("./seeds");
//seedDB();

// require routes files
var mtgRoutes = require("./routes/mtg"),
	wishlistRoutes = require("./routes/wishlist");


const PORT = process.env.PORT || 3000

//mongoose.connect("mongodb://localhost/juice_app");
mongoose.connect("mongodb://deckbuilder:mtg123@ds113648.mlab.com:13648/deckbuilder");
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static(__dirname + "/public")); // for a shortcut to the public folder
app.use(methodOverride("_method")); // for PUT and DELETE
app.use(flash());
app.use(sanitizer());


app.use(require("express-session")({
	secret: "Meet me in the city of Freesh Ava Cado",
	resave: false,
	saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser()); 


//middleware used on every route call 
app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.get("/", function(req, res){
	res.redirect("/mtg");
});

app.post("/register", function(req, res){
	if(req.body.password === req.body.password2){
		var newUser = new User({username: req.body.username});
		User.register(newUser, req.body.password, function(err, user){
			if(err){
				req.flash("error", err.message);
				res.redirect("/");
			}
			passport.authenticate("local")(req, res, function(){
				req.flash("success", "Account created! Welcome!");
				res.redirect("/");
			});
		});
	} else {
		req.flash("error", "Passwords don't match");
		res.redirect("/");
	}	
});

app.post("/login", passport.authenticate("local", 
	{
		successRedirect: "back",
		failureRedirect: "back",
		failureFlash: true,
		successFlash: "Login successful"
	}), function(req, res){		
});

app.get("/logout", function(req, res){
	req.logout();
	req.flash("success", "You have been successfully signed out.");
	res.redirect("/");
});

app.get("/user", middleware.isLoggedIn, function(req, res){ 
	var page = "user";
	res.render("users/index", {page: page});
});

app.put("/user/password", middleware.isLoggedIn, function(req, res){
	if(req.body.password === req.body.password2){
		req.flash("success", "I would change it if I could...");
		res.redirect("/user");
	} else {
		req.flash("error", "Passwords don't match");
		res.redirect("/user");
	}	
});

// app.use routes files
app.use(mtgRoutes);
app.use(wishlistRoutes);

app.listen(PORT, () => console.log(`Listening on ${ PORT }`));
	