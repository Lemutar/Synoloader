

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


test_Protocol_connect_succsed_mock.description = 'test_Protocol_connect_succsed_mock';
test_Protocol_connect_succsed_mock.priority    = 'must';
function test_Protocol_connect_succsed_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');
 utils.writeTo("{ \"id\" : \"G.OzcP8kl19EU\", \"login_success\" : true , \"success\" : true }" , "../fixtures/test.txt" );
 server.expect('/download/download_redirector.cgi', 200, '/test.txt'); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(true,myresponse.success);
 assert.equals("G.OzcP8kl19EU",myresponse.id);
}


test_Protocol_connect_wrong_password_mock.description = 'test_Protocol_connect_wrong_password_mock';
test_Protocol_connect_wrong_password_mock.priority    = 'must';
function test_Protocol_connect_wrong_password_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester', '1234');
 utils.writeTo("{ \"errcode\" : -2, \"login_success\" : false , \"success\" : true }" , "../fixtures/test.txt" );
 server.expect('/download/download_redirector.cgi', 200, '/test.txt'); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals('wrong password',myresponse.error_text);
}

test_Protocol_connect_wrong_user_mock.description = 'test_Protocol_connect_wrong_user_mock';
test_Protocol_connect_wrong_user_mock.priority    = 'must';
function test_Protocol_connect_wrong_user_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester', '1234');
 utils.writeTo("{ \"errcode\" : -5, \"login_success\" : false , \"success\" : true }" , "../fixtures/test.txt" );
 server.expect('/download/download_redirector.cgi', 200, '/test.txt'); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals('unknown user',myresponse.error_text);
}

test_Protocol_connect_timeout_mock.description = 'test_Protocol_connect_timeout_mock';
test_Protocol_connect_timeout_mock.priority    = 'must';
function test_Protocol_connect_timeout_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445',20,'synoloader_tester', '1234');
 utils.writeTo("{ \"errcode\" : -5, \"login_success\" : false , \"success\" : true }" , "../fixtures/test.txt" );
 server.expect('/download/download_redirector.cgi', 200, { path : '/test.txt', delay : 200 }); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals('Request Time-out',myresponse.error_text);
}

test_Protocol_connect_error404_mock.description = 'test_Protocol_connect_error404_mock';
test_Protocol_connect_error404_mock.priority    = 'must';
function test_Protocol_connect_error404_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445',500,'synoloader_tester', '1234');
 utils.writeTo("{ \"errcode\" : -5, \"login_success\" : false , \"success\" : true }" , "../fixtures/test.txt" );
 server.expect('/download/download_redirector.cgi', 404, '/test.txt'); 
 mytest.conect(setdone);


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals('Not Found',myresponse.error_text);
}





