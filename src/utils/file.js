function loadFile(name) {
  const xhr = new XMLHttpRequest();
  const okStatus = document.location.protocol === 'file:' ? 0 : 200;
  xhr.open('GET', name, false);
  xhr.send(null);
  return xhr.status == okStatus ? xhr.responseText : null;
}
