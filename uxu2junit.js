var fs = require('fs')
var builder = require('xmlbuilder');
var testsuites = builder.create('testsuites');
fs.readFile('test_result.json', 'utf8', function (err,data) {
  if (err) 
  {
    return console.log(err);
  }
  var test_data = JSON.parse(data);
  for (var index = 0; index < test_data.length; index++) 
  {
    var testsuite = testsuites.ele('testsuite');
    testsuite.att('name', test_data[index].title );
    testsuite.att('tests', test_data[index].topics.length );
    test_data[index].topics.forEach(function(test) 
    {
        var testcase = testsuite.ele('testcase');
        testcase.att('name', test.description );
        console.log(test.description);
    });
  }

  fs.writeFile("test_result.xml", testsuites.end({ pretty: true}), function(err) {
    if(err) {
        console.log(err);
    } else {
        console.log("The file was saved!");
    }
    }); 
  return ;
});
