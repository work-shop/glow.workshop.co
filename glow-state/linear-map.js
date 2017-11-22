'use strict';

module.exports = function( a, b ) {
     return function( c, d ) {
         return function( x ) {
             return (( d - c ) / (b - a)) * (x - a) + c;
         };
     };
};
