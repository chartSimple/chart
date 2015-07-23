module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt); //加载所有的任务
	
	  // 配置Grunt各种模块的参数
	  grunt.initConfig({
		connect: {
			options: {
				hostname:'0.0.0.0',
				keepalive:true,
				open:false
			},
			proxies: [
				{
					context: '/api',
					host: '123.126.105.47',
					port: 9987,
				//	host:'123.126.105.45',
			//		port:29987,
					changeOrigin: true
				}
			],
			d3: {
				options: {
					port:7000,
					middleware: function (connect) {
						 return [
							require('grunt-connect-proxy/lib/utils').proxyRequest,
							connect.static('static')
						 ];
					 }
				 }
			},
			bdp: {
				options: {
					port:8888,
					middleware: function (connect) {
						 return [
							require('grunt-connect-proxy/lib/utils').proxyRequest,
							connect.static('bdp-m')
						 ];
					 }
				 }
			}
	  	}
	 });

	// 从node_modules目录加载模块文件
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-connect-proxy');
	//grunt.loadNpmTasks('grunt-contrib-jshint');
	//grunt.loadNpmTasks('grunt-contrib-uglify');

	// 每行registerTask定义一个任务
	//grunt.registerTask('default', ['jshint', 'concat', 'uglify']);
	grunt.registerTask('default',
		[
			//'connect:server',
			'configureProxies',
			'connect:d3'
		]	
	);
	grunt.registerTask('bdp',
		[
			//'connect:server',
			'configureProxies',
			'connect:bdp'
		]	
	);

};
