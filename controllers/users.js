const User = require("../models/user");
// sign up form 
module.exports.renderSignupForm = (req, res) =>{
    res.render("users/signup.ejs");
};

// post route / signup route
module.exports.signup = async (req, res) =>{
    try{
        let {username, email, password} = req.body;
        const newUser = new User({email, username}); 
        const registerUser = await User.register(newUser, password);
        console.log(registerUser);
        req.login(registerUser, (err) =>{
            if(err){
               return next(); 
            }
        req.flash("success", "Welcome to Wanderlust!");
        res.redirect("/listings");
        });

    }catch(e){
        req.flash("error", e.message);
        res.redirect("/signup");
    }   
};

// render login form
module.exports.renderLoginForm = (req, res) =>{
    res.render("users/login.ejs");
};

// login route
module.exports.login = async(req, res) =>{
    req.flash("success", "Welcome to Wanderlust! You are logged in!");
    let redirectUrl = res.locals.redirectUrl || "/listings";
    res.redirect(redirectUrl);
};

// logout route
module.exports.logout = (req, res, next) =>{
    req.logout((err) =>{
        if(err) {
            return next(err);
        }
        req.flash("success", "you are logged out now");
        res.redirect("/listings");
    });
};
