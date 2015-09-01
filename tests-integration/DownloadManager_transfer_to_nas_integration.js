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
    DownloadManager.deleteAll();
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

function getDownloadItems(title) {
    let downloadItems = {};
    DownloadManager.loadDownloadList((items) => {
        downloadItems = items;
        if (typeof title !== "undefined") {
            downloadItems.some((item) => {
                if (item.title === title) {
                    title = true;
                    return true;
                }
            });
        } else {
            title = null;
        }
        loaded.value = true;
    }, (items) => {
        downloadItems = null;
        loaded.value = true;
    });
    utils.wait(loaded);
    loaded.value = false;

    if (title !== null) {
        return (title === true);
    }
    return downloadItems;
}


test_Protocol_DownloadManager_transferToNas_torrent_file.description = "test_Protocol_DownloadManager_transferToNas_torrent_file";

function test_Protocol_DownloadManager_transferToNas_torrent_file() {
    let file = {};
    let t = Date.now();
    setUpNotificationMock("Send torrent file to NAS", "http://releases.ubuntu.com/vivid/ubuntu-15.04-desktop-amd64.iso.torrent?" + t);
    DownloadManager.transferToNas("http://releases.ubuntu.com/vivid/ubuntu-15.04-desktop-amd64.iso.torrent?" + t, file);
    utils.wait(loaded);
    loaded.value = false;

    // Can the filename that's been added be found in the list?
    assert.isTrue(getDownloadItems(file.name));
}

test_Protocol_DownloadManager_transferToNas_link.description = "test_Protocol_DownloadManager_transferToNas_link";

function test_Protocol_DownloadManager_transferToNas_link() {
    let t = Date.now();
    setUpNotificationMock("Send link", "http://releases.ubuntu.com/vivid/ubuntu-15.04-desktop-amd64.iso?" + t);
    DownloadManager.transferToNas("http://releases.ubuntu.com/vivid/ubuntu-15.04-desktop-amd64.iso?" + t);
    utils.wait(loaded);
    loaded.value = false;

    // Can the filename that's been added be found in the list?
    assert.isTrue(getDownloadItems("ubuntu-15.04-desktop-amd64.iso?" + t));
}
