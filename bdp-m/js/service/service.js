/**
**  services
*/

angular.module('BDP.services',[])
	.factory('Hint',hintService) //错误提示信息
	.service('commonHttp',commonHttpService)//commonHttp.get  commonHttp.post
    .service('Ajax',ajaxService);



/*---hintService start---*/
	hintService.$inject = ['$rootScope','$timeout'];

	function hintService($rootScope, $timeout){
		var n = 0;
        var timer = null;
        return function(param){
        	var str;
            if (typeof param == 'string') {
                str = param;
            } else {
                var d = param;

                switch (d) {
                    case 1 :
                        location.href = '/login.html';
                        break;
                    case 1010:
                        str = '登录信息有误，请检查并重新填写。'
                        break;
                    default:
                        str = '出错啦';
                }

            }

            $rootScope.hint = str;

            if(timer){
                $timeout.cancel(timer.$$timeoutId);
                timer = null;
            }

            timer = $timeout(function(){
                $rootScope.hint = '';
            }, 3000)

        }
	}
/*-- end HintService--*/

/*--commonHttp - start--*/
	commonHttpService.$inject = ['$http','Hint'];

	function commonHttpService($http,Hint){
		var param = {},o = {Hint:true};
        var responseData = function (data) {
            data = data.data;
            if (data.status == "0") {
                return data
            } else {
                if(o.Hint){
                    var code = parseInt(data.status);
                    Hint(code || data.errstr);
                }
                return data;
            }
        };
        return {
            get: function (url, ops,params) {
                param = {};
                param._t = new Date().getTime();
                angular.extend(param, ops);


                if(!params){
                    params = {};
                }else{
                    angular.extend(o, params);
                }

                return $http.get(url, {
                    params: param
                }).then(responseData);
            },
            post: function (url, ops,params) {

                param = {};
                angular.extend(param, ops);

                if(!params){
                    params = {};
                }else{
                    angular.extend(o, params);
                }
                return $http.post(url, param).then(responseData)
            }
        }
	}
/*--commonHttp - end--*/


/*--ajaxService--start--*/
    ajaxService.$inject = ['commonHttp'];

    function ajaxService(commonHttp){

        return{
            login:function(param){
                return commonHttp.get('/api/user/login',param);
            }
        }
    }
/*--ajaxService--end--*/
