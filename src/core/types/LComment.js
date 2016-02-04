/**
 * Created by westerp on 2016-02-03.
 */


define(function(){
    "use strict";

    var LComment = function (str){
        this._str = str;
    };

    LComment.prototype.toString = function() {
        return '//' + this._str  + '\n';
    };

    return LComment;
});