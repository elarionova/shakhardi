var cRedClass = 'red';
var cBlueClass = 'blue'

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

function setChips() {
  var field = getField();
  for (var y = 0; y < cFieldHeight; ++y) {
    for (var x = 0; x < cFieldWidth; ++x) {

    }
  }
}

createField();
