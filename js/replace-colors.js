'use strict';
console.log(scriptOptions);

_.map(scriptOptions.colors, function(o) {
  if (o.color == scriptOptions.previousColorValue && o.node != '' && o.node != undefined) {
    $(o.node.trim()).css(o.css, scriptOptions.newColorValue);
  }
});