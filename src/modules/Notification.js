var EXPORTED_SYMBOLS = ["Notification"];

var ww = Components.classes["@mozilla.org/embedcomp/window-watcher;1"]
.getService(Components.interfaces.nsIWindowWatcher);


Notification = function(){

};
try {
Notification.AlertInterface=Components.classes['@mozilla.org/alerts-service;1'].getService(Components.interfaces.nsIAlertsService);

} catch(e) {
// prevents runtime error on platforms that don't implement nsIAlertsService
}

Notification.show_not=false;
Notification.show = function(title,text)
 {
	if(this.show_not)
	{
		try 
		{
			this.AlertInterface.showAlertNotification("chrome://SynoLoader/skin/Syno.png", title, text, false, '', null);
		} 
		catch(e) 
		{
	    	// prevents runtime error on platforms that don't implement nsIAlertsService
		}
	}
};

Notification.showDownlaodManager = function()
{
	if(this.start_dlm)
	{
		var win = ww.openWindow(null, "chrome://SynoLoader/content/SynoDownloads.xul","SynoLoader Downloads", "chrome,centerscreen,width=500,height=600", null);
	}
};
 