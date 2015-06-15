

utils.include( utils.baseURL + "../src/modules/DownloadManager.js");
utils.include( utils.baseURL + "../src/modules/Protocol_API.js"); 

function setUp()
{
  
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

test_Protocol_DownloadManager_transfer_to_nas_faild_mock.description = 'test_Protocol_DownloadManager_transfer_to_nas_faild_mock';
test_Protocol_DownloadManager_transfer_to_nas_faild_mock.priority    = 'must';
function test_Protocol_DownloadManager_transfer_to_nas_faild_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");
 var loaded = { value : false };
 utils.writeTo("{ \"error\" :{\"code\" : 105},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 
 SynoLoader_DownloadManager.password = "1234";
 SynoLoader_DownloadManager.username = "test_user";
 SynoLoader_DownloadManager.set_protocol();
 SynoLoader_DownloadManager.protocol.base_url = 'http://localhost:4445';
 SynoLoader_DownloadManager.protocol.Connect_Time = Date.now();
 SynoLoader_DownloadManager.protocol.connect_id = "122211";

 var stube_connect_to_nas = function() {

 };

 SynoLoader_DownloadManager.connect_to_nas =  stube_connect_to_nas;


 var NotificationMock = new Mock(Notification);
 NotificationMock.expect('show', ["Send link failed","The logged in session does not have permission"], null)
 .andStub(function(title,text){loaded.value = true;}).times(1);
 SynoLoader_DownloadManager.Notification = NotificationMock;

 SynoLoader_DownloadManager.transfer_to_nas("link");

 utils.wait(loaded);
 
}


test_Protocol_DownloadManager_transfer_to_nas_mock.description = 'test_Protocol_DownloadManager_transfer_to_nas_mock';
test_Protocol_DownloadManager_transfer_to_nas_mock.priority    = 'must';
function test_Protocol_DownloadManager_transfer_to_nas_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");
 var loaded = { value : false };
 utils.writeTo("{ \"error\" :{\"code\" : 105},\"success\": true }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 
 SynoLoader_DownloadManager.password = "1234";
 SynoLoader_DownloadManager.username = "test_user";
 SynoLoader_DownloadManager.set_protocol();
 SynoLoader_DownloadManager.protocol.base_url = 'http://localhost:4445';
 SynoLoader_DownloadManager.protocol.Connect_Time = Date.now();
 SynoLoader_DownloadManager.protocol.connect_id = "122211";

 var NotificationMock = new Mock(Notification);
 NotificationMock.expect('show', ["Send link","link"], null)
 .andStub(function(title,text){loaded.value = true;}).times(1);
 SynoLoader_DownloadManager.Notification = NotificationMock;

 SynoLoader_DownloadManager.transfer_to_nas("link");

 utils.wait(loaded);

}

test_Protocol_DownloadManager_transfer_to_nas_torrent_file_mock.description = 'test_Protocol_DownloadManager_transfer_to_nas_torrent_file_mock';
test_Protocol_DownloadManager_transfer_to_nas_torrent_file_mock.priority    = 'must';
function test_Protocol_DownloadManager_transfer_to_nas_torrent_file_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 
 var loaded = { value : false };
 utils.writeTo("42" , "../fixtures/test_torrent.txt" );
 server.expect("/test.Torrent", 200, '/test_torrent.txt'); 
 
 utils.writeTo("{ \"error\" :{\"code\" : 105},\"success\": true }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 
 SynoLoader_DownloadManager.password = "1234";
 SynoLoader_DownloadManager.username = "test_user";
 SynoLoader_DownloadManager.set_protocol();
 SynoLoader_DownloadManager.protocol.base_url = 'http://localhost:4445';
 SynoLoader_DownloadManager.protocol.Connect_Time = Date.now();
 SynoLoader_DownloadManager.protocol.connect_id = "122211";

 var NotificationMock = new Mock(Notification);
 NotificationMock.expect('show', ["Send torrent file to NAS","http://localhost:4445/test.Torrent"], null)
 .andStub(function(title,text){loaded.value = true;}).times(1);
 SynoLoader_DownloadManager.Notification = NotificationMock;
 SynoLoader_DownloadManager.transfer_to_nas("http://localhost:4445/test.Torrent");

 utils.wait(loaded);

}

test_DownloadManager_convert_old_url_protocol.description = 'test_DownloadManager_convert_old_url_protocol';
test_DownloadManager_convert_old_url_protocol.priority    = 'must';
function test_DownloadManager_convert_old_url_protocol() {
 var preferences = Components.classes["@mozilla.org/preferences-service;1"]
     .getService(Components.interfaces.nsIPrefService)
     .getBranch("extensions.SynoLoader.");
 preferences.setCharPref('protocol',"test");
 preferences.setCharPref('host',"");
 SynoLoader_DownloadManager.convert_old_url("http://localhost");
 assert.equals("http",preferences.getCharPref('protocol'));
 assert.equals("localhost",preferences.getCharPref('host'));
}

test_DownloadManager_not_convert_old_url_protocol.description = 'test_DownloadManager_not_convert_old_url_protocol';
test_DownloadManager_not_convert_old_url_protocol.priority    = 'must';
function test_DownloadManager_not_convert_old_url_protocol() {
 var preferences = Components.classes["@mozilla.org/preferences-service;1"]
     .getService(Components.interfaces.nsIPrefService)
     .getBranch("extensions.SynoLoader.");
 preferences.setCharPref('protocol',"test");
 preferences.setCharPref('host',"");
 SynoLoader_DownloadManager.convert_old_url("localhost");
 assert.equals("test",preferences.getCharPref('protocol'));
 assert.equals("localhost",preferences.getCharPref('host'));
}

test_DownloadManager_convert_old_url_port.description = 'test_DownloadManager_not_convert_old_url_port';
test_DownloadManager_convert_old_url_port.priority    = 'must';
function test_DownloadManager_convert_old_url_port() {
 var preferences = Components.classes["@mozilla.org/preferences-service;1"]
     .getService(Components.interfaces.nsIPrefService)
     .getBranch("extensions.SynoLoader.");
 preferences.setCharPref('port',"test");
 preferences.setCharPref('host',"");
 SynoLoader_DownloadManager.convert_old_url("http://localhost:4445");
 assert.equals("4445",preferences.getCharPref('port'));
 assert.equals("localhost",preferences.getCharPref('host'));
}

test_DownloadManager_convert_old_url_ip.description = 'test_DownloadManager_convert_old_url_ip';
test_DownloadManager_convert_old_url_ip.priority    = 'must';
function test_DownloadManager_convert_old_url_ip() {
 var preferences = Components.classes["@mozilla.org/preferences-service;1"]
     .getService(Components.interfaces.nsIPrefService)
     .getBranch("extensions.SynoLoader.");
 preferences.setCharPref('port',"test");
 preferences.setCharPref('host',"");
 SynoLoader_DownloadManager.convert_old_url("http://192.168.0.201:5050");
 assert.equals("5050",preferences.getCharPref('port'));
 assert.equals("192.168.0.201",preferences.getCharPref('host'));
}
