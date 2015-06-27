(function(){

	var width = 500,height = 250,margin = {left:50,top:30,right:20,bottom:20},
		g_width = width - margin.left - margin.right,
		g_height = height - margin.top - margin.bottom;
	var svg = d3.select('#container')
				.append('svg')
				.attr('width',width)
				.attr('height',height);
	
	var g = svg.append('g')
		.attr('transform','translate('+margin.left+','+margin.top+')');

	var data = [1,3,5,7,8,3,7];

	var scale_x = d3.scale.linear()
					.domain([0,data.length-1]) //输入范围
					.range([0,g_width]); //输出范围
	var scale_y = d3.scale.linear()
					.domain([0,d3.max(data)]) //输入范围
					.range([g_height,0]); //输出范围


	var line_generator = d3.svg.line()
		.x(function(d,i){ // 0,1,2,3...
			return scale_x(i);
		})
		.y(function(d,i){
			return scale_y(d)
		})
		.interpolate('cardinal');//把曲线处理光滑

	g.append('path')
		.attr('d',line_generator(data)); // d="M1,oL20"


	var x_axis = d3.svg.axis().scale(scale_x),
		y_axis = d3.svg.axis().scale(scale_y)
				.orient('left');//旋转Y轴

	g.append('g')
		.call(x_axis)
		.attr('transform','translate(0,'+g_height+')');

	g.append('g')
		.call(y_axis)
		.append('text')
		.text('Price($)')
		.attr('transform','rotate(-90)')
		.attr('text-anchor','end')
		.attr('dy','1em');

})()