var cMaxDice = 6;
var cMinDice = 1;
var cDiceClass = 'dice';

function getRandom() {
	return Math.floor(Math.random() * cMaxDice) + cMinDice;
}


function setDices () {
	var dice = document.getElementsByClassName(cDiceClass);
	var leftNum = getRandom();
	var rightNum;
	do {
		rightNum = getRandom();
	} while(rightNum == leftNum) 

	var leftSpan = dice[0].children[0];
	var rightSpan = dice[0].children[1];
	rightSpan.innerText = rightNum;
	leftSpan.innerText = leftNum;
}


setDices();