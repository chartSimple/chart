(function(){
		angular.module('BDP.controllers.dashboard',[])
		.controller('dashboardCtrl',dashboardCtrl);

		dashboardCtrl.$inject = ['$scope','$rootScope','Hint','$location',"httpService"];

		function dashboardCtrl($scope,$rootScope,Hint,$location,httpService){
			$scope.dashboardData = {};
			$scope.dashboardView = {};

			var dashboardData = $scope.dashboardData,
				dashboardView = $scope.dashboardView;

			if(window.localStorage){
				var proj = angular.fromJson(localStorage.getItem('proj'));
				dashboardData.dash = proj.dsh_list;
				dashboardData.projName = proj.name;
			}

			getDashInfo(dashboardData.dash[0].dsh_id);



			function getDashInfo(dsh_id){
				httpService.dash.info({dsh_id:dsh_id}).then(function(data){
					if(data.status != 0) return;

					dashboardData.charts = data.result.meta.charts;
					// console.log($scope.dashboardData)
				})
			}

		}
})()