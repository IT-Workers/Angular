
'use strict';
/**
 * init
 */
var angular_material = angular.module('app', ['ui.router','oc.lazyLoad','ngMaterial']);

/**
 * angular_material  config
 */
angular_material.config(['$stateProvider', '$controllerProvider',function($stateProvider,$controllerProvider){
	
	angular_material.controller = $controllerProvider.register;
	
	$stateProvider.state('/', {
        url: '',
        views: {
            'main': {
                templateUrl: 'index/views/index_content.html',
                controller: "dd",
                resolve:resolve(["index/js/inexController.js", 'index/css/main.css'])
            }
        }
    })
}]);
/**
 * load file
 * @param files
 * @returns
 */
function resolve(files){
	return {
		 loadMyCtrl:['$ocLazyLoad',function ($ocLazyLoad) {
             return $ocLazyLoad.load({
                 files:files
             })
       	}]
	}
}










