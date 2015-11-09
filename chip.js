// coords is an object like {x, y}
var Chip = function(field, coords) {
  this.cTdTag = 'td';

  this.cRedClass = 'red';
  this.cBlueClass = 'blue'
  this.cHighlightedBlue = 'highlighted-blue';
  this.cSelectedBlueClass = 'selected-blue';
  this.cEnabledYellowClass = 'enabled-yellow';

  this.field = field;
  this.coords = coords;

  this.type = this.EMPTY;

  // If chip is flagged, then:
  // 1. for EMPTY chip it means it should be yellow-highlighted;
  // 2. for BLUE chip it means it should be blue-selected.
  // 3. It's invalid state for RED to be flagged. So assert on this while
  // flagging.
  this.flagged = this.NONE;
}

Chip.prototype.EMPTY = 0;
Chip.prototype.BLUE = 1;
Chip.prototype.RED = 2;

Chip.prototype.NONE = 0;
Chip.prototype.HIGHLIGHTED = 1;
Chip.prototype.SELECTED = 2;

Chip.prototype.setType = function(type) {
  this.type = type;
  this.field.renderWhenIdle();
}

Chip.prototype.getType = function() { return this.type; }
Chip.prototype.isBlue = function() { return this.type == this.BLUE; }
Chip.prototype.isEmpty = function() { return this.type == this.EMPTY; }

Chip.prototype.isSelected = function() { return this.flagged == this.SELECTED; }
Chip.prototype.isHighlighted = function() {
  return this.flagged == this.HIGHLIGHTED;
}

Chip.prototype.render = function() {
  var el = document.createElement(this.cTdTag);
  if (this.type != this.EMPTY) {
    el.classList.add(this.type == this.BLUE ? this.cBlueClass : this.cRedClass);
  }

  if (this.type != this.RED && this.flagged != this.NONE) {
    el.classList.add(this.appendClickListener(el, this.cEnabledYellowClass));
  }
  return el;
}

Chip.prototype.appendClickListener = function(el, style) {
  if (this.type == this.EMPTY) {
    el.addEventListener('click',
        this.field.makeStep.bind(this.field, this.coords));
    return style;
  }

  // From here on we work with BLUE only:

  if (this.flagged == this.HIGHLIGHTED) {
    el.addEventListener('click',
        this.field.showStepsForChip.bind(this.field, this.coords));
    return this.cHighlightedBlue;
  }
}

Chip.prototype.highlight = function() {
  if (this.type == this.RED) {
    console.assert('Red chip should never be highlighted');
    return;
  }
  this.setFlagInternal(this.HIGHLIGHTED);
}

Chip.prototype.select = function() {
  if (this.type == this.RED) {
    console.assert('Red chip should never be selected');
    return;
  }
  this.setFlagInternal(this.SELECTED);
}

Chip.prototype.clean = function() {
  if (this.type == this.RED) {
    console.assert('Red chip should never be cleaned up again');
    return;
  }
  this.setFlagInternal(this.NONE);
}

Chip.prototype.setFlagInternal = function(flag) {
  this.flagged = flag;
  this.field.renderWhenIdle();
}
