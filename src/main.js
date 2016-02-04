/**
 * Created by westerp on 2016-02-03.
 */
define(["jquery","ljsp!ljsp/fnFibonacci"], function($, fibonacci){
    $("#out").append("Fibonacci of 10 is: " + fibonacci(10));
});