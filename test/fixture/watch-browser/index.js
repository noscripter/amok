console.log('ready');

window.addEventListener('fileCreate', function(event) {
  console.assert(event.detail.filename);
  console.log('fileCreate ' + event.detail.filename);
});

window.addEventListener('fileChange', function(event) {
  console.assert(event.detail.filename);
  console.log('fileChange ' + event.detail.filename);
});

window.addEventListener('fileRemove', function(event) {
  console.assert(event.detail.filename);
  console.log('fileRemove ' + event.detail.filename);
});
