utils.include(utils.baseURL + "../src/modules/API.js");

let response, loaded, server, api;
let cb = (res) => {
    response = res;
    loaded.value = true;
};

function setUp() {
    response = {};
    loaded = {
        value: false
    };

    server.expect("/download/download_redirector.cgi", 200, "/connect.txt");
    server.expect("/download/download_redirector.cgi", 200, "/items.txt");

    api = new Protocol(0, "http://localhost:4445");
}

function tearDown() {}

function startUp() {
    server = utils.setUpHttpServer(4445, "fixtures");
    utils.writeTo('{"id":"CONNECTION_ID","login_success":true,"success":true}', "fixtures/connect.txt");
}

function shutDown() {
    utils.tearDownHttpServer(4445);
}


test_API_0_get_all_entries_empty_succeed_mock.description = "test_API_0_get_all_entries_empty_succeed_mock";

function test_API_0_get_all_entries_empty_succeed_mock() {
    utils.writeTo('{"success":true,"items":[]}', "fixtures/items.txt");

    api.taskAction(cb, "getall");

    utils.wait(loaded);
    assert.equals(true, response.success);
    assert.equals([], response.items);
}

test_API_0_get_all_entries_succeed_mock.description = "test_API_0_get_all_entries_succeed_mock";

function test_API_0_get_all_entries_succeed_mock() {
    let itemsFile = '{"items":[{"availablePieces":0,"connectedPeers":0,"createdTime":1386523198,"currentRate":0,"currentSize":"0.1 MB","downloadedPieces":0,"extraInfo":"","filename":"file1","id":1,"pid":-1,"progress":"1%","seedingInterval":0,"seedingRatio":0,"startedTime":1386523202,"status":3,"totalPeers":0,"totalPieces":0,"totalSize":"1 MB","totalUpload":0,"uploadRate":0,"url":"http://file1","username":"username"}],"success":true}';
    utils.writeTo(itemsFile, "fixtures/items.txt");

    api.taskAction(cb, "getall");

    utils.wait(loaded);
    assert.equals(true, response.success);
    assert.equals("file1", response.items[0].filename);
}
