

utils.include( utils.baseURL + "../src/modules/DownloadManager.js");


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


test_Protocol_DownloadManager_connect_to_nas_mock.description = 'test_Protocol_DownloadManager_connect_to_nas_mock';
test_Protocol_DownloadManager_connect_to_nas_mock.priority    = 'must';
function test_Protocol_DownloadManager_connect_to_nas_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");


 utils.writeTo("{ \"data\" :{\"sid\" : \"ohOCjwhHhwghw\"},\"success\": true }" , "../fixtures/connect.txt" );
 server.expect("/webapi/auth.cgi", 200, '/connect.txt'); 
 
 SynoLoader_DownloadManager.password = "1234";
 SynoLoader_DownloadManager.username = "test_user";
 SynoLoader_DownloadManager.url = 'http://localhost:4445';
 SynoLoader_DownloadManager.set_protocol("2");
 SynoLoader_DownloadManager.connect_to_nas();

 utils.wait(500);
 assert.equals(true,SynoLoader_DownloadManager.is_connect);
}



test_Protocol_DownloadManager_transfer_to_nas__faild_mock.description = 'test_Protocol_DownloadManager_transfer_to_nas__faild_mock';
test_Protocol_DownloadManager_transfer_to_nas__faild_mock.priority    = 'must';
function test_Protocol_DownloadManager_transfer_to_nas__faild_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 utils.writeTo("{ \"error\" :{\"code\" : 105},\"success\": false }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 
 SynoLoader_DownloadManager.password = "1234";
 SynoLoader_DownloadManager.username = "test_user";
 SynoLoader_DownloadManager.url = 'http://localhost:4445';
 SynoLoader_DownloadManager.set_protocol("2");
 SynoLoader_DownloadManager.protocol.Connect_Time = Date.now();
 SynoLoader_DownloadManager.protocol.connect_id = "122211";



 var NotificationMock = new Mock(Notification);
 NotificationMock.expect('show', ["Send link failed","The logged in session does not have permission"], null);
 SynoLoader_DownloadManager.Notification = NotificationMock;

 SynoLoader_DownloadManager.transfer_to_nas("link");

 utils.wait(500);
 
}

test_Protocol_DownloadManager_transfer_to_nas_mock.description = 'test_Protocol_DownloadManager_transfer_to_nas_mock';
test_Protocol_DownloadManager_transfer_to_nas_mock.priority    = 'must';
function test_Protocol_DownloadManager_transfer_to_nas_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 utils.writeTo("{ \"error\" :{\"code\" : 105},\"success\": true }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 
 SynoLoader_DownloadManager.password = "1234";
 SynoLoader_DownloadManager.username = "test_user";
 SynoLoader_DownloadManager.url = 'http://localhost:4445';
 SynoLoader_DownloadManager.set_protocol("2");
 SynoLoader_DownloadManager.protocol.Connect_Time = Date.now();
 SynoLoader_DownloadManager.protocol.connect_id = "122211";

 var NotificationMock = new Mock(Notification);
 NotificationMock.expect('show', ["Send link","link"], null);
 SynoLoader_DownloadManager.Notification = NotificationMock;

 SynoLoader_DownloadManager.transfer_to_nas("link");

 utils.wait(800);

}

test_Protocol_DownloadManager_transfer_to_nas_torrent_file_mock.description = 'test_Protocol_DownloadManager_transfer_to_nas_torrent_file_mock';
test_Protocol_DownloadManager_transfer_to_nas_torrent_file_mock.priority    = 'must';
function test_Protocol_DownloadManager_transfer_to_nas_torrent_file_mock() {

 var server = utils.setUpHttpServer(4445, "../fixtures");
 
 
 
 utils.writeTo("42" , "../fixtures/test_torrent.txt" );
 server.expect("/test.Torrent", 200, '/test_torrent.txt'); 
 
 utils.writeTo("{ \"error\" :{\"code\" : 105},\"success\": true }" , "../fixtures/action.txt" );
 server.expect("/webapi/DownloadStation/task.cgi", 200, '/action.txt'); 
 
 SynoLoader_DownloadManager.password = "1234";
 SynoLoader_DownloadManager.username = "test_user";
 SynoLoader_DownloadManager.url = 'http://localhost:4445';
 SynoLoader_DownloadManager.set_protocol("2");
 SynoLoader_DownloadManager.protocol.Connect_Time = Date.now();
 SynoLoader_DownloadManager.protocol.connect_id = "122211";

 var NotificationMock = new Mock(Notification);
 NotificationMock.expect('show', ["Send torrent file to NAS","http://localhost:4445/test.Torrent"], null);
 SynoLoader_DownloadManager.Notification = NotificationMock;
 SynoLoader_DownloadManager.transfer_to_nas("http://localhost:4445/test.Torrent");

 utils.wait(500);

}


