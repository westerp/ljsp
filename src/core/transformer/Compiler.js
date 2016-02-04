/**
 * Created by westerp on 2016-02-03.
 */

define(['../types/LString',
        '../types/LSymbol',
        '../types/LList',
        '../types/LComment',
        './objZeroEnvironment'],
    function (LString, LSymbol, LList, LComment, objEnv) {
        var Compiler = function (objParser) {
            this._objCode    = objParser.getObject();
            this._bDesugared = false;
            this._bCompiled  = false;
        };

        Compiler.prototype.deSugar = function () {
            //TODO: Make something more here
            this._bDesugared = true;
            return this;
        };

        // This is eval!!
        function _fnCompile(expr, env) {
            if (expr instanceof LSymbol ||
                expr instanceof LString ||
                expr instanceof LComment ||
                typeof (expr) === 'number') {
                return expr.toString();
            }
            if (expr instanceof LList) {
                if (objEnv.syntax[expr[0]] !== undefined) {
                    return objEnv.syntax[expr[0]].fnImplementation(expr, env, _fnCompile);
                }
                return _fnCompile(expr.shift()) + '(' + expr.map(_fnCompile).join(',') + ')';
            }
            throw "Unsupported data type";
        }

        Compiler.prototype.compile = function () {
            if (!this._bDesugared) {
                this.deSugar();
            }
            this._jsCode    = _fnCompile(this._objCode, objEnv);
            this._bCompiled = true;
            return this;
        };

        Compiler.prototype.getScript = function () {
            if (!this._bCompiled) {
                this.compile();
            }
            return this._jsCode;
        };

        return Compiler;
    });