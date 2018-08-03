'use strict';
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var logger = require('morgan');
//var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var clientsRouter = require('./routes/routes');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var util = require('util');
var bunyan = require('bunyan');
var config = require('./config');
var compression = require('compression');
var helmet = require('helmet');

// Start QuickStart here

//var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;

var log = bunyan.createLogger({
    name: 'Microsoft OIDC Example Web Application'
});


var app = express();
app.use(compression()); //Compress all routes
app.use(helmet()); //use protection against vulnerabilities

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public'), {dotfiles: 'allow'}));

//app.use(methodOverride());
app.use(cookieParser());


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
