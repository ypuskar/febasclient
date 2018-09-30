
var request = require('superagent');
var Boom = require('boom');

/**
 * Generates a GET request the user endpoint.
 * @param {string} accessToken The access token to send with the request.
 * @param {Function} callback
 */
function getUserData(accessToken, callback) {
  request
      .get('https://graph.microsoft.com/v1.0/me')
   .set('Authorization', 'Bearer ' + accessToken)
   .end((err, res) => {
     callback(err, res);
   });
}
exports.getUserData = getUserData;
//get from SP kliendileping if valik = leping
//Firma if valik = firma. nextlink == A => first iteration
//nextlink == empty => last iteration
function getSPData(accessToken, valik, nextlink,
  reqOrig, resOrig, callback) {
  //var url = '';
  var url1 = "https://graph.microsoft.com/v1.0/sites"+
  "/febas.sharepoint.com,2193468f-41a6-4a37-a762-14fb432fbb95,"+
  "a41f917e-fafa-4ad3-9962-9fb386b1f26d/lists/"+
  "0182799d-53c3-45da-8894-3e39ecaf65dc/items"+
  "?expand=fields(select=Id,ValiFirma,"+
  "Firma_x0020_Nimi_x003a_RegistrikLookupId)";
  var url = "https://graph.microsoft.com/v1.0/sites/"+
  "febas.sharepoint.com,2193468f-41a6-4a37-a762-14fb432fbb95,"+
  "a41f917e-fafa-4ad3-9962-9fb386b1f26d/lists/"+
  "0e29a37c-f5b0-485f-a91a-23094e9c1c0f/items?expand=fields";
  if(valik === 'Leping' && nextlink === 'A'){
    url = url1;
  }
  (nextlink === 'A')? '' : url = nextlink;
  //console.log(url);
  request
      .get(url)
      //.get("http://febas.sharepoint.com/_api/Web/lists/GetByTitle('Firma')/Items(100)")
   .set('Authorization', 'Bearer ' + accessToken)
   .accept('application/json')
   .set('cache-control', 'no-cache')
   .end((err, res) => {
     callback(err, res, reqOrig, resOrig);
   });
}
exports.getSPData = getSPData;

function getSPFirma(accessToken, firmaid, j, vastus, callback) {
  var url = "https://graph.microsoft.com/v1.0/sites/febas.sharepoint.com,2193468f-41a6-4a37-a762-14fb432fbb95,a41f917e-fafa-4ad3-9962-9fb386b1f26d/lists/0e29a37c-f5b0-485f-a91a-23094e9c1c0f/items/";
  url = url + firmaid;
  //console.log(url);
  request
      .get(url)
      //.get("http://febas.sharepoint.com/_api/Web/lists/GetByTitle('Firma')/Items(100)")
   .set('Authorization', 'Bearer ' + accessToken)
   .accept('application/json')
   .set('cache-control', 'no-cache')
   .end((err, res) => {
     callback(err, res, j, vastus);
   });
}
exports.getSPFirma = getSPFirma;

//fn mis leiab rakenduse tokeni (timer job jaoks)
function getSPToken(callback) {
  var url = "https://accounts.accesscontrol.windows.net/2b5d21bf-c40b-48ce-b17b-009ea3124a5d/tokens/OAuth/2";

  //console.log(url);
  request
      .post(url)
      //.get("http://febas.sharepoint.com/_api/Web/lists/GetByTitle('Firma')/Items(100)")
   .set('Content-Type', 'application/x-www-form-urlencoded')
   //.accept('application/json')
   .set('cache-control', 'no-cache')
   .send({"grant_type": "client_credentials"})
   .send({"client_id": "a84f3da2-7ec3-4e34-a4c1-c2f96f607220@2b5d21bf-c40b-48ce-b17b-009ea3124a5d"})
   .send({"client_secret": "PjpQShsxJiG0xtw8fApFk6yb9Mrbawoe9lXidJUQPLE="})
   .send({"resource": "00000003-0000-0ff1-ce00-000000000000/febas.sharepoint.com@2b5d21bf-c40b-48ce-b17b-009ea3124a5d"})
   .end((err, res) => {
     callback(err, res);
   });
}
exports.getSPToken = getSPToken;

//fn mis leiab Graph rakenduse tokeni (timer job jaoks)
function getGToken(callback) {

  //console.log('Get TOKEN');
  var url = "https://login.microsoftonline.com/2b5d21bf-c40b-48ce-b17b-009ea3124a5d/oauth2/v2.0/token";

  //console.log(url);
  request
      .post(url)
      //.get("http://febas.sharepoint.com/_api/Web/lists/GetByTitle('Firma')/Items(100)")
   .set('Content-Type', 'application/x-www-form-urlencoded')
   //.accept('application/json')
   .set('cache-control', 'no-cache')
   .send({"grant_type": "client_credentials"})
   .send({"client_id": "cd40b934-7653-46d6-811e-1e33ef2b54b6"})
   .send({"client_secret": "uMVWQsBFKNAXCp0hz6iyGMVD+QfFGPHSMEIVXr2ouNw="})
   .send({"tenant": "2b5d21bf-c40b-48ce-b17b-009ea3124a5d"})
   .send({"scope": "https://graph.microsoft.com/.default"})
   .end((err, res) => {
     callback(err, res);
   });
}
exports.getGToken = getGToken;

