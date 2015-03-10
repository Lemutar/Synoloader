

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



test_Protocol_task_action_add_fail_100_mock.description = 'test_Protocol_task_action_add_fail_100_mock';
test_Protocol_task_action_add_fail_100_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_100_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var loaded = { value : false };
 var addurl_callback = function(response){addurl_response=response; loaded.value = true;};
 utils.writeTo("{ \"error\" :{\"code\" : 100},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(loaded);
 assert.equals(false,addurl_response.success);
 assert.equals("Unknown error",addurl_response.error_text);
}

test_Protocol_task_action_add_fail_101_mock.description = 'test_Protocol_task_action_add_fail_101_mock';
test_Protocol_task_action_add_fail_101_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_101_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var loaded = { value : false };
 var addurl_callback = function(response){addurl_response=response; loaded.value = true;};
 utils.writeTo("{ \"error\" :{\"code\" : 101},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(loaded);
 assert.equals(false,addurl_response.success);
 assert.equals("Invalid parameter",addurl_response.error_text);
}

test_Protocol_task_action_add_fail_102_mock.description = 'test_Protocol_task_action_add_fail_102_mock';
test_Protocol_task_action_add_fail_102_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_102_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var loaded = { value : false };
 var addurl_callback = function(response){addurl_response=response; loaded.value = true; };
 utils.writeTo("{ \"error\" :{\"code\" : 102},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(loaded);
 assert.equals(false,addurl_response.success);
 assert.equals("The requested API does not exist",addurl_response.error_text);
}


test_Protocol_task_action_add_fail_103_mock.description = 'test_Protocol_task_action_add_fail_102_mock';
test_Protocol_task_action_add_fail_103_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_103_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var loaded = { value : false };
 var addurl_callback = function(response){addurl_response=response; loaded.value = true;};
 utils.writeTo("{ \"error\" :{\"code\" : 103},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(loaded);
 assert.equals(false,addurl_response.success);
 assert.equals("The requested method does not exist",addurl_response.error_text);
}

test_Protocol_task_action_add_fail_104_mock.description = 'test_Protocol_task_action_add_fail_104_mock';
test_Protocol_task_action_add_fail_104_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_104_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var loaded = { value : false };
 var addurl_callback = function(response){addurl_response=response;loaded.value = true; };
 utils.writeTo("{ \"error\" :{\"code\" : 104},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(loaded);
 assert.equals(false,addurl_response.success);
 assert.equals("The requested version does not support the functionality",addurl_response.error_text);
}

test_Protocol_task_action_add_fail_105_mock.description = 'test_Protocol_task_action_add_fail_105_mock';
test_Protocol_task_action_add_fail_105_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_105_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var loaded = { value : false };
 var addurl_callback = function(response){addurl_response=response; loaded.value = true;};
 utils.writeTo("{ \"error\" :{\"code\" : 105},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(loaded);
 assert.equals(false,addurl_response.success);
 assert.equals("The logged in session does not have permission",addurl_response.error_text);
}

test_Protocol_task_action_add_fail_106_mock.description = 'test_Protocol_task_action_add_fail_106_mock';
test_Protocol_task_action_add_fail_106_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_106_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var loaded = { value : false };
 var addurl_callback = function(response){addurl_response=response;loaded.value = true; };
 utils.writeTo("{ \"error\" :{\"code\" : 106},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(loaded);
 assert.equals(false,addurl_response.success);
 assert.equals("Session timeout",addurl_response.error_text);
}

test_Protocol_task_action_add_fail_107_mock.description = 'test_Protocol_task_action_add_fail_107_mock';
test_Protocol_task_action_add_fail_107_mock.priority    = 'must';
function test_Protocol_task_action_add_fail_107_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 testee= Protocol('http://localhost:4445',5000,'synoloader_tester','1234');

 addurl_response={};
 var loaded = { value : false };
 var addurl_callback = function(response){addurl_response=response; loaded.value = true;};
 utils.writeTo("{ \"error\" :{\"code\" : 107},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 testee.Connect_Time = Date.now();
 testee.task_action(addurl_callback,'addurl','http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest'); 

 utils.wait(loaded);
 assert.equals(false,addurl_response.success);
 assert.equals("Session interrupted by duplicate login",addurl_response.error_text);
}