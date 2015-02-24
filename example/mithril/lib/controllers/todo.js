var app = app || {};

(function () {
  'use strict';

  app.controller = function () {
    this.list = new app.TodoList();
    this.title = m.prop('');
    this.filter = m.prop(m.route.param('filter') || '');

    this.add = function (title) {
      if (this.title()) {
        this.list.push(new app.Todo({ title: title() }));
        this.title('');
      }
    };

    this.isVisible = function (todo) {
      if (this.filter() == '')
        return true;
      if (this.filter() == 'active')
        return !todo.completed();
      if (this.filter() == 'completed')
        return todo.completed();
    };

    this.clearTitle = function () {
      this.title('')
    };

    this.remove = function (key) {
      this.list.splice(key, 1)
    };

    this.clearCompleted = function () {
      for (var i = this.list.length - 1; i >= 0; i--) {
        if (this.list[i].completed()) {
          this.list.splice(i, 1);
        }
      }
    };

    this.amountCompleted = function () {
      var amount = 0;

      for (var i = 0; i < this.list.length; i++) {
        if (this.list[i].completed()) {
          amount++;
        }
      }

      return amount;
    };
  };
})();