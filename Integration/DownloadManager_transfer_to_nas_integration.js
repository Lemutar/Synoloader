utils.include(utils.baseURL + "../src/modules/DownloadManager.js");

let loaded;

function setUp() {
    loaded = {
        value: false
    };

    DownloadManager.password = "1234";
    DownloadManager.username = "synoloader_tester";
    DownloadManager.urlToConnect = "http://z35.no-ip.org:5050";
    DownloadManager.setProtocol();
}

function tearDown() {}

function startUp() {
    utils.setPref("extensions.SynoLoader.dsm_version", "2");
    utils.setPref("extensions.SynoLoader.show_debug", true);
}

function shutDown() {
    DownloadManager.delete_all();
    utils.wait(5000);
}


function setUpNotificationMock(title, text) {
    let NotificationMock = new Mock(Notification);
    NotificationMock.expect("show", [title, text], null)
        .andStub(() => {
            loaded.value = true;
        })
        .times(1);
    Notification = NotificationMock;
}


test_Protocol_DownloadManager_transferToNas_torrent_file.description = "test_Protocol_DownloadManager_transferToNas_torrent_file";

function test_Protocol_DownloadManager_transferToNas_torrent_file() {
    setUpNotificationMock("Send torrent file to NAS", "http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso.torrent");
    DownloadManager.transferToNas("http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso.torrent");
    utils.wait(loaded);
}

test_Protocol_DownloadManager_transferToNas_link.description = "test_Protocol_DownloadManager_transferToNas_link";

function test_Protocol_DownloadManager_transferToNas_link() {
    setUpNotificationMock("Send link", "http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso");
    DownloadManager.transferToNas("http://releases.ubuntu.com/14.04/ubuntu-14.04-desktop-amd64.iso");
    utils.wait(loaded);
}

test_DownloadManager_loadDownloadList.description = "test_DownloadManager_loadDownloadList";
test_DownloadManager_loadDownloadList.priority = "low";

function test_DownloadManager_loadDownloadList() {
    let downloadItems = {};
    DownloadManager.loadDownloadList((items) => {
        downloadItems = items;
        loaded.value = true;
    }, (items) => {
        downloadItems.length = 99;
        loaded.value = true;
    });

    utils.wait(loaded);
    assert.equals(2, downloadItems.length);
}
