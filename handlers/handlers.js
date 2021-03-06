var DataStore = require('../datastore/dataStore');
var findObj = require('./passporthelper.js');
var express = require('express');
var Boom = require('boom');
var app = express();
var util = require('util');
var patchSPContract = require('./passporthelper').patchSPContract;


var Handlers = {};

exports.customer_list = function(req, res) {

  DataStore.executesql(req, 'SELECT TOP 10 k.[KLENDI_NIMI] as Kliendi_nimi, p.MT_NIMETUS as Maksetingimus FROM [MR_KLIENDID] k JOIN [MR_MAKSETINGIMUS] p ON k.MAKSETINGIMUS = p.MT', function(result){

 //console.log("CALLBACK TÖÖTAB");
 console.log(req.user);
//  res.send('LÕPP KÄES');
  res.render('clients', {title: 'Vaatame, kas midagi tuleb', result: req.user});
  });
};

exports.customer_json = function (req, res) {
  DataStore.executesql(req, "SELECT TOP 10 k.[KLENDI_NIMI] as Kliendi_nimi, p.MT_NIMETUS as Maksetingimus FROM [MR_KLIENDID] k JOIN [MR_MAKSETINGIMUS] p ON k.MAKSETINGIMUS = p.MT",
  function(result){

 //console.log("CALLBACK TÖÖTAB");
//  res.send('LÕPP KÄES');
  res.status(200).json(result);
  });
};
//reads timestamp from db
exports.timestamp = function (req, res) {
  DataStore.executesql(req, "SELECT TOP 1 k.[DB_UPDATETIME]"+
  " FROM [MR_DBTIMESTAMP] k WHERE DB_KEY = 1",
  function(result){

 //console.log("CALLBACK TÖÖTAB");
//  res.send('LÕPP KÄES');
  return res.status(200).json(result);
  });
};

//Read all customers
exports.febcust = function (req, res) {
  DataStore.executesql(req, 'SELECT  DISTINCT k.[KLENDI_NIMI] as Kliendi_nimi,'+
  ' k.[E_MAIL],'+
  ' k.[TELEFON],'+
  ' k.[KMKN],'+
  ' k.[MÄRKUS_1],'+
  ' k.[AUT_TARNEKEELD],'+
  ' k.[KRED_LIMIIT],'+
  ' k.[REG_NR],'+
  ' k.[TARNEKEELD],'+
  ' k.[MÄRKUS_2],'+
  ' k.KOMMENTAAR,'+
  //                        ' k.MAKSETINGIMUS,'+
  ' k.ID,'+
  ' k.KLIENDIKOOD,'+
  ' k.AEGUMATA,'+
  ' k.[30P],'+
  ' k.[180P],'+
  ' k.VANEM,'+
  ' k.KOKKU,'+
  ' k.TARNITUD,'+
  ' k.VABA_LIMIIT,'+
  ' k.YLE_MT,'+
  ' k.YLE_MT_KOKKU,'+
  ' k.TEHNIK,'+
  ' k.YLE_LIMIIDI,'+
  ' k.ARVEID,'+
  ' k.KOONDARVE,'+
  ' k.SP_ID,'+
  ' k.SP_FIRMA_ID,'+
  ' k.F_NIMI,'+
  ' k.F_TELELFON AS F_TELEFON,'+
  ' k.F_EMAIL,'+
  //                        ' COUNT(a.ID) over (partition by k.id) AS [Maksmata_arveid],'+
  //                        ' SUM(a.tasumata) over (partition by k.id) as [Tasumata_SUM],'+
  ' p.[MT_NIMETUS] as MAKSETINGIMUS'+
  ' FROM [MR_KLIENDID] k'+
  ' JOIN [MR_MAKSETINGIMUS] p ON k.MAKSETINGIMUS = p.MT',
  //                        ' LEFT OUTER JOIN [MR_ARVED] a ON k.ID = a.KLIENDI_ID',
  function(result){
    return res.status(200).json(result);
  //  res.send('LÕPP KÄES');
  });
}
// SQL loads all Feb customers and joins maksetingimus
exports.customer_feb = function(req, res) {
    // check if user is authenticated
  if (req.user != undefined) {
    console.log(req.user.profile.displayName + ' IS Authenticated');
  } else {
    console.log('NOT Authenticated in customer_feb');
    return res.redirect('/login');
  }
  res.render('customers', {title: 'FEB MR', result: [], env: process.env.NODE_ENV, user: req.user});

};

