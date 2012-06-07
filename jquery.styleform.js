/*jslint browser: true, unparam: true, forin: true, plusplus: true, maxerr: 50, indent: 2*/
/**
 * jQuery styleform
 *
 * By______ Philip Birk-Jensen <philip (at) birk-jensen (dot) dk>
 * Sponsor_ b14 <http://www.b14.dk>
 *
 * This plugin enables styling of form elements.
 *
 * Changelog:
 *   | = Error fix.
 *   + = Added functionality.
 *   - = Note
 *
 * Version_ 1.0.3 (2012-06-07)
 *   | Now working in MSIE 8
 *   - Passes JSLint with: 'jslint browser: true, unparam: true, forin: true, plusplus: true, maxerr: 50, indent: 2'

 * Version_ 1.0.2 (2012-03-22)
 *   + Added radiobutton styling.
 *   - Passes JSLint with: 'jslint browser: true, unparam: true, forin: true, plusplus: true, maxerr: 50, indent: 2'

 * Version_ 1.0.1 (2012-02-17)
 *   | The checkbox toggled when then styleform was called.
 *   - Passes JSLint with: 'jslint browser: true, unparam: true, forin: true, plusplus: true, maxerr: 50, indent: 2'
 *
 * Version_ 1.0.0 (2012-02-17)
 *   + Added checkbox styling.
 *   - Passes JSLint with: 'jslint browser: true, unparam: true, forin: true, plusplus: true, maxerr: 50, indent: 2'
 */
