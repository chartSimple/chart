(function(){
		angular.module('BDP.controllers.login',[])
		.controller('loginCtrl',loginCtrl);

		loginCtrl.$inject = ['$scope','Hint','httpService','$location'];

		function loginCtrl($scope,Hint,httpService,$location){

			$scope.loginData = {};
			$scope.loginView = {};

			var loginData = $scope.loginData;
			

			$scope.login = function(event){
				event.preventDefault();

				httpService.login({
					domain:loginData.domain,
					username:loginData.username,
					password:loginData.password
				}).then(function(data){
					if(data.status == 0){
						$location.path('/main');
					}
				})

			}
		}
})()