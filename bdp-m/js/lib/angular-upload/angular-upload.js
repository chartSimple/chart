'use strict';

angular.module('lr.upload', ['lr.upload.formdata', 'lr.upload.iframe', 'lr.upload.directives']);
angular.module('lr.upload.directives', []);

'use strict';

angular.module('lr.upload.directives').directive('uploadButton', ["upload", 'errHint',function(upload, errHint) {
    return {
        restrict: 'EA',
        scope: {
            data: '=?data',
            url: '@',
            blockChange: '@',
            param: '@',
            method: '@',
            onChange: '&',
            onUpload: '&',
            onSuccess: '&',
            onProgress: '&',
            onError: '&',
            onComplete: '&'
        },
        link: function(scope, element, attr) {

            var el = angular.element(element);
            var maxSize = 100 * (1 << 20); // 100M
            var fileInput = angular.element('<input type="file" />');
            el.append(fileInput);

            scope.$on('fileInputChange', function(){
               uploadButtonFileInputChange();
            });

            fileInput.on('change', function(){
                scope.onChange({files: fileInput[0].files})

            });

            if(!scope.blockChange){
                fileInput.on('change', uploadButtonFileInputChange);
            }

            function uploadButtonFileInputChange(e) {

                var files = fileInput[0].files;
                if (files && files.length === 0) {
                    return;
                }
                if(files && files[0].size >= maxSize){
                    var sizeInMB = files[0].size / ( 1 << 20);
                    errHint('上传文件大小不能超过100M，当前文件大小为:' + sizeInMB.toFixed(1) + "M");
                    return ;
                }

                var options = {
                    url              : scope.url,
                    method           : scope.method || 'POST',
                    forceIFrameUpload: scope.$eval(attr.forceIframeUpload) || false,
                    data             : scope.data || {}
                };

                options.data[scope.param || 'file'] = fileInput;

                if(e){
                    scope.$apply(function () {
                        scope.onUpload({files: fileInput[0].files});
                    });
                }else{
                    scope.onUpload({files: fileInput[0].files});
                }

                upload(options).then(
                    function (response) {
                        scope.onSuccess({response: response});
                        scope.onProgress({progress: 1});
                        scope.onComplete({response: response});
                        resetInput(fileInput[0]);
                    },
                    function (response) {
                        scope.onError({response: response});
                        scope.onComplete({response: response});
                    },
                    function (e) {
                        console.log(e)
                        scope.onProgress({progress: e.loaded / e.total});
                    }
                );
            }

            function resetInput(file){
                var form=document.createElement('form');
                document.body.appendChild(form);
                //记住file在旧表单中的的位置
                var pos=file.nextSibling;
                var parentNode = file.parentNode;
                form.appendChild(file);
                form.reset();
                parentNode.insertBefore(file,pos);
                document.body.removeChild(form);
            }

            // Add required to file input and ng-invalid-required
            // Since the input is reset when upload is complete, we need to check something in the
            // onSuccess and set required="false" when we feel that the upload is correct
            if ('required' in attr) {
                attr.$observe('required', function uploadButtonRequiredObserve(value) {
                    var required = value === '' ? true : scope.$eval(value);
                    fileInput.attr('required', required);
                    element.toggleClass('ng-valid', !required);
                    element.toggleClass('ng-invalid ng-invalid-required', required);
                });
            }

            if ('accept' in attr) {
                attr.$observe('accept', function uploadButtonAcceptObserve(value) {
                    fileInput.attr('accept', value);
                });
            }

            if (upload.support.formData) {
                var uploadButtonMultipleObserve = function () {
                    fileInput.attr('multiple', !!(scope.$eval(attr.multiple) && !scope.$eval(attr.forceIframeUpload)));
                };
                attr.$observe('multiple', uploadButtonMultipleObserve);
                attr.$observe('forceIframeUpload', uploadButtonMultipleObserve);
            }
        }
    };
}]);

'use strict';

