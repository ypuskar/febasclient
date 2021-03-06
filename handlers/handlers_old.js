var DataStore = require('../datastore/dataStore');

var Boom = require('boom');



var Handlers = {};

exports.customer_list = function(req, res) {

  DataStore.executesql(req, 'SELECT TOP 10 k.[KLENDI_NIMI] as Kliendi_nimi, p.MT_NIMETUS as Maksetingimus FROM [MR_KLIENDID] k JOIN [MR_MAKSETINGIMUS] p ON k.MAKSETINGIMUS = p.MT', function(result){

 console.log("CALLBACK TÖÖTAB");
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
exports.customer_feb = function(req, res) {
  DataStore.executesql(req, 'SELECT  k.[KLENDI_NIMI] as Kliendi_nimi, k.[E_MAIL],'+
                        ' k.[TELEFON], k.[KMKN], k.[MÄRKUS_1], k.[AUT_TARNEKEELD],'+
                        ' k.[KRED_LIMIIT], k.[REG_NR], k.[TARNEKEELD], k.[MÄRKUS_2],'+
                        ' k.KOMMENTAAR, k.ID,'+
                        ' COUNT(DISTINCT a.ID) AS [Maksmata_arveid],'+
                        ' p.[MT_NIMETUS] as Maksetingimus FROM [MR_KLIENDID] k'+
                        ' JOIN [MR_MAKSETINGIMUS] p ON k.MAKSETINGIMUS = p.MT'+
                        ' LEFT OUTER JOIN [MR_ARVED] a ON k.ID = a.KLIENDI_ID'+
                        ' group by k.KLENDI_NIMI, k.E_MAIL, k.TELEFON, k.KMKN,'+
                        ' k.MÄRKUS_1, k.KRED_LIMIIT, k.REG_NR, k.TARNEKEELD, k.MÄRKUS_2,'+
                        ' p.MT_NIMETUS, k.AUT_TARNEKEELD, k.KOMMENTAAR, k.ID',
                        function(result){

//  res.send('LÕPP KÄES');
  res.render('customers', {title: 'Feb kliendid', result: result/*, user: req.user*/});
  });
};
exports.customer_feb_tekst = function (req, res) {
  console.log(req.b)
  DataStore.executesql(req, "UPDATE MR_KLIENDID SET KOMMENTAAR = '"+req.body.KOMMENTAAR+"'"+
                      " WHERE ID = "+req.params.tekstId+" "+
                      " INSERT INTO KOMMENTAARID (KLIENDI_ID, KOMMENTAAR, CREATED, CREATEDBY) "+
                      " VALUES ("+req.params.tekstId+", '"+req.body.KOMMENTAAR+"', GETDATE(), '"+req.body.CREATEDBY+"');",
                        function(result){

  //console.log(req.body.CREATEDBY);

 //console.log("CALLBACK TÖÖTAB");
//  res.send('LÕPP KÄES');
  res.redirect('/clients/customers/customers');
  });
};
exports.kommentaarid_json = function (req, res) {
  DataStore.executesql(req, "SELECT k.ID, k.KOMMENTAAR, FORMAT(k.CREATED, 'dd/MM/yyyy') AS CREATED, k.CREATEDBY"+
  " FROM KOMMENTAARID k WHERE KLIENDI_ID = " + req.params.kommId + " ORDER BY ID DESC",
  function(result){

 //console.log("CALLBACK TÖÖTAB");
//  res.send('LÕPP KÄES');
  res.status(200).json(result);
  });
  };
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
exports.getAllClients = function(request, reply) {

    DataStore.getAllClients(function(err, results) {

        if(err) {

            return reply(Boom.badImplementation(err.details[0].message));

        }

        reply(results[0]);

    });

}

//module.exports = Handlers;
