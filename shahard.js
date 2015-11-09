var GameLogic = function() {
  this.dices = new Dices();
  this.dices.render();

  this.field = new Field();
  this.field.startTurn(this.dices.getValues(), this.onStepMade.bind(this));
}

// dices : [N, M]
GameLogic.prototype.onStepMade = function(dices) {
  this.dices.setValues(dices);
}

var gameLogic = new GameLogic();
