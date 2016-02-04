/**
 * Created by westerp on 2016-02-03.
 *
 * Sub classing String is really foobar so this just wraps it.
 */

define(function(){
    "use strict";

    var LString = function (str){
        this._str = str;
    };

    LString.prototype.toString = function() {
        return '"' + this._str  + '"';
    };

    return LString;
});