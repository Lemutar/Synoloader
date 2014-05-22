

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





test_Protocol_get_all_entrys_succsed_42.description = 'test_Protocol_get_all_entrys_succsed_42';
test_Protocol_get_all_entrys_succsed_42.priority    = 'never';
function test_Protocol_get_all_entrys_succsed_42() {
 mytest= Protocol('http://192.168.0.201:5050',5000,'synoloader_tester', '1234');

 connect_response={};
 var setdone = function(response){connect_response=response; };

 mytest.conect(setdone);

 utils.wait(2000);
 assert.equals(true,connect_response.success);

 myresponse={};
 var setdone_get_all_items = function(response){myresponse=response; };
 mytest.task_action(setdone_get_all_items,'getall'); 

 utils.wait(5000);
 assert.equals(true,myresponse.success);
 assert.equals([],myresponse.items);
}

test_Protocol_connect_succsed_42_without_connect.description = 'test_Protocol_get_all_entrys_succsed_42_without_connect';
test_Protocol_connect_succsed_42_without_connect.priority    = 'never';
function test_Protocol_connect_succsed_42_without_connect() {
 mytest= Protocol('http://192.168.0.201:5050',5000,'synoloader_tester', '1234');

 myresponse={};
 var setdone_get_all_items = function(response){myresponse=response; };
 mytest.task_action(setdone_get_all_items,'getall'); 

 utils.wait(5000);
 assert.equals(true,myresponse.success);
 assert.equals([],myresponse.items);
}





