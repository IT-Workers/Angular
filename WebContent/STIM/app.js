
'use strict';
var app = angular.module('app',[]);

app.filter('messageCount', function() {
    return function(count) {
        if(count > 99){
        	count = "99+";
        }
        return count;
    }
});

app.filter('fileName', function() {
    return function(name) {
    	var len = name.length;
        if( len > 20){
        	name = "..." + name.substring(len - 20, len);
        }
        return name;
    }
});

app.filter('fileSize', function() {
    return function(size) {
    	var value = 0 ,unit = 'B';
    	if(size < 1024){
    		value = size;
    	}else{
    		var i=0; value = size / 1024;
    		while(value > 1024){
    			value = value / 1024;
    			i++;
    		}
			if(i==0){
				unit = "KB";
			}else if(i==1){
				unit = "MB";
			}else if(i==2){
				unit = "GB";
			}else{
				unit = "TB";
			}
    	}
    	return value.toFixed(2) + unit;
    }
});

app.directive('word', [function () {
    return {
        restrict: 'A',
        link: function (scope, element, attrs) {
        	var value = attrs.word;
        	for(var i in scope.faceArr){
    			var rep = scope.faceArr[i];
    			value = value.replace(rep.alias, rep.img);
    		}
        	element[0].innerHTML = value;
        }
    };
}]);

