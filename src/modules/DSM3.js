
var EXPORTED_SYMBOLS = ["SynoLoaderDMS"];


if (typeof SynoLoaderDMS == "undefined") {
  var SynoLoaderDMS = {};
   



SynoLoaderDMS = {
			

		        syno_download_station : new function() {
		
	
			this.SynoId=0;
			this.password = "";
			this.username = "";
			this.initialized=false;
			this.is_connect = false;
                        this.connect_error = false;
			this.list = [];
			this.protocoll = "undefined"; 

			Components.utils.import("resource://SynoLoader/Protocol_API.js",SynoLoaderDMS); 
			this.protocoll = SynoLoaderDMS.Protocol(this.url,5000,this.username,this.password);
			
			this.url="none";

			this.set_protocol= function(protocol) 
		        {
				switch(protocol)
				{
					case "1":
						SynoLoaderDMS.Util.log("Set Protocol to < DMS 4.1");
						Components.utils.import("resource://SynoLoader/Protocol.js",SynoLoaderDMS); 
						this.protocoll = SynoLoaderDMS.Protocol(this.url,5000,this.username,this.password);
						break;
					case "2":
						SynoLoaderDMS.Util.log("Set Protocol to > DMS 4.1");
						Components.utils.import("resource://SynoLoader/Protocol_API.js",SynoLoaderDMS); 
						this.protocoll = SynoLoaderDMS.Protocol(this.url,5000,this.username,this.password);
						break;
				}
				
			}; 
			

			this.connect_to_nas= function(link) 
		        {
				this.protocoll.password = this.password;
				this.protocoll.username = this.username;
                                this.protocoll.base_url = this.url;
		       		this.protocoll.conect(function(response)
							{
								SynoLoaderDMS.syno_download_station.is_connect=response.success;
							});
			}; 	
		
			this.transfer_to_nas = function(link)
			{
				this.protocoll.task_action(function(response)
					{	
					if(response.success==true)
					{
						SynoLoaderDMS.Notification.show("Send Link", link);
					}
					else
					{
						SynoLoaderDMS.Notification.show("Send Link Faild", link);
					}
					
					},
					'addurl',
					link); 
		
			};


		
			this.GetAll = function()
			{
				this.protocoll.task_action(function(response)
					{	
					if(response.success==true)
					{
						SynoLoaderDMS.syno_download_station.list = SynoLoaderDMS.syno_download_station.protocoll.calcItems(response.items);
					}
					else
					{
					}
					
					},
					'getall'); 
			};
			
			
			this.getlist = function()
			{
				return this.list;
			};

	
		}
	};
 };	
	
Components.utils.import("resource://SynoLoader/Util.js",SynoLoaderDMS); 
Components.utils.import("resource://SynoLoader/Notification.js",SynoLoaderDMS); 


