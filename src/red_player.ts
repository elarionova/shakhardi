/// <reference path="./base.ts"/>
/// <reference path="./dices.ts"/>
/// <reference path="./player.ts"/>

class RedPlayer extends Player {
  private can_reshuffle_: boolean;
  constructor(field: Field, dices: Dices, mode_manager: Mode.Manager) {
    super(field, dices, mode_manager);
    this.is_blue_ = false;
    this.can_reshuffle_ = true;
  }

  GetRowFromDice(dice: number): number {
    return Field.kFieldWidth - (dice - 1) * 2 - 1;
  }

  StartTurn(): void {
    setTimeout(this.StartTurnInner.bind(this), 500);
  }

  StartTurnInner(): void {
    var made_move: Base.MoveData = null;
    const possible_moves: [Base.MoveData] = [
      {
        row: this.GetRowFromDice(this.dices_.GetFirstDice()),
        steps: this.dices_.GetSecondDice()
      },
      {
        row: this.GetRowFromDice(this.dices_.GetSecondDice()),
        steps: this.dices_.GetFirstDice()
      }
    ];

    possible_moves.forEach((move_data) => {
      if (!made_move) {
        made_move = this.TryMakeMove(move_data);
      }
    });

    if (!made_move && this.can_reshuffle_) {
      this.dices_.Shuffle();
      return this.StartTurnInner();
    } else if (made_move) {
      this.can_reshuffle_ = false;
      this.dices_.Decrement(made_move);
    } else {
      // If we already made some moves, but can no longer continue(no free chips
      // on selected rows) -- we should stop.
      this.dices_.EndTurn();
    }
  }

  TryMakeMove(move_data: Base.MoveData): Base.MoveData {
    for (var y = Field.kFieldHeight - 1; y > move_data.steps; --y) {
      //for (var steps = moveData.steps; steps > 0; --steps) {
      for (var steps = 1; steps < move_data.steps; ++steps) {
        var coords_from = {x: move_data.row, y: y};
        var coords_to = {x: move_data.row, y: y - steps};
        if (this.field_.CanMoveChip(coords_from, coords_to)) {
          this.field_.MoveChip(coords_from, coords_to);
          return {row: move_data.row, steps: steps};
        }
      }
    }
    return null;
  }

  OnTurnEnded(): void {
    super.OnTurnEnded();
    this.can_reshuffle_ = true;
  }
}
