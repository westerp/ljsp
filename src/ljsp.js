/**
 * This is the main plugin script.
 * Uses mostly RequireJs text-plugin
 * Created by westerp on 2016-02-01.
 */

define(['module', 'core/reader/LParser', 'core/transformer/Compiler', 'text'],
    function (module, LParser, LCompiler, objText) {
        return {
            load: function (strName, require, fnCallback, objConfig) {
                if (!strName.match(/\.ljsp/)) {
                    strName += '.ljsp';
                }
                var fnTextCallback   = function (content) {
                    try {
                        var objParser = new LParser(content);
                        objParser.parse();
                        var objCompiler = new LCompiler(objParser);
                        objCompiler.compile();
                        var strSrc = objCompiler.getScript();
                        fnCallback.fromText(strSrc);
                    } catch (e) {
                        fnCallback.error(e);
                    }
                };
                fnTextCallback.error = fnCallback.error;
                objText.load(strName, require, fnTextCallback, objConfig);
            }
        }
    });