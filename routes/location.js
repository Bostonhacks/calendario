//Contains functions to get the location of a class using the API at
//https://www.bu.edu/phpbin/course-search/section/?t=[classname]
//exports as location

var request = require('request');
var xml2js = require('xml2js');

var parser = new xml2js.Parser();
var exports = module.exports;

exports.getClassLocation = function (classtitle, section, callback){
  classtitle = classtitle.replace(/\s+/g, '');
  // console.log('2016SPRG' + classtitle + ' ' + section);
  request('https://www.bu.edu/phpbin/course-search/section/?t=' + classtitle, function (error, response, body) {
    if (!error && response.statusCode == 200) {
      parser.parseString(body, function (err, result) {
        if(err){
          console.log(err);
        }

        try {
          var json = JSON.parse(JSON.stringify(result));
        }
        catch(e){
          console.log(e);
          return null;
        }
        if(json != null){
          var table = json.html.body[0].div[0].div[0].div[0].div[0].table;
          var classJSON= table[table.length-1].tr;
          // console.log(JSON.stringify(classJSON));

            for(var i = 0; i < classJSON.length; i++){
                if(classJSON[i]["$"] != null){
                  if(classJSON[i]["$"]["data-section"] === '2016SPRG' + classtitle + ' ' + section){
                      exports.info = classJSON[i];
                      callback();
                  }
                }
                else{
                  console.log(JSON.stringify(classJSON[i]));
                }
            }
        }
      });
    };
  });
}
