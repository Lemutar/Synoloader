utils.include(utils.baseURL + "../src/modules/API.js");

let api,
    server,
    loaded,
    response,
    cb = (res) => {
      response = res;
      loaded.value = true;
    };

function setUp() {
  response = {};
  loaded = { value : false };

  server.expect("/download/download_redirector.cgi", 200, "/connect.txt");
  server.expect("/download/download_redirector.cgi", 200, "/items.txt");

  api = new Protocol(0, "http://localhost:4445");
}

function tearDown() {}

function startUp() {
  server = utils.setUpHttpServer(4445, "../fixtures");
  utils.writeTo('{"id":"CONNECTION_ID","login_success":true,"success":true}', "../fixtures/connect.txt");
}

function shutDown() {
  utils.tearDownHttpServer(4445);
}


test_API_0_get_all_entries_empty_succeed_mock.description = "test_API_0_get_all_entries_empty_succeed_mock";
test_API_0_get_all_entries_empty_succeed_mock.priority    = "must";
function test_API_0_get_all_entries_empty_succeed_mock() {
  utils.writeTo('{"success":true,"items":[]}', "../fixtures/items.txt");

  api.task_action(cb, "getall");

  utils.wait(loaded);
  assert.equals(true, response.success);
  assert.equals([], response.items);
}

test_API_0_get_all_entries_succeed_mock.description = "test_API_0_get_all_entries_succeed_mock";
test_API_0_get_all_entries_succeed_mock.priority    = "must";
function test_API_0_get_all_entries_succeed_mock() {
  let itemsFile = '{' +
        '"items" : [{' +
          '"availablePieces" : 0,' +
          '"connectedPeers" : 0,' +
          '"createdTime" : 1386523198,' +
          '"currentRate" : 0,' +
          '"currentSize" : "57.35 MB",' +
          '"downloadedPieces" : 0,' +
          '"extraInfo" : "",' +
          '"filename" : "ubuntu-12.04.3-desktop-amd64.iso",' +
          '"id" : 333,' +
          '"pid" : -1,' +
          '"progress" : "  8.1%",' +
          '"seedingInterval" : 0,' +
          '"seedingRatio" : 0,' +
          '"startedTime" : 1386523202,' +
          '"status" : 3,' +
          '"totalPeers" : 0,' +
          '"totalPieces" : 0,' +
          '"totalSize" : "708.00 MB",' +
          '"totalUpload" : 0,' +
          '"uploadRate" : 0,' +
          '"url" : "http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=lts",' +
          '"username" : "synoloader_tester"' +
        '}],' +
        '"success" : true' +
    '}';
  utils.writeTo(itemsFile, "../fixtures/items.txt");

  api.task_action(cb, "getall");

  utils.wait(loaded);
  assert.equals(true, response.success);
  assert.equals("ubuntu-12.04.3-desktop-amd64.iso", response.items[0].filename);
}
