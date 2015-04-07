

utils.include( utils.baseURL + "../src/modules/QuickConnect.js"); 




function setUp() {
  
}

function tearDown() {
   utils.tearDownHttpServer(4445);
}

function startUp()
{
 
}

function shutDown()
{
}


test_quick_connect_get_nas_info.description = 'test_quick_connect_get_nas_info';
test_quick_connect_get_nas_info.priority    = 'must';
function test_quick_connect_get_nas_info() {
    /*jshint multistr: true */
    QuickConnectResponse = "{\"version\":1,\"command\":\"get_server_info\",\"errno\":0,\"server\"\
                            :{\"serverID\":\"002834820\",\"ddns\":\"QuickConnectID.synology.me\",\"fqdn\":\"NULL\",\"ipv6_tunnel\":[],\"gateway\":\"192.168.0.1\",\"interface\":\
                            [{\"ip\":\"192.168.0.200\",\"ipv6\":[{\"addr_type\":32,\"address\":\"fe80::211:32ff:fe0a:d061\",\"prefix_length\":64,\"scope\":\"link\"}],\
                            \"mask\":\"255.255.255.0\",\"name\":\"eth0\"},{\"ip\":\"192.168.0.150\",\"ipv6\":[{\"addr_type\":32,\"address\":\"fe80::211:32ff:fe0a:d061\",\"prefix_length\":64,\"scope\":\"link\"}],\
                            \"mask\":\"255.255.255.0\",\"name\":\"eth0\"}],\"external\":{\"ip\":\"217.162.254.219\"},\"behind_nat\":true,\"udp_punch_port\":41864,\"tcp_punch_port\":0,\"ds_state\":\"OFFLINE\"},\
                            \"client\":{\"external\":{\"ip\":\"217.162.254.219\"}},\"env\":{\"relay_region\":\"de\",\"control_host\":\"dec.quickconnect.to\"},\"service\":{\"port\":5001,\"ext_port\":0,\"pingpong\":\"UNKNOWN\"}}";
    myresponse={};
    myconnect=QuickConnect(1000,200, "http://",5000);
    var loaded = { value : false };
    var setdone = function(response){myresponse = response; loaded.value = true;};
    var server = utils.setUpHttpServer(4445, "../fixtures");
    utils.writeTo(QuickConnectResponse , "../fixtures/connect.txt" );
   
    server.expect('/relai_server.php', 200, '/connect.txt'); 
    myconnect.relai_server = 'http://localhost:4445/relai_server.php';
    myconnect.get_server_info('QuickConnectID', setdone); 
    utils.wait(loaded);
    assert.equals(true,myresponse.success);
    assert.equals("192.168.0.200",myresponse.internal_ip[0]);
    assert.equals("192.168.0.150",myresponse.internal_ip[1]);
    assert.equals("217.162.254.219",myresponse.external_ip);   
}

test_quick_connect_get_nas_info_negativ.description = 'test_quick_connect_get_nas_info_negativ';
test_quick_connect_get_nas_info_negativ.priority    = 'must';
function test_quick_connect_get_nas_info_negativ() {
    /*jshint multistr: true */
    QuickConnectResponse = "{\"version\":1,\"command\":\"get_server_info\",\"errno\":1,\"server\"\
                            :{\"serverID\":\"002834820\",\"ddns\":\"QuickConnectID.synology.me\",\"fqdn\":\"NULL\",\"ipv6_tunnel\":[],\"gateway\":\"192.168.0.1\",\"interface\":\
                            [{\"ip\":\"192.168.0.200\",\"ipv6\":[{\"addr_type\":32,\"address\":\"fe80::211:32ff:fe0a:d061\",\"prefix_length\":64,\"scope\":\"link\"}],\
                            \"mask\":\"255.255.255.0\",\"name\":\"eth0\"},{\"ip\":\"192.168.0.150\",\"ipv6\":[{\"addr_type\":32,\"address\":\"fe80::211:32ff:fe0a:d061\",\"prefix_length\":64,\"scope\":\"link\"}],\
                            \"mask\":\"255.255.255.0\",\"name\":\"eth0\"}],\"external\":{\"ip\":\"217.162.254.219\"},\"behind_nat\":true,\"udp_punch_port\":41864,\"tcp_punch_port\":0,\"ds_state\":\"OFFLINE\"},\
                            \"client\":{\"external\":{\"ip\":\"217.162.254.219\"}},\"env\":{\"relay_region\":\"de\",\"control_host\":\"dec.quickconnect.to\"},\"service\":{\"port\":5001,\"ext_port\":0,\"pingpong\":\"UNKNOWN\"}}";
    myresponse={};
    var loaded = { value : false };
    myconnect=QuickConnect(1000,200, "http://",5000);
    var setdone = function(response){myresponse = response; loaded.value = true;};
    var server = utils.setUpHttpServer(4445, "../fixtures");
    utils.writeTo(QuickConnectResponse , "../fixtures/connect.txt" );
   
    server.expect('/relai_server.php', 200, '/connect.txt'); 
    myconnect.relai_server = 'http://localhost:4445/relai_server.php';
    myconnect.get_server_info('QuickConnectID', setdone); 
    utils.wait(loaded);
    assert.equals(false,myresponse.success);
}

