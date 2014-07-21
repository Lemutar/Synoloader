
utils.include( utils.baseURL + "../src/modules/FileDownloaderHandler.js");

function setUp()
{
  
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



test_FileDownloader_get_file_content.description = 'test_FileDownloader_get_file_content';
test_FileDownloader_get_file_content.priority    = 'must';
function test_FileDownloader_get_file_content() {

   var server = utils.setUpHttpServer(4445, "../fixtures");
   var succeded_called = false;
   var test_succeded = function(){succeded_called=true}
  
   utils.writeTo("42" , "../fixtures/test_file.txt" );
   server.expect("/test.file", 200, '/test_file.txt'); 
   var file = Components.classes["@mozilla.org/file/directory_service;1"]
       .getService(Components.interfaces.nsIProperties)
       .get("TmpD", Components.interfaces.nsIFile);
   var uuidGenerator = Components.classes["@mozilla.org/uuid-generator;1"]
                       .getService(Components.interfaces.nsIUUIDGenerator);
   var uuid = uuidGenerator.generateUUID();
   var uuidString = uuid.toString();
   file.append("synoloader"+uuidString+".torrent");
   file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0666);
   FileDownloaderHandler.get_file_content("http://localhost:4445/test.file",file.path,test_succeded)
  
   utils.wait(200);
   assert.equals(utils.readFrom(file.path),"42");
   assert.equals(succeded_called,true);
}


