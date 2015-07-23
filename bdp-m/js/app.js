var bdpApp = angular.module('BDP',[
	'ui.router',
	'BDP.controllers.login',
	'BDP.services'
]);

bdpApp.run(['$rootScope','$location',function($rootScope,$location){
	$rootScope.$on(
        "$stateChangeStart",
        function () {

            // 显示加载状态
            $rootScope.pageLoading = true;

        }
    );
    
    $rootScope.$on(
        "$stateChangeSuccess",
        function () {
            // 关闭加载状态
            $rootScope.pageLoading = false;
        }
    );
}])




bdpApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/login');
	$stateProvider.state('login',{
		url:'/login',
		templateUrl:'view/login.html',
		controller:'loginCtrl'
	})
}])
