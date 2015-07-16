'use strict';

var Module = angular.module('datePicker');

Module.directive('dateRange', function () {
    return {
        templateUrl: '/static/partials/daterange.html',
        scope: {
            start: '=',
            end: '=',
            range:'='
        },
        link: function (scope, element, attrs) {

            if(scope.range){
                if(scope.range.length>1){
                    if(!scope.range[0]){
                        scope.start = null;
                    }else{
                        scope.start = new Date(scope.range[0]);
                    }
                    if(!scope.range[1]){
                        scope.end = null;
                    }else{

                        scope.end = new Date(scope.range[1]);
                    }
                }
            }
            scope.$watch('range',function(value){
                if(scope.range){
                    if(value.length > 1){
                        if(!scope.range[0]){
                            scope.start = '';
                        }else{
                            scope.start = new Date(scope.range[0]);
                        }
                        if(!scope.range[1]){
                            scope.end = '';
                        }else{

                            scope.end = new Date(scope.range[1]);
                        }
                    }
                }
            });
            scope.$watch('start', function(val) {
                if(!val){
                    scope.start = val;
                }
            });
            scope.$watch('end', function(val) {
                if(!val){
                    scope.end = val;
                }
            });


            attrs.$observe('disabled', function(isDisabled){
                scope.disableDatePickers = !!isDisabled;
            });
            scope.$watch('start.getTime()', function (value) {
                if (value && scope.end && value > scope.end.getTime()) {
                    scope.end = new Date(value);
                }
            });
            scope.$watch('end.getTime()', function (value) {
                if (value && scope.start && value < scope.start.getTime()) {
                    scope.start = new Date(value);
                }
            });
        }
    };
});