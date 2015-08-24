utils.include(utils.baseURL + "../src/modules/API.js");

//let url = "http://www.ubuntu.com/start-download?distro=desktop&bits=64&release=latest";
let url = "";
let server;
let response;
let loaded;
let api;
let cb = (res) => {
  response = res;
  loaded.value = true;
};

function setUp() {
  response = {};
  loaded = { value : false };

  server.expect("/webapi/DownloadStation/task.cgi", 200, "/action.txt");
  api = new Protocol(1, "http://localhost:4445", 5000, "username", "password");
  api.connectTime = Date.now();
}

function tearDown() { }

function startUp() {
  server = utils.setUpHttpServer(4445, "../fixtures");
}

function shutDown() {
  utils.tearDownHttpServer(4445);
}

function doTaskAction(successful, str, responseKey) {
  api.task_action(cb, "addurl", url);
  utils.wait(loaded);
  assert.equals(successful, response.success);
  assert.equals(str, response[responseKey]);
}

/*
 * Common errors.
 */
test_API_task_action_addurl_error_100_mock.description = "test_API_task_action_addurl_error_100_mock";
test_API_task_action_addurl_error_100_mock.priority    = "must";
function test_API_task_action_addurl_error_100_mock() {
  utils.writeTo('{"error":{"code":100},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "Unknown error", "error_text")
}

test_API_task_action_addurl_error_101_mock.description = "test_API_task_action_addurl_error_101_mock";
test_API_task_action_addurl_error_101_mock.priority    = "must";
function test_API_task_action_addurl_error_101_mock() {
  utils.writeTo('{"error":{"code":101},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "Invalid parameter", "error_text");
}

test_API_task_action_addurl_error_102_mock.description = "test_API_task_action_addurl_error_102_mock";
test_API_task_action_addurl_error_102_mock.priority    = "must";
function test_API_task_action_addurl_error_102_mock() {
  utils.writeTo('{"error":{"code":102},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "The requested API does not exist", "error_text");
}


test_API_task_action_addurl_error_103_mock.description = "test_API_task_action_addurl_error_102_mock";
test_API_task_action_addurl_error_103_mock.priority    = "must";
function test_API_task_action_addurl_error_103_mock() {
  utils.writeTo('{"error":{"code":103},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "The requested method does not exist", "error_text");
}

test_API_task_action_addurl_error_104_mock.description = "test_API_task_action_addurl_error_104_mock";
test_API_task_action_addurl_error_104_mock.priority    = "must";
function test_API_task_action_addurl_error_104_mock() {
  utils.writeTo('{"error":{"code":104},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "The requested version does not support the functionality", "error_text");
}

test_API_task_action_addurl_error_105_mock.description = "test_API_task_action_addurl_error_105_mock";
test_API_task_action_addurl_error_105_mock.priority    = "must";
function test_API_task_action_addurl_error_105_mock() {
  utils.writeTo('{"error":{"code":105},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "The logged in session does not have permission", "error_text");
}

test_API_task_action_addurl_error_106_mock.description = "test_API_task_action_addurl_error_106_mock";
test_API_task_action_addurl_error_106_mock.priority    = "must";
function test_API_task_action_addurl_error_106_mock() {
  utils.writeTo('{"error":{"code":106},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "Session timeout", "error_text");
}

test_API_task_action_addurl_error_107_mock.description = "test_API_task_action_addurl_error_107_mock";
test_API_task_action_addurl_error_107_mock.priority    = "must";
function test_API_task_action_addurl_error_107_mock() {
  utils.writeTo('{"error":{"code":107},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "Session interrupted by duplicate login", "error_text");
}


/*
 * Task action errors.
 */
test_API_task_action_addurl_error_400_mock.description = "test_API_task_action_addurl_error_400_mock";
test_API_task_action_addurl_error_400_mock.priority    = "must";
function test_API_task_action_addurl_error_400_mock() {
  utils.writeTo('{"error":{"code":400},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "File upload failed", "error_text");
}

test_API_task_action_addurl_error_401_mock.description = "test_API_task_action_addurl_error_401_mock";
test_API_task_action_addurl_error_401_mock.priority    = "must";
function test_API_task_action_addurl_error_401_mock() {
  utils.writeTo('{"error":{"code":401},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "Max number of tasks reached", "error_text");
}

test_API_task_action_addurl_error_402_mock.description = "test_API_task_action_addurl_error_402_mock";
test_API_task_action_addurl_error_402_mock.priority    = "must";
function test_API_task_action_addurl_error_402_mock() {
  utils.writeTo('{"error":{"code":402},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "Destination denied", "error_text");
}

test_API_task_action_addurl_error_403_mock.description = "test_API_task_action_addurl_error_403_mock";
test_API_task_action_addurl_error_403_mock.priority    = "must";
function test_API_task_action_addurl_error_403_mock() {
  utils.writeTo('{"error":{"code":403},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "Destination does not exist", "error_text");
}

test_API_task_action_addurl_error_404_mock.description = "test_API_task_action_addurl_error_404_mock";
test_API_task_action_addurl_error_404_mock.priority    = "must";
function test_API_task_action_addurl_error_404_mock() {
  utils.writeTo('{"error":{"code":404},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "Invalid task id", "error_text");
}

test_API_task_action_addurl_error_405_mock.description = "test_API_task_action_addurl_error_405_mock";
test_API_task_action_addurl_error_405_mock.priority    = "must";
function test_API_task_action_addurl_error_405_mock() {
  utils.writeTo('{"error":{"code":405},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "Invalid task action", "error_text");
}

test_API_task_action_addurl_error_406_mock.description = "test_API_task_action_addurl_error_406_mock";
test_API_task_action_addurl_error_406_mock.priority    = "must";
function test_API_task_action_addurl_error_406_mock() {
  utils.writeTo('{"error":{"code":406},"success":false}', "../fixtures/action.txt" );
  doTaskAction(false, "No default destination", "error_text");
}