app.controller('controller', function($scope, $http) {
	
	/**
	 * STIM 所需的加密公钥和私钥, 不建议自己写在客户端，建议通后后台 获取。
	 * demo 是为方便测试才写入客户端js中。
	 */
	
	var publickey = "MIIBojANBgkqhkiG9w0BAQEFAAOCAY8AMIIBigKCAYEAsG6CABTC0N31ZwXbnwoREdKtLDKlLSLQ0x+1pBPtvAHIXgGuA+v6OklGAtkyv/"
		+ "awq3UubOwC5n4E+sIS5xCDUyRXSXFAXlc4pEE5uOSjPiWJVIJ6oyM7wZIFqYieMysWgPBae3cW+pa6Eg59lLBstfEhpMSJAJmSC1/FwWb9L5v2XTjoteLcq2JSFiB1YZ+"
		+ "dLRjQ2bAZUmVhwrnVmIQGSmMT39tyaMrsD0I1IGrhHrQLTx8qxHB9M1BXCScPVsMAmQAVbariUfcuk963ICBixYaaVHDSjgbd6e2kkwDz4djzGNZqgZ4Kmb88FQbA4BBIcF8rhLzfes"
		+ "7G1UGzTU1U5tjnq3t1Jdyv3xEBB2Fg+1hddS1B7SQlPSI3N6WetpuXQRD/I7RwDTQJ03s7UHKwbIaYQ7NXZsTpXvLu0ONF8Osx8DgcsiPR6rukM09XEFkrcBtgT9Sr6JmOgPu8Unf4lfo" 
		+"QeHqIAdnVii0adb//Sb6uk9cccFtLOBR4En0HBzpZAgMBAAE=";


	var privateKey = "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";
	
	/**
	 * 用户信息
	 */
	$scope.user = {
		name:'DEMO1',
		clientId:'123456',
		password:'123456',
		appSpace:'STIM_TEST',
		icon:'resource/img/user.jpg',
		publickey:publickey,
		privateKey:privateKey
	};
	
	/**
	 * 初始化客户端
	 * publickey  ：公钥
	 * privateKey ：私钥
	 * appSpace   : 应用空间名
	 * userName   ：用户名
	 * password   ：密码
	 * callback   ：回调函数  参数：result ：eq：{status：[状态 0 初始化成功，-1 初始化失败],message:[描述信息], event：[websocket连接信息]}
	 */
	var iMClient  = new STIM.Client({
		publickey:$scope.user.publickey,
		privateKey:$scope.user.privateKey,
		appSpace:$scope.user.appSpace,
		userName:$scope.user.clientId,
		password:$scope.user.password,
		callback:function(result){
			console.log(result);
		}
	});
	
	/**
	 * 接收消息回调
	 */
	iMClient.setReceiveMessageHandler(function(message) {
		
		$scope.conversation.push(message);
		$scope.friendConversation = iMClient.getFriendConversation();
		
		$scope.$apply(function () {
			$scope.$watch('conversation',function(newValue,oldValue){
				var element = document.getElementById('content');
				element.scrollTop = element.scrollHeight;
			});
		});
	});
	
	/**
	 * 获取所有好友【本地】历史会话
	 */
	$scope.friendConversation = iMClient.getFriendConversation();
	
	/**
	 * 好友列表，好友列表需要通过自己的服务器去获取，之所以消息服务部存错好友列表，是因为每个人的系统服务存储的好友信息都不一样。
	 * 以下为测试的好友列表，仅供demo使用
	 */
	 $scope.friends = [{
		 name:'测试好友',
		 clientId:'456789',
		 icon:'resource/img/friend-456789.jpg'
	 }];
	 
	 //获取好友详细信息
	 $scope.getFriend = function(friendId){
		for (var i in $scope.friends) {
			var friend = $scope.friends[i];
			if (friendId == friend.clientId) {
				return friend;
			}
		}
	 };
		
	//保存当前选择的好友ID，当刷新浏览器 从新获取上次 会话的好友
    $scope.friendId = localStorage.getItem($scope.user.clientId + "_initFriend");
    //获取当前好友会话
    $scope.conversation = iMClient.getFriendConversationById($scope.friendId);
    //会话显示到底部
    angular.element(window).bind('load', function() {  
    	var element = document.getElementById('content');
		element.scrollTop = element.scrollHeight;
    });
    
    //发送消息
    $scope.sendMessage = function(friendId){
    	if(!friendId){
    		friendId = localStorage.getItem($scope.user.clientId + "_initFriend");
    	}
    	var container = document.getElementById('messageValue');
    	var value = container.innerHTML;
    	if(value.length > 0){
    		//替换表情
    		for(var i in $scope.faceArr){
    			var rep = $scope.faceArr[i];
    			value = value.replace(rep.img, rep.alias);
    		}
    		var message =  new STIM.TextMessage($scope.user.clientId, friendId, value);
    		iMClient.sendMessage(message, function(ok, message){
    			if(ok){
    				$scope.sendOk = true;
    				$scope.conversation.push(message);
    				container.innerHTML = '';
    				$scope.$watch('conversation',function(newValue,oldValue){
        				var element = document.getElementById('content');
        				element.scrollTop = element.scrollHeight;
        				$scope.friendConversation = iMClient.getFriendConversation();
        		    });
    			}else{
    				$scope.sendOk = false;
    			}
    		});
    	}
    };
    
    /**
     * Ctrl+Enter发送
     */
    $scope.editMessage = function(event, friendId){
    	if (event.ctrlKey && event.which === 13) {
    		$scope.sendMessage(friendId);
		}
    };
    /**
     * 选择会话或者好友列表
     */
    $scope.type = 1;
    $scope.selected = function(type){
    	$scope.type = type;
    };
    /**
     * 选择好友
     */
    $scope.seleectdFriend = function(friendId){
    	$scope.friendId = friendId;
    	localStorage.setItem($scope.user.clientId + "_initFriend", friendId);
    	$scope.conversation = iMClient.getFriendConversationById(friendId);
    };
    /**
     *删除好友会话
     */
    $scope.deleteFriendConversation = function(friendId){
    	iMClient.deleteFriendConversation(friendId);
    	$scope.friendConversation = iMClient.getFriendConversation();
    	if($scope.friendConversation.length == 0){
    		$scope.friendId = undefined;
    	}
    };
    /**
     * 搜索
     */
    $scope.search = function(name){
		$scope.searcgName = name;
	};
	
	/**
	 * 表情个数
	 */
	$scope.faceArr = [];
	for(var i=1; i<=91; i++){
		$scope.faceArr[i-1] = {
			url:'resource/img/face/'+i+'.gif',
			img:'<img src="resource/img/face/'+i+'.gif" style="vertical-align: middle">',
			alias:'[:'+i+')]',
		};;
	};
	/**
	 * 显示表情
	 */
	$scope.showFace = function(event){
		event.stopPropagation();
		$scope.faceshow = true;
	};
	angular.element(window).bind('click', function() {  
		$scope.$apply(function () {
			$scope.faceshow = false;
		});
    });
	/**
	 * 选择表情
	 */
	$scope.selectedFaceImgage = function(face){
		var container = document.getElementById('messageValue');
		var img = document.createElement('img');
		img.src = face.url;
		img.setAttribute("style", "vertical-align: middle");
		container.appendChild(img);
	};
	/**
	 * 选择文件 并发送文件
	 */
	$scope.seletedFile = function(fileNode){
		var clientId = $scope.user.clientId;
		var friendId = $scope.friendId;
		var message, files = fileNode.files;
		for(var i =0; i<files.length; i++){
			var file = files[i];
			var type = file.type;
			var name = file.name;
			var size = file.size;
			// 代码中的  文件 url thUrl, width. height, duration 通过文件上上传到自己的服务获得
			//文件上传代码 略。。。。:)
			var url = 'http://www.w3school.com.cn/i/eg_tulip.jpg', thUrl = 'http://www.w3school.com.cn/i/eg_tulip.jpg';
			var width = 320, height = 240;
			var duration = 5000;
			if(type.indexOf("image") != -1){
				message = new STIM.ImageMessage(clientId, friendId, type, url, thUrl, width, height, size);
			}else if(type.indexOf("video") != -1){
				url = 'http://www.w3school.com.cn/example/html5/mov_bbb.mp4';
				message = new STIM.VideoMessage(clientId, friendId, type, url, duration, size);
			}else if(type.indexOf("audio") != -1){
				url = 'http://www.w3school.com.cn/i/movie.ogg';
				message = new STIM.AudioMessage(clientId, friendId, type, url, duration, size);
			}else{
				if(type == ''){
					var arr = name.split(".");
					type = arr[arr.length - 1];
				}
				message = new STIM.FileMessage(clientId, friendId, name, type, url, size);
			}
			//发送消息
			iMClient.sendMessage(message, function(ok, message){
				if(ok){
					$scope.conversation.push(message);
					$scope.$apply(function () {
		    			$scope.$watch('conversation',function(newValue,oldValue){
		    				var element = document.getElementById('content');
		    				element.scrollTop = element.scrollHeight;
		    				$scope.friendConversation = iMClient.getFriendConversation();
		    		    });
					});
				}else{
					$scope.sendOk = false;
				}
    		});
		}
	};
});









