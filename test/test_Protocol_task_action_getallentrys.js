

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

test_Protocol_connect_faild_not_connect_mock.description = 'test_Protocol_connect_faild_not_connect_mock';
test_Protocol_connect_faild_not_connect_mock.priority    = 'must';
function test_Protocol_connect_faild_not_connect_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445');
 

 utils.writeTo("{ \"errcode\" : -2, \"login_success\" : false , \"success\" : true }" , "../fixtures/connect.txt" );


 server.expect('/download/download_redirector.cgi', 200, '/connect.txt'); 


 mytest.task_action(setdone,'getall'); 


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals('wrong password',myresponse.error_text);
}

test_Protocol_connect_succed_not_connect_mock.description = 'test_Protocol_connect_succed_not_connect_mock';
test_Protocol_connect_succed_not_connect_mock.priority    = 'must';
function test_Protocol_connect_succed_not_connect_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response;loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445');
 

 utils.writeTo("{ \"id\" : \"G.OzcP8kl19EU\", \"login_success\" : true , \"success\" : true }" , "../fixtures/connect.txt" );
 utils.writeTo("{ \"success\" : true , \"items\" : [] }" , "../fixtures/items.txt" );

 server.expect('/download/download_redirector.cgi', 200, '/connect.txt'); 
 server.expect('/download/download_redirector.cgi', 200, '/items.txt'); 

 mytest.task_action(setdone,'getall'); 


 utils.wait(loaded);
 assert.equals(true,myresponse.success);
 assert.equals([],myresponse.items);
}


test_Protocol_connect_faild_500_not_connect_mock.description = 'test_Protocol_connect_faild_500_not_connect_mock';
test_Protocol_connect_faild_500_not_connect_mock.priority    = 'must';
function test_Protocol_connect_faild_500_not_connect_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445');
 

 utils.writeTo("{ \"id\" : \"G.OzcP8kl19EU\", \"login_success\" : true , \"success\" : true }" , "../fixtures/connect.txt" );
 utils.writeTo("{ \"success\" : true , \"items\" : [] }" , "../fixtures/items.txt" );

 server.expect('/download/download_redirector.cgi', 200, '/connect.txt'); 
 server.expect('/download/download_redirector.cgi', 500); 

 mytest.task_action(setdone,'getall'); 


 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals('Internal Server Error',myresponse.error_text);
}

test_Protocol_connect_faild_404_mock.description = 'test_Protocol_connect_faild_404_mock';
test_Protocol_connect_faild_404_mock.priority    = 'must';
function test_Protocol_connect_faild_404_mock() {

 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse=response; loaded.value = true;};
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 

 mytest= Protocol('http://localhost:4445');
 server.expect('/download/download_redirector.cgi', 404); 
 mytest.Connect_Time = Date.now();
 mytest.task_action(setdone,'getall'); 



 utils.wait(loaded);
 assert.equals(false,myresponse.success);
 assert.equals('Not Found',myresponse.error_text);
}





test_Protocol_connect_succsed_mock.description = 'test_Protocol_get_all_entrys_succsed_mock';
test_Protocol_connect_succsed_mock.priority    = 'must';
function test_Protocol_connect_succsed_mock() {

 myresponse={};
 
 var server = utils.setUpHttpServer(4445, "../fixtures");
 var loaded = { value : false };
 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester', '1234');
 var setdone_get_all_items = function(response){myresponse=response; loaded.value = true;};

 utils.writeTo("{ \"success\" : true , \"items\" : [] }" , "../fixtures/items.txt" );

 server.expect('/download/download_redirector.cgi', 200, '/items.txt'); 
 mytest.Connect_Time = Date.now();
 mytest.task_action(setdone_get_all_items,'getall'); 


 utils.wait(loaded);
 assert.equals(true,myresponse.success);
 assert.equals([],myresponse.items);
}



test_Protocol_connect_succsed_itme_mock.description = 'test_Protocol_get_all_entrys_succsed_itme_mock';
test_Protocol_connect_succsed_itme_mock.priority    = 'must';
function test_Protocol_connect_succsed_itme_mock() {

 myresponse={};
 var loaded = { value : false };
 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 mytest= Protocol('http://localhost:4445',5000,'synoloader_tester', '1234');
 var setdone_get_all_items = function(response){myresponse=response; loaded.value = true;};

/*jshint multistr: true */
 var file_contend = "{\
	   \"items\" : [\
	      {\
		 \"availablePieces\" : 0,\
		 \"connectedPeers\" : 0,\
		 \"createdTime\" : 1386523198,\
		 \"currentRate\" : 0,\
		 \"currentSize\" : \"57.35 MB\",\
		 \"downloadedPieces\" : 0,\
		 \"extraInfo\" : \"\",\
		 \"filename\" : \"ubuntu-12.04.3-desktop-amd64.iso\",\
		 \"id\" : 333,\
		 \"pid\" : -1,\
		 \"progress\" : \"  8.1%\",\
		 \"seedingInterval\" : 0,\
		 \"seedingRatio\" : 0,\
		 \"startedTime\" : 1386523202,\
		 \"status\" : 3,\
		 \"totalPeers\" : 0,\
		 \"totalPieces\" : 0,\
		 \"totalSize\" : \"708.00 MB\",\
		 \"totalUpload\" : 0,\
		 \"uploadRate\" : 0,\
		 \"url\" : \"http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=lts\",\
		 \"username\" : \"synoloader_tester\"\
	      }\
	   ],\
	   \"success\" : true\
	}";

 utils.writeTo(file_contend,"../fixtures/items.txt" );

 server.expect('/download/download_redirector.cgi', 200, '/items.txt'); 
 mytest.Connect_Time = Date.now();
 mytest.task_action(setdone_get_all_items,'getall'); 

 utils.wait(loaded);
 assert.equals(true,myresponse.success);
 assert.equals("ubuntu-12.04.3-desktop-amd64.iso",myresponse.items[0].filename);
}








