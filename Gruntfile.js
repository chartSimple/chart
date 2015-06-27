module.exports = function(grunt) {

	require('load-grunt-tasks')(grunt); //加载所有的任务
	
	  // 配置Grunt各种模块的参数
	  grunt.initConfig({
		connect: {
			options: {
				hostname:'127.0.0.1',
				keepalive:true,
				open:true
			},
			proxies: [
				{
					context: '/api',
					host: '123.126.105.20',
					port: 9987,
				//	host:'123.126.105.45',
			//		port:29987,
					changeOrigin: true
				}
			],
			mc: {
				options: {
					port:9000,
					middleware: function (connect) {
						 return [
							require('grunt-connect-proxy/lib/utils').proxyRequest,
							connect.static('tu/branches/1.0.8/mc')
						 ];
					 }
				 }
			},
			admin: {
				options: {
					port:8000,
					middleware: function (connect) {
						 return [
							require('grunt-connect-proxy/lib/utils').proxyRequest,
							connect.static('mc-web')
						 ];
					 }
				 }
			},
			admin107: {
				options: {
					port:1208,
					middleware: function (connect) {
						 return [
							require('grunt-connect-proxy/lib/utils').proxyRequest,
							connect.static('tu/branches/1.0.7/')
						 ];
					 }
				 }
			},
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
	grunt.registerTask('admin',
		[
			//'connect:server',
			'configureProxies',
			'connect:admin'
		]	
	);
	grunt.registerTask('test',
		[
			//'connect:server',
			'configureProxies',
			'connect:test'
		]	
	);
	grunt.registerTask('admin107',
		[
			//'connect:server',
			'configureProxies',
			'connect:admin107'
		]	
	);

};
