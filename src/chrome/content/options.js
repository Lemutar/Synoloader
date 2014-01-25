var SynoLoader = {};
Components.utils.import("resource://SynoLoader/DSM3.js",SynoLoader);  





  SynoLoader.SetUserNamePassword= function()
  {
	this.myLoginManager = Components.classes["@mozilla.org/login-manager;1"]
                   .getService(Components.interfaces.nsILoginManager);
	// create instance of LoginInfo
	this.nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
		                                     Components.interfaces.nsILoginInfo,
		                                     "init");
	// ask for credentials
	this.prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
		      .getService(Components.interfaces.nsIPromptService);

        this.logins = this.myLoginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
        if (this.logins.length > 0)
	{	
	this.username = {value:this.logins[0].username};
	this.password = {value:this.logins[0].password};
	this.check = {value:false};
	this.okorcancel = this.prompts.promptUsernameAndPassword(window, '', 'Please enter your login for your SynoNas', this.username, this.password, null, {});
	//store login infos into the loginManager
	this.myLoginInfo = new this.nsLoginInfo('chrome://SynoLoader.Pass',
                      null, 'User Registration',
                      this.username.value, this.password.value, "", "");
        this.myLoginManager.modifyLogin(this.logins[0],this.myLoginInfo);
	}
	else
	{
	this.username = {value:""};
	this.password = {value:""};
	this.check = {value:false};
	this.okorcancel = this.prompts.promptUsernameAndPassword(window, '', 'Please enter your login for your SynoNas', this.username, this.password, null, {});
	//store login infos into the loginManager
	this.myLoginInfo = new this.nsLoginInfo('chrome://SynoLoader.Pass',
                      null, 'User Registration',
                      this.username.value, this.password.value, "", "");
        this.myLoginManager.addLogin(this.myLoginInfo);
	}

        this.logins = this.myLoginManager.findLogins({}, 'chrome://SynoLoader.Pass', null, 'User Registration');
	if( this.logins.length > 0) {
	this.SynoLoaderDMS.syno_download_station.username = this.username.value;
	this.SynoLoaderDMS.syno_download_station.password = this.password.value;
        this.SynoLoaderDMS.syno_download_station.connect_to_nas("");
	}

};

SynoLoader.init = function()
{
	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.SynoLoader.");

	this.prefs = Components.classes["@mozilla.org/preferences-service;1"]
		.getService(Components.interfaces.nsIPrefService)
		.getBranch("extensions.SynoLoader.");

	this.prefs.QueryInterface(Components.interfaces.nsIPrefBranch2);
	this.prefs.addObserver("", this, false);
	this.UpdateStatus();
	this.interval=window.setInterval(function(){SynoLoader.UpdateStatus();},1000);
};


SynoLoader.UpdateStatus = function()
{

	if(true == this.SynoLoaderDMS.syno_download_station.is_connect)
	{
		document.getElementById("SynoLoader_status_image").setAttribute("src", "chrome://SynoLoader/skin/connected.png");
		document.getElementById("SynoLoader_status_lable").value="connected";
	}
	else
	{
		document.getElementById("SynoLoader_status_image").setAttribute("src", "chrome://SynoLoader/skin/notconnect.png");
		document.getElementById("SynoLoader_status_lable").value="not connected";
	}
};	

 SynoLoader.observe = function(subject, topic, data)
  {
	  if (topic == "nsPref:changed")
	  {
		  switch(data)
		  {
		  case 'start_dlm':
			  this.SynoLoaderDMS.Notification.start_dlm=this.prefs.getBoolPref('start_dlm');
			  break;
		  case 'url':
			  this.SynoLoaderDMS.syno_download_station.url=this.prefs.getCharPref('url');
			  break;
		  case 'show_not':
	          this.SynoLoaderDMS.Notification.show_not=this.prefs.getBoolPref('show_not');
	          break;
		  case 'show_dgb':
			  this.SynoLoaderDMS.Util.show_log=this.prefs.getBoolPref('show_dgb');
			  break;
		  case 'DSM_Verison':
			switch(this.prefs.getCharPref('DSM_Verison'))
			{
				case "1":
					document.getElementById('Synoloader.use_magnet').setAttribute("disabled", "true");
					break;
				case "2":
					document.getElementById('Synoloader.use_magnet').setAttribute("disabled", "false");
					break;
			  }
			  this.SynoLoaderDMS.syno_download_station.set_protocol(this.prefs.getCharPref('DSM_Verison'));
			  this.SynoLoaderDMS.syno_download_station.connect_to_nas("");
			  
			  break;
		  case 'emule_downloadfolder':
			  this.SynoLoaderDMS.syno_download_station.emule_downloadfolder=this.prefs.getBoolPref('emule_downloadfolder');
			  break;

		  }       
	  } 
  };

window.addEventListener("load", function (e) { SynoLoader.init(); }, false);




