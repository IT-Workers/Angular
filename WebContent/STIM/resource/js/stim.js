
var STIM = (function (window) {
	
	'use strict';
	
	var webSocket;
	
	var MessageType = {
		MSG_TXT    :'MSG_TXT', 
		MSG_IMG    :'MSG_IMG',
		MSG_AUDIO  :'MSG_AUDIO',
		MSG_VIDEO  :'MSG_VIDEO',
		MSG_FILE   :'MSG_FILE'
	};
	
	var publickey;
	var privateKey;
	
	var gap = String.fromCharCode(0x0f);
	
	function encrypt(value){
		var binaryString = pako.gzip((typeof value) == 'string' ? value : JSON.stringify(value), { to: 'string' });
		var encrypt = new JSEncrypt();
	    encrypt.setKey(publickey);
	    return encrypt.encrypt(binaryString);
	};
	
	function decrypt(value){
		var decrypt = new JSEncrypt();
		decrypt.setKey(privateKey);
		return JSON.parse(pako.ungzip(decrypt.decrypt(value), { to: 'string' }));
	};
	
	var Client = function(options){
		
		publickey = options.publickey;
		privateKey = options.privateKey;
		
		var clientId = options.userName;
		var appSpace = options.appSpace
		var callback = options.callback;
		
		var receiveMessageHandler;
		
		this.setReceiveMessageHandler = function(handler){
			receiveMessageHandler = handler;
		};
		
		webSocket = createWebSocket();
		
		function onopen(event){
			//console.log(event);
		};
		
		function onclose(event){
			//console.log(event);
		};
		
		function onerror(event){
			callback({status:-1, message:'connection failure!',event:event});
		};
		
		function onmessage(event){
			var data = event.data;
			var message;
			try {
				message = JSON.parse(data);
				if(message.body == "OK"){
					callback({status:0, message:'connection success!',event:event});
				}else{
					callback({status:-1, message:message.body,event:event});
					close();
				}
			} catch (e) {
				message = decrypt(data);
				saveMessage(message);
				if(receiveMessageHandler){
					receiveMessageHandler(message);
				}
			}
		};
		
		function createWebSocket(){
			webSocket = new WebSocket('ws://127.0.0.1:8080/IMServer/chart/' +appSpace + '/' + clientId + '?token=' + encrypt(options.password) + '');
			webSocket.onopen = onopen;
			webSocket.onerror = onerror;
			webSocket.onmessage = onmessage;
			webSocket.onclose = onclose;
			return webSocket;
		};
		
		function keepLive(){
			if(webSocket && webSocket.readyState == WebSocket.CLOSED){
				webSocket = createWebSocket();
			}
		};
		
		var interval = setInterval(keepLive, 5000);
		
		function close(){
			if(webSocket) webSocket.close();
			clearInterval(interval);
		};
		
		function saveMessage(message){
			var from = message.from;
			var to = (from == clientId ? message.to : from)
			var i_key = clientId + "#" + to;
			var index = localStorage.getItem(i_key);
			for(var key in localStorage){
				var arr = key.split("#");
				if(arr && arr.length == 2 && clientId == arr[0]){
					var record = parseInt(localStorage.getItem(key));
					if(index == null || parseInt(index) > record){
						localStorage.setItem(key, record + 1);
					}
				}
			}
			localStorage.setItem(i_key, 0);
			var c_key = clientId + "@" + to;
			var conversation = localStorage.getItem(c_key);
			localStorage.setItem(c_key, (conversation == null ? "" : conversation + gap ) + JSON.stringify(message));
		};
		
		this.sendMessage = function(message, handler){
			if(webSocket && webSocket.readyState == WebSocket.OPEN){
				webSocket.send(encrypt(message));
				if(webSocket.bufferedAmount > 0){
					handler(true, message);
				}
				saveMessage(message);
			}else{
				handler(false,message);
			}
		};
		
		this.getFriendConversation = function(){
			var conversation = [];
			for(var key in localStorage){
				var arr = key.split("@");
				if(arr && arr.length == 2 && clientId == arr[0]){
					var friendId = arr[1];
					var index = parseInt(localStorage.getItem(clientId + "#" + friendId));
					var dataList = localStorage.getItem(key).split(gap);
					var list = [];
					for(var i in dataList){
						list[i] = JSON.parse(dataList[i])
					}
					conversation[index] = {
						friendId:friendId,
						conversation:list
					};
				}
			}
			return conversation;
		}
		
		this.getFriendConversationById = function(friendId){
			var list = [];
			for(var key in localStorage){
				var arr = key.split("@");
				if(arr && arr.length == 2 && clientId == arr[0]){
					var dataList = localStorage.getItem(key).split(gap);
					for(var i in dataList){
						list[i] = JSON.parse(dataList[i])
					}
				}
			}
			return list;
		};
		
		this.deleteFriendConversation = function(friendId){
			var i_key = clientId + "#" + friendId;
			var index = localStorage.getItem(i_key);
			for(var key in localStorage){
				var arr = key.split("#");
				if(arr && arr.length == 2 && clientId == arr[0]){
					var record = parseInt(localStorage.getItem(key));
					if(record > parseInt(index)){
						localStorage.setItem(key, record - 1);
					}
				}
			}
			localStorage.removeItem(i_key);
			localStorage.removeItem(clientId + "@" + friendId);
		};
		
	};
	
	var TextMessage = function(from, to, body){
		this.from = from;
		this.to = to;
		this.type = MessageType.MSG_TXT;
		this.body = body;
		this.sendTime = nowDate();
	};
	
	var ImageMessage = function(from, to, format, url, thUrl, width, height, size){
		this.from = from;
		this.to = to;
		this.type = MessageType.MSG_IMG;
		this.format = format;
		this.url = url;
		this.thUrl = thUrl;
		this.width = width;
		this.height = height;
		this.size = size;
		this.sendTime = nowDate();
	};
	
	var AudioMessage = function(from, to, format, url, duration, size){
		this.from = from;
		this.to = to;
		this.type = MessageType.MSG_AUDIO;
		this.format = format;
		this.url = url;
		this.duration = duration;
		this.size = size;
		this.sendTime = nowDate();
	};
	
	var VideoMessage = function(from, to, format, url, duration, size){
		this.from = from;
		this.to = to;
		this.type = MessageType.MSG_VIDEO;
		this.format = format;
		this.url = url;
		this.duration = duration;
		this.size = size;
		this.sendTime = nowDate();
	};
	
	var FileMessage = function(from, to, name, format, url, size){
		this.from = from;
		this.to = to;
		this.type = MessageType.MSG_FILE;
		this.name = name;
		this.format = format;
		this.url = url;
		this.size = size;
		this.sendTime = nowDate();
	};
	
	function nowDate(){
		var date;
		try {
			var xhr = new XMLHttpRequest();
			xhr.timeout = 5000;
			xhr.open('GET', 'http://127.0.0.1/STIMWEB', false);
			xhr.send(null);
			date = new Date(xhr.getResponseHeader("Date"));
		} catch (e) {
			date = new Date();
		}
		return date.getTime();
	};
	
	return {
		Client: Client,
		TextMessage:TextMessage,
		ImageMessage:ImageMessage,
		AudioMessage:AudioMessage,
		VideoMessage:VideoMessage,
		FileMessage:FileMessage,
		MessageType:MessageType
	};
})(window);
