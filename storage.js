(function () {
  const KEY = 'todo-tasks';
  const origGet = Storage.prototype.getItem;
  const origSet = Storage.prototype.setItem;
  let queue = Promise.resolve(); // keeps saves in order

  Storage.prototype.getItem = function (k) {
    if (k === KEY && this === window.localStorage) {
      return window.__TASKS__ === null ? null : JSON.stringify(window.__TASKS__);
    }
    return origGet.call(this, k);
  };

  Storage.prototype.setItem = function (k, v) {
    if (k === KEY && this === window.localStorage) {
      queue = queue.then(() =>
        fetch('api.php', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: v,
          keepalive: true
        })
      ).catch(err => console.error('Save failed', err));
      return;
    }
    return origSet.call(this, k, v); 
  };
})();