angular.module('lr.upload.formdata', [])

    // Convert all data properties to FormData,
    // if they are a jqLite element, extract the files from the input
    .factory('formDataTransform', function () {
        return function formDataTransform(data) {
            var formData = new FormData();

            // Extract file elements from within config.data
            angular.forEach(data, function (value, key) {

                // If it's an element that means we should extract the files
                if (angular.isElement(value)) {
                    var files = [];
                    // Extract all the Files from the element
                    angular.forEach(value, function (el) {
                        angular.forEach(el.files, function (file) {
                            files.push(file);
                        });
                    });

                    // Do we have any files?
                    if (files.length !== 0) {

                        // If we have multiple files we send them as a 0 based array of params
                        // file[0]=file1&file[1]=file2...
                        if (files.length > 1) {
                            angular.forEach(files, function (file, index) {
                                formData.append(key + '[' + index + ']', file);
                            });
                        } else {
                            formData.append(key, files[0]);
                        }
                    }
                } else {
                    // If it's not a element we append the data as normal
                    formData.append(key, value);
                }
            });

            return formData;
        };
    })

    .factory('formDataUpload', ["$q", "$http", "formDataTransform", function ($q, $http, formDataTransform) {
        // see https://github.com/danialfarid/angular-file-upload/blob/master/dist/angular-file-upload-shim.js
        var proceed = XMLHttpRequest.prototype.setRequestHeader;
        XMLHttpRequest.prototype['setRequestHeader'] =  function(header, value) {
                if (header === '__setXHR_') {
                    var val = value(this);
                    // fix for angular < 1.2.0
                    if (val instanceof Function) {
                        val(this);
                    }
                } else {
                    proceed.apply(this, [].slice.call(arguments));
                }
            };

        return function formDataUpload(config) {
            // Apply FormData transform to the request
            config.transformRequest = formDataTransform;
            var deferred = $q.defer();
            // Extend the headers so that the browser will set the correct content type
            config.headers = angular.extend(config.headers || {}, {
                'Content-Type': undefined,
                "__setXHR_": function(){
                    return function(xhr) {
                        if (!xhr) return;
                        config.__XHR = xhr;
                        config.xhrFn && config.xhrFn(xhr);
                        xhr.upload.addEventListener('progress', function(e) {
                            deferred.notify(e);
                        }, false);
                        //fix for firefox not firing upload progress end, also IE8-9
                        xhr.upload.addEventListener('load', function(e) {
                            if (e.lengthComputable) {
                                deferred.notify(e);
                            }
                        }, false);
                    };
                }
            });

            $http(config).then(deferred.resolve, deferred.reject, deferred.notify);
            return deferred.promise;
        };
    }]);

'use strict';