//fn mis leiab SP-st firma reg. nr alusel
function getSPTest(aToken, Registrikood, callback) {

  var url = "https://febas.sharepoint.com/_api/Web/lists(guid'0e29a37c-f5b0-485f-a91a-23094e9c1c0f')/items/?$filter=Registrikood eq '"+Registrikood+"'";

  //console.log(url);
  request
      .get(url)
      //.get("http://febas.sharepoint.com/_api/Web/lists/GetByTitle('Firma')/Items(100)")
   //.set('Content-Type', 'application/x-www-form-urlencoded')
   .accept('application/json;odata=nometadata')
   .set('cache-control', 'no-cache')
   //.accept('application/json')
   .set('Authorization', 'Bearer ' + aToken)
   .end((err, res) => {
     callback(err, res);
   });
}
exports.getSPTest = getSPTest;

exports.getSPCustomer = function (Registrikood, callback) {

  var url = "https://febas.sharepoint.com/_api/Web/lists"+
  "(guid'0e29a37c-f5b0-485f-a91a-23094e9c1c0f')/items/"+
  "?$filter=Registrikood eq '"+Registrikood+"'";

  getSPToken((err, response) => {
        if (!err) {
          accessToken = JSON.parse(response.text).access_token;
          //console.log(accessToken);
          request
              .get(url)
              //.get("http://febas.sharepoint.com/_api/Web/lists/GetByTitle('Firma')/Items(100)")
           //.set('Content-Type', 'application/x-www-form-urlencoded')
           .accept('application/json;odata=nometadata')
           .set('cache-control', 'no-cache')
           //.accept('application/json')
           .set('Authorization', 'Bearer ' + accessToken)
           .end((err, res) => {
             //console.log(res);
             callback(err, res);
           });

      } else {
        return callback(Boom.forbidden(err.details[0].message), res);
      }
    }); //end getSPToken
} //end getSPCustomer
exports.getSPContract = function (FirmaId, callback) {

  var url = "https://febas.sharepoint.com/_api/Web/lists(guid'0182799d-53c3-45da-8894-3e39ecaf65dc')/items?$filter=Nimi_x0020_otsingId eq '"+
  FirmaId+"'";

  getSPToken((err, response) => {
        if (!err) {
          accessToken = JSON.parse(response.text).access_token;
          //console.log(accessToken);
          request
              .get(url)
              //.get("http://febas.sharepoint.com/_api/Web/lists/GetByTitle('Firma')/Items(100)")
           //.set('Content-Type', 'application/x-www-form-urlencoded')
           .accept('application/json;odata=nometadata')
           .set('cache-control', 'no-cache')
           //.accept('application/json')
           .set('Authorization', 'Bearer ' + accessToken)
           .end((err, res) => {
             //console.log(res);
             callback(err, res);
           });

      } else {
        return callback(Boom.forbidden(err.details[0].message), res);
      }
    }); //end getSPToken
} //end getSPContract
exports.postSPCustomer = function (accessToken, fields, callback) {

  var url = "https://graph.microsoft.com/v1.0/sites/febas.sharepoint.com,2193468f-41a6-4a37-a762-14fb432fbb95,a41f917e-fafa-4ad3-9962-9fb386b1f26d/lists/0e29a37c-f5b0-485f-a91a-23094e9c1c0f/items";
/*  var fields = {};
  fields.Title='TestFirma';
  fields.Registrikood='TESTKOOD';*/

  request
      .post(url)
      //.get("http://febas.sharepoint.com/_api/Web/lists/GetByTitle('Firma')/Items(100)")
   .set('Authorization', 'Bearer ' + accessToken)
   .accept('application/json')
   .set('cache-control', 'no-cache')
   .send({fields: fields})
   .end((err, res) => {
     callback(err, res);
   });
} //end postSPCustomer

exports.postSPContract = function (accessToken, fields, callback) {

  var url = "https://graph.microsoft.com/v1.0/sites/febas.sharepoint.com,2193468f-41a6-4a37-a762-14fb432fbb95,a41f917e-fafa-4ad3-9962-9fb386b1f26d/lists/0182799d-53c3-45da-8894-3e39ecaf65dc/items";
/*  var fields = {};
  fields.Title='TestFirma';
  fields.Registrikood='TESTKOOD';*/

  request
      .post(url)
      //.get("http://febas.sharepoint.com/_api/Web/lists/GetByTitle('Firma')/Items(100)")
   .set('Authorization', 'Bearer ' + accessToken)
   .accept('application/json')
   .set('cache-control', 'no-cache')
   .send({fields: fields})
   .end((err, res) => {
     callback(err, res);
   });
} //end postSPContract
//Generates POST request to Sendmail endpoint
exports.sendMail = function sendMail(accessToken, message, user, callback) {
//console.log(message);
  var url = "https://graph.microsoft.com/v1.0/users/"+user+"/sendMail";
  const emailAsPayload = {
    Message: {
        Subject: 'Welcome to Microsoft Graph development with Node.js and the Microsoft Graph Connect sample',
        Body: {
            ContentType: 'HTML',
            Content: '<h3>Testiks tehtud kiri</h3>'
        },
        ToRecipients: [
            {
                EmailAddress: {
                    Address: 'ylo.puskar@feb.ee'
                }
            }
        ]
    },
    SaveToSentItems: true
};
  //console.log(message);
  request
    .post(url)
    .send(message)
      //.get("http://febas.sharepoint.com/_api/Web/lists/GetByTitle('Firma')/Items(100)")
   .set('Authorization', 'Bearer ' + accessToken)
   .set('Content-Type', 'application/json')
   //.accept('application/json')
   .set('cache-control', 'no-cache')
   .end((err, res) => {
     callback(err, res);
   });
}
