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
    let itemsFile = '{"data":{"offeset":0,"tasks":[{"additional":{"transfer":{"size_downloaded":"0","size_uploaded":"0","speed_download":0,"speed_upload":0}},"id":"dbid_1","size":"1","status":"paused","status_extra":null,"title":"file1","type":"http","username":"username"}],"total":1},"success":true}';
    utils.writeTo(itemsFile, "../fixtures/items.txt");

    api.taskAction(cb, "getall");

    utils.wait(loaded);
    assert.equals(true, response.success);
    assert.equals("file1", response.items[0].title);
}
