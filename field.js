var cFieldClassName = 'field';
var cTdTag = 'td';
var cFieldHeight = 24;
var cFieldWidth = 12;

function createTd(value, id) {
  var el = document.createElement(cTdTag);
  el.innerText = value ? value : '';
  el.id = id ? id : '';
  return el;
}

function createTr(row) {
  var tr = document.createElement('tr');
  row.forEach(function (td) {
    tr.appendChild(td);
  });
  return tr;
}

function getField() {
  return document.getElementsByClassName(cFieldClassName)[0];
}

function createField() {
  var field = getField();
  field.appendChild(generateEdgeRow(true));
  for (var counter = 0; counter < cFieldHeight; ++counter)
    field.appendChild(generateRow(counter));
  field.appendChild(generateEdgeRow(false));
}

function generateEdgeRow(reverse) {
  var row = [];
  for (var counter = 1; counter < cFieldWidth + 3; ++counter) {
    var value = undefined;
    if ((counter % 2 == 0) && (counter / 2 != 7))
      value = counter / 2;
    row.push(createTd(value));
  }
  if (reverse)
    row.reverse();
  return createTr(row);
}

function generateRow(counter) {
  var row = [];
  row.push(createTd(cFieldHeight - counter));
  for (var i = 0; i < cFieldWidth; ++i) {
    row.push(createTd(undefined, i + 'x' + (cFieldHeight - counter - 1)));
  }
  row.push(createTd(counter + 1));
  return createTr(row);
}
