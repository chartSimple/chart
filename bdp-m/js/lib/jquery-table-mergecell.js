//合并表格列单元格，必须是td
jQuery.fn.mergeCol = function(colIdx) {
    return this.each(function() {
        var that, rowspan, prevtext, prevrowtext;
        $('tr', this).each(function(row) {
            $('td:eq(' + colIdx + ')', this).filter(':visible').each(function(col) {
                // 可合并条件：1、内容相同；2、如果不是第一列，则需前一列内容相同，并且待合并的前一列处于隐藏状态/*至少有一个隐藏状态*/
                if (that !== null
                    && $(this).text() == $(that).text()
                    && (!colIdx || (!!colIdx && $(this).prev().text() == $(that).prev().text()
                        && !$(this).prev().is(":visible")))) {
                    rowspan = $(that).attr("rowSpan");
                    if (rowspan === undefined) {
                        $(that).attr("rowSpan", 1);
                        rowspan = $(that).attr("rowSpan");
                    }
                    rowspan = Number(rowspan) + 1;
                    $(that).attr("rowSpan", rowspan);
                    $(this).hide();

                } else {
                    that = this;
                }
            });
        });
    });
};

//合并表格头行，必须是th才会合并
jQuery.fn.mergeRow = function(rowIdx) {
    return this.each(function() {
        var that;
        var colspan;
        var $this = this;
        $('tr', $this).filter(":eq(" + rowIdx + ")").each(function(row) {
            $(this).find('th').each(function(col) {

                if (that !== null && $(this).text() == $(that).text() && ( !rowIdx || ( !!rowIdx  && $('tr',$this).eq(rowIdx-1).find('th').eq(col).text() === $('tr',$this).eq(rowIdx-1).find('th').eq(col-1).text() && (+!!$('tr',$this).eq(rowIdx-1).find('th').eq(col).is(":visible") + (+!!$('tr',$this).eq(rowIdx-1).find('th').eq(col-1).is(":visible")) < 2)))) {

                    colspan = $(that).attr("colSpan");

                    if (colspan === undefined) {
                        $(that).attr("colSpan", 1);
                        colspan = $(that).attr("colSpan");
                    }
                    colspan = Number(colspan) + 1;
                    $(that).attr("colSpan", colspan);
                    $(this).hide();
                } else {
                    that = this;
                }
                that = (that === null) ? this : that; 
            });
        });
    });
};