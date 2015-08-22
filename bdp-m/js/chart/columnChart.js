(function(){
	window.columnChart = function(options){

		// console.log(options);
		var width = options.width,
			height = options.height;
		var svg = d3.select(options.elem[0])
			.append('svg')
			.attr('width',width)
			.attr('height',height);
		var padding = {left:30,right:30,top:20,bottom:20};

		var xData = options.data.data.x[0];
		var yData = options.data.data.y[0].data;
		// console.log(yData);
		var xScale = d3.scale.ordinal()
			.domain(d3.range(yData.length))
			.rangeRoundBands([0, width - padding.left - padding.right]);

		var yScale = d3.scale.linear()
			.domain([0,d3.max(yData)])
			.range([height - padding.top - padding.bottom,0]);

		//定义x轴
		var xAxis = d3.svg.axis()
			.scale(xScale)
			.orient('bottom');

		//定义y轴
		var yAxis = d3.svg.axis()
			.scale(yScale)
			.orient('left');

		var rectPadding = 10;

		//添加矩形元素
		var rects = svg.selectAll('.myRect')
			.data(yData)
			.enter()
			.append('rect')
			.attr('class','myRect')
			.attr('transform','translate('+ padding.left + ',' +padding.top+')')
			.attr('x',function(d,i){
				// console.log(xScale(i));
				return xScale(i) + rectPadding/2;
			})
			.attr('fill','#72AFD9')
			.attr('y',function(d){
				// console.log(height - padding.bottom - padding.top);
				return height - padding.bottom - padding.top
			})
			.attr('height',function(d){
				return 0
			})
			.transition()
			.duration(500)
			// .delay(500)
			.ease('linear')
			.attr('y',function(d){
				return yScale(d);
			})
			.attr('width',xScale.rangeBand() - rectPadding)
			.attr('height',function(d){
				return height - padding.top - padding.bottom - yScale(d)
			});

		svg.append('g')
			.attr('class','axis x-axis')
			.attr('transform','translate('+ padding.left +','+(height - padding.bottom)+')')
			.call(xAxis);

		svg.append('g')
			.attr('class','axis y-axis')
			.attr('transform','translate('+ padding.left+','+padding.top+')')
			.call(yAxis);
	}
})()