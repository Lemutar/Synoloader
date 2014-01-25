var EXPORTED_SYMBOLS = ["Protocol"];
Components.utils.import("resource://SynoLoader/Request.js");  
Components.utils.import("resource://SynoLoader/Util.js");

var Protocol = function (base_url,timeout,user_name,password)
{
 var return_protocol = function (){};
 return_protocol.connect_id =""
 return_protocol.base_url = base_url;



 return_protocol.Connect_Time = 0;
 return_protocol.ed2k_download_folder = "home";
 return_protocol.password = password;
 return_protocol.username = user_name;
 return_protocol.conect = function (callback)
 {
     var conect_response = {success: false, id:"", error_text: ''};
     var conect_request = Request(return_protocol.base_url + '/download/download_redirector.cgi',
				'action=login&username=' + encodeURIComponent(return_protocol.username) + '&passwd=' + encodeURIComponent(return_protocol.password),
				timeout,
				function(response){ 
				if (response.status != 200)
				{
					conect_response.error_text = response.statusText	
				}
				else
				{
					Util.log(response.text);
					if(response.json.success==true)
					{
						if(response.json.login_success==true)
						{
							conect_response.id = response.json.id; 
							conect_response.success = true; 
  							return_protocol.connect_id = response.json.id;
							return_protocol.Connect_Time = Date.now();
						}
						else
						{
							conect_response.success = false; 
							switch(response.json.errcode){
							case -2:
								conect_response.error_text="wrong password"	
								break;
							case -5:
								conect_response.error_text="unknown user"	
								break;								
							}
						}
						
						
					}
				}
				callback(conect_response);					  
				});
     Util.log("try to conect to : " + return_protocol.base_url);
     conect_request.post();
    
 };


 return_protocol.task_action = function (callback, task_action, parameter)
 {
        var task_action_response = {success: false, data: [], error_text: ''};
	if (Date.now() - return_protocol.Connect_Time > 1000 * 60 * 20)
	{
		return_protocol.conect(function(conect_response){
		if(conect_response.success==true )	
		{
		    return_protocol.task_action(callback, task_action, parameter)	
		}
		else
		{
		    callback(conect_response);	
		}
	});
	}
	else
	{
		switch(task_action)
		{
		case 'getall':
		   	var task_action_request = Request(return_protocol.base_url + '/download/download_redirector.cgi',
					'action=getall&id=' + return_protocol.connect_id,
					timeout,
					function(response){
					if (response.status != 200)
					{
					 	 task_action_response.error_text = response.statusText	
					}
					else
					{
						 Util.log(response.text);
		                                 task_action_response.success = response.json.success; 
						 task_action_response.items = response.json.items; 
					}
					callback(task_action_response);
					});
			Util.log("try to getall to : " + return_protocol.base_url);
			task_action_request.post();

		  break;

		case 'addurl':
		   	var task_action_request = Request(return_protocol.base_url + '/download/download_redirector.cgi',
					'action='+ task_action + '&id=' + return_protocol.connect_id + '&url='+ encodeURIComponent(parameter),
					timeout,
					function(response){
					if (response.status != 200)
					{
					 	 task_action_response.error_text = response.statusText	
					}
					else
					{
						 Util.log(response.text);
		                                 task_action_response.success = response.json.success; 
					}
					callback(task_action_response);		
					
					});
			Util.log("try to addurl to : " + return_protocol.base_url);
			task_action_request.post();
			

		  break;

		case 'delete':
                case 'resume':
                case 'stop':
		   	var task_action_request = Request(return_protocol.base_url + '/download/download_redirector.cgi',
					'action='+ task_action + '&idList='+ parameter +'&id=' + return_protocol.connect_id,
					timeout,
					function(response){
					if (response.status != 200)
					{
					 	 task_action_response.error_text = response.statusText	
					}
					else
					{
						 Util.log(response.text);
		                                 task_action_response.success = response.json.success; 
					}
					callback(task_action_response);	
					});
			Util.log("try to "+ task_action + " to : " + return_protocol.base_url);
			task_action_request.post();
		  break;

		}
        }



return_protocol.OnStart = function(event)
{            

     if (event.target.status==3)
	     {
			return_protocol.task_action(function(){},'resume',event.target.id.replace("syno-start","")); 
	     }
	     else
	     {
			return_protocol.task_action(function(){},'stop',event.target.id.replace("syno-start","")); 
	     }
};

return_protocol.OnDel = function(event)
{
	 return_protocol.task_action(function(){},'delete',event.target.id.replace("syno-del","")); 
};


return_protocol.calcItems=function(items)
{
	mediator = Components.classes['@mozilla.org/appshell/window-mediator;1']
                  .getService(Components.interfaces.nsIWindowMediator);
        document = mediator.getMostRecentWindow("navigator:browser").document;
	var richlistitems = [];
	for each (item in items)
	{	
	 var richlistitem = document.createElement('richlistitem');
	 var vbox = document.createElement('vbox');
	 var hbox = document.createElement('hbox');
	 var title = document.createElement('label');
	 var progressmeter = document.createElement('progressmeter');
	 var label = document.createElement('label');
	 var start = document.createElement('toolbarbutton');
	 var del = document.createElement('toolbarbutton');

	 start.setAttribute('id', "syno-start" + item.id);
	 start.setAttribute('class',"SynoLoader_Item_start");
	 start.setAttribute('autocheck',"false");
	 
	 start.status=item.status;
	 start.addEventListener('command', return_protocol.OnStart, true);	
	 if (item.status==3)
	 {
	       start.setAttribute('style', "list-style-image: url('chrome://SynoLoader/skin/Play.png')");       
	 }
	 else
	 {
	       start.setAttribute('style', "list-style-image: url('chrome://SynoLoader/skin/Pause.png')");
	 }
	 del.setAttribute('autocheck',"false");
	 del.setAttribute('id', "syno-del" + item.id);
	 del.setAttribute('class',"SynoLoader_Item_del");
	 del.setAttribute("style", "list-style-image: url('chrome://SynoLoader/skin/Stop.png')");
	 del.addEventListener('command', return_protocol.OnDel, true);		     
	 
	 progressmeter.setAttribute('value', item.progress.replace("%",""));
	 progressmeter.setAttribute('class',"SynoLoader_Item_progress");
	 progressmeter.setAttribute('id', "syno-progress" + item.id);
	 progressmeter.setAttribute('flex','1');
	 title.setAttribute('id', "syno-title" + item.id);
	 title.setAttribute('value', item.filename);
	 title.setAttribute('crop', "center"); 
	 title.setAttribute('class',"SynoLoader_Item_title");
	 
	 status = "none"  
	 switch(item.status)
	 {
		case 1:
			status = "waiting"
			break;
		case 2:
			status = "downloading"
			break;
		case 3:
			status = "paused"
			break;
		case 5:
			status = "finished"
			break;
	 }
	 label.setAttribute('value', status + " - " + item.currentSize +" of "+ item.totalSize + " - " + item.progress );
	 label.setAttribute('id', "syno-label" + item.id);
	 label.setAttribute('crop', "center");


	 hbox.setAttribute('class',"SynoLoader_Item_hbox");
	 hbox.setAttribute('flex','1');
	 vbox.setAttribute('flex','1');
	 vbox.appendChild(title);

	 hbox.appendChild(progressmeter);
	 hbox.appendChild(start);
	 hbox.appendChild(del);
	 vbox.appendChild(hbox);
	 vbox.appendChild(label);
	 
	 richlistitem.setAttribute('id',"syno-" + item.id);
	 richlistitem.setAttribute('syono-id',item.id);
	 richlistitem.setAttribute('class',"SynoLoader_Item");
	 richlistitem.appendChild(vbox);
	 
	 richlistitems.push(richlistitem);
	}	
	return richlistitems;
};


    
};

 return return_protocol;
} 


