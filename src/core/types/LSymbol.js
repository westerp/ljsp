/**
 * Created by westerp on 2016-02-03.
 */

define(function(){
    "use strict";

    // A global set of Symbols, only accessible by LSymbol class.
    var Symbols = {byName: {}, byIndex: []};

    var LSymbol = function(name, intern){
        if ( this instanceof LSymbol ){
            this.name = name;
            this.id = Symbols.byIndex.length;
            this._genSafeName(intern);
            Symbols.byIndex.push(this);
            if( intern ){
                return this._intern();
            }
        } else if( Symbols[name] === undefined ){
            return new LSymbol(name, intern === undefined ? true : intern );
        } else {
            return Symbols[name];
        }
    };

    LSymbol.prototype._genSafeName = function(intern) {
        var str = this.name.replace(/\-([a-z])/,function(a,x){
            return x.toUpperCase();
        });
        this.safeName = str.replace(/\+/g, 'plus')
                           .replace(/^-$/,'minus')
                           .replace(/\-([a-z])/,'\U$1')
                           .replace(/\-/,'_')
                           .replace(/[^$a-zA-Z0-9_]/, 'x');

        if( this.safeName !== str ||
            ! this.name.charAt(0).match(/[a-zA-Z$_]/) || // if there was illegal chars
            ! intern ||                                  // or this is a private symbol
            this.name.match(/^S_[\w_$]*_\d+$/) ) {       // or it's name looks like our symbols
            this.safeName = 'S_' + this.safeName + '_' + this.id;
        }
    };

    LSymbol.prototype._intern = function() {
        if( Symbols[this.name] !== undefined ){
            return Symbols[this.name];
        }
        Symbols[this.name] = this;
        return this;
    };

    LSymbol.prototype.toString = function() {
        return this.safeName;
    };

    LSymbol('nil');
    LSymbol("true");
    return LSymbol;
});
