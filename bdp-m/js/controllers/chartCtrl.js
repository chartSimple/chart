(function(){
		angular.module('BDP.controllers.chart',[])
		.controller('chartCtrl',chartCtrl);

		chartCtrl.$inject = ['$scope','$rootScope','Hint','$location',"httpService","$stateParams"];

		function chartCtrl($scope,$rootScope,Hint,$location,httpService,$stateParams){
			
			$scope.chartData = {};
			$scope.chartView = {};

			var chartData = $scope.chartData,chartView = $scope.chartView;

			getChartData($stateParams.id);


			function getChartData(ct_id){
				httpService.chart.data({ct_id:ct_id}).then(function(data){
					if(data.status != 0) return;
					var info = data.result.info;

					chartData.title = info.title;
					chartData.data = data.result;

				})
			}
		}
})()