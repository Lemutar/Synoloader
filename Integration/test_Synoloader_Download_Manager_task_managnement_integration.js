

utils.include( utils.baseURL + "../src/modules/DownloadManager.js");


function setUp()
{
 SynoLoader_DownloadManager.password = "1234";
 SynoLoader_DownloadManager.username = "synoloader_tester";
 SynoLoader_DownloadManager.url = 'http://http://z35.no-ip.org:5050';


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


 SynoLoader_DownloadManager.set_protocol("2");
 SynoLoader_DownloadManager.Util.show_log=true;
 SynoLoader_DownloadManager.transfer_to_nas("http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso.torrent");
 utils.wait(10000);
 var download_items={};
 SynoLoader_DownloadManager.load_download_list(function(items){download_items=items});
 utils.wait(15000);
 assert.equals(download_items.length,1);

}

test_Protocol_DownloadManager_load_download_list_old.description = 'test_Protocol_DownloadManager_load_download_list_old';
test_Protocol_DownloadManager_load_download_list_old.priority    = 'must';
function test_Protocol_DownloadManager_load_download_list_old() {


 SynoLoader_DownloadManager.set_protocol("1");
 SynoLoader_DownloadManager.Util.show_log=true;
 SynoLoader_DownloadManager.transfer_to_nas("http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso.torrent");
 utils.wait(10000);
 var download_items={};
 SynoLoader_DownloadManager.load_download_list(function(items){download_items=items});
 utils.wait(15000);
 assert.equals(download_items.length,1);

}
