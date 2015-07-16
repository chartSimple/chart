(function () {
    var r = {};
    r.cutStr = function (r, e, t, a) {
        var n;
        a = a || 12;
        e = Math.round(e * 12 / a);
        r = r || "";
        r = r.toString();
        if (r.length * 12 <= e) {
            return r
        }
        var u = /[^\x00-\xff]/g;
        var v = r.replace(u, "W");
        var i =[12, 6, 6, 6, 6, 6, 6, 6, 6, 4, 0, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 5, 9, 7, 12, 8, 3, 5, 5, 7, 8, 4, 4, 4, 5, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 4, 4, 9, 9, 9, 6, 11, 8, 7, 7, 8, 7, 6, 8, 8, 4, 5, 7, 6, 9, 8, 9, 7, 9, 7, 7, 8, 8, 8, 12, 7, 8, 7, 5, 5, 5, 9, 7, 7, 6, 7, 6, 7, 7, 4, 7, 7, 2, 3, 6, 2, 10, 7, 7, 7, 7, 4, 5, 5, 7, 6, 10, 6, 6, 5, 6, 5, 6, 9, 6];
        var f = 0;
        var g = r.length;
        for (var o = 0; o < r.length; o++) {
            f += Number(i[Number(v.charCodeAt(o))]) || 12;
            if (f >= e) {
                g = o;
                break
            }
        }
        if (f >= e && t == true) {
            e -= 12;
            for (var b = g - 1; b > 0; b--) {
                f -= Number(i[Number(v.charCodeAt(b))]) || 12;
                if (f <= e) {
                    g = b + 1;
                    break
                }
            }
            n = r.substring(0, g) + "..."
        } else {
            n = r.substring(0, g)
        }
        return n
    };
    r.getP = function (r, e) {
        e = e || 12;
        var t = /[^\x00-\xff]/g;
        var a = r.toString().replace(t, "W");
        var n = [12, 6, 6, 6, 6, 6, 6, 6, 6, 4, 0, 0, 0, 0, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 6, 4, 4, 5, 9, 7, 12, 8, 3, 5, 5, 7, 8, 4, 4, 4, 5, 7, 7, 7, 7, 7, 7, 7, 7, 7, 7, 4, 4, 9, 9, 9, 6, 11, 8, 7, 7, 8, 7, 6, 8, 8, 4, 5, 7, 6, 9, 8, 9, 7, 9, 7, 7, 8, 8, 8, 12, 7, 8, 7, 5, 5, 5, 9, 7, 7, 6, 7, 6, 7, 7, 4, 7, 7, 2, 3, 6, 2, 10, 7, 7, 7, 7, 4, 5, 5, 7, 6, 10, 6, 6, 5, 6, 5, 6, 9, 6];
        var u = 0;
        for (var v = 0; v < r.length; v++) {
            u += Number(n[Number(a.charCodeAt(v))]) || 12
        }
        return Math.round(u * e / 12)
    };
    window.hz = window.hz || {};
    hz.cutString = r
})();
