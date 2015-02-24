var app = app || {};

(function () {
  'use strict';

  app.Todo = function (data) {
    this.title = m.prop(data.title);
    this.completed = m.prop(false);
  };

  var list = [];
  app.TodoList = function () {
    return list;
  };
})();