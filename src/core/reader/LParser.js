/**
 * Created by westerp on 2016-02-03.
 */

define(['../types/LString',
        '../types/LSymbol',
        '../types/LList',
        '../types/LComment',
        './Cursor'],
    function (LString, LSymbol, LList, LComment, Cursor) {
        "use strict";

        var LParser = function (src) {
            this._strSrc    = src;
            this._bParsed   = false;
            this._objParsed = null;
        };

        LParser.prototype._parseString = function () {
            var c = this._c;
            c.next().push();
            var escape = false;
            var tmp    = c.peek();
            while (tmp !== '"' || escape) {
                escape = tmp == '\\';
                tmp    = c.next().peek();
            }
            var result = c.getToken();
            c.next();
            return new LString(result);
        };

        LParser.prototype._parseSymbolOrNumber = function () {
            var c       = this._c.push();
            var test    = function (c) {
                return !(c == '(' || c == ')' || this.isWhiteSpace());
            };
            var result  = c.slurpWhile(test).getToken();
            var nResult = Number(result);

            if (isNaN(nResult)) {
                return LSymbol(result);
            }
            return nResult;
        };

        LParser.prototype._parseList = function (searchFor) {
            var c         = this._c;
            var nPos      = c.getIndex();
            var objResult = new LList();
            var strTmp    = c.peek();
            while (strTmp !== searchFor) {
                if (strTmp === false) {
                    throw "Missing closing parentheses that match position " + nPos + ":" + this._c.getSrcInjected(' <=== ERROR THERE ');
                }
                var objTmp2 = this._parse();
                objResult.push(objTmp2);
                strTmp = c.slurpWhiteSpace().peek();
            }
            c.next();
            if (objResult.length === 0) {
                return LSymbol('nil');
            }
            return objResult;
        };

        LParser.prototype._parseComment = function () {
            return new LComment(
                this._c.slurpWhile(
                    function (c) {
                        return c === ';';
                    }).push()
                      .slurpWhile(
                    function (c) {
                        return c !== '\n' && c !== false
                    }).getToken());
        };

        LParser.prototype._parse = function () {
            switch (this._c.slurpWhiteSpace().peek()) {
                case ')':
                    throw "Invalid parentheses nesting at position: " + this._c.getSrcInjected(' <=== ERROR THERE ');
                case ';':
                    return this._parseComment();
                case '"':
                    return this._parseString();
                case '(':
                    this._c.next();
                    return this._parseList(')');
                case '[':
                    this._c.next();
                    return this._parseList(']');
                default:
                    return this._parseSymbolOrNumber();
            }
        };

        LParser.prototype.parse = function () {
            var symModule = LSymbol('module');
            if (this._bParsed === false) {
                this._c = new Cursor(this._strSrc);
                // Support Racket style language header
                if( ! this._c.exact('#!ljsp') &&
                    ! this._c.exact('#lang ljsp') &&
                      this._c.exact('#') ) {
                    throw 'Bad language header. Should be "#!ljsp" or "#lang ljsp"';
                }

                try {
                    this._objParsed = this._parseList(false);
                    if( ! this._objParsed instanceof LList || this._objParsed.length === 0){
                        var value = this._objParsed;
                        this._objParsed = new LList();
                        this._objParsed.push(symModule, value);
                    } else if( this._objParsed.length === 1 &&
                               this._objParsed[0] instanceof LList &&
                               this._objParsed[0][0] === symModule  ){
                        this._objParsed = this._objParsed[0];
                    } else {
                        this._objParsed.unshift(symModule);
                    }
                    this._bParsed   = true;
                } catch (e) {
                    throw e;
                }
            }
            return this;
        };

        LParser.prototype.toString = function () {
            return this.getObject().toString();
        };

        LParser.prototype.getObject = function (){
            if (!this._bParsed) {
                this.parse();
            }
            return this._objParsed;
        };

        return LParser;
    });