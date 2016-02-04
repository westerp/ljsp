/**
 * Created by westerp on 2016-02-04.
 */

/**
 * Created by westerp on 2016-02-04.
 */

define(['./objZeroEnvironment'], function (objZeroEnvironment) {
    var objFunctions = {};
    for(var name in objZeroEnvironment.functions ){
        //noinspection JSUnfilteredForInLoop
        objFunctions[name] = objZeroEnvironment.functions[name].fnImplementation;
    }
    return objFunctions;
});