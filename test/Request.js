utils.include(utils.baseURL + "../src/modules/Request.js");

let response, loaded, server, request;
let cb = (res) => {
    response = res;
    loaded.value = true;
};

function setUp() {
    response = {};
    loaded = {
        value: false
    };

    request = new Request("http://localhost:4445/download", "", 500, cb);
}

function tearDown() {}

function startUp() {
    server = utils.setUpHttpServer(4445, "../fixtures");
}

function shutDown() {
    utils.tearDownHttpServer(4445);
}

test_Request_succeed_post.description = "test_Request_succeed_post";

function test_Request_succeed_post() {
    utils.writeTo("test text", "../fixtures/test.txt");
    server.expect("/download", 200, "/test.txt");

    request.post();

    utils.wait(loaded);
    assert.equals(200, response.status);
    assert.equals("test text", response.text);
}

test_Request_succeed_get.description = "test_Request_succeed_get";

function test_Request_succeed_get() {
    utils.writeTo("test text", "../fixtures/test.txt");
    server.expect("/download", 200, "/test.txt");

    request.get();

    utils.wait(loaded);
    assert.equals(200, response.status);
    assert.equals("test text", response.text);
}

test_Request_succeed_JSON.description = "test_Request_succeed_JSON";

function test_Request_succeed_JSON() {
    utils.writeTo('{"test":true}', "../fixtures/test.txt");
    server.expect("/download", 200, "/test.txt");

    request.post();

    utils.wait(loaded);
    assert.equals(200, response.status);
    assert.equals(true, response.json.test);
}

test_Request_receive_404.description = "test_Request_receive_404";

function test_Request_receive_404() {
    utils.writeTo('{"id":"CONNECTION_ID","login_success":true,"success":true}', "../fixtures/test.txt");
    server.expect("/download", 404, "/test.txt");

    request.post();

    utils.wait(loaded);
    assert.equals(404, response.status);
    assert.equals("Not Found", response.statusText);
}

test_Request_timeout.description = "test_Request_timeout";

function test_Request_timeout() {
    utils.writeTo('{"id":"CONNECTION_ID","login_success":true,"success":true}', "../fixtures/test.txt");
    // Make sure the delay is larger than the timeout of the request!
    server.expect("/download", 200, {
        path: "/test.txt",
        delay: 1000
    });

    request.post();

    utils.wait(loaded);
    assert.equals(408, response.status);
    assert.equals("Request Time-out", response.statusText);
}
