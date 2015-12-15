/// <reference path="./base.ts"/>
/// <reference path="./dices.ts"/>

class Player {
  protected is_blue_: boolean;
  protected field_: any;
  protected dices_: Dices;

  private turn_start_: Date;

  constructor(field: any, dices: Dices) {
    this.field_ = field;
    this.dices_ = dices;
    this.is_blue_ = true;
  }

  GetRowFromDice(dice: number) {
    const shift = this.is_blue_ ? 0 : 1;
    return (dice - 1) * 2 + shift;
  }

  StartTurn() {
    this.OnTurnStarted();
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

  OnTurnStarted() {
    this.turn_start_ = new Date();
  }

  OnTurnEnded() {
    const current_date = new Date();
    const turn_period_ = current_date.getTime() - this.turn_start_.getTime();
    console.log('Turn took: %d', turn_period_);
    this.turn_start_ = null;
    this.field_.CheckEatenChips();
  }
}
