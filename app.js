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
var async = require('async');
var helmet = require('helmet');
var graphHelper = require('./handlers/passportHelper.js');
var updateCustomer = require('./handlers/handlers.js').sp_id_json;
var createSPContract = require('./handlers/handlers.js').createSPContract;

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
  var user = users[id];
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

// session middleware configuration i
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
  res.render('index', {user: req.user});
  //res.redirect('/clients/customers/customers');
});
app.get('/clients',  function(req, res) {
  res.status(200).json({ message: 'Connected!' });
  //res.redirect('/clients/customers/customers');
});
// Authentication request.
app.get('/login',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    (req, res) => {
          accessToken=req.user.accessToken;
          return res.redirect('/clients/customers/customers');
      //res.redirect('/clients/customers/customers');
  });
// Authentication callback.
// After we have an access token, get user data and load the sendMail page.0
var aToken='';
var accessToken = '';
app.get('/token',
  passport.authenticate('azuread-openidconnect', { failureRedirect: '/' }),
    (req, res) => {
          accessToken=req.user.accessToken;
      //console.log(req);
      //console.log(req.user.accessToken);
      graphHelper.getUserData(req.user.accessToken, (err, user) => {
          if (!err) {

            //console.log('TOKEN CONTROL');
            //console.log(aToken);
          req.user.profile.displayName = user.body.displayName;
          req.user.profile.emails = [{ address: user.body.mail || user.body.userPrincipalName }];
          //res.redirect('/');
          return res.redirect('/clients/customers/customers');
        } else {
          renderError(err, res);
        }
      });
    });
