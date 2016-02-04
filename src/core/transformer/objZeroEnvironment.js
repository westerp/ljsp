/**
 * Created by westerp on 2016-02-04.
 */

define(['../types/LSymbol', '../types/LList'], function (LSymbol, LList) {

    var Primitive = function (objSym, bSpecial, fnImplementation) {
        this.sym              = objSym;
        this.fnImplementation = fnImplementation;
    };

    var symTrue   = LSymbol('#t');
    var symFalse  = LSymbol('nil');
    var symImport = LSymbol('import');

    function fnAll(fnTest) {
        return function () {
            var nLen = arguments.length;
            var test = arguments[0];
            for (var n = 1; nLen > n; n++) {
                if (! fnTest(test, arguments[n])) {
                    return symFalse;
                }
            }
            return symTrue;
        };
    }

    function genArithmetic(fnOp, init) {
        return function () {
            var nLen = arguments.length;
            var n    = 0;
            var nResult = init;
            if (nLen >= 2) {
                nResult = arguments[0];
                n++;
            }
            for (; nLen > n; n++) {
                nResult = fnOp(nResult, arguments[n]);
            }
            return nResult;
        }
    }

    var objZeroEnvironment = {
        syntax: {},
        functions: {},
        export: {}
    };

    function register(bSpecial, arrNames, arrImp) {
        var nLen = arrNames.length;
        var strIndex = bSpecial ? 'syntax' : 'functions';
        for (var n = 0; n < nLen; n++) {
            var sym  = arrNames[n] instanceof LSymbol ? arrNames[n] : LSymbol(arrNames[n]);
            var strSym = sym.toString();
            objZeroEnvironment.export[strSym] =
                objZeroEnvironment[strIndex][strSym] =
                    new Primitive(sym, bSpecial, arrImp[n]);
        }
    }

    function foldMacros(arr, fn, init, fromIndex) {
        var n      = fromIndex;
        var nEnd   = arr.length - 1;
        var result = init;
        for (; n < nEnd; n++) {
            result = fn(arr[n], result, false, n);
        }
        if( n == nEnd ){
            return fn(arr[nEnd], result, true, nEnd);
        }
        return init;
    }

    function fnQuoteMacro (expr, env, compiler){
        return foldMacros(expr, function(e, acc, last) {
            var tmp;
            if( e instanceof LSymbol ){
                tmp =  '__tmp.push(LSymbol("' + e.name + '"));';
            } else if( e instanceof LList ){
                tmp = '__tmp.push(' + foldMacros(e, env, compiler) + ');'
            } else {
                tmp = '__tmp.push(' + expr.toString() + ');'
            }
            if( last ){
                tmp += 'return __tmp;})()';
            }
            return tmp;
        }, '(function(){var __tmp = new LList();', 1);
    }

    register(false, ['eq', 'equal', '+', '-'],
        [fnAll(function (a, b) {
            return a === b;
        }),
            fnAll(function (a, b) {
                return a == b;
            }),
            genArithmetic(function (a, b) {
                return a + b;
            }),
            genArithmetic(function (a, b) {
                return a - b;
            }),
            function (a) {
                return typeof(a);
            }]);

    register(false, [symFalse, symTrue], [symFalse, symTrue]);
    register(true, ['if', 'lambda', 'define', 'module', '.', '^', 'new', 'quote'],
        [function (expr, env, compiler) { // if
            return "( (" + compiler(expr[1]) + ") !== " + symFalse + "?\n " + compiler(expr[2], env) + " :\n " + compiler(expr[3], env) + ")";
        }, function (expr, env, compiler) { // lambda
            return foldMacros(expr, function (e, acc, last) {
                return last ?
                acc + 'return ' + compiler(e, env) + ';\n})' :
                acc + compiler(e, env) + '\n';
            }, "(function (" + expr[1].toArrayString() + "){", 2);
        }, function (expr, env, compiler) { //define
            return ( expr[1] instanceof LSymbol ? "//var " + expr[1].name + "\n" : '' ) +
                   "var " + compiler(expr[1]) + " = " + compiler(expr[2]) +  ";";
        }, function (expr, env, compiler) { // module
            // ugliest code ever! Needs cleaning up
            var strReturn = 'define(';
            var nIndex    = 1;
            var arrImports;
            if (expr[nIndex][0] == symImport) {
                arrImports = expr[nIndex];
                nIndex++;
            } else {
                arrImports = [1];
            }
            var nLen    = arrImports.length;
            var symbols = '___o';
            var paths   = '"core/transformer/objRuntimeEnvironment"';
            var imports = '';
            for (var n = 1; n < nLen; n++) {
                symbols += ', ' + expr[1][n][0];
                paths += ', ' + expr[1][n][1];
                (function(obj) {
                    imports += foldMacros(expr[1][n], function (e, acc) {
                        return acc + 'var ' + e + '=' + obj + '.' + e + '; //import '+ obj.name + '.' + e.name + '\n';
                    }, '', 2);
                })(expr[1][n][0]);
            }
            strReturn += '[' + paths + '],function(' + symbols + '){\n';
            for( var strFun in objZeroEnvironment.functions ){
                //noinspection JSUnfilteredForInLoop
                strReturn += 'var ' + strFun + ' = ___o.' + strFun + '; //import #code#.' + objZeroEnvironment.functions[strFun].sym.name + '\n';
            }

            strReturn += imports;
            strReturn += foldMacros(expr, function(e, acc, last){
                return acc +
                       (last ? 'return ' : '') +
                       compiler(e, env) + '\n';
            }, '\n', nIndex);
            return strReturn + ";});";
        }, function (expr, env, compiler) { // .
            return foldMacros(expr, function (e, acc, last) {
                return (e instanceof LList ?
                    acc + '.' + compiler(e.shift()) + '(' + e.map(compiler).join(',') + ')' :
                    acc + '.' + compiler(e, env)) + (last ? ';' : '');
            }, compiler(expr[1], env), 2);
        }, function (expr, env, compiler) { //^
            return compiler(expr[1], env) + '.' + expr[2] + '(' + expr.splice(3).toString() + ');';
        }, function (expr, env, compiler) { //new
            return 'new ' + compiler(expr.shift(), env)
        },fnQuoteMacro]);

    return objZeroEnvironment;
});