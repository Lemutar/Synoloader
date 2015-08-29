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

    server.expect("/webapi/auth.cgi", 200, "/connect.txt");
    server.expect("/webapi/DownloadStation/task.cgi", 200, "/items.txt");

    api = new Protocol(1, "http://localhost:4445");
}

function tearDown() {}

function startUp() {
    server = utils.setUpHttpServer(4445, "../fixtures");
    utils.writeTo('{"data":{"sid":"CONNECTION_ID"},"success":true}', "../fixtures/connect.txt");
}

function shutDown() {
    utils.tearDownHttpServer(4445);
}


test_API_1_get_all_entries_empty_succeed_mock.description = "test_API_1_get_all_entries_empty_succeed_mock";

function test_API_1_get_all_entries_empty_succeed_mock() {
    utils.writeTo('{"data":{"offeset":0,"tasks":[],"total":0},"success":true}', "../fixtures/items.txt");

    api.taskAction(cb, "getall");

    utils.wait(loaded);
    assert.equals(true, response.success);
    assert.equals([], response.items);
}

test_API_1_get_all_entries_succeed_mock.description = "test_API_1_get_all_entries_succeed_mock";

function test_API_1_get_all_entries_succeed_mock() {
    let itemsFile = '{' +
        '"data":{' +
        '"offeset":0,' +
        '"tasks":[{' +
        '"additional":{' +
        '"transfer":{' +
        '"size_downloaded":"2266112",' +
        '"size_uploaded":"0",' +
        '"speed_download":0,' +
        '"speed_upload":0' +
        '}' +
        '},' +
        '"id":"dbid_140",' +
        '"size":"1054867456",' +
        '"status":"paused",' +
        '"status_extra":null,' +
        '"title":"ubuntu-14.04.3-desktop-amd64.iso",' +
        '"type":"http",' +
        '"username":"synotest"' +
        '}],' +
        '"total":1' +
        '},' +
        '"success":true' +
        '}';
    utils.writeTo(itemsFile, "../fixtures/items.txt");

    api.taskAction(cb, "getall");

    utils.wait(loaded);
    assert.equals(true, response.success);
    assert.equals("ubuntu-14.04.3-desktop-amd64.iso", response.items[0].title);
}
