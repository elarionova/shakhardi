var cRedClass = 'red';
var cBlueClass = 'blue'
var cSelectedBlueClass = 'selected-blue';
var cEnabledYellowClass = 'enabled-yellow';

var currentStepCount = 6;

// coords : { x, y }
function getChipId(coords) {
  return coords.x + 'x' + coords.y;
}

// color : cRedClass or cBlueClass
// coords : { x, y }
function addChip(color, coords) {
  var el = document.getElementById(getChipId(coords));
  el.classList.remove(cRedClass);
  el.classList.remove(cBlueClass);
  el.classList.add(color);
}

function getCoordsFromId(id) {
  var splitted = id.split('x');
  return {x: parseInt(splitted[0]), y: parseInt(splitted[1])};
}

function setChips() {
  var field = getField();
  for (var y = 0; y < cFieldHeight; ++y) {
    for (var x = 0; x < cFieldWidth; ++x) {
      if (y < 6 && x % 2 == 0)
        addChip(cBlueClass, {x: x, y:y});
      if (y > 17 && x % 2)
        addChip(cRedClass, {x: x, y: y})
    }
  }
  addChip(cBlueClass, {x: 4, y : 18});
  addChip(cBlueClass, {x: 4, y : 17});
}

function collectColumn(x) {
  var data = [];
  for (var y = 0; y < cFieldHeight; ++y) {
    var el = document.getElementById(getChipId({x:x, y:y}));
    data.push(el.classList.contains(cBlueClass));
  }
  return data;
}

function canMakeStep(columnData, from, number) {
  var margin = Math.min(columnData.length, from + number + 1);
  for (var x = from + 1; x < margin; ++x) {
    if (!columnData[x])
      return true;
  }
  return false;
}

function canStepTo(columnData, from, number) {
  var margin = Math.max(0, from - number - 1);
  for (var x = from - 1; x > margin; --x) {
    if (columnData[x])
      return true;
  }
  return false;
}

function toggleCellStyle(coords, style) {
  var el = document.getElementById(getChipId(coords));
  el.classList.toggle(style);
  return el;
}

function selectColumn(x, stepCount) {
  var columnData = collectColumn(x);
  var field = getField();
  for (var y = 0; y < cFieldHeight; ++y) {
    if (columnData[y] && canMakeStep(columnData, y, stepCount)) {
      var el = toggleCellStyle({x:x, y:y}, cSelectedBlueClass);
      el.addEventListener('click', showPossibleSteps);
    }
  }
}

function showPossibleSteps(click_event) {
  console.log(click_event.target.id);
  var coords = getCoordsFromId(click_event.target.id);
  if (click_event.target.classList.contains(cSelectedBlueClass)) {
    removeSelectionFromColumn(coords.x);
    toggleCellStyle(coords, cSelectedBlueClass);
    var columnData = collectColumn(coords.x);
    var margin = Math.min(columnData.length,
                          coords.y + currentStepCount + 1);
    for (var y = coords.y; y < margin; ++y) {
      if (!columnData[y])
        toggleCellStyle({x:coords.x, y:y}, cEnabledYellowClass);
    }
  } else {
    removeSelectionFromColumn(coords.x);
    selectColumn(coords.x, currentStepCount);
  }
}

function removeSelectionFromColumn(x) {
  for (var y = 0; y < cFieldHeight; ++y) {
    var el = document.getElementById(getChipId({x:x, y:y}));
    if (el.classList.contains(cSelectedBlueClass))
      el.classList.toggle(cSelectedBlueClass);
    if (el.classList.contains(cEnabledYellowClass))
      el.classList.toggle(cEnabledYellowClass);
  }
}

createField();
setChips();