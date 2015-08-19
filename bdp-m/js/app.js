var bdpApp = angular.module('BDP',[
    'ui.router',
    'BDP.services',
    'BDP.directives',
    'BDP.controllers.login',
    'BDP.controllers.main',
    'BDP.controllers.dashboard',
    'BDP.controllers.chart'
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

    $rootScope.changePath = function(path,id){
        $location.path('/'+path+'/'+ id);
    }
}])



bdpApp.config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
	$urlRouterProvider.otherwise('/main');
	$stateProvider.state('login',{
		url:'/login',
		templateUrl:'view/login.html',
		controller:'loginCtrl'
	})
    .state('main',{
        url:'/main',
        templateUrl:'view/main.html',
        controller:'mainCtrl'
    })
    .state('dashboard',{
        url:'/dashboard',
        templateUrl:'view/dashboard.html',
        controller:'dashboardCtrl'
    })
    .state('chart/:id',{
        url:'/chart/:id',
        templateUrl:'view/chart.html',
        controller:'chartCtrl'
    })
}])
