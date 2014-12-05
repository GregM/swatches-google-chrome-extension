'use strict';

console.log("replace the colors");

_.map(scriptOptions.userFilteredElements, function(o) {
  var preexistingColor = getSixCharacterHexValue(rgbToHex(o.color));
  if (o.color == scriptOptions.previousColorValue && o.node != '' && o.node != undefined) {
    $(o.node.trim()).css(o.css, scriptOptions.newColorValue);
  }
});


/**
 * Return 6 character hex value, check if 3 exists currently
 *
 * @param {String} String beginning with a # like #fff or #ffffff
 *
 * @private
 */
function getSixCharacterHexValue (v) {
  if (v.substring(1) === 3) {
    return v + v.substring(1,4);
  } else {
    return v;
  }
}


/**
 * Use REQUIRE to abstract this away
 * Convert individual rgb value to hex
 *
 * @param {String} rgb value
 *
 * @private
 */
function componentToHex(c) {
  var hex = c.toString(16);
  return hex.length == 1 ? "0" + hex : hex;
}


/**
 * Convert rgb to hex
 *
 * @param {String} rgb value
 *
 * @private
 */
function rgbToHex(rgb) {
  var rgbList = rgb.replace(/[^\d,]/g, '').split(',');
  var r = rgbList[0] * 1;
  var g = rgbList[1] * 1;
  var b = rgbList[2] * 1;
  return "#" + componentToHex(r) + componentToHex(g) + componentToHex(b);
}