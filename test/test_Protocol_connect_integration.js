utils.include( utils.baseURL + "../src/modules/Protocol.js"); 


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

test_Protocol_connect_wrong_password_43.description = 'test_Protocol_connect_wrong_password_43';
test_Protocol_connect_wrong_password_43.priority    = 'never';
function test_Protocol_connect_wrong_password_43() {

 myresponse={};
 var setdone = function(response){myresponse=response; };
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 mytest= Protocol('http://192.168.0.200:5000',5000,'synoloader_tester', '1234s');
 mytest.conect(setdone);

 utils.wait(5000);
 assert.equals(false,myresponse.success);
 assert.equals('wrong password',myresponse.error_text);
}

test_Protocol_connect_wrong_user_43.description = 'test_Protocol_connect_wrong_user_43';
test_Protocol_connect_wrong_user_43.priority    = 'never';
function test_Protocol_connect_wrong_user_43() {

 myresponse={};
 var setdone = function(response){myresponse=response; };
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 mytest= Protocol('http://192.168.0.200:5000',5000,'synoloader_testerr', '1234');
 mytest.conect(setdone);

 utils.wait(5000);
 assert.equals(false,myresponse.success);
 assert.equals('unknown user',myresponse.error_text);
}



