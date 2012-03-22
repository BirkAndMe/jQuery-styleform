/**
 * jQuery styleform
 *
 * By______ Philip Birk-Jensen <philip@b14.dk>
 * Sponsor_ b14 <http://www.b14.dk>
 *
 * This plugin enables styling of form elements.
 *
 * Changelog:
 *   | = Error fix.
 *   + = Added functionality.
 *   - = Note
 *
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

  /**
   * Private function for setting up a states list.
   */
  function prepareStatesList(prefix, list) {
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
  }

  // This contains the templates for all the styling elements.
  var
    // List of all the templates used.
    templates = {
      'checkbox' : $('<label />')
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

    // The prefix used when creating a unique id for elements.
    uniquePrefix = 'jqsf-uid',

    // The counter managing unique ids.
    uniqueId = 0,

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
        });
      },

      /**
       * Enable styling of a checkbox
       */
      checkbox : function () {
        return this.each(function (index, element) {
          // Notice we hide the element as well.
          var $element = $(element),

            // We assign this to a variable, so we can use the variable inside
            // the functions without using an extra $(this).
            $template = templates.checkbox.clone(),

            // We define the onUp function so we can unbind it again.
            onUp = function () {
              $template.removeClass(actionStates.down);
              $(document).unbind('mouseup', onUp);
            },

            // This function is called when the checkbox is changed.
            checkboxChange = function () {
              if ($element.attr('checked')) {
                $template.addClass(states.checked);
              } else {
                $template.removeClass(states.checked);
              }
            };

          // Prepare the checkbox.
          $element.hide()
            .change(checkboxChange);
          checkboxChange();

          // If the checkbox don't have an id, we need to assign one, so the
          // label can refer to it.
          // Notice that attr() is used for backwards compatibility.
          // (http://api.jquery.com/attr/) (http://api.jquery.com/prop/)
          if (!$element.attr('id')) {
            $element.attr('id', uniquePrefix + '-' + (uniqueId++));
          }

          // Set all the template events and add it to the DOM.
          $template.attr('for', $element.attr('id'))
            .mouseover(function () { $template.addClass(actionStates.over); })
            .mouseout(function () { $template.removeClass(actionStates.over); })
            .mouseup(onUp)
            .mousedown(function () {
              $template.addClass(actionStates.down);
              $(document).mouseup(onUp);
            })
            .insertBefore($element);
        });
      },

      /**
       * Set the default prefix of the classes.
       */
      setDefaultPrefix : function (prefix) {
        var
          elementClass = prefix + '-element',
          key;

        for (key in templates) {
          templates[key].removeClass().addClass(elementClass + ' ' + prefix + '-' + key);
        }

        actionStates = prepareStatesList(prefix, actionStates);

        states = prepareStatesList(prefix, states);

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