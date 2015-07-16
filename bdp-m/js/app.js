var bdp = angular.module('bdp_m',[
	'ui.router'
]);


hzApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
	$stateProvider.state('login',{
		url:'/login',
		templateUrl:'view/login.html',
		controller:'loginCtrl'
	})
}])