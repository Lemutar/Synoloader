

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


test_Protocol_connect_succsed_mock.description = 'test_Protocol_connect_succsed_mock';
test_Protocol_connect_succsed_mock.priority    = 'must';
function test_Protocol_connect_succsed_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 

 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');
 utils.writeTo("{ \"data\" :{\"sid\" : \"ohOCjwhHhwghw\"},\"success\": true }" , "../fixtures/connect.txt" );
 server.expect("/webapi/auth.cgi", 200, '/connect.txt'); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(true,myresponse.success);
 assert.equals("ohOCjwhHhwghw",myresponse.id);
}



test_Protocol_connect_fail_400_mock.description = 'test_Protocol_connect_fail_400_mock';
test_Protocol_connect_fail_400_mock.priority    = 'must';
function test_Protocol_connect_fail_400_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');
 
 utils.writeTo("{ \"error\" :{\"code\" : 400},\"success\": false }" , "../fixtures/connect.txt" );
 server.expect("/webapi/auth.cgi", 200, '/connect.txt'); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals("No such account or incorrect password",myresponse.error_text);
}

test_Protocol_connect_fail_401_mock.description = 'test_Protocol_connect_fail_401_mock';
test_Protocol_connect_fail_401_mock.priority    = 'must';
function test_Protocol_connect_fail_401_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');
 
 utils.writeTo("{ \"error\" :{\"code\" : 401},\"success\": false }" , "../fixtures/connect.txt" );
 server.expect("/webapi/auth.cgi", 200, '/connect.txt'); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals("Account disabled",myresponse.error_text);
}

test_Protocol_connect_fail_402_mock.description = 'test_Protocol_connect_fail_402_mock';
test_Protocol_connect_fail_402_mock.priority    = 'must';
function test_Protocol_connect_fail_402_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');
 
 utils.writeTo("{ \"error\" :{\"code\" : 402},\"success\": false }" , "../fixtures/connect.txt" );
 server.expect("/webapi/auth.cgi", 200, '/connect.txt'); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals("Permission denied",myresponse.error_text);
}

test_Protocol_connect_fail_403_mock.description = 'test_Protocol_connect_fail_403_mock';
test_Protocol_connect_fail_403_mock.priority    = 'must';
function test_Protocol_connect_fail_403_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');
 
 utils.writeTo("{ \"error\" :{\"code\" : 403},\"success\": false }" , "../fixtures/connect.txt" );
 server.expect("/webapi/auth.cgi", 200, '/connect.txt'); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals("2-step verification code required",myresponse.error_text);
}

test_Protocol_connect_fail_404_mock.description = 'test_Protocol_connect_fail_404_mock';
test_Protocol_connect_fail_404_mock.priority    = 'must';
function test_Protocol_connect_fail_404_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response;loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');
 
 utils.writeTo("{ \"error\" :{\"code\" : 404},\"success\": false }" , "../fixtures/connect.txt" );
 server.expect("/webapi/auth.cgi", 200, '/connect.txt'); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals("Failed to authenticate 2-step verification code",myresponse.error_text);
}
