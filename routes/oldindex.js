var express = require('express');
var router = express.Router();
var app = express();
var cookieParser = require('cookie-parser');
var expressSession = require('express-session');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var passport = require('passport');
var util = require('util');
var config = require('../config');
//Install passport log in
var OIDCStrategy = require('passport-azure-ad').OIDCStrategy;
// add a logger
var bunyan = require('bunyan');
var log = bunyan.createLogger({
    name: 'Microsoft OIDC Example Web Application'
});
var path = require('path');
app.use(cookieParser());
// Use the OIDCStrategy within Passport. (Section 2)
//
//   Strategies in passport require a `validate` function that accepts
//   credentials (in this case, an OpenID identifier), and invokes a callback
//   with a user object.
app.use(express.static(path.join(__dirname, '/public'), {dotfiles: 'allow'}));
passport.use(new OIDCStrategy({
    identityMetadata: config.creds.identityMetadata,
    clientID: config.creds.clientID,
    responseType: config.creds.responseType,
    responseMode: config.creds.responseMode,
    redirectUrl: config.creds.redirectUrl,
    allowHttpForRedirectUrl: config.creds.allowHttpForRedirectUrl,
    clientSecret: config.creds.clientSecret,
    validateIssuer: config.creds.validateIssuer,
    isB2C: config.creds.isB2C,
    issuer: config.creds.issuer,
    passReqToCallback: config.creds.passReqToCallback,
    scope: config.creds.scope,
    loggingLevel: config.creds.loggingLevel,
    nonceLifetime: config.creds.nonceLifetime,
    nonceMaxAmount: config.creds.nonceMaxAmount,
    useCookieInsteadOfSession: config.creds.useCookieInsteadOfSession,
    cookieEncryptionKeys: config.creds.cookieEncryptionKeys,
    clockSkew: config.creds.clockSkew,

  //  callbackURL: config.creds.returnURL,
  //  realm: config.creds.realm,
  //  oidcIssuer: config.creds.issuer,
    skipUserProfile: false,

},
function(iss, sub, profile, accessToken, refreshToken, done) {
    if (!profile.email) {
    return done(new Error("No email found"), null);
    }
    // asynchronous verification, for effect...
    process.nextTick(function () {
    findByEmail(profile.email, function(err, user) {
        if (err) {
        return done(err);
        }
        if (!user) {
        // "Auto-registration"
        //users.push(profile);
        return done(null, 'NO-User');
        }
        return done(null, user);
    });
    });
}
));
// Passport session setup. (Section 2)

//   To support persistent sign-in sessions, Passport needs to be able to
//   serialize users into the session and deserialize them out of the session. Typically,
//   this is done simply by storing the user ID when serializing and finding
//   the user by ID when deserializing.
passport.serializeUser(function(user, done) {
    done(null, user.email);
});

passport.deserializeUser(function(id, done) {
    findByEmail(id, function (err, user) {
        done(err, user);
    });
});
//app.use(express.logger());
//app.use(express.methodOverride());

app.use(expressSession({ secret: 'keyboard cat', resave: true, saveUninitialized: false }));
app.use(bodyParser.urlencoded({ extended : true }));
// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());
app.use(passport.session());
//app.use(app.router)
// array to hold signed-in users
var users = [];

var findByEmail = function(email, fn) {
    for (var i = 0, len = users.length; i < len; i++) {
        var user = users[i];
        log.info('we are using user: ', user);
        if (user.email === email) {
            return fn(null, user);
        }
    }
    return fn(null, null);
}

// array to hold logged in users

var users = [];
var findByEmail = function(email, fn) {
  for (var i = 0, len = users.length; i < len; i++) {
    var user = users[i];
   log.info('we are using user: ', user);
    if (user.email === email) {
      return fn(null, user);
    }
  }
  return fn(null, null);
};

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Feb kliendirakendus' });
});

router.get('/login', function(req, res, next) {
      passport.authenticate('azuread-openidconnect',
        {
          response: res,                      // required
          resourceURL: config.resourceURL,    // optional. Provide a value if you want to specify the resource.
          customState: 'my_state',            // optional. Provide a value if you want to provide custom state value.
          failureRedirect: '/'
          }
      )(req, res, next);
    },
    function(req, res) {
      log.info('Login was called in the Sample');
      res.redirect('/');
});

    // Our Auth routes (section 3)

    // GET /auth/openid
    //   Use passport.authenticate() as route middleware to authenticate the
    //   request. The first step in OpenID authentication involves redirecting
    //   the user to their OpenID provider. After authenticating, the OpenID
    //   provider redirects the user back to this application at
    //   /auth/openid/return.
router.get('/auth/openid',
    passport.authenticate('azuread-openidconnect', { failureRedirect: '/login' }),
    function(req, res) {
        log.info('Authentication was called in the Sample');
        res.redirect('/');
    });

// GET /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user is redirected back to the
//   sign-in page. Otherwise, the primary route function is called,
//   which, in this example, redirects the user to the home page.
router.get('/auth/openid/return',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/login' }),
  function(req, res) {
    log.info('We received a return from AzureAD.');
    res.redirect('/');
  });

// POST /auth/openid/return
//   Use passport.authenticate() as route middleware to authenticate the
//   request. If authentication fails, the user is redirected back to the
//   sign-in page. Otherwise, the primary route function is called,
//   which, in this example, redirects the user to the home page.
router.post('/auth/openid/return',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/login' }),
  function(req, res) {
    log.info('We received a return from AzureAD.');
    res.redirect('/clients/customers/');
  });

router.get('/logout', function(req, res){
  req.logout();
  res.redirect('/');
});
/*
router.get('/api', passport.authenticate('oauth-bearer', { session: false }), (req, res, next) => {
  res.json({ message: 'Serveri vastus' });
  return next();
});
router.get('/sees', ensureAuthenticated, function(req, res, next) {
  res.json({ message: 'Serveri vastus' });
  return next();
});
*/
// Simple route middleware to ensure user is authenticated. (section 4)

//   Use this route middleware on any resource that needs to be protected. If
//   the request is authenticated (typically via a persistent sign-in session),
//   the request proceeds. Otherwise, the user is redirected to the
//   sign-in page.
function ensureAuthenticated(req, res, next) {
  if (req.isAuthenticated()) { return next(); }
  res.redirect('/')
}

module.exports = router;
