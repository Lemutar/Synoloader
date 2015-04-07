

utils.include( utils.baseURL + "../src/modules/QuickConnect.js");
utils.include( utils.baseURL + "../src/modules/Request.js"); 

function setUp()
{


}

function tearDown() {
   
}

function startUp()
{
 
}

function shutDown()
{

}



test_Synoloader_QuickConnect_get.description = 'test_Synoloader_QuickConnect_get';
test_Synoloader_QuickConnect_get.priority    = 'must';
function test_Synoloader_QuickConnect_get() {

 myconnect=QuickConnect(5000,5000,"http://", 5050);
 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse = response; loaded.value = true;};
 myconnect.get('lemutar', setdone); 
 utils.wait(loaded);
 assert.equals(true,myresponse.success); 
 assert.equals("192.168.0.201",myresponse.ip); 
}


test_Synoloader_QuickConnect_get.description = 'test_Synoloader_QuickConnect_get';
test_Synoloader_QuickConnect_get.priority    = 'must';
function test_Synoloader_QuickConnect_get() {

 myconnect=QuickConnect(5000,5000,"http://", 5050);
 myresponse={};
 var loaded = { value : false };
 var setdone = function(response){myresponse = response; loaded.value = true;};
 myconnect.get('192.168.0.201', setdone); 
 utils.wait(loaded);
 assert.equals(false,myresponse.success); 
 assert.equals("192.168.0.201",myresponse.ip); 
}

