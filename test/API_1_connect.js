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

  server.expect("/webapi/auth.cgi", 200, "/connect.txt");

  api = new Protocol(1, "http://localhost:4445");
}

function tearDown() {}

function startUp() {
  server = utils.setUpHttpServer(4445, "../fixtures");
}

function shutDown() {
  utils.tearDownHttpServer(4445);
}


function doConnect(successful, str, responseKey) {
  api.connect(cb);
  utils.wait(loaded);
  assert.equals(successful, response.success);
  assert.equals(str, response[responseKey]);
}


test_API_1_connect_succeed_mock.description = "test_API_1_connect_succeed_mock";
test_API_1_connect_succeed_mock.priority    = "must";
function test_API_1_connect_succeed_mock() {
  utils.writeTo('{"data":{"sid":"CONNECTION_ID"},"success":true}', "../fixtures/connect.txt");
  doConnect(true, "CONNECTION_ID", "id");
}

test_API_1_connect_fail_400_mock.description = "test_API_1_connect_fail_400_mock";
test_API_1_connect_fail_400_mock.priority    = "must";
function test_API_1_connect_fail_400_mock() {
  utils.writeTo('{"error":{"code":400},"success":false}', "../fixtures/connect.txt");
  doConnect(false, "No such account or incorrect password", "error_text");
}

test_API_1_connect_fail_401_mock.description = "test_API_1_connect_fail_401_mock";
test_API_1_connect_fail_401_mock.priority    = "must";
function test_API_1_connect_fail_401_mock() {
  utils.writeTo('{"error":{"code":401},"success":false}', "../fixtures/connect.txt" );
  doConnect(false, "Account disabled",  "error_text");
}

test_API_1_connect_fail_402_mock.description = "test_API_1_connect_fail_402_mock";
test_API_1_connect_fail_402_mock.priority    = "must";
function test_API_1_connect_fail_402_mock() {
  utils.writeTo('{"error":{"code":402},"success":false}', "../fixtures/connect.txt" );
  doConnect(false, "Permission denied", "error_text");
}

test_API_1_connect_fail_403_mock.description = "test_API_1_connect_fail_403_mock";
test_API_1_connect_fail_403_mock.priority    = "must";
function test_API_1_connect_fail_403_mock() {
  utils.writeTo('{"error":{"code":403},"success":false}', "../fixtures/connect.txt" );
  doConnect(false, "2-step verification code required", "error_text");
}

test_API_1_connect_fail_404_mock.description = "test_API_1_connect_fail_404_mock";
test_API_1_connect_fail_404_mock.priority    = "must";
function test_API_1_connect_fail_404_mock() {
  utils.writeTo('{"error":{"code":404},"success":false}', "../fixtures/connect.txt" );
  doConnect(false, "Failed to authenticate 2-step verification code", "error_text");
}
