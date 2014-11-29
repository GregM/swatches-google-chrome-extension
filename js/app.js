(function(_, $) {

  'use strict';


  /**
   * Access visible tab and retrieve an object that contains
   *    1. List of nodes and their corresponding colors
   *    2. All unique colors and their counts
   *
   * @private
   */
  function retrieveColors () {
    chrome.tabs.executeScript(null, {
      file: 'js/theme.js'
    },
    function(result, isException) {
      if (isException) {
        console.log("sigh, there were errors... :(");
      } else if (result) {
        console.log(result);
        displayColors(result);
        displayMenuData(result);
      }
    });
  };


  /**
  * Prints the menu data to the screen
  *
  * @param {Object} all unique colors and their counts
  *
  * @private
  */
  function displayMenuData (uniqueColorObject) {
    nodeCount(uniqueColorObject);
    copyValues(uniqueColorObject);
  };


  /**
   * Prints the node count to the screen
   *
   * @param {Object} all unique colors and their counts
   *
   * @private
   */
   function nodeCount (uniqueColorObject) {
    var nodeCount = uniqueColorObject[0].colors.length;
    var nodes = nodeCount > 1 ? ' nodes' : ' node';
    var colorCount = uniqueColorObject[0].colorCount.length;
    var colors = colorCount > 1 ? ' unique colors identified.' : ' unique color identified.';
    document.getElementsByClassName('inspected-elements')[0].innerText = nodeCount + nodes + ' had colors.\r\n' + colorCount + colors;
   };


  /**
  * Allow users to download these colors as Less and Sass variables
  *
  * @param {Object} all unique colors and their counts
  *
  * @private
  */
  function copyValues (uniqueColorObject) {
    lessValues(uniqueColorObject);
    sassValues(uniqueColorObject);
  };


  /**
  * Create less values
  *
  * @param {Object} all unique colors and their counts
  *
  * @private
  */
  function lessValues (uniqueColorObject) {
    var text = "Less variables for " + uniqueColorObject[0].website.replace(/"/g, '&quot;') + " generated by Swatches Google Chrome extension: \r\n\r\n";
    _.each(uniqueColorObject[0].colorCount, function (o, idx) {
      var c = colorOrGradient(o.color);
      var css = '@color' + (idx + 1) + ': "' + c + '";\r\n';
      text = text.concat(css);
    });
    document.getElementsByClassName('less-variables')[0].innerText = text;
  };


  /**
  * Create sass values
  *
  * @param {Object} all unique colors and their counts
  *
  * @private
  */
  function sassValues (uniqueColorObject) {
    var text = "Sass variables for " + uniqueColorObject[0].website.replace(/"/g, '&quot;') + " generated by Swatches Google Chrome extension: \r\n\r\n";
    _.each(uniqueColorObject[0].colorCount, function (o, idx) {
      var c = colorOrGradient(o.color);
      var css = '$color' + (idx + 1) + ': "' + c + '";\r\n';
      text = text.concat(css);
    });
    document.getElementsByClassName('sass-variables')[0].innerText = text;
  };


  /**
   * Prints the colors to the screen
   *
   * @param {Object} all unique colors and their counts
   *
   * @private
   */
  function displayColors (uniqueColorObject) {
    var wrapper = document.getElementsByClassName('color-list-wrapper')[0];
    _.map(uniqueColorObject[0].colorCount, function (o) {

        var div = document.createElement('DIV');
        div.className = 'count';
        var elements = o.count > 1 ? 'elements' : 'element';
        div.innerText = o.count + ' ' + elements;

        var li = document.createElement('LI');
        var c = colorOrGradient(o.color);
        li.innerText = rgbToHex(c);
        if (isGradient(c)) {
          li.style.background = c;
        } else {
          li.style.backgroundColor = c;
        }
        li.className = 'theme-color';
        li.style.color = getAppropriateColorConsideringBackground(o.color);

        li.appendChild(div);

        wrapper.appendChild(li);
      });
  };


  /**
   * Determines whether given backgroundn color is a gradient
   *
   * @param {String} background color
   *
   * @private
   */
  function isGradient (c) {
    var rgbTotal= c.match(/rgb/g);
    if (rgbTotal && rgbTotal.length === 1) {
      return false;
    } else {
      return true;
    }
  }


  /**
   * Returns a color or gradient value
   *
   * @param {String} background color
   *
   * @private
   */
  function colorOrGradient (c) {
    if (isGradient(c)) {
      return generateGradient(c);
    } else {
      return c;
    }
  }


  /**
   * Creates a Google Chrome friendly gradient value
   *
   * @param {String} background color
   *
   * @private
   */
  function generateGradient (c) {
    var prefix = "-webkit-linear-gradient(left";
    var postfix = ")"
    var gradient = "";
    var colorStopStart = ", ";
    var rgbList = c.match(/rgb *\([^)]+\)/g);
    _.each(rgbList, function(item) {
      gradient = gradient.concat(colorStopStart, rgbToHex(item));
    });
    return prefix + gradient + postfix;
  }


  /**
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


  /**
   * We want to display legible text over a background color. If it's dark,
   * we want to display white. If it's light, we want to display black. To do so,
   * we separate the spectrum by 255 * 255 * 255 / 2.
   *
   * @param {string} rgb value of background color
   *
   * @private
   */
  function getAppropriateColorConsideringBackground (bgColor) {
    var rgbList = bgColor.replace(/[^\d,]/g, '').split(',');
    var rgbTotal = rgbList[0] * 1+ rgbList[1] * 1 + rgbList[2] * 1;
    if (rgbTotal < 380) {
      return 'white';
    } else {
      return 'black';
    }
  };


  $(document).ready(function () {
    retrieveColors();
  });

})(window._, window.$);
