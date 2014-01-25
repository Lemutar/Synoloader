

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
/*

test_Protocol_connect_faild_not_connect_mock.description = 'test_Protocol_connect_faild_not_connect_mock';
test_Protocol_connect_faild_not_connect_mock.priority    = 'must';
function test_Protocol_connect_faild_not_connect_mock() {

 myresponse={};
 var setdone = function(response){myresponse=response; };
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 //mytest= Protocol('http://localhost:4445');
 mytest= Protocol('http://192.168.0.200:5000',5000,'synoloader_tester', '1234');

 utils.writeTo("{ \"errcode\" : -2, \"login_success\" : false , \"success\" : true }" , "../fixtures/connect.txt" );


 server.expect('/download/download_redirector.cgi', 200, '/connect.txt'); 


 mytest.task_action('delete',setdone);


 utils.wait(5000);
 assert.equals(false,myresponse.success);
 assert.equals('wrong password',myresponse.error_text);
}
*/
