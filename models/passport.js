const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
// const flash = require('connect-flash');

// Load User model
const User = require('./user');

module.exports = function(passport) {
  passport.use(
    new LocalStrategy({ usernameField: 'email' , passwordField : 'password'}, (username, password, done) => {
      // console.log(username);
      // Match user
      User.findOne({
        email:username
      }).then(user => {
        if (!user) {
          return done(null, false, {message:'Email is not registered'});
        }

        // Match password
        bcrypt.compare(password, user.password, (err, isMatch) => {
          if (err) throw err;
          if (isMatch) {
            return done(null, user);
          } else {
            return done(null, false, {message:'Password incorrect'});
          }
        });
      });
    })
  );

  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};