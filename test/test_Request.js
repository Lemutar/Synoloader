

utils.include( utils.baseURL + "../src/modules/Request.js"); 


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


test_Request_succsed_post.description = 'test_Request_succsed_post';
test_Request_succsed_post.priority    = 'must';
function test_Request_succsed_post() {
 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 utils.writeTo("my_test" , "../fixtures/test.txt" );
 var mytest= Request('http://localhost:4445/download/download_redirector.cgi?test','',500, setdone);
 server.expect('/download/download_redirector.cgi', 200, '/test.txt'); 
 mytest.post();

 utils.wait(loaded);
 assert.equals(200,myresponse.status);
 assert.equals("my_test",myresponse.text);
 
}

test_Request_succsed_get.description = 'test_Request_succsed_get';
test_Request_succsed_get.priority    = 'must';
function test_Request_succsed_get() {
 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 utils.writeTo("my_test" , "../fixtures/test.txt" );
 var mytest= Request('http://localhost:4445/download/download_redirector.cgi','',500, setdone);

 server.expect('/download/download_redirector.cgi', 200, '/test.txt'); 
 mytest.get();

 utils.wait(loaded);
 assert.equals(200,myresponse.status);
 assert.equals("my_test",myresponse.text);
 
}


test_Request_resive_404.description = 'test_Request_resive_404';
test_Request_resive_404.priority    = 'must';
function test_Request_resive_404() {
 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 utils.writeTo("{ \"id\" : \"G.OzcP8kl19EU\", \"login_success\" : true , \"success\" : true }" , "../fixtures/test.txt" );
 var mytest= Request('http://localhost:4445/download','',1000, setdone);

 server.expect('/download', 404, '/test.txt');
 mytest.post();

 utils.wait(loaded);
 assert.equals(404,myresponse.status);
 assert.equals("",myresponse.text);
}

test_Request_timeout.description = 'test_Request_timeout';
test_Request_timeout.priority    = 'must';
function test_Request_timeout() {
 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 utils.writeTo("{ \"id\" : \"G.OzcP8kl19EU\", \"login_success\" : true , \"success\" : true }" , "../fixtures/test.txt" );
 var mytest= Request('http://localhost:4445/download','',50, setdone);

 server.expect('/download', 200, { path : '/test.txt', delay : 3000 });
 mytest.post();

 utils.wait(loaded);
 assert.equals(408,myresponse.status);
 assert.equals("Request Time-out",myresponse.statusText);
}


test_Request_succsed_JSON.description = 'test_Request_succsed_JSON';
test_Request_succsed_JSON.priority    = 'must';
function test_Request_succsed_JSON() {
 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 utils.writeTo("{ \"test\" :  true }" , "../fixtures/test.txt" );
 var mytest= Request('http://localhost:4445/download/download_redirector.cgi','',500, setdone);

 server.expect('/download/download_redirector.cgi', 200, '/test.txt'); 
 mytest.post();

 utils.wait(loaded);
 assert.equals(200,myresponse.status);
 assert.equals(true,myresponse.json.test);
}



