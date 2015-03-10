

utils.include( utils.baseURL + "../src/modules/DownloadManager.js");


function setUp()
{
 SynoLoader_DownloadManager.password = "1234";
 SynoLoader_DownloadManager.username = "synoloader_tester";
 SynoLoader_DownloadManager.url = 'http://lut001.no-ip.org:5000';
 SynoLoader_DownloadManager.set_protocol("2");
 SynoLoader_DownloadManager.Util.show_log=true;
 
}

function tearDown() {
   
   SynoLoader_DownloadManager.delete_all();
   utils.wait(5000);

}

function startUp()
{
 
}

function shutDown()
{

}



test_Protocol_DownloadManager_transfer_to_nas_torrent_file.description = 'test_Protocol_DownloadManager_transfer_to_nas_torrent_file';
test_Protocol_DownloadManager_transfer_to_nas_torrent_file.priority    = 'must';
function test_Protocol_DownloadManager_transfer_to_nas_torrent_file() {



 var NotificationMock = new Mock(Notification);
 var loaded = { value : false };
 NotificationMock.expect('show', ["Send torrent file to NAS","http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso.torrent"], null)
   .andStub(function(title,text){loaded.value = true}).times(1);
 SynoLoader_DownloadManager.Notification = NotificationMock;
 SynoLoader_DownloadManager.transfer_to_nas("http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso.torrent");
 utils.wait(loaded);


}


test_Protocol_DownloadManager_transfer_to_nas_link.description = 'test_Protocol_DownloadManager_transfer_to_nas_link';
test_Protocol_DownloadManager_transfer_to_nas_link.priority    = 'must';
function test_Protocol_DownloadManager_transfer_to_nas_link() {



 var NotificationMock = new Mock(Notification);
 var loaded = { value : false };
 NotificationMock.expect('show', ["Send link","http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso"])
   .andStub(function(title,text){loaded.value = true}).times(1);
 SynoLoader_DownloadManager.Notification = NotificationMock;
 SynoLoader_DownloadManager.transfer_to_nas("http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso");
 utils.wait(loaded);


}

test_Protocol_DownloadManager_transfer_to_nas_torrent_file_old.description = 'test_Protocol_DownloadManager_transfer_to_nas_torrent_file_old';
test_Protocol_DownloadManager_transfer_to_nas_torrent_file_old.priority    = 'never';
function test_Protocol_DownloadManager_transfer_to_nas_torrent_file_old() {


 SynoLoader_DownloadManager.set_protocol("1");
 var NotificationMock = new Mock(Notification);
 var loaded = { value : false };
 NotificationMock.expect('show', ["Send link","http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso.torrent"], null)
   .andStub(function(title,text){loaded.value = true}).times(1);
 SynoLoader_DownloadManager.Notification = NotificationMock;
 SynoLoader_DownloadManager.transfer_to_nas("http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso.torrent");
 utils.wait(loaded);

}



