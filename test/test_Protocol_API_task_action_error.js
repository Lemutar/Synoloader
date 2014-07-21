

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



test_Protocol_task_action_add_fail_400_mock.description = 'test_Protocol_task_action_add_fail_400_mock';
test_Protocol_task_action_add_fail_400_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_400_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var addurl_callback = function(response){addurl_response=response; };
 utils.writeTo("{ \"error\" :{\"code\" : 400},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(50);
 assert.equals(false,addurl_response.success);
 assert.equals("File upload failed",addurl_response.error_text);
}

test_Protocol_task_action_add_fail_401_mock.description = 'test_Protocol_task_action_add_fail_401_mock';
test_Protocol_task_action_add_fail_401_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_401_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var addurl_callback = function(response){addurl_response=response; };
 utils.writeTo("{ \"error\" :{\"code\" : 401},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(50);
 assert.equals(false,addurl_response.success);
 assert.equals("Max number of tasks reached",addurl_response.error_text);
}


test_Protocol_task_action_add_fail_402_mock.description = 'test_Protocol_task_action_add_fail_402_mock';
test_Protocol_task_action_add_fail_402_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_402_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var addurl_callback = function(response){addurl_response=response; };
 utils.writeTo("{ \"error\" :{\"code\" : 402},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(50);
 assert.equals(false,addurl_response.success);
 assert.equals("Destination denied",addurl_response.error_text);
}

test_Protocol_task_action_add_fail_403_mock.description = 'test_Protocol_task_action_add_fail_403_mock';
test_Protocol_task_action_add_fail_403_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_403_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var addurl_callback = function(response){addurl_response=response; };
 utils.writeTo("{ \"error\" :{\"code\" : 403},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(50);
 assert.equals(false,addurl_response.success);
 assert.equals("Destination does not exist",addurl_response.error_text);
}


test_Protocol_task_action_add_fail_404_mock.description = 'test_Protocol_task_action_add_fail_404_mock';
test_Protocol_task_action_add_fail_404_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_404_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var addurl_callback = function(response){addurl_response=response; };
 utils.writeTo("{ \"error\" :{\"code\" : 404},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(50);
 assert.equals(false,addurl_response.success);
 assert.equals("Invalid task id",addurl_response.error_text);
}


test_Protocol_task_action_add_fail_405_mock.description = 'test_Protocol_task_action_add_fail_405_mock';
test_Protocol_task_action_add_fail_405_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_405_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var addurl_callback = function(response){addurl_response=response; };
 utils.writeTo("{ \"error\" :{\"code\" : 405},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(50);
 assert.equals(false,addurl_response.success);
 assert.equals("Invalid task action",addurl_response.error_text);
}

test_Protocol_task_action_add_fail_406_mock.description = 'test_Protocol_task_action_add_fail_406_mock';
test_Protocol_task_action_add_fail_406_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_406_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var addurl_callback = function(response){addurl_response=response; };
 utils.writeTo("{ \"error\" :{\"code\" : 406},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(50);
 assert.equals(false,addurl_response.success);
 assert.equals("No default destination",addurl_response.error_text);
}