//insert new comment for customer
exports.customer_feb_tekst = function (req, res) {
//console.log(req.b)
DataStore.executesql(req, //"UPDATE MR_KLIENDID SET KOMMENTAAR = '"+req.body.KOMMENTAAR+"'"+
                    //" WHERE ID = "+req.params.tekstId+" "+
                    " INSERT INTO KOMMENTAARID (KLIENDI_ID, KOMMENTAAR, CREATED, CREATEDBY) "+
                    " VALUES ("+req.params.tekstId+", '"+req.body.KOMMENTAAR+"', GETDATE(), '"+req.body.CREATEDBY+"');",
                      function(result){

//console.log(req.body);

//console.log("CALLBACK TÖÖTAB");
  res.end('OK');
//res.redirect('/clients/customers/customers');
});
};
// delete customer comment by comment id
exports.delete_comment = function (req, res) {


  if (req.body.deleted !== '' && req.body.kommId !== '' ) {
    //console.log(req.body);
    var deleted = req.body.deleted;
    var ID = req.body.kommId;
      DataStore.executesql(req, "UPDATE KOMMENTAARID SET DELETEDBY = '"+deleted+"',"+
                          " DELETED = GETDATE()"+
                          " WHERE ID = "+ID,
                            function(result){

      //console.log(req.body.CREATEDBY);

      //console.log("CALLBACK TÖÖTAB");
      return  res.end('END');
      //return res.redirect('/clients/customers/customers');
    });
    //res.end('OK');
    //res.redirect('/clients/customers/customers');
  } else return;


};
exports.kommentaarid_json = function (req, res) {
DataStore.executesql(req, "SELECT k.ID, k.KOMMENTAAR,"+
" FORMAT(k.CREATED, 'dd/MM/yyyy') AS CREATED, k.CREATEDBY,"+
" FORMAT(k.DELETED, 'dd/MM/yyyy') AS DELETED, k.DELETEDBY"+
" FROM KOMMENTAARID k WHERE KLIENDI_ID = " + req.params.kommId + " ORDER BY k.CREATED DESC",
function(result){

//console.log("CALLBACK TÖÖTAB");
//  res.send('LÕPP KÄES');
res.status(200).json(result);
});
};
// return customer invoices
exports.arved_json = function (req, res) {
DataStore.executesql(req, "SELECT k.ID, k.ARVE_NUMBER,"+
" FORMAT(k.ARVE_KUUPÄEV, 'dd/MM/yyyy') AS ARVE_KUUPÄEV,"+
" FORMAT(k.MAKSE_KUUPÄEV, 'dd/MM/yyyy') AS MAKSE_KUUPÄEV,"+
" k.ARVE_SUMMA,"+
" k.TASUTUD,"+
" k.TASUMATA,"+
" k.FILIAAL"+
" FROM MR_ARVED k WHERE KLIENDI_ID = " + req.params.kommId +
" ORDER BY ARVE_KUUPÄEV DESC",
function(result){

//console.log("CALLBACK TÖÖTAB");
//  res.send('LÕPP KÄES');
res.status(200).json(result);
});
};
//kliendi kontaktisikute päring
exports.kontaktid_json = function (req, res) {
  DataStore.executesql(req, "SELECT k.ID, RTRIM(k.NIMI) AS NIMI,"+
  " RTRIM(ISIKUKOOD) AS ISIKUKOOD,"+
  " FORMAT(k.KEHTIVUS, 'dd/MM/yyyy') AS KEHTIVUS,"+
  " RTRIM(k.TELEFON) AS TELEFON,"+
  " RTRIM(k.EMAIL) AS EMAIL,"+
  " k.BKAART,"+
  " RTRIM(k.MARKUSED) AS MARKUSED"+
  " FROM MR_VOLITUSED k WHERE KLIENDI_ID = " + req.params.kommId +
  " ORDER BY NIMI ASC",
  function(result){

 //console.log("CALLBACK TÖÖTAB");
//  res.send('LÕPP KÄES');
  res.status(200).json(result);
  });
  };
  //kliendi sharepoint id update
  exports.sp_id_json = function sp_id_json(req, queryString, callback) {
    //console.log('UPDATE STARTED');
    /*var mobjekt = {};
    mobjekt['kliendi_id'] = klient_id;
    mobjekt['reg_nr'] = reg_nr;*/
    DataStore.executesql(req, queryString,
      function(result){
  /*        if(typeof callback_end === 'function') {
     //console.log("CALLBACK TÖÖTAB");
    //  res.send('LÕPP KÄES');
      callback_end(reqOrig, resOrig, aToken, j, vastus);
    } else {
      throw new TypeError("Callback in NOT function");
    }*/
      console.log('DB UPDATED...');
      callback();
      });
    };
