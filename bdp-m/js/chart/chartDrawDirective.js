(function(bdpChart){


    function Chart(){
    	this.init = function(data,elem){

    		var chartType = data.info.chart_type;

    		if($.inArray(chartType,bdpChart.config.chartType) == -1){
    			console.log('暂不支持此图表类型');
    			return;
    		}


    		this.WIDTH = $(elem).width();
    		this.HEIGHT = $(elem).height();
    		this.chartType = chartType;
    		this.charttype = bdpChart.config.chart[this.chartType];
    		this.draw(data);
    	}

    }

    Chart.prototype = {
    	draw:function(data,elem){
    		
    	}
    }

	
	angular.module('BDP.directives',[])
		.directive('chartDraw',[function(){
			return {
	            restrict: 'A',
	            // replace: true,
	            scope:{
	            	chartData:'='
	            },
	            link: function ($scope, element, attrs) {
	                
	                $scope.$watch('chartData',function(val){
	                	// console.log(val);
	                	if(val){
	                		var chart = new Chart();
	                		chart.init(val,element);
	                	}
	                })
	            },
	            controller: ['$scope', function ($scope) {


	            }]
	        };
		}])

	// chartDraw.$inject = ['$scope'];

	// function chartDraw($scope){
	// }
})(bdpChart)