test_quick_connect_get_nas_info_negativ_no_answer.description = 'test_quick_connect_get_nas_info_negativ_no_answer';
test_quick_connect_get_nas_info_negativ_no_answer.priority    = 'must';
function test_quick_connect_get_nas_info_negativ_no_answer() {
   
    myconnect=QuickConnect(1000,200, "http://",5000);
    myresponse={};
    var loaded = { value : false };
    var setdone = function(response){myresponse = response; loaded.value = true;};
    var server = utils.setUpHttpServer(4445, "../fixtures");
    myconnect.relai_server = 'http://localhost:4445/relai_server.php';
    myconnect.get_server_info('QuickConnectID', setdone); 
    utils.wait(loaded);
    assert.equals(false,myresponse.success);
}



test_quick_connect_check_internal_ips.description = 'test_quick_connect_check_internal_ips';
test_quick_connect_check_internal_ips.priority    = 'must';
function test_quick_connect_check_internal_ips() {
   
    internal_ips = ["localhost:4445/ip_1","localhost:4445/ip_2"];
    myconnect=QuickConnect(1000,200, "http://",4445);
    myresponse={};
    var loaded = { value : false };
    var setdone = function(response){myresponse = response; loaded.value = true;};
    var server = utils.setUpHttpServer(4445, "../fixtures");
    utils.writeTo("{ \"data\" : 2, \"success\" : true }" , "../fixtures/connect.txt" );
    server.expect('/ip_1:4445/webapi/query.cgi', 200, { path : '/connect.txt', delay : 80 });
    server.expect('/ip_2:4445/webapi/query.cgi', 200, { path : '/connect.txt', delay : 50 });
    
    myconnect.check_internal_ips(internal_ips, setdone); 
    utils.wait(loaded);
    assert.equals(true,myresponse.success);
    assert.equals("localhost:4445/ip_2",myresponse.ip);   
}

test_quick_connect_check_internal_ips_timeout.description = 'test_quick_connect_check_internal_ips_timeout';
test_quick_connect_check_internal_ips_timeout.priority    = 'must';
function test_quick_connect_check_internal_ips_timeout() {
   
    internal_ips = ["localhost:4445/ip_1","localhost:4445/ip_2"];
    myconnect=QuickConnect(1000,200, "http://",4445);
    myresponse={};
    var loaded = { value : false };
    var setdone = function(response){myresponse = response; loaded.value = true;};
    var server = utils.setUpHttpServer(4445, "../fixtures");
    utils.writeTo("{ \"data\" : 2, \"success\" : true }" , "../fixtures/connect.txt" );
    server.expect('/ip_1:4445/webapi/query.cgi', 200, { path : '/connect.txt', delay : 300 });
    server.expect('/ip_2:4445/webapi/query.cgi', 200, { path : '/connect.txt', delay : 300 });
    
    myconnect.check_internal_ips(internal_ips, setdone); 
    utils.wait(loaded);
    assert.equals(false,myresponse.success);
    assert.equals("",myresponse.ip);   
}


