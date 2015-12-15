/// <reference path="./dices.ts"/>
/// <reference path="./field.ts"/>
/// <reference path="./player.ts"/>
/// <reference path="./red_player.ts"/>

class GameLogic {
  private dices_: Dices;
  private field_: Field;
  private red_player_: RedPlayer;
  private blue_player_: Player;

  constructor() {
    this.dices_ = new Dices();
    this.field_ = new Field(this.dices_);
    this.red_player_ = new RedPlayer(this.field_, this.dices_);
    this.blue_player_ = new Player(this.field_, this.dices_);

    this.dices_.InitPlayers(this.red_player_, this.blue_player_);
    this.dices_.GetActivePlayer().StartTurn();
  }
}

var game_logic = new GameLogic();
