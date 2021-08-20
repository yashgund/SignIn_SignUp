const express = require('express');
const path = require('path');
const CookieParser = require('cookie-parser')
const mongoose = require('mongoose');
const bp = require('body-parser');
const flash = require('connect-flash');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const passport = require('passport');
let localhost = process.env.PORT || 3000;
let USER = require('./models/user');

const { forwardAuthenticated, ensureAuthenticated } = require('./models/auth');

//mongoose and node database connection
mongoose.connect('mongodb+srv://Yash:adminportal@cluster0.1clzk.mongodb.net/login_logout', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.once('open', () => {
  console.log('Connected to Database');
});
//error check
db.on('err', () => {
  console.log(err);
});

//bringing the schema in
let User = require('./models/user');
const cookieParser = require('cookie-parser');
const app = express();

//passport configuration
require('./models/passport')(passport); 




app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
//for static files
app.use(express.static(__dirname + '/public'));



//body-parser set up
app.use(express.urlencoded({ extended: false }))
app.use(bp.json());


// Express Session Middleware
app.use(session({
  secret: 'keyboard cat',
  resave: true,
  saveUninitialized: true,
  // cookie: { maxAge: 60000 }
}));

//passport Middleware
app.use(passport.initialize());
app.use(passport.session());

app.use(flash());

//global variables for flash messages
app.use((req,res,next)=>{
  res.locals.success_msg = req.flash('success_msg');
  res.locals.error_msg = req.flash('error_msg');
  res.locals.error= req.flash('error');
  next();
})


// GET requests
app.get('/register', forwardAuthenticated,  (req, res) => {
  res.render('register');
})
app.get('/', ensureAuthenticated,  (req, res) => {
  res.render('index');
})

app.get('/login', forwardAuthenticated, (req, res) => {
  const errors = req.flash().error || [];
  res.render('login' , {errors});
})

app.get('/logout', (req,res)=>{
  req.logOut();
  res.redirect('/login');
} )

//POST requests
app.post('/register', (req, res) => {

  const { name, email, password } = req.body;
  

  USER.findOne({ email: email }).then(
    user => {
      if (user) {
        req.flash('error_msg', 'User already exists');
        res.redirect('/register');
        console.log('User already exist, try logging in');
        

      }
      else {
        let Rtr = new USER(req.body);
        var salt = bcrypt.genSaltSync(10);                                              //hashing the inpt password before saving
        Rtr.password = bcrypt.hashSync(Rtr.password, salt);

        Rtr.save()
          .then(user => {
            res.redirect('/login');
            req.flash('success_msg', 'You can now login');
            console.log('Data saved');

          })
          .catch(err => {
            console.log(err);
          })

      }
    }
  )
});

app.post('/login',
  passport.authenticate('local', { failureFlash:true,failureRedirect: '/login' }),
  function (req, res,next) {
    res.redirect('/');
  });



app.listen(localhost, () => {
  console.log(`listening at port ${localhost}`);
})
