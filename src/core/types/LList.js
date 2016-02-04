/**
 * TODO: Make Lists use real Cons
 * Created by westerp on 2016-02-03.
 */

define(function(){
    "use strict";
    var root = window || this;
    var Array = root.Array;
    var LList = function () {
        Array.apply(this,arguments);
    };

    function ArrayClone() {}
    ArrayClone.prototype = Array.prototype;
    LList.prototype =  new ArrayClone();
    LList.prototype.constructor = LList;
    LList.prototype.toArrayString = LList.prototype.toString;
    LList.prototype.toString = function() {
        var end = this.length;
        if( ! end  ){
            return '()';
        }
        var tmp = '(' + this[0].toString();
        for(var i=1; i < end; i++){
            tmp += ' ' + this[i].toString();
        }
        return tmp + ')';
    };
    return LList;
});

