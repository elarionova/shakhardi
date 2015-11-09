var Dices = function() {
  this.cMinDice = 1;
  this.cMaxDice = 6;
  this.cDiceClass = 'dice';

	this.diceElements =
      document.getElementsByClassName(this.cDiceClass)[0].children;
  this.shuffle();
}

Dices.prototype.shuffle = function() {
	this.firstDice = this.getRandom();
	do {
		this.secondDice = this.getRandom();
	} while(this.firstDice == this.secondDice);
}

Dices.prototype.render = function() {
	this.diceElements[0].innerText = this.firstDice;
	this.diceElements[1].innerText = this.secondDice;
}

Dices.prototype.getValues = function() {
  return [this.firstDice, this.secondDice];
}

Dices.prototype.setValues = function(values) {
  this.firstDice = values[0];
  this.secondDice = values[1];
  this.render();
}

Dices.prototype.getRandom = function() {
	return Math.floor(Math.random() * this.cMaxDice) + this.cMinDice;
}
