(function(){
		angular.module('BDP.controllers.login',[])
		.controller('loginCtrl',loginCtrl);

		loginCtrl.$inject = ['$scope','Hint','Ajax'];

		function loginCtrl($scope,Hint,Ajax){

			$scope.loginData = {};
			$scope.loginView = {};

			var loginData = $scope.loginData;
			

			$scope.login = function(event){
				event.preventDefault();

				Ajax.login({
					domain:loginData.domain,
					username:loginData.username,
					password:loginData.password
				}).then(function(data){
					if(data.status){
						
					}
				})

			}
		}

})()