//service updates MR_kliendid with Sharepoint Kliendileping ID using registrikood
app.get('/sp',
  function (req, res) {
  /*  if(!req.isAuthenticated()) {
                res.redirect('/token');
          }*/
          graphHelper.getGToken((err, response) => { //Get Graph access token
            if (!err) {

              aToken =  JSON.parse(response.text).access_token;
              //console.log('Token on '+aToken);
              var i,j=0;
              var nextlink = 'A';
              var vastus = [];
              var leping = [];
              var firma = [];
              //var firma = [];
              //console.log(nextlink);
              //get Sharepoint Firma ID and kliendileping ID from SP
              async.parallel({
                one: function (callback) {
                  var vast = rSPdata(aToken, 'Leping', nextlink, i, req,
                    res, vastus, (vastus) => {
                      leping = vastus; //kliendileping fields
                      //console.log('FN sees');
                      //console.log(leping[0]);
                      callback(null, vastus);
                      //console.log(vastus.length);
                  /*    var firmad = rFirma (aToken, req, res, vastus, j, (j) => {
                        console.log(vastus.length + ' firma update.....');
                        //töötav kood
                        for (var e=398; e < vastus.length; e++) {
                          if (vastus[e]["id"] != '' && vastus[e]["registrikood"] != '') {
                            updateCustomer( req, vastus[e]["id"],
                            vastus[e]["registrikood"]);
                          } //if
                          //console.log(vastus[e]["id"]+' '+vastus[e]["registrikood"]);
                        } //for*/
                        }, callback); //end callback and func

                }, //end one
                two: function (callback) {
                  var vastu = rSPdata1(aToken, 'Firma', nextlink, i, req,
                    res, firma, (firma) => {
                      callback(null, firma);
                  /*    var firmad = rFirma (aToken, req, res, vastus, j, (j) => {
                        console.log(vastus.length + ' firma update.....');
                        //töötav kood
                        for (var e=398; e < vastus.length; e++) {
                          if (vastus[e]["id"] != '' && vastus[e]["registrikood"] != '') {
                            updateCustomer( req, vastus[e]["id"],
                            vastus[e]["registrikood"]);
                          } //if
                          //console.log(vastus[e]["id"]+' '+vastus[e]["registrikood"]);
                        } //for*/
                      }, callback); //end callback and func

                }, //end two
              }, function(err, results) {
                  res.status(200).json("ALGUS - UUENDATAKSE "+vastus.length+" KIRJET");

                        //console.log(leping[0]);
                        var k = 0;
                        var t = 0;
                        var queryString = '';
                        var queryArray = [];

                      for (var e=0; e < leping.length; e++) {
                        var yksfirma = firma.filter(yks => yks.id == leping[e]["Firma_x0020_Nimi_x003a_RegistrikLookupId"]);
                        //console.log(leping[e]["Firma_x0020_Nimi_x003a_RegistrikLookupId"]);
                        if (yksfirma.length > 0) {
                        if (leping[e]["id"] != '' && yksfirma[0]["registrikood"] != '') {
                        //console.log(leping.length+' '+leping[e].id+' '+yksfirma[0].Registrikood);
                        queryString = queryString + "UPDATE MR_KLIENDID "+
                        "SET SP_ID = "+leping[e]["id"]+
                        ", SP_FIRMA_ID ="+leping[e]["Firma_x0020_Nimi_x003a_RegistrikLookupId"]+
                        " WHERE reg_nr = '" + yksfirma[0].Registrikood+"'; \n";
                          /*updateCustomer( req, leping[e]["id"],
                          yksfirma[0].Registrikood);*/
                          if (k == 100) { //make patches to lower DB requests
                            t++;
                            console.log('UPDATE NR '+ t);
                            //updateCustomer( req, queryString);
                            queryArray.push(queryString);
                            k=0;
                            queryString = '';
                          }
                          k++;
                        } //if
                      }
                      } //for
                        console.log('UPDATE NR '+ (t=t+1));
                        queryArray.push(queryString);
                        async.eachLimit(queryArray, 8,
                          function(qstring, callback){
                          updateCustomer( req, qstring, () => {
                            callback();
                          });
                        });
                        //updateCustomer( req, queryString);
                        //console.log(results.two[0]);
                        return;
              }); //parallel end
            //}); //firma

          } else {
            renderError(err, res);
          }
        });
}); //get
//recurssively receives Kliendileping records from sharepoint using MS Graph REST
var rSPdata = function recursiveSPdata (aToken, valik, nextlink, i,
  reqOrig, resOrig, vastus, callback1) {

  i = i || 0;
  vastus = vastus || {};
  //console.log(res1);
  graphHelper.getSPData(aToken, valik, nextlink, reqOrig, resOrig,
    (err, response, reqOrig, resOrig) => {
      //console.log();
      if (!err) {
        nextlink = response.body["@odata.nextLink"]; //pointer to next record set

        //console.log(nextlink);
        for (var j= 0; j < Object.keys(response.body["value"]).length; j++) {
          vastus.push(response.body["value"][j]["fields"]);
        } //array of kliendileping fields

        if(nextlink != null && nextlink != undefined && i < 30) { //i is for testing in prod 30
          //console.log(typeof vastus);

          console.log(valik + i + ' ' + Object.keys(response.body["value"]).length);
          rSPdata(aToken, valik, nextlink, i + 1,
             reqOrig, resOrig, vastus, callback1 );
        } else {

        //  res.status(200).json(response.body["value"][0]["fields"]);


          callback1(vastus); //callback mis väljub teenusest
        }
      } else {
          renderError(err, resOrig);
      }
  }); //end callback
};
//recurssively receives Firma records from sharepoint using MS Graph REST
var rSPdata1 = function (aToken, valik, nextlink, i,
  reqOrig, resOrig, vastus, callback1) {

  i = i || 0;
  vastus = vastus || {};
  //console.log(res1);
  graphHelper.getSPData(aToken, valik, nextlink, reqOrig, resOrig,
    (err, response, reqOrig, resOrig) => {
      //console.log();
      if (!err) {
        nextlink = response.body["@odata.nextLink"]; //pointer to next record set

        //console.log(nextlink);
        for (var j= 0; j < Object.keys(response.body["value"]).length; j++) {
          vastus.push(response.body["value"][j]["fields"]);
        } //array of kliendileping fields

        if(nextlink != null && nextlink != undefined && i < 30) { //i is for testing in prod 30
          //console.log(typeof vastus);

          console.log(valik + i + ' ' + Object.keys(response.body["value"]).length);
          rSPdata1(aToken, valik, nextlink, i + 1,
             reqOrig, resOrig, vastus, callback1 );
        } else {

        //  res.status(200).json(response.body["value"][0]["fields"]);


          callback1(vastus); //callback mis väljub teenusest
        }
      } else {
          renderError(err, resOrig);
      }
  }); //end callback
};
var rFirma = function (aToken, reqOrig, resOrig, vastus, j, callback2) { //recurssively finds Reg_nr from Firma by Kliendileping Id
   var j = j||398;
   console.log(typeof vastus[j]);
   if (vastus[j] !== undefined) { //brakes loop if reg_nr id is missing
          graphHelper.getSPFirma(aToken,
            vastus[j]["Firma_x0020_Nimi_x003a_RegistrikLookupId"], j, vastus,
             (err, response, j, vastus) => {

              if (!err) {
                vastus[j]["registrikood"] = response.body["fields"]["Registrikood"];
                console.log(j+' '+vastus[j]["ValiFirma"]+' '+
                vastus[j]["registrikood"]+' '+vastus[j]["id"]); //updates vastus object with firma reg_nr
                //call for DB update proc


                  console.log(vastus[j]["ValiFirma"]+' UPDATE started');

                  if( j < vastus.length) { //call until all records are looped
                  rFirma(aToken, reqOrig, resOrig, vastus, j+1, callback2);
                } else {
                  callback2(j);
                }



            } else {
              renderError(err, resOrig);
            }
          }); //end callback
      } else {
        callback2(j);
      }
};

app.get('/logout', (req, res) => {
  req.session.destroy(() => {
    req.logOut();
    res.clearCookie('graphNodeCookie');
    res.status(200);
    res.redirect('/');
  });
});

//Create SP Firma, KLiendileping or update Firma, Kliendileping
//regnr - Firma.registreerimisnumber, title - firma.nimi,
//count - checks times URL is called > 3 automatic cancel
app.get('/test/:regnr/:title/:count', (req, res) => {

      if(req.params.regnr === '' || req.params.title === '') {
        return res.redirect('/');

      } else {
        var Registrikood = '';
        Registrikood = req.params.regnr;
        var Firmanimi = '';
        Firmanimi = req.params.title;
        var count=parseInt(req.params.count);
        if(accessToken === '') {
          //console.log('ACCESS TOKEN empty');
          graphHelper.getGToken((err, response) => { //Get Graph access token
            if (!err) {

              aToken =  JSON.parse(response.text).access_token;
              //console.log('ACCESS TOKEN '+aToken);
              createSPContract(req, Registrikood/*'12345'*/, Firmanimi/*'TESTFIRMA'*/,
              aToken, (tulemus) => {
                if(tulemus.resStatus === 'OK') {
                  return res.status(200).json(JSON.stringify(tulemus));

                } else if (count < 4 ) {
                  count+=1;

                  return res.redirect('/test/'+Registrikood+'/'+Firmanimi+'/'+count);
                } else {
                  return res.status(200).send('ERROR '+tulemus.resStatus);
                }
              });
            }


        });
        } else {

          createSPContract(req, Registrikood/*'12345'*/, Firmanimi/*'TESTFIRMA'*/,
          accessToken, (tulemus) => {
            if(tulemus.resStatus === 'OK') {
              return res.status(200).json(JSON.stringify(tulemus));

            } else if (count < 4 ) {
              count+=1;

              return res.redirect('/test/'+Registrikood+'/'+Firmanimi+'/'+count);
            } else {
              return res.status(200).send('ERROR '+tulemus.resStatus);
            }
          });
        }
      }

/*    var fields = {};
    fields.Title='LEPNR';
    //fields.Registrikood='TESTKOOD';
    fields.Nimi_x0020_otsingLookupId='5299';
    fields.ValiFirma='TESTFIRMA';
    fields.Firma_x0020_Nimi_x003a_RegistrikLookupId='5299';
graphHelper.postSPContract(accessToken, fields, (err, response) => {
    if (!err) {
      res.status(200).json(JSON.parse(response.text));
      console.log(JSON.parse(response.text).id);
  } else {
    renderError(err, res);
  }
});*/
/*    graphHelper.getSPToken((err, response) => {
      if (!err) {
        accessToken = JSON.parse(response.text).access_token;
        graphHelper.getSPTest(accessToken, (err, response) => {
          if (!err) {
            res.status(200).json(JSON.parse(response.text));
          } else {
            renderError(err, res);
          }
        });

    } else {
      renderError(err, res);
    }
  });*/
/*  graphHelper.getSPContract('4446', (err, response) => { //12408568
    //console.log(JSON.parse(response.text).value.length);
    if (!err) { //Leiti vastus
      if (JSON.parse(response.text).value.length > 0 ) { //Firma SP olemas
      res.status(200).json(JSON.parse(response.text).value);
    } else { //Firma SP-st puudu
          res.status(200).json('tühi vastus'+JSON.parse(response.text));
          return response;
        }
    } else { //vastust ei leitud
      if(err == 'Error: Not Found') {
        res.status(200).json('Error: Not Found');
      } else {
        renderError(err, res);
      }
    }
  });*/

            //res.status(200).json(accessToken);

}); //end /test

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
/**
 *
 * @param {*} e
 * @param {*} res
 */
function renderError(e, res) {
  e.innerError = (e.response) ? e.response.text : '';
  res.render('error', {
    error: e
  });
}

module.exports = app;
