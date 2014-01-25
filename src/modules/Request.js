var EXPORTED_SYMBOLS = ["Request"];
Components.utils.import("resource://SynoLoader/Util.js");


var Request = function (url,parameter,timeout,callback)
{
 var return_request = function (){};
 return_request.http_request = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
	                    .createInstance(Components.interfaces.nsIXMLHttpRequest);
 return_request.response = {text: "", statusText:"", status: 0, json : {}};	



return_request.http_request.timeout=timeout;
return_request.http_request.ontimeout = function () {  

		return_request.response.status = 408;
		return_request.response.statusText = "Request Time-out"; 
		callback(return_request.response);
};



return_request.http_request.onreadystatechange = function()
{
  
 		if ( return_request.http_request.readyState == 4 ) 
		{
				switch( return_request.http_request.status)
				{
				case 0:
				
					break;
				case 200:
					return_request.response.text = return_request.http_request.responseText;
					try 
					{
  						return_request.response.json = JSON.parse(return_request.http_request.responseText);
					} 
					catch (e) 
					{}
  					break;	
				default:
					break;
	
				};
			
				return_request.response.statusText = return_request.http_request.statusText;
				return_request.response.status = return_request.http_request.status;
				callback(return_request.response);
				
 		}

 };

return_request.post = function()
{
   return_request.http_request.open('POST',url, true);
   return_request.http_request.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
   return_request.http_request.setRequestHeader("Content-length", parameter.length);
   return_request.http_request.send(parameter);

}

return_request.get = function()
{
   return_request.http_request.open('GET',url+"?"+parameter, true);
   return_request.http_request.send(null);

}
 



return return_request;
} 