exports.getAllClients = function(request, reply) {

    DataStore.getAllClients(function(err, results) {

        if(err) {

            return reply(Boom.badImplementation(err.details[0].message));

        }

        reply(results[0]);

    });

}
exports.createSPContract = function(req, Registrikood, FirmaNimi, accessToken, reply) {

//Check Company exists in SP
    findObj.getSPCustomer(Registrikood, (err, response) => { //12408568
      //console.log(JSON.parse(response.text).value.length);
      if (!err) { //Leiti vastus
        if (JSON.parse(response.text).value.length > 0 ) { //Firma SP olemas
          var FirmaID = JSON.parse(response.text).value[0].Id;

          console.log('Firma Id on '+FirmaID);
          //console.log(JSON.parse(response.text).value[0].Id);
          //Check Contract exists in SP
          findObj.getSPContract(FirmaID, (err, response) => {
              if (!err) { //leiti vastus
                //console.log('GetSPCustomer vastus');
                //console.log(response.text);
                if (JSON.parse(response.text).value.length > 0 ) { //Leping SP olemas
                  var LepingId = JSON.parse(response.text).value[0].Id;
                  var FirmaId = JSON.parse(response.text).value[0].Nimi_x0020_otsingId;
                  var queryString = "UPDATE MR_KLIENDID "+
                                    "SET SP_ID = "+LepingId+
                                    ", SP_FIRMA_ID = "+FirmaId+
                                    " WHERE reg_nr = '" + Registrikood+"'; \n";
                  DataStore.executesql(req, queryString,
                    function(result){
                /*        if(typeof callback_end === 'function') {
                   //console.log("CALLBACK TÖÖTAB");
                  //  res.send('LÕPP KÄES');
                    callback_end(reqOrig, resOrig, aToken, j, vastus);
                  } else {
                    throw new TypeError("Callback in NOT function");
                  }*/
                    console.log('CUSTOMER '+Registrikood+'UPDATE FINISHED');
                    var tulemus = {};
                    tulemus.resStatus = 'OK';
                    tulemus.LepingId = LepingId;
                    return reply(tulemus);
                  });
                } else { //SP-s leping puudu
                  console.log('Lepingut SP ei ole');
                  var fields = {};
                  //fields.Title='LEPNR';
                  //fields.Registrikood='TESTKOOD';
                  fields.Nimi_x0020_otsingLookupId=FirmaID;
                  fields.ValiFirma=FirmaNimi;
                  //fields.Firma_x0020_Nimi_x003a_RegistrikLookupId=FirmaId;
                  //console.log(fields);
                  findObj.postSPContract(accessToken, fields, (err, response) => {
                      if (!err) {
                        var tulemus = {};
                        tulemus.resStatus = 'LEPING';
                        //JSON.parse(response.text).id;
                        return reply(tulemus);
                      } else {
                        var tulemus = {};
                        tulemus.resStatus = 'Leping SP-st puudu, viga Lepigu loomisel '+err;
                        return reply(tulemus);

                    }
                  });

                }
              } else { //vastust ei leitud

              }



          }); //End getSPContract Callback

      } else { //Firma SP-st puudu
            console.log('FIRMA SP-st puudu');
            var fields = {};
            fields.Title=FirmaNimi;
            fields.Registrikood=Registrikood;
            findObj.postSPCustomer(accessToken, fields, (err, response) => {
              if(!err) {
                var firmaId = JSON.parse(response.text).id;
                var tulemus = {};
                tulemus.resStatus = 'FIRMA';
                return reply(tulemus);
              } else {
                var tulemus = {};
                tulemus.resStatus = 'Firma SP-st puudu, viga firma loomisel '+err;
                return reply(tulemus);
              }
            });

          }
      } else { //vastust ei leitud
        if(err == 'Error: Not Found') {
          return res.status(200).json('Error: Not Found');
        } else {
          renderError(err, res);
        }
      }
    }); //End getSPCustomer callback
  };

  //send mail using Graph
  exports.sendMail = function (req, res) {

    findObj.getGToken((err, response) => {

        if (!err) {
          var accessToken = JSON.parse(response.text).access_token;
          var message = req.body.message;
          var user = req.body.user;
                    //console.log(req.body.message);
          findObj.sendMail(accessToken, message, user,
                              (err, result) => {
                                if(!err) {
                                  console.log('MAIL saadetud!');
                                res.status(200).json(result);
                              } else {
                                  console.log('MAILI EI SAADETUD! ' +err);
                                  res.status(400).json(err);
                              }

                            });
        } else {
          renderError(err, res);
        }
      });
    };

  function renderError(e, res) {
    e.innerError = (e.response) ? e.response.text : '';
    res.render('error', {
      error: e
    });
  }

  //fn checks from MR_kliendid ARH and updates Sharepoint contracts 5491
  exports.updateArh = function(accessToken) {
    //console.log(accessToken);

    function readData(querystring) {
      DataStore.executesql('', querystring,
        function(updated){
         // SQLupdated.push(item);
          console.log(' UPDATED', updated);

          //j++;
        },{},30000);
    }
    function createQuery(massiiv, item) {
      return massiiv.push("UPDATE MR_KLIENDID SET SP_ARH = GETDATE()"+
      " WHERE SP_FIRMA_ID = "+ item + " ;")
    }
    DataStore.executesql({}, "SELECT TOP (1000) k.[SP_ID],"+
    " k.[SP_FIRMA_ID]"+
    " FROM MR_KLIENDID k WHERE [KLIENDIRÜHM] = 'ARH' AND SP_ID != 0 AND SP_ARH IS NULL" ,
    function(result){
      console.log(result.length);

      //let querystring = result.map(item =>{return "UPDATE MR_KLIENDID SET SP_ARH = GETDATE()"+
      //  " WHERE SP_FIRMA_ID = "+ item.SP_FIRMA_ID+ " ;"});
      //console.log(querystring);
      let j=0;
      let m = 20;
      let k=0;
      let SPupdated = [];
      let SPerr = [];
      let SQLupdated = [];
      let arrReminder = 0;
      let arrLength = 0;

     /* async function processArray(arr) {
        for (const item of arr) {
          await func(item);
        }
      }*/
      function successCallback(item) {
        return new Promise(function(resolve, reject){
          patchSPContract(accessToken, item, {'Ajalugu' : true}, 
          response => {
            if (response !== null) {
              resolve(null)
            } else {
              resolve(item)
            }
            }, err => {reject(err)})
        })
        //console.log('READY');
      }
      async function processCustomers(results) {

          for (const item of results) {
           await successCallback(item.SP_ID).then(function(resp) {
               if(resp === null) console.log('VIGA')
               else {console.log("Success!", resp); SPupdated.push(resp)}}, function(error) {
                 console.error("Failed!", error);
             });
          }
      

       // await Promise.all(promises);
        //console.log('FINISHED', SPupdated);
        let querystring = SPupdated.map(item =>{return "UPDATE MR_KLIENDID SET SP_ARH = GETDATE()"+
        " WHERE SP_ID = "+ item+ " ; "});
        //console.log(querystring.join('\n'));
        const pglength = 40;
        arrReminder = querystring.length % pglength;
        arrLength = Math.floor(querystring.length / pglength);
        let queryarray = [];
        if (arrLength > 0) {

          for (let i=0; i < arrLength; i++) {
            //readData(querystring.slice(i*pglength,i*pglength+pglength).join('\n'));
            queryarray.push(querystring.slice(i*pglength,i*pglength+pglength).join(' '));
          }
          queryarray.map(query => readData(query));
          console.log(queryarray);

        } 
        if (arrReminder > 0) {
          readData(querystring.slice(arrLength*pglength, arrLength*pglength+arrReminder+1).join('\n'));
          console.log(querystring.slice(arrLength*pglength, arrLength*pglength+arrReminder+1).join('\n'));
        }
      }

      processCustomers(result);
        //console.log(item);
      /*  const patchpromise = new Promise(patchSPContract(accessToken, item.SP_FIRMA_ID, {'Ajalugu' : true}, 
        res => {console.log(item)}, err => {console.log(err)}))
       patchpromise.then(successCallback);*/
        //.then(res =>{console.log('VALMIS')});
      
     /*   for (let i= 0; i < result.length; i++) {
          let SPfirma = result[i].SP_FIRMA_ID;
          (function (muutuja, accessToken) {
            patchSPContract(accessToken, muutuja, {'Ajalugu' : true},
            (err, res) => {
              console.log('patchSP',i);
              //k++;
              if (err) {
                SPerr.push(muutuja);
                console.log ('SP UPDATE VIGA ', muutuja);
              } else {
                SPupdated.push(muutuja);
                if(i % m === 0) {
                  console.log('TIMEOUT');
                  setTimeout(readData,15000,muutuja);
                } else {
                  readData(muutuja);
                }

                console.log(i, muutuja);
              }
              console.log('i',i);
            });
          })(SPfirma, accessToken);

        }*/



      //console.log('SP update:', SPupdated.length, 'SQL update:', SQLupdated.length)

    });
  }

//module.exports = Handlers;
