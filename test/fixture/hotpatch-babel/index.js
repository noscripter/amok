console.log('ready');

var previous = null;

setInterval(function() {
  var value = 'step-0';
  if (value !== previous) {
    console.log(value);
    document.write('<p>' + value + '</p>');
    previous = value;
  }
}, 0);
