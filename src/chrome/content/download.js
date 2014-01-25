


var SynoLoader = {};
Components.utils.import("resource://SynoLoader/DSM3.js",SynoLoader);  

onaccept = function(event) {
 	if ( document.getElementById("mode").value == "SynoLoader")
	{
	SynoLoader.SynoLoaderDMS.syno_download_station.transfer_to_nas(dialog.mLauncher.source.spec);
	return dialog.onCancel() ;
	}
	else
	{
	return dialog.onOK();
	}
};
 
	 

