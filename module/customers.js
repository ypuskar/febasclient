
var db = require('../datastore/dataStore');

exports.getAllCustomers = function (req, res) {
  db.executesql('SELECT TOP 20 k.[KLENDI_NIMI] as Kliendi_nimi, p.MT_NIMETUS as Maksetingimus FROM [MR_KLIENDID] k JOIN [MR_MAKSETINGIMUS] p ON k.MAKSETINGIMUS = p.MT,',
    function (data, err) {
      if (err) {
        res.writeHead(500, "Internal Error occured", { "Content-Type": "text/html" });
        res.write("<html><head><title>500</title></head><body>500: Internal Error. Details: " + err + "</body></html>");
      }
      else {
//        res.writeHead(200, { "Content-Type": "text/html" });
//        res.write("<html><head><title>500</title></head><body>500: Internal Error. Details: SEE ON TULEMUS </body></html>");

      }
      res.end();
    });
};