(function ($) {
  'use strict';

  // This contains the templates for all the styling elements.
  var
    // List of all the templates used.
    templates = {
      'checkbox' : $('<label />'),
      'radio' : $('<label />')
    },

    // All the interactive states. Like mouseover and mousedown
    actionStates = {
      'over' : '',
      'down' : ''
    },

    // Actual states. Like checked for checkboxes.
    states = {
      'checked' : ''
    },

    // HTML attributes that can have an effect on the styling
    flags = {
      'disabled' : ''
    },

    // A class from the field that will change the way styleform handles the
    // styling.
    settingsClasses = {
      'show' : '',
      'skip' : ''
    },

    // The standard class that identifies a styleform element.
    elementClass = '',

    // The prefix used when creating a unique id for elements.
    uniquePrefix = 'jqsf-uid',

    // The counter managing unique ids.
    uniqueId = 0,

    /**
     * Get the next unique Id
     */
    getUniqueId = function () {
      return uniquePrefix + '-' + (uniqueId++);
    },

    /**
     * Private function for setting up a states list.
     */
    prepareStatesList = function (prefix, list) {
      var
        allStates = '',
        key;

      delete list.all;
      for (key in list) {
        list[key] = prefix + '-' + key;
        allStates += ' ' + list[key];
      }
      list.all = allStates.substr(1);

      return list;
    },

    /**
     * Since checkbox and radio is styled almost the same way, they both use
     * this private function for setting up the styling.
     */
    styleCheckers = function (type, $element, typeChanger) {
      // We assign this to a variable, so we can use the variable inside
      // the functions without using an extra $(this).
      var $template = templates[type].clone(),

        // We define the onUp function so we can unbind it again.
        onUp = function (e) {
          $template.removeClass(actionStates.down);
          $(document).unbind('mouseup', onUp);
        },

        // This function is called when the checker is changed.
        checkerChange = function () {
          typeChanger($template, $element);
        },

        // Catering for JSLint, though I disagree on this one, and think it
        // needs to get fixed, it's hopefully not working as intended.
        // It tells us "Move 'var' declarations to the top of the function"
        // when it's declared in a "for (var key in object)".
        // (http://stackoverflow.com/questions/4646455/jslint-error-move-all-var-declarations-to-the-top-of-the-function)
        key;

      // Hide the checker, unless the settingsClass show is present.
      if (!$element.hasClass(settingsClasses.show)) {
        $element.hide();
      }

      // Check for flags and set their appropriate classes
      for (key in flags) {
        if ($element.attr(key) === key) {
          $template.addClass(flags[key]);
        }
      }

      // If the checker don't have an id, we need to assign one, so the
      // label can refer to it.
      // Notice that attr() is used for backwards compatibility.
      // (http://api.jquery.com/attr/) (http://api.jquery.com/prop/)
      if (!$element.attr('id')) {
        $element.attr('id', getUniqueId());
      }

      // Add the template to the DOM.
      $template.attr('for', $element.attr('id'))
        .insertBefore($element);

      // Setup the events for both the template and any previously declared
      // label for the checker.
      $('label[for="' + $element.attr('id') + '"]')
        .mouseover(function () { $template.addClass(actionStates.over); })
        .mouseout(function () { $template.removeClass(actionStates.over); })
        .mouseup(onUp)
        .mousedown(function () {
          $template.addClass(actionStates.down);
          $(document).mouseup(onUp);
        })
        .click(function (e) {
          // IE 8 doesn't set the input field automatically when clicking
          // the label, if the input field is hidden.
          // So we need to manually set and unset the input field.
          e.preventDefault();

          if ($element.is(':checked') && $element.attr('type') === 'checkbox') {
            $element.removeAttr('checked');
          } else {
            $element.attr('checked', 'checked');
          }

          // Call the change event.
          $element.change();
        });

      // Listen to the change event, and invoke it once at the start.
      $element.change(checkerChange);
      checkerChange();
    },

    // Setting the proper namespace as encouraged.
    // (http://docs.jquery.com/Plugins/Authoring#Namespacing)
    methods = {
      /**
       * Style a form with all the styling options available.
       */
      form : function () {
        return this.each(function (index, element) {
          var $element = $(element);

          // Using the [type="checkbox"] to take advantage of added performance.
          // (http://api.jquery.com/checkbox-selector/)
          $element.find('input[type="checkbox"]').styleform('checkbox');

          $element.find('input[type="radio"]').styleform('radio');
        });
      },

      /**
       * Enable styling of a checkbox
       */
      checkbox : function () {
        return this.each(function (index, element) {
          var $element = $(element);

          // Skip te checkbox if the user told us to.
          if ($element.hasClass(settingsClasses.skip)) {
            return;
          }

          styleCheckers('checkbox', $element, function ($template, $element) {
            if ($element.attr('checked')) {
              $template.addClass(states.checked);
            } else {
              $template.removeClass(states.checked);
            }
          });
        });
      },

      /**
       * Enable styling of a radio
       */
      radio : function () {
        return this.each(function (index, element) {
          var $element = $(element);

          // Skip the radio if the user told us to.
          if ($element.hasClass(settingsClasses.skip)) {
            return;
          }

          // unlike the checkbox the change function is abit more tricky
          styleCheckers('radio', $element, function ($template, $element) {
            var $radioGroup;

            // First get all the other radio buttons which are in the same group
            if ($element.attr('name')) {
              $radioGroup = $('input[name="' + $element.attr('name') + '"]:radio');
            } else {
              // If there's no group, just change the one.
              $radioGroup = $element;
            }

            // Run through all the radio buttons and set their template.
            $radioGroup.each(function (index, radio) {
              var $radio = $(radio),

                // Get the style element
                $styleElement = $radio.parent()
                  .children('label.' + elementClass + '[for="' + $radio.attr('id') + '"]');

              if ($radio.attr('checked')) {
                $styleElement.addClass(states.checked);
              } else {
                $styleElement.removeClass(states.checked);
              }
            });
          });
        });
      },

      /**
       * Set the default prefix of the classes.
       */
      setDefaultPrefix : function (prefix) {
        var key;

        elementClass = prefix + '-element';

        for (key in templates) {
          templates[key].removeClass()
            .addClass(elementClass + ' ' + prefix + '-' + key);
        }

        actionStates = prepareStatesList(prefix, actionStates);
        states = prepareStatesList(prefix, states);
        flags = prepareStatesList(prefix, flags);
        settingsClasses = prepareStatesList(prefix, settingsClasses);

        uniquePrefix = prefix + '-uid';
      }
    };

  /**
   * Setup a form with stylable elements.
   */
  $.fn.styleform = function (method) {
    if (methods[method]) {
      return methods[method].apply(this, Array.prototype.slice.call(arguments, 1));
    }
    if (typeof method === 'object' || !method) {
      return methods.form.apply(this, arguments);
    }

    $.error('Method ' +  method + ' does not exist on jQuery.styleform');
  };

  // Set the prefix to jqsf
  methods.setDefaultPrefix('jqsf');
}(jQuery));