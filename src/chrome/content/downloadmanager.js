
var SynoLoader = {};
Components.utils.import("resource://SynoLoader/DSM3.js",SynoLoader);  



(function() {


this.UpdateList = function()
{
	SynoLoader.SynoLoaderDMS.syno_download_station.GetAll();
	this.list=document.getElementById("Syno-List");
	var count = this.list.itemCount;
	while(count-- > 0)
	{	
		 this.list.removeItemAt(count);
	}

	var DMS_Downloadlist=SynoLoader.SynoLoaderDMS.syno_download_station.getlist();
	SynoLoader.SynoLoaderDMS.Util.log( DMS_Downloadlist);
	for(i in DMS_Downloadlist)
	{
		
		 this.list.appendChild(DMS_Downloadlist[i]);
	}
	
};




this.StartRequestData = function() 
{
SynoLoader.UpdateList();
this.intvall = window.setInterval(function(){
SynoLoader.UpdateList();},1000);
};

 
window.addEventListener("load", function (e) {SynoLoader.StartRequestData();}, false);	
window.addEventListener("unload", function(e) {window.clearInterval(SynoLoader.intvall); }, false); 
}).apply(SynoLoader);
