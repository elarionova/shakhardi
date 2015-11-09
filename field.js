var Field = function() {
  this.cFieldClassName = 'field';
  this.cTdTag = 'td';
  this.cTrTag = 'tr';
  this.cFieldHeight = 24;
  this.cFieldWidth = 12;

  this.fieldElement =
      document.getElementsByClassName(this.cFieldClassName)[0];
  this.renderTask = 0;
  // model is array of rows. So to access cell yout should use model[y][x]
  // notation.
  this.model = [];
  this.setInitial();

  this.dices = [];
}

Field.prototype.renderWhenIdle = function() {
  if (this.renderTask)
    return;
  this.renderTask = setTimeout(this.render.bind(this), 0);
}

// Returns <tr> with fulfilled <td>'s
Field.prototype.renderEdgeRow = function(reverse) {
  var row = [];
  var margin = this.cFieldWidth + 3;
  for (var counter = 1; counter < margin; ++counter) {
    var value = undefined;
    if ((counter % 2 == 0) && (counter / 2 != 7))
      value = counter / 2;
    row.push(this.createTd(value));
  }
  if (reverse)
    row.reverse();
  return this.createTr(row);
}

// Returns <tr> with fulfilled <td>'s
Field.prototype.renderRow = function(counter) {
  var row = [];
  row.push(this.createTd(counter + 1));
  for (var i = 0; i < this.cFieldWidth; ++i) {
    row.push(this.model[counter][i].render());
  }
  row.push(this.createTd(this.cFieldHeight - counter));
  return this.createTr(row);
}

Field.prototype.render = function() {
  this.renderTask = 0;
  // Clear all fields, then reappend new ones.
  var firstRow = this.renderEdgeRow(true);
  var middleRows = [];
  for (var counter = this.cFieldHeight - 1; counter >= 0; --counter)
    middleRows.push(this.renderRow(counter));
  var lastRow = this.renderEdgeRow(false);


  while (this.fieldElement.firstChild) {
        this.fieldElement.removeChild(this.fieldElement.firstChild);
  }
  this.fieldElement.appendChild(firstRow);
  for (var counter = 0; counter < this.cFieldHeight; ++counter)
    this.fieldElement.appendChild(middleRows[counter]);
  this.fieldElement.appendChild(lastRow);
}

Field.prototype.setInitial = function() {
  for (var y = 0; y < this.cFieldHeight; ++y) {
    this.model[y] = [];
    for (var x = 0; x < this.cFieldWidth; ++x) {
      var chip = new Chip(this, {x:x, y:y});
      if (y < 6 && x % 2 == 0)
        chip.setType(Chip.prototype.BLUE);
      if (y > 17 && x % 2)
        chip.setType(Chip.prototype.RED);
      this.model[y][x] = chip;
    }
  }
  // TODO(matthewtff): Remove debugging chips:
  var ch1 = new Chip(this, {x:4, y:18}); ch1.setType(Chip.prototype.BLUE);
  var ch2 = new Chip(this, {x:4, y:17}); ch2.setType(Chip.prototype.BLUE);
  this.model[18][4] = ch1;
  this.model[17][4] = ch2;
}

Field.prototype.collectColumn = function(x) {
  var column = [];
  for (var y = 0; y < this.cFieldHeight; ++y)
    column.push(this.model[y][x]);
  return column;
}

// Check if a blue chip from position |from| can make a step within |number|
// steps available.
Field.prototype.canMakeStep = function(columnData, from, number) {
  var margin = Math.min(columnData.length, from + number + 1);
  for (var x = from + 1; x < margin; ++x) {
    if (columnData[x].isEmpty())
      return true;
  }
  return false;
}

// Check if there's a blue chip available in |number| steps from |from|.
Field.prototype.canStepInto = function(columnData, from, number) {
  var margin = Math.max(0, from - number - 1);
  for (var x = from - 1; x > margin; --x) {
    if (columnData[x].isEmpty())
      return true;
  }
  return false;
}

Field.prototype.selectColumn = function(x, stepCount) {
  var columnData = this.collectColumn(x);
  for (var y = 0; y < this.cFieldHeight; ++y) {
    if (columnData[y].isBlue() &&
        this.canMakeStep(columnData, y, stepCount)) {
      var chip = this.model[y][x];
      chip.highlight();
    }
  }
}

// Dices is an array of length 2: [N, M].
Field.prototype.startTurn = function(dices, updateDicesFun) {
  this.dices = dices;
  this.updateDicesFun = updateDicesFun;
  this.clean();
  this.selectColumn(this.getRowFromDice(dices[0]), dices[1]);
  this.selectColumn(this.getRowFromDice(dices[1]), dices[0]);
}

Field.prototype.makeStep = function(coordsTo) {
  var coordsFrom = this.moveChip(coordsTo);

  var steps = coordsTo.y - coordsFrom.y;
  if (coordsTo.x == this.getRowFromDice(this.dices[0])) {
    this.dices[1] -= steps;
  } else if (coordsTo.x == this.getRowFromDice(this.dices[1])) {
    this.dices[0] -= steps;
  } else {
    console.error('Invalid move!!!');
  }

  this.updateDicesFun(this.dices);
  this.startTurn(this.dices, this.updateDicesFun);
}

Field.prototype.removeShownStpes = function() {
  for (var y = 0; y < this.cFieldHeight; ++y) {
    for (var x = 0; x < this.cFieldWidth; ++x) {
      var chip = this.model[y][x];
      if (chip.getType() == Chip.prototype.NONE) {
        chip.clean();
      }
    }
  }
}

Field.prototype.showStepsForChip = function(coords) {
  this.removeShownStpes();
  this.model[coords.y][coords.x].select();
  var columnData = this.collectColumn(coords.x);
  var margin = Math.min(this.cFieldHeight,
                        coords.y + this.getMaxStep(coords.x) + 1);
  for (var y = coords.y; y < margin; ++y) {
    var chip = columnData[y];
    if (chip.isEmpty())
      chip.highlight();
  }
}

Field.prototype.clean = function() {
  for (var y = 0; y < this.cFieldHeight; ++y) {
    for (var x = 0; x < this.cFieldWidth; ++x) {
      this.model[y][x].clean();
    }
  }
}

Field.prototype.field = function() { return this.fieldElement; }

Field.prototype.createTd = function(value, id) {
  var el = document.createElement(this.cTdTag);
  el.innerText = value ? value : '';
  el.id = id ? id : '';
  return el;
}

Field.prototype.createTr = function(row) {
  var tr = document.createElement(this.cTrTag);
  row.forEach(function (td) {
    tr.appendChild(td);
  });
  return tr;
}

Field.prototype.getRowFromDice = function (dice) {
  return (dice - 1) * 2;
}

Field.prototype.getMaxStep = function(x) {
  if (x == this.getRowFromDice(this.dices[0])) {
    return this.dices[1];
  } else if (x == this.getRowFromDice(this.dices[1])) {
    return this.dices[0];
  }
  console.error('Attempt to get step for forbidden column :(');
}

Field.prototype.moveChip = function(coords) {
  var newBlueChip = this.model[coords.y][coords.x];
  newBlueChip.clean();
  newBlueChip.setType(Chip.prototype.BLUE);

  var newEmptyChip = null;
  for (var counter = 0; counter < coords.y; ++counter) {
    var chip = this.model[counter][coords.x];
    if (chip.isBlue() && chip.isSelected()) {
      newEmptyChip = chip;
      break;  // Early return
    }
  }

  newEmptyChip.clean();
  newEmptyChip.setType(Chip.prototype.EMPTY);
  return {x: coords.x, y:counter};
}
