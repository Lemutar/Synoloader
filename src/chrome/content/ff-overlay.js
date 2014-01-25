
var SynoLoader = {};
Components.utils.import("resource://SynoLoader/DSM3.js",SynoLoader);  

(function() {

this.onLoad= function()
    {
    var mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
                  .getService(Components.interfaces.nsIWindowMediator);
    var doc = mediator.getMostRecentWindow("navigator:browser").document;
    if(SynoLoader.SynoLoaderDMS.syno_download_station.initialized==false)
    {
	    // initialization code


	    this.strings = doc.getElementById("SynoLoader-strings");

	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
					.getService(Components.interfaces.nsIPrefService)
					.getBranch("extensions.SynoLoader.");
	    
	    this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.SynoLoader.");
	    
	    this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);

	    var myLoginManager = Components.classes["@mozilla.org/login-manager;1"].
				          getService(Components.interfaces.nsILoginManager);
			  
		// Find users for the given parameters
		var logins = myLoginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
		if( logins.length > 0) {
			this.SynoLoaderDMS.syno_download_station.username = logins[0].username;
			this.SynoLoaderDMS.syno_download_station.password = logins[0].password;
		}

	   

	   this.SynoLoaderDMS.syno_download_station.set_protocol(this.prefs.getCharPref('DSM_Verison'));
	   this.SynoLoaderDMS.syno_download_station.window=window;
	   this.SynoLoaderDMS.Notification.start_dlm=this.prefs.getBoolPref('start_dlm');
	   this.SynoLoaderDMS.Notification.show_not=this.prefs.getBoolPref('show_not');
	   this.SynoLoaderDMS.Util.show_log=this.prefs.getBoolPref('show_dgb');
	   this.SynoLoaderDMS.syno_download_station.url=this.prefs.getCharPref('url');
	   this.SynoLoaderDMS.syno_download_station.emule_downloadfolder=this.prefs.getCharPref('emule_downloadfolder');
	   this.SynoLoaderDMS.syno_download_station.connect_to_nas("");
	   this.SynoLoaderDMS.syno_download_station.initialized = true;
	   
	   }
   };






	this.strWindowFeatures = "menubar=yes,location=yes,resizable=yes,scrollbars=yes,status=yes";  

	this.onFirefoxLoad = function(event) {
	  Components.utils.import("resource://SynoLoader/magnetHandler.js");
	  document.getElementById("contentAreaContextMenu")
		  .addEventListener("popupshowing", function (e){ SynoLoader.showFirefoxContextMenu(e); }, false);
	  
	  SynoLoader.httpResponseObserver = SynoLoader.SynoLoaderDMS.Util.createObserver();
	  SynoLoader.httpResponseObserver.observe = function( aSubject, aTopic, aData ) 
	  {	
		  if(aTopic == 'magnet-on-open-uri')
		  {
			  var aURI = aSubject.QueryInterface(Components.interfaces.nsIURI);
			  if(!aURI) return;
			  var uriText = aURI.spec;
			  SynoLoader.SynoLoaderDMS.syno_download_station.transfer_to_nas(uriText);
		  }
	  };
	  
	  var observerService = Components.classes["@mozilla.org/observer-service;1"]
		.getService(Components.interfaces.nsIObserverService);

	  observerService.addObserver( SynoLoader.httpResponseObserver, "magnet-on-open-uri", false);

	};



this.onMenuItemLinkCommand= function(event) {
    	if(SynoLoader.SynoLoaderDMS.syno_download_station.is_connect==true)
	{
	    window.open(this.SynoLoaderDMS.syno_download_station.url+"/webman/index.cgi?launchApp=SYNO.SDS.DownloadStation.Application", "Diskstation", SynoLoader.strWindowFeatures );  
	}
	else
	{
	this.SynoLoaderDMS.Notification.show("No Connection");
	}

};

this.onMenuItemCommand= function(event) {
    	if(SynoLoader.SynoLoaderDMS.syno_download_station.is_connect==true)
	{
    	this.SynoLoaderDMS.syno_download_station.transfer_to_nas(gContextMenu.linkURL);
	}
	else
	{
	this.SynoLoaderDMS.Notification.show("No Connection");
	}

};


this.onMenuItemDownloads = function(event) {

	 window.open("chrome://SynoLoader/content/SynoDownloads.xul", "SynoLoader Downloads", "chrome,centerscreen,width=500,height=600" );  
};

this.showFirefoxContextMenu = function(event) {
  // show or hide the menuitem based on what the context menu is on
  document.getElementById("context-SynoLoader").hidden = (!gContextMenu.onLink);

};

this.onCommand = function(event) {
  // show or hide the menuitem based on what the context menu is on
  alert(event);

};




  this.shutdown= function()
  {

	window.removeEventListener("load", function (e) { SynoLoader.onFirefoxLoad(); }, false);
	window.removeEventListener("load", function (e) { SynoLoader.onLoad(); }, false);
	window.removeEventListener("unload", function(e) { SynoLoader.shutdown(); }, false);
	window.clearInterval(this.intvall);
  	document.getElementById("contentAreaContextMenu")
        .removeEventListener("popupshowing", function (e){ SynoLoader.showFirefoxContextMenu(e); }, false);
  };


 

  this.onToolbarButtonCommand= function(e) {
    // just reuse the function above.  you can change this, obviously!
    this.onMenuItemCommand(e);
  };

window.addEventListener("load", function (e) { SynoLoader.onFirefoxLoad(); }, false);
window.addEventListener("load", function (e) { SynoLoader.onLoad(); }, false);
window.addEventListener("unload", function(e) { SynoLoader.shutdown(); }, false);

}).apply(SynoLoader);

