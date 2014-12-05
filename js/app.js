(function(_, $) {

  'use strict';

  var swatches = {

    /* What specifically does the user want to inspect? */
    userFilteredElements : {},

    /* How many nodes are in this filtered object? */

    /* Which website are we inspecting? */
    inspectedWebsite : '',

    /* How many unique colors does this website have? */
    uniqueColorCount : 0,

    /* What are the unique colors on this website? */
    uniqueColorList : [],

    /* How many of each color?
    *     { color : String, count : Number}
    */
    countByColor : []

  }


  /**
   * Access visible tab and retrieve an object that contains
   *    1. List of nodes and their corresponding colors
   *    2. All unique colors and their counts
   *
   * @private
   */
  function retrieveColors () {
    showLoader();
    chrome.tabs.executeScript(null, {
      file: 'js/theme.js'
    },
    function(result, isException) {
      if (isException) {
        console.log("sigh, there were errors... :(");
        hideLoader();
      } else if (result) {
        console.log(result);
        swatches.inspectedWebsite = result[0].website.replace(/"/g, '&quot;');
        displayColors(result);
        displayMenuData();
        addEventBindersForColorChanges();
        hideLoader();
        console.log(swatches);
      }
    });
  };


  /**
   * Show loading prompt
   *
   * @private
   */
  function showLoader () {
    $('.loading').show();
  };


  /**
   * Hide loading prompt
   *
   * @private
   */
  function hideLoader () {
    $('.loading').hide();
  };


  /**
  * Prints the menu data to the screen
  *
  * @param {Object} all unique colors and their counts
  *
  * @private
  */
  function displayMenuData () {
    nodeCount(swatches.userFilteredElements);
    precompileCSSVariables(['Less', 'Sass']);
  };


  /**
   * Prints the node count to the screen
   *
   * @param {Object} all unique colors and their counts
   *
   * @private
   */
   function nodeCount (colors) {
    var nodeCount = colors.length;
    var nodes = nodeCount > 1 ? ' nodes' : ' node';
    var colorCount = swatches.uniqueColorCount;
    var colors = colorCount > 1 ? ' unique colors identified.' : ' unique color identified.';
    document.getElementsByClassName('inspected-elements')[0].innerText = nodeCount + nodes + ' had colors.\r\n' + colorCount + colors;
   };


  /**
  * Create precompiler variable values
  *
  * @param {List} precompiler names
  * @param {Object} all unique colors and their counts
  *
  * @private
  */
  function precompileCSSVariables (precompilerList) {
    _.each(precompilerList, function(precompiler) {
      var prefix = '';
      var el;
      var text = '';
      var css = '';

      switch (precompiler.toLowerCase()) {
        case 'sass' :
          prefix = '$';
          el = document.getElementsByClassName('sass-variables')[0];
          break;
        case 'less' :
          prefix = '@';
          el = document.getElementsByClassName('less-variables')[0];
          break;
      }

      text = precompiler + ' variables for ' + swatches.inspectedWebsite + ' generated by Swatches Google Chrome extension: \r\n\r\n';

      _.each(swatches.countByColor, function (color, idx) {
        var colorValue;
        if (isValidWordColor(color.color) || isGradient(color.color)) {
          colorValue = color.color;
        } else {
          colorValue = rgbToHex(color.color);
        }
        css = prefix + 'color' + (idx + 1) + ': ' + colorValue + ';\r\n';
        text = text.concat(css);
      });

      el.textContent = text;
    });
  };


  /**
  * Prints the colors to the screen
  *
  * @param {Object} all unique colors and their counts
  *
  * @private
  */
  function generateFilteredColorsBasedOnUserInput (uniqueColorObject) {
    // only display theme based on filters selected
    var userFiltersSelected = $('.elements-filtered input[type="checkbox"]:checked');

    if (userFiltersSelected.length < 1) {
      setUniqueColorCount({});
      swatches.userFilteredElements = {};
      return {};
    }

    var filters = [];
    _.each(userFiltersSelected, function(f) {
      filters.push(f.value);
    });

    swatches.userFilteredElements = _.filter(uniqueColorObject[0].colors, function(c) {
      return filters.indexOf(c.css) != -1;
    });

    countColors(swatches.userFilteredElements);
    sortColorsByTotal();
  }


  /**
  * Prints the colors to the screen
  *
  * @param {Object} all unique colors and their counts
  *
  * @private
  */
  function countColors (colorObject) {
    _.map(colorObject, function(c) {
      if (!_.contains(swatches.uniqueColorList, c.color)) {
        swatches.uniqueColorList.push(c.color);
        swatches.countByColor.push({'color' : c.color, 'count' : 1});
      } else {
        var e = _.find(swatches.countByColor, function(i) { return i.color == c.color });
        if (e) { e.count = e.count + 1; }
      }
    });

    setUniqueColorCount(swatches.uniqueColorList);
    console.log(swatches.uniqueColorList);
  }


  /**
  * With list of colors, sort them by total count
  *
  * @private
  */
  function sortColorsByTotal () {
    swatches.countByColor = _.sortBy(swatches.countByColor, function(o) { return -1 * o.count; });
  }


  /**
   * Set the color count to the global variable
   *
   * @param {Object} unique colors
   *
   * @private
   */
  function setUniqueColorCount (uniqueColorObject) {
    swatches.uniqueColorCount = uniqueColorObject.length > 0 ? uniqueColorObject.length : 0;
  }


  /**
   * Clear all the colors and associated data
   *
   * @private
   */
  function clearCurrentThemeDisplay () {
    $('.color-list-wrapper').children().remove();
  }


  /**
   * Prints the colors to the screen
   *
   * @param {Object} all unique colors and their counts
   *
   * @private
   */
  function displayColors (rawColorObject) {
    var wrapper = document.getElementsByClassName('color-list-wrapper')[0];

    generateFilteredColorsBasedOnUserInput(rawColorObject);

    clearCurrentThemeDisplay();

    _.map(swatches.countByColor, function (o) {

        var numElementsDiv = document.createElement('DIV');
        numElementsDiv.className = 'count';
        var elements = o.count > 1 ? 'elements' : 'element';
        numElementsDiv.innerText = o.count + ' ' + elements;

        var editWrapperDiv = document.createElement('DIV');
        editWrapperDiv.className = 'edit-color-wrapper';

        var editColorDiv = document.createElement('DIV');
        editColorDiv.className = 'edit-color-text';
        editColorDiv.innerText = 'change to: '

        var newColorInput = document.createElement('INPUT');
        newColorInput.className = 'edit-color-input';
        newColorInput.defaultValue = '#color';

        var newColorButton = document.createElement('BUTTON');
        newColorButton.className = 'edit-color-button';
        newColorButton.textContent = 'GO';

        var clearfix = document.createElement('DIV');
        clearfix.className = 'clearfix';

        editWrapperDiv.appendChild(editColorDiv);
        editWrapperDiv.appendChild(newColorInput);
        editWrapperDiv.appendChild(newColorButton);
        editWrapperDiv.appendChild(clearfix);

        var li = document.createElement('LI');
        if (isValidWordColor(o.color)) {
          li.style.backgroundColor = o.color;
          li.innerText = o.color;
        } else if (isGradient(o.color)) {
          li.style.background = generateGradient(o.color);
          li.innerText = 'gradient';
        } else {
          li.style.backgroundColor = o.color;
          li.innerText = rgbToHex(o.color);
        }
        li.className = 'theme-color';
        li.style.color = getAppropriateColorConsideringBackground(o.color);

        li.appendChild(numElementsDiv).appendChild(editWrapperDiv);

        wrapper.appendChild(li);
      });
  };


  /**
   * Determines whether given backgroundn color is a gradient
   * How many times does rgb appear? If greater than 1, it's a gradient.
   *
   * color arrives like:
   *    rgb(34, 34, 34) rgb(34, 34, 34) rgb(34, 34, 34) rgba(0, 0, 0, 0)
   *
   * @param {String} background color
   *
   * @private
   */
  function isGradient (c) {
    var rgbStringExists = c.match(/rgb/g);
    if ((rgbStringExists && rgbStringExists.length === 1) || isValidWordColor(c)) {
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
  function colorOrGradient (color) {
    return isGradient(color) ? generateGradient(color) : color;
  }


  /**
   * Creates a Google Chrome friendly gradient value
   *
   * @param {String} background color
   *
   * @private
   */
  function generateGradient (color) {
    var prefix = "-webkit-linear-gradient(left";
    var postfix = ")"
    var gradient = "";
    var colorStopStart = ", ";
    var rgbList = color.match(/rgb *\([^)]+\)/g);
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
  function componentToHex(color) {
    var hex = color.toString(16);
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
   * If there is opacity, we just above always display darker color.
   *   rgba can arrive in the following forms:
   *            rgba(155, 155, 155, 0.568627)
   *            rgba(155, 155, 155, 0.1)
   *            rgba(155, 155, 155, 1)
   *
   *
   * @param {string} rgb value of background color
   *
   * @private
   */
  function getAppropriateColorConsideringBackground (bgColor) {
    var rgbList = bgColor.replace(/[^\d,]/g, '').split(',');

    var foregroundColor;

    var rgbSum = rgbList[0] * 1+ rgbList[1] * 1 + rgbList[2] * 1;

    if ((/^rgba/g).test(bgColor) ) {
      var opacity = rgbList[3][0] * 10 + rgbList[3][1] * 1;
      foregroundColor = rgbSum <= 380 || opacity < 6 ? 'black' : 'white';
    } else {
      foregroundColor = rgbSum <= 380 ? 'white' : 'black';
    }

    return foregroundColor;
  };


  /**
   * Add event binding for all of the buttons to change colors
   *
   * @private
   */
  function addEventBindersForColorChanges () {
    $('.edit-color-button').on('click', function(e) {
      var sibling = e.target.previousSibling;
      var newColorValue = sibling ? sibling.value : '';
      if (isValidColorInput(newColorValue)) {
        var previousColor = e.target.parentNode.parentNode.parentNode.style.backgroundColor;
        replaceAllPreviousColorsWith(newColorValue, previousColor, swatches.userFilteredElements);
      } else {
        sibling.value = 'Invalid color';
      }
    })
  };


  /**
   * Validate whether the given color is valid or not
   *
   * @param {string} input color
   *
   * @private
   */
  function isValidColorInput (color) {
    // A valid hex might have !important on it like #fff!important
    var regex = /(^#[0-9A-Fa-f]{6}(\n)*?(!important)?$)|(^#[0-9A-Fa-f]{3}(\n)*?(!important)?$)/
    return regex.test(color) || isValidWordColor(color);
  };



  /**
   * Does the incoming string match an approved word color
   *
   * @param {string} input color
   *
   * @private
   */
  function isValidWordColor (color) {
    var cssColors = ['aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige','bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown', 'burlywood','cadetblue', 'chartreuse', 'chocolate', 'coral', 'cornflowerblue', 'cornsilk','crimson', 'cyan', 'deeppink', 'deepskyblue', 'dimgray', 'dodgerblue', 'firebrick','floralwhite', 'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold','goldenrod', 'gray', 'green', 'greenyellow', 'honeydew', 'hotpink', 'indianred','indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen', 'lemonchiffon','lime', 'limegreen', 'linen', 'magenta', 'maroon', 'midnightblue', 'mintcream','mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace', 'olive', 'olivedrab','orange', 'orangered', 'orchid', 'papayawhip', 'peachpuff', 'peru', 'pink', 'plum','powderblue', 'purple', 'red', 'rosybrown', 'royalblue', 'saddlebrown', 'salmon','sandybrown', 'seagreen', 'seashell', 'sienna', 'silver', 'skyblue', 'slateblue','slategray', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle', 'tomato', 'turquoise', 'violet', 'wheat', 'white', 'whitesmoke', 'yellow', 'yellowgreen'];
    return cssColors.indexOf(color) != -1;
  }


  /**
  * Replace all previous colors with this new color
  *
  * @param {string} new color value
  *
  * @private
  */
  function replaceAllPreviousColorsWith (newColorValue, previousColorValue, uniqueColorObject) {
    var params = {
      newColorValue : newColorValue,
      previousColorValue : previousColorValue,
      userFilteredElements : swatches.userFilteredElements
    };
    showLoader();
    chrome.tabs.executeScript(null,
      {
        code: "var scriptOptions =" + JSON.stringify(params)
      },
    function() {
      chrome.tabs.executeScript(null, {
        file: 'js/replace-colors.js'
      },
      function(result, isException) {
        if (isException) {
          console.log("sigh, there were errors... :(");
        } else if (result) {
          retrieveColors();
        }
      });
    });
  };


  /**
  * Radio button on/off switch for Less/Sass values
  *
  * @private
  */
  function clickCssRadioButton () {
    $('.css-precompiler-variables input').click(function(e) {
      switch (e.target.value) {
        case 'less' :
          $('.sass-variables').hide();
          $('.less-variables').show();
          break;
        case 'sass' :
          $('.less-variables').hide();
          $('.sass-variables').show();
          break;
      }
    });
  }


  /**
  * Filtering based on element property
  *
  * @private
  */
  function clickElementFiltering () {
    $('.element-filter-submit').click(function(e) {
      retrieveColors();
    });
  }


  /**
  * All the event listeners
  *
  *
  * @private
  */
  function addEventListeners () {
    clickCssRadioButton();
    clickElementFiltering();
  }


  $(document).ready(function () {
    retrieveColors();
    addEventListeners();
  });

})(window._, window.$);
