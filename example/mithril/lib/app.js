var app = app || {};

(function (window) {
  'use strict';

  app.ENTER_KEY = 13;
  app.ESC_KEY = 27;

  m.route(document.getElementById('app'), '/', {
    '/': app,
    '/:filter': app
  });

  window.addEventListener('patch', function () {
    m.redraw();
  });
})(window);