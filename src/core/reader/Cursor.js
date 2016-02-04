/**
 * A simple string processing class
 *
 * Created by westerp on 2016-02-03.
 */
define(function(){
   "use strict";

    var Cursor = function(str){
        this._str       = str;
        this._n         = 0;
        this._arrRewind = [];
    };

    Cursor.prototype.getSrcInjected = function(str){
        return this._str.substring(0,this._n+1) + str + this._str.substring(this._n+1);
    };

    Cursor.prototype.getIndex = function() {
        return this._n;
    };

    Cursor.prototype.exact = function(str) {
        this.push();
        var nLen = str.length;
        for(var n=0; n < nLen; n++){
            if( this.peek() !== str.charAt(n) ){
                this.pop();
                return false;
            }
            this.next();
        }
        this.discard();
        return true;
    };

    Cursor.prototype.peek = function() {
        return this._n < this._str.length && this._str.charAt(this._n);
    };

    Cursor.prototype.next = function() {
        this._n++;
        return this._n < this._str.length && this;
    };

    Cursor.prototype.pop = function(){
        this._n = this._arrRewind.pop();
        return this;
    };

    Cursor.prototype.discard = function(){
        this._arrRewind.length--;
        return this;
    };

    Cursor.prototype.getToken = function(){
        var start = this._arrRewind.pop();
        return this._str.substring(start,this._n);
    };

    Cursor.prototype.push = function(){
        this._arrRewind.push(this._n);
        return this;
    };

    Cursor.prototype.isWhiteSpace = function (arg) {
        var tmp = arg || this.peek();
        return tmp === ' '  ||
            tmp === '\n' ||
            tmp === '\r' ||
            tmp === '\t';
    };

    Cursor.prototype.slurpWhile = function (f) {
        var remaining = this._str.length - this._n;
        while( remaining-- > 0 && f.call(this, this.peek()) ){
            this.next();
        }
        return this;
    };

    Cursor.prototype.slurpWhiteSpace = function () {
        return this.slurpWhile(this.isWhiteSpace);
    };

    return Cursor;
});