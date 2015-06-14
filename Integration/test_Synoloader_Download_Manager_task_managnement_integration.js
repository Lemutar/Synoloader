

utils.include( utils.baseURL + "../src/modules/DownloadManager.js");


function setUp()
{

 SynoLoader_DownloadManager.password = "1234";
 SynoLoader_DownloadManager.username = "synoloader_tester";
 SynoLoader_DownloadManager.url_to_connect = 'http://z35.no-ip.org:5050';

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


test_Protocol_DownloadManager_load_download_list.description = 'test_Protocol_DownloadManager_load_download_list';
test_Protocol_DownloadManager_load_download_list.priority    = 'must';
function test_Protocol_DownloadManager_load_download_list() {


 SynoLoader_DownloadManager.set_protocol();
 SynoLoader_DownloadManager.Util.show_log=true;
 
 var NotificationMock = new Mock(Notification);
 var loaded = { value : false };
 NotificationMock.expect('show', ["Send link","http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso"], null)
   .andStub(function(title,text){loaded.value = true}).times(1);
 SynoLoader_DownloadManager.Notification = NotificationMock;
 
 SynoLoader_DownloadManager.transfer_to_nas("http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso");
 utils.wait(loaded);
 
 var download_items={};
 var loaded = { value : false };
 SynoLoader_DownloadManager.load_download_list(function(items){
   download_items=items;
   loaded.value = true;
   },function(items){
   download_items.length=99;
   loaded.value = true;
   });
 utils.wait(loaded);
 assert.equals(download_items.length,1);

}


test_Protocol_DownloadManager_load_download_list_old.description = 'test_Protocol_DownloadManager_load_download_list_old';
test_Protocol_DownloadManager_load_download_list_old.priority    = 'never';
function test_Protocol_DownloadManager_load_download_list_old() {


 SynoLoader_DownloadManager.set_protocol();
 SynoLoader_DownloadManager.Util.show_log=true;
 
 var NotificationMock = new Mock(Notification);
 var loaded = { value : false };
 NotificationMock.expect('show', ["Send link","http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso"], null)
   .andStub(function(title,text){loaded.value = true}).times(1);
 SynoLoader_DownloadManager.Notification = NotificationMock;
 
 SynoLoader_DownloadManager.transfer_to_nas("http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso");
 utils.wait(loaded);
 
 var download_items={};
 var loaded = { value : false };
 SynoLoader_DownloadManager.load_download_list(function(items){
   download_items=items;
   loaded.value = true;
   },function(items){
   download_items.length=99;
   loaded.value = true;
   });
 utils.wait(loaded);
 assert.equals(download_items.length,1);

}