test_quick_connect_check_internal_ips_negativ.description = 'test_quick_connect_check_internal_ips_negativ';
test_quick_connect_check_internal_ips_negativ.priority    = 'must';
function test_quick_connect_check_internal_ips_negativ() {
    internal_ips = ["localhost:4445/ip_1","localhost:4445/ip_2"];
    myconnect=QuickConnect(1000,200, "http://",4445);
    myresponse={};
    var loaded = { value : false };
    var setdone = function(response){myresponse = response; loaded.value = true;};
    var server = utils.setUpHttpServer(4445, "../fixtures");

    
    myconnect.check_internal_ips(internal_ips, setdone); 
    utils.wait(loaded);
    assert.equals(false,myresponse.success);
}


test_quick_connect.description = 'test_quick_connect';
test_quick_connect.priority    = 'must';
function test_quick_connect() {
    myresponse={};
    myconnect=QuickConnect(1000,200);
    var loaded = { value : false };
    var setdone = function(response){myresponse = response; loaded.value = true;};
    mock_get_server_info = function(id,callback)
   {
        var get_server_info_response = {
                                         success: true,
                                         internal_ip: ["1","2"],
                                         external_ip: '3',
                                     };
         assert.equals('QuickConnectID',id);                            
         callback(get_server_info_response);                            
   };
    mock_check_internal_ips = new MockFunction('check_internal_ips');
    mock_check_internal_ips = function(ips,callback)
       {
        var get_server_info_response = {
                                         success: true,
                                         ip: "1",
                                     };
         assert.equals(["1","2"],ips);
         callback(get_server_info_response);                            
   };

    myconnect.get_server_info=mock_get_server_info;
    myconnect.check_internal_ips=mock_check_internal_ips;
    myconnect.get('QuickConnectID', setdone); 
    utils.wait(loaded);
    assert.equals(true,myresponse.success); 
    assert.equals("1",myresponse.ip); 
}


test_quick_connect_server_info_fail.description = 'test_quick_connect_server_info_fail';
test_quick_connect_server_info_fail.priority    = 'must';
function test_quick_connect_server_info_fail() {
    myresponse={};
    myconnect=QuickConnect(1000,200);
    var loaded = { value : false };
    var setdone = function(response){myresponse = response; loaded.value = true;};
    mock_get_server_info = function(id,callback)
   {
        var get_server_info_response = {
                                         success: false,
                                         internal_ip: ["1","2"],
                                         external_ip: '3',
                                     };
         assert.equals('QuickConnectID',id);                            
         callback(get_server_info_response);                            
   };

    myconnect.get_server_info=mock_get_server_info;
    myconnect.get('QuickConnectID', setdone); 
    utils.wait(loaded);
    assert.equals(false,myresponse.success); 
    assert.equals("QuickConnectID",myresponse.ip); 
}

test_quick_connect_not_internal.description = 'test_quick_connect_not_internal';
test_quick_connect_not_internal.priority    = 'must';
function test_quick_connect_not_internal() {
    myconnect=QuickConnect(1000,200);
    myresponse={};
    var loaded = { value : false };
    var setdone = function(response){myresponse = response; loaded.value = true;};
    mock_get_server_info = function(id,callback)
   {
        var get_server_info_response = {
                                         success: true,
                                         internal_ip: ["1","2"],
                                         external_ip: '3',
                                     };
         assert.equals('QuickConnectID',id);                            
         callback(get_server_info_response);                            
   };
    mock_check_internal_ips = new MockFunction('check_internal_ips');
    mock_check_internal_ips = function(ips,callback)
       {
        var get_server_info_response = {
                                         success: false,
                                         ip: "1",
                                     };
         assert.equals(["1","2"],ips);
         callback(get_server_info_response);                            
   };

    myconnect.get_server_info=mock_get_server_info;
    myconnect.check_internal_ips=mock_check_internal_ips;
    myconnect.get('QuickConnectID', setdone); 
    utils.wait(loaded);
    assert.equals(true,myresponse.success); 
    assert.equals("3",myresponse.ip); 
}







