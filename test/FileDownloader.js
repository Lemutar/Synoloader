utils.include(utils.baseURL + "../src/modules/FileDownloaderHandler.js");

let {
    classes: Cc,
    interfaces: Ci,
    utils: Cu
} = Components;

let loaded, server;
let cb = () => {
    loaded.value = true;
};

function setUp() {
    loaded = {
        value: false
    };

    server.expect("/test.file", 200, "/test_file.txt");
}

function tearDown() {}

function startUp() {
    server = utils.setUpHttpServer(4445, "../fixtures");
}

function shutDown() {
    utils.tearDownHttpServer(4445);
}


test_FileDownloader_get_file_content.description = "test_FileDownloader_get_file_content";
test_FileDownloader_get_file_content.priority = "must";

function test_FileDownloader_get_file_content() {
    utils.writeTo("42", "../fixtures/test_file.txt");

    let file = Cc["@mozilla.org/file/directory_service;1"].
        getService(Ci.nsIProperties).
        get("TmpD", Ci.nsIFile);

    let uuidString = Cc["@mozilla.org/uuid-generator;1"].
        getService(Ci.nsIUUIDGenerator).
        generateUUID().
        toString();

    file.append("synoloader" + uuidString + ".torrent");
    file.createUnique(Ci.nsIFile.NORMAL_FILE_TYPE, 0666);
    FileDownloaderHandler.getFileContent("http://localhost:4445/test.file", file.path, cb);

    utils.wait(loaded);
    assert.equals("42", utils.readFrom(file.path));
}
