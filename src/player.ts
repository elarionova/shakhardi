/// <reference path="./base.ts"/>
/// <reference path="./dices.ts"/>
/// <reference path="./field.ts"/>
/// <reference path="./mode_manager.ts"/>

class Player {
  protected is_blue_: boolean;
  protected field_: Field;
  protected dices_: Dices;

  private turn_start_: Date;
  private mode_manager_: Mode.Manager;

  constructor(field: Field, dices: Dices, mode_manager: Mode.Manager) {
    this.field_ = field;
    this.dices_ = dices;
    this.mode_manager_ = mode_manager;
    this.is_blue_ = true;
  }

  GetRowFromDice(dice: number) {
    return (dice - 1) * 2;
  }

  StartTurn() {
    var can_make_move: boolean = false;
    this.dices_.GetMoveData().forEach((moveData: Base.MoveData) => {
      can_make_move = this.field_.SelectColumn(moveData.row, moveData.steps) ||
          can_make_move;
    });
    if (!can_make_move) {
      this.dices_.Shuffle();
      this.StartTurn();
    }
  }

  OnTurnStarted(): void {
    this.turn_start_ = new Date();
    console.log("Starting turn for " + (this.is_blue_ ? "blue" : "red") + " player");
  }

  OnTurnEnded(): void {
    var turn_period = 0;
    if (this.turn_start_) {
      const current_date = new Date();
      turn_period = current_date.getTime() - this.turn_start_.getTime();
      console.log('Turn took: %d ms', turn_period);
      this.turn_start_ = null;
    }
    this.mode_manager_.OnPlayerTurnEnded(this.is_blue_,
                                         turn_period,
                                         this.field_.CheckEatenChips());
  }
}
