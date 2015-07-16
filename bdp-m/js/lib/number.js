/**
 * 解决javaScript小数在做四则运算时，精度会丢失的问题
 * 如：0.9-0.8=0.09999999999998
 * 调用方法 (number1).fn(number2)
 */
(function () {
    function add(first, second) {
        var l1 = 0;
        var l2 = 0;
        try{
            l1 = first.toString().split(".")[1].length;
        }catch(e){

        }
        try{
            l2 = second.toString().split(".")[1].length;
        }catch(e){

        }
        var m = Math.pow(10, Math.max(l1, l2));
        return (first * m + second * m) / m;
    }

//加法
    Number.prototype.add = function (number) {
        return add.call(this, this, number);
    };

//减法，等同于加法
    Number.prototype.sub = function (number) {
        return this.add(-number);
    };

    function mul(first, second) {
        var l1 = 0;
        var l2 = 0;
        try{
            l1 = first.toString().split(".")[1].length;
        }catch(e){

        }
        try{
            l2 = second.toString().split(".")[1].length;
        }catch(e){

        }
        return ((first*Math.pow(10,l1)) * (second*Math.pow(10,l2))) / Math.pow(10, l1+l2);
    }

//乘法
    Number.prototype.mul = function (number) {
        return mul.call(this, this, number);
    };

    function div(first, second) {
        var l1 = 0;
        var l2 = 0;
        try{
            l1 = first.toString().split(".")[1].length;
        }catch(e){

        }
        try{
            l2 = second.toString().split(".")[1].length;
        }catch(e){

        }
        var m = Math.pow(10, Math.max(l1, l2));
        return (first*m) / (second*m);
    }

//除法
    Number.prototype.div = function (number) {
        return div.call(this, this, number)
    };
})();
