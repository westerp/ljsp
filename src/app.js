/**
 * Created by westerp on 2016-02-03.
 */

requirejs.config({
    waitSeconds: 200,
    baseUrl: "src",
    paths: {
        jquery: "external/jquery-2.2.0",
        underscore: "external/underscore",
        text: "external/text"
    }
});

if( location.search !== "" ){
    requirejs([location.search.substring(1)]);
}
