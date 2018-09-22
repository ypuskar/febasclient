// Purpose: Open database connection and execute query
//var Connection = require('tedious').Connection;
//var sql = require('mssql');
var Connection = require('tedious').Connection;
var Request = require('tedious').Request;
var config = require('../config');


var DataStore = {};




var config =
  {
    userName: config.db.userName, // update me
    password: config.db.password, // update me
    server: config.db.server, // update me
    options:
       {
          database: config.db.database //update me
          , encrypt: true
       }
  };

var jsonArray = [];

exports.executesql = function(muutuja, sqlstatement, callback, mobjekt) {
    var connection = new Connection(config);

    connection.on('connect', function(err)
    {
      if (err)
        {
           console.log('viga baasi avamisel ' + err)
        }
     else
        {
            queryDatabase()
        }
    }
  );
  connection.on('errorMessage', function(err)
  {
    if (err)
      {
         console.log('saabus errorMessage EVENT ' + err)
      }
   else
      {
          console.log("ERRORMESSAGE ilma veata")
      }
  }
);
connection.on('error', function(err)
{
  if (err)
    {
       console.log('saabus error EVENT ' + err)
    }
 else
    {
        console.log("ERROR ilma veata")
    }
}
);
  function queryDatabase()
     { console.log('Reading rows from the Table...');

         // Read all rows from table
       request = new Request(sqlstatement,
               function(err, rowCount, rows)
                  {
                    if (err) {
                      console.log("REQUEST ERROR " + sqlstatement);
                      callback(err);
                    } else {

                      console.log(rowCount + ' row(s) returned');
//                      process.exit();
//                      console.log("CALLBACK NULL");
                    //  callback(null);
                    }
                  }

              );
              //reset the jsonArray
              jsonArray = [];
       request.on('row', function(columns) {
          var result = {};
          columns.forEach(function(column) {
        //    if(column.value === null) {
        //      console.log('NULL');
        //    } else {
              //console.log("%s\t%s", column.metadata.colName, column.value);
            //  result += column.metadata.colName + ':'+ column.value + " ";
            result[column.metadata.colName] = column.value;
            //console.log(result);
        //    }
           });
        //console.log('hakkan pushima');
        jsonArray.push(result);
      //  console.log(jsonArray);
    //      callback(jsonArray);
         });
      request.on('doneProc', function (rowCount, more, returnStatus, rows){
          console.log("doneProc");
      //    console.log(rows + ' row(s) returned');
          console.log('CALLBACK JSON ' + jsonArray.length);
          callback(jsonArray, mobjekt);
          jsonArray = [];
      });
      request.on('requestCompleted', function () {
                  jsonArray = [];
                  console.log('Closing connection');
                  connection.close();
      });
      connection.execSql(request);

     }

};



    function connected(sqlstatement, callback, err) {

      if (err) {

        console.log(err);
        callback(null, err);
//        process.exit(1);

      } else {
      console.log("SQL lugemine");
//      Read(sqlstatement, callback);
        var request = new Request(sqlstatement,
          function (err, rowCount, rows) {

            if (err) {
              callback(err);
            } else {
              console.log(rowCount + ' row(s) returned');
              callback(rows);
            }
          });
          var result = "";

          request.on('row', function(columns) {
            columns.forEach(function(column) {
            if (column.value === null) {
                console.log('NULL');
              } else {
                result += column.value + " ";

              }
            });
            console.log(result);
            result = '';
          });
          // Execute SQL statement
          connection.execSql(request);
        }

      }




//module.exports = DataStore;
