(function(){
		angular.module('BDP.controllers.main',[])
		.controller('mainCtrl',mainCtrl);

		mainCtrl.$inject = ['$scope','Hint','httpService','$location'];

		function mainCtrl($scope,Hint,httpService,$location){
			$scope.mainData = {};
			$scope.mainView = {};

			var mainData = $scope.mainData,
				mainView = $scope.mainView;

				getTree();

			$scope.getDashList = function(proj){
				if(window.localStorage){
					localStorage.setItem('proj',angular.toJson(proj));
				}
				$location.path('/dashboard');
			}



			function getTree(){
				httpService.project.tree().then(function(data){
					if(data.status != 0) return;
					var result = data.result;

					mainData.list = result.own.concat(result.rule,result.share);

				})
			}
		}
})()