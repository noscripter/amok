console.log 'ready'

previous = null

setInterval (->
  value = 'step-0'
  if value != previous
    console.log value
    document.write '<p>' + value + '</p>'
    previous = value
  return
), 0
