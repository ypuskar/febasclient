'use strict';
var createError = require('http-errors');
var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
//var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var clientsRouter = require('./routes/routes');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
var uuid = require('uuid');
var util = require('util');
var bunyan = require('bunyan');
var config = require('./config');
var compression = require('compression');
var helmet = require('helmet');

// Start QuickStart here

var log = bunyan.createLogger({
    name: 'FEB kliendid Web Application'
});


var app = express();

app.use(compression()); //Compress all routes
app.use(helmet()); //use protection against vulnerabilities

// authentication setup
var callback = (iss, sub, profile, accessToken, refreshToken, done) => {
  done(null, {
    profile,
    accessToken,
    refreshToken
  });
};
passport.use(new OIDCStrategy(config.creds, callback));

var users = {};
passport.serializeUser((user, done) => {
  var id = uuid.v4(); //random RFC4122 UUID
  users[id] = user;
  done(null, id);
});
passport.deserializeUser((id, done) => {
  const user = users[id];
  done(null, user);
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.use(favicon(path.join(__dirname, 'public', 'images', 'feb.png')));

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public'), {dotfiles: 'allow'}));

//app.use(methodOverride());
app.use(cookieParser());

// session middleware configuration
// see https://github.com/expressjs/session
app.use(session({
  secret: '12345QWERTY-SECRET',
  name: 'graphNodeCookie',
  resave: false,
  saveUninitialized: false,
  //cookie: {secure: true} // For development only
}));
app.use(passport.initialize());
app.use(passport.session());

app.get('/',  function(req, res) {
  res.redirect('/clients/customers/customers');
});

app.use('/users', usersRouter);
//app.use('/clients', clientsRouter);
//app.use('/clients/json', clientsRouter);
app.use('/clients/customers',  clientsRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
