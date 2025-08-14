if(process.env.NODE_ENV != "production"){ //until deployment
    require('dotenv').config();
}
// console.log(process.env.SECRET);
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const cors = require("cors");
const listingRouter = require("./routes/listingRoute.js");
const reviewsRouter = require("./routes/reviewRoute.js");
const userRouter = require("./routes/userRoute.js");
const dbUrl = process.env.ATLASDB_URL;

const session = require("express-session");
const MongoStore = require('connect-mongo');
const flash = require('connect-flash');
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User =  require("./models/user.js");
const multer = require('multer');


main()
    .then(() =>{
        console.log("connected to DB");
    })
    .catch((err) =>{
        console.log(err);
    });

//connected to mongodb
async function main(){
    await mongoose.connect(dbUrl);
}
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.engine("ejs", ejsMate);
app.use(express.static(path.join(__dirname, "/public")));
app.use(cors());


const store = MongoStore.create({
    mongoUrl: dbUrl,
    crypto:{
        secret: process.env.SECRET,
    },
    touchAfter: 24*3600,
});

store.on("error", () =>{
    console.log("ERROR in MONGO SESSION STORE", err);
});

const sessionOptions = {
    store,
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: true,
    cookie:{
        expires: Date.now() + 7 * 24 * 60 *60 * 1000, //one week //time added in the form of milisecs
        maxAge: 7 * 24 * 60 * 60 * 1000,
        httpOnly: true,
    },
};

//basic route
// app.get("/", (req, res) =>{
//     res.send("Hi i am root");
// });


app.use(session(sessionOptions));
app.use(flash());


// initializing passport 
// all the passport implementation is done here
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req, res, next) =>{
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currUser = req.user;
    // req.locals.redirectUrl
    next();
});

// demo user creation - passport
app.get("/demouser", async (req, res) =>{
    let fakeUser = new User({
        email: "student@gmail.com",
        username: "delta-student"
    });
    // to store the user
    let registeredUser = await User.register(fakeUser, "helloworld"); //helloworld is password
    res.send(registeredUser);
});
 

//using the routes here
app.use('/listings', listingRouter); //created seperate file in the routes folder
app.use("/listings/:id/reviews", reviewsRouter); //created seperate file in the routes folder
app.use("/", userRouter); //created seperate file in the routes folder

// now if any user on our site, is trying to visit any random route, which is not defined, then we are trying to send this page not found err
app.all("*", (req, res, next) =>{
    next(new ExpressError(404, "Page not found!"));
});

// createing a middeware
app.use((err, req, res, next) => {
    let {statusCode=500, message="Something went wrong!"} = err;
    res.status(statusCode).render("listings/error.ejs", { message });
});


app.listen(8080, () =>{
    console.log("server is listening to port 8080");
});