angular.module('lr.upload.iframe', []).factory('iFrameUpload', ["$q", "$http", "$document", "$rootScope", function ($q, $http, $document, $rootScope) {

    function indexOf(array, obj) {
        if (array.indexOf) {
            return array.indexOf(obj);
        }

        for ( var i = 0; i < array.length; i++) {
            if (obj === array[i]) {
                return i;
            }
        }
        return -1;
    }

    function iFrameUpload(config) {
        var files = [];

        var deferred = $q.defer(),
            promise = deferred.promise;

        // Extract file elements from the within config.data
        angular.forEach(config.data || {}, function (value, key) {
            if (angular.isElement(value)) {
                delete config.data[key];
                value.attr('name', key);
                files.push(value);
            }
        });

        // If the method is something else than POST append the _method parameter
        var addParamChar = /\?/.test(config.url) ? '&' : '?';
        // XDomainRequest only supports GET and POST:
        if (config.method === 'DELETE') {
            config.url = config.url + addParamChar + '_method=DELETE';
            config.method = 'POST';
        } else if (config.method === 'PUT') {
            config.url = config.url + addParamChar + '_method=PUT';
            config.method = 'POST';
        } else if (config.method === 'PATCH') {
            config.url = config.url + addParamChar + '_method=PATCH';
            config.method = 'POST';
        }

        var body = angular.element($document[0].body);

        // Generate a unique name using getUid() https://github.com/angular/angular.js/blob/master/src/Angular.js#L292
        // But since getUid isn't exported we get it from a temporary scope
        var uniqueScope = $rootScope.$new();
        var uniqueName = 'iframe-transport-' + uniqueScope.$id;
        uniqueScope.$destroy();

        var form = angular.element('<form></form>');
        form.attr('target', uniqueName);
        form.attr('action', config.url);
        form.attr('method', config.method || 'POST');
        form.css('display', 'none');

        if (files.length) {
            form.attr('enctype', 'multipart/form-data');
            // enctype must be set as encoding for IE:
            form.attr('encoding', 'multipart/form-data');
        }

        // Add iframe that we will post to
        var iframe = angular.element('<iframe name="' + uniqueName + '" src="javascript:false;"></iframe>');

        // The first load is called when the javascript:false is loaded,
        // that means we can continue with adding the hidden form and posting it to the iframe;
        var timer = null, count = 0, loaded = 0, total = 1024 * 1024;
        iframe.on('load', function () {
            iframe
                .off('load')
                .on('load', function () {
                    // The upload is complete and we not need to parse the contents and resolve the deferred
                    timer !== null && clearInterval(timer);
                    deferred.notify({
                        total: total,
                        loaded: total
                    });
                    var response;
                    // Wrap in a try/catch block to catch exceptions thrown
                    // when trying to access cross-domain iframe contents:
                    try {
                        var doc = this.contentWindow ? this.contentWindow.document : this.contentDocument;
                        response = angular.element(doc.body).text();
                        // Google Chrome and Firefox do not throw an
                        // exception when calling iframe.contents() on
                        // cross-domain requests, so we unify the response:
                        if (!response.length) {
                            throw new Error();
                        }
                    } catch (e) {}

                    // Fix for IE endless progress bar activity bug
                    // (happens on form submits to iframe targets):
                    form.append(angular.element('<iframe src="javascript:false;"></iframe>'));

                    // Convert response into JSON
                    try {
                        response = transformData(response, $http.defaults.transformResponse);
                    } catch (e) {}

                    deferred.resolve({
                        data: response,
                        status: 200,
                        headers: [],
                        config: config
                    });
                });

            // Move file inputs to hidden form
            angular.forEach(files, function (input) {

                // Clone the original input also cloning it's event
                // @fix jQuery supports the option of cloning with events, but angular doesn't
                // this means that if you don't use jQuery the input will only work the first time.
                // because when we place the clone in the originals place we will not have a
                // change event hooked on to it.
                var clone = input.clone(true);

                // Insert clone directly after input
                input.after(clone);

                // Move original input to hidden form
                form.append(input);
            });

            // Add all existing data as hidden variables
            angular.forEach(config.data, function (value, name) {
                var input = angular.element('<input type="hidden" />');
                input.attr('name', name);
                input.val(value);
                form.append(input);
            });

            config.$iframeTransportForm = form;

            // Add the config to the $http pending requests to indicate that we are doing a request via the iframe
            $http.pendingRequests.push(config);

            // Transform data using $http.defaults.response
            function transformData(data, fns) {
                // An iframe doesn't support headers :(
                var headers = [];
                if (angular.isFunction(fns)) {
                    return fns(data, headers);
                }

                angular.forEach(fns, function(fn) {
                    data = fn(data, headers);
                });

                return data;
            }

            // Remove everything when we are done
            function removePendingReq() {
                var idx = indexOf($http.pendingRequests, config);
                if (idx !== -1) {
                    $http.pendingRequests.splice(idx, 1);
                    config.$iframeTransportForm.remove();
                    delete config.$iframeTransportForm;
                }
            }

            // submit the form and wait for a response
            form[0].submit();
            timer = setInterval(function(){
                count++;
                loaded += total *  Math.pow(0.45, count);
                console.log(total, loaded);
                deferred.notify({
                    total: total,
                    loaded: loaded
                });
            }, 400);

            promise.then(removePendingReq, removePendingReq);
        });

        form.append(iframe);
        body.append(form);


        return promise;
    }

    return iFrameUpload;
}]);

'use strict';

angular.module('lr.upload').factory('upload', ["$window", "formDataUpload", "iFrameUpload", function ($window, formDataUpload, iFrameUpload) {
    var support = {
        // Detect file input support, based on
        // http://viljamis.com/blog/2012/file-upload-support-on-mobile/
        // Handle devices which give false positives for the feature detection:
        fileInput: !(
            new RegExp(
                    '(Android (1\\.[0156]|2\\.[01]))' +
                    '|(Windows Phone (OS 7|8\\.0))|(XBLWP)|(ZuneWP)|(WPDesktop)' +
                    '|(w(eb)?OSBrowser)|(webOS)' +
                    '|(Kindle/(1\\.0|2\\.[05]|3\\.0))'
            ).test($window.navigator.userAgent) || angular.element('<input type="file">').prop('disabled')
            ),

        // The FileReader API is not actually used, but works as feature detection,
        // as e.g. Safari supports XHR file uploads via the FormData API,
        // but not non-multipart XHR file uploads:
        fileUpload: !!($window.XMLHttpRequestUpload && $window.FileReader),
        formData: !!$window.FormData
    };

    function upload(config) {
        if (support.formData && !config.forceIFrameUpload) {
            return formDataUpload(config);
        }
        return iFrameUpload(config);
    }

    upload.support = support;

    return upload;
}]);
