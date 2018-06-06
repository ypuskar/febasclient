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

exports.executesql = function(muutuja, sqlstatement, callback) {
    var connection = new Connection(config);

    connection.on('connect', function(err)
    {
      if (err)
        {
           console.log('viga kurat ' + err)
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
                      console.log("CONNECTION ERROR" + sqlstatement);
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
      //    console.log("LOOOP");
      //    console.log(rows + ' row(s) returned');
          console.log('CALLBACK JSON ' + jsonArray.length);
          callback(jsonArray);
          jsonArray = [];
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
      console.log("FUUUUUUUUUUCK");
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

/*    function Read(sqlstatement, callback) {

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
          };
};
*/
/*        if(err) {

            console.log('Error: ' + err);

            callback(err);

        }

        else {

  //          var request = new sql.Request(connection);

  new sql.Request().query('SELECT TOP 20 k.[KLENDI_NIMI] as Kliendi_nimi, p.MT_NIMETUS as Maksetingimus FROM [MR_KLIENDID] k JOIN [MR_MAKSETINGIMUS] p ON k.MAKSETINGIMUS = p.MT,',
            function(err, recordsets) {

                if(err) {

                    console.log('Error: ' + err);

                    callback(err);

                }

                else {

                    console.dir(recordsets);

                    callback(null, recordsets);

                }

            });

        }

    });



    connection.on('error', function(err) {

        console.log('Error: ' + err);

    });

}

*/
/*
DataStore.getHeroesByIntent = function(good, callback) {

    var connection = new sql.Connection(config, function(err) {

        if(err) {

            console.log('Error: ' + err);

            callback(err);

        }

        else {

            var request = new sql.Request(connection);

            request.input('good', sql.Bit, good);

            request.execute('HeroesByIntent', function(err, recordsets) {

                if(err) {

                    console.log('Error: ' + err);

                    callback(err);

                }

                else {

                    console.dir(recordsets);

                    callback(null, recordsets);

                }

            });

        }

    });



    connection.on('error', function(err) {

        console.log('Error: ' + err);

    });

}



DataStore.getHeroById = function(heroId, callback) {

    var connection = new sql.Connection(config, function(err) {

        if(err) {

            console.log('Error: ' + err);

            callback(err);

        }

        else {

            var request = new sql.Request(connection);

            request.input('heroId', sql.Bit, heroId);

            request.execute('HeroById', function(err, recordsets) {

                if(err) {

                    console.log('Error: ' + err);

                    callback(err);

                }

                else {

                    console.dir(recordsets);

                    callback(null, recordsets);

                }

            });

        }

    });



    connection.on('error', function(err) {

        console.log('Error: ' + err);

    });

}
*/


//module.exports = DataStore;
