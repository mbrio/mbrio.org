/*
Mbrio
Version: @@VERSION@@
Copyright © 2011 Michael Diolosa <michael.diolosa@gmail.com> All Rights Reserved.
*/

/*jshint browser: true, devel: true, jquery: true */
/*global define: true */

(function($, _, Backbone, window, document, undefined) {
  'use strict';
  
  define(['js/templates.js'], function(Templates) {
    var VERSION,
        Mbrio = {
          Templates: Templates
        };
    
    VERSION = '@@VERSION@@';

    return Mbrio;
  });
}(this.jQuery, this._, this.Backbone, this, this.document));