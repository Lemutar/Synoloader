
utils.include( utils.baseURL + "../src/modules/Protocol_API.js"); 


function setUp() {
  
}

function tearDown() {
   utils.tearDownHttpServer(4445);
}

function startUp()
{
 
}

function shutDown()
{
}



test_Protocol_connect_43_API2.description = 'test_Protocol_connect_43_API2';
test_Protocol_connect_43_API2.priority    = 'never';
function test_Protocol_connect_43_API2() {

 myresponse={};
 var setdone = function(response){myresponse=response; };
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 mytest= Protocol('http://192.168.0.201:5050',5000,'synoloader_tester', '1234');
 mytest.conect(setdone);

 utils.wait(5000);
 assert.equals(true,myresponse.success);
}

test_Protocol_connect_wrong_password_43_API2.description = 'test_Protocol_connect_wrong_password_43_API2';
test_Protocol_connect_wrong_password_43_API2.priority    = 'never';
function test_Protocol_connect_wrong_password_43_API2() {

 myresponse={};
 var setdone = function(response){myresponse=response; };
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 mytest= Protocol('http://192.168.0.201:5050',5000,'synoloader_tester', '1234s');
 mytest.conect(setdone);

 utils.wait(5000);
 assert.equals(false,myresponse.success);
 assert.equals('No such account or incorrect password',myresponse.error_text);
}

test_Protocol_connect_wrong_user_43_API2.description = 'test_Protocol_connect_wrong_user_43_API2';
test_Protocol_connect_wrong_user_43_API2.priority    = 'never';
function test_Protocol_connect_wrong_user_43_API2() {

 myresponse={};
 var setdone = function(response){myresponse=response; };
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 mytest= Protocol('http://192.168.0.201:5050',5000,'synoloader_testerr', '1234');
 mytest.conect(setdone);

 utils.wait(5000);
 assert.equals(false,myresponse.success);
 assert.equals('No such account or incorrect password',myresponse.error_text);
}



