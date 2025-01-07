const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;
const regd_users = require('./router/auth_users.js').authenticated;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: false, saveUninitialized: true, cookie: { secure: false } }))

app.use("/customer/auth/*", function auth(req,res,next){
    //check if users is logged in and has valid access token
    if(req.session.authorization){
        let token = req.session.authorization['accessToken'];

        //verify JWT token
        jwt.verify(token, "access", (err, user) => {
            if(!err){
                req.user = user;
                next(); //proceed to the next middleware
            } else {
                return res.status(403).json({ message: "User not authenticated" });
            }
        });
    } else {
        return res.status(403).json({ message: "User not logged in"});
    }
});
 
const PORT =5000;



// Ensure that `/auth` is correctly prefixed
app.use('/auth', regd_users);
app.use("/customer", customer_routes);
app.use("/", genl_routes);
app.use(express.json());


app.listen(PORT,()=>console.log("Server is running"));
