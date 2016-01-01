/// <reference path="./player.ts"/>

class Dices {
  private static kMinDice = 1;
  private static kMaxDice = 6;
  private static kDiceClass = "dice";

  private static kNumberedDices: string[] = [
    "dice_1", "dice_2", "dice_3", "dice_4", "dice_5", "dice_6",
  ];

  private dice_elements_: NodeList;
  private blue_player_turn_: boolean;
  private red_player_: Player;
  private blue_player_: Player;

  private first_dice_: number;
  private second_dice_: number;
  constructor() {
    this.blue_player_turn_ = true;
    const dice_elements = document.getElementsByClassName(Dices.kDiceClass);
    this.dice_elements_ = dice_elements;
    this.Shuffle();
  }

  GetFirstDice(): number { return this.first_dice_; }
  GetSecondDice(): number { return this.second_dice_; }

  InitPlayers(red_player: Player, blue_player: Player): void {
    this.red_player_ = red_player;
    this.blue_player_ = blue_player;
  }
  Shuffle(): void {
    this.first_dice_ = this.GetRandom();
  	do {
  		this.second_dice_ = this.GetRandom();
  	} while (this.first_dice_ == this.second_dice_);
    this.Render();
  }

  Render(): void {
    this.RenderDice(this.dice_elements_.item(0), this.first_dice_);
    this.RenderDice(this.dice_elements_.item(1), this.second_dice_);
  }
  RenderDice(element: Node, value: number): void {
    var class_list = GetDivFromNode(element).classList;
    // First remove all player/value classes.
    Dices.kNumberedDices.forEach(class_name => {
      class_list.remove(class_name);
    });
    class_list.remove("active_blue", "active_red");
    // Then add current classes.
    class_list.add(Dices.kNumberedDices[value - 1]);
    class_list.add(this.blue_player_turn_ ? "active_blue" : "active_red");
  }
  GetValues(): [number] {
    return [this.first_dice_, this.second_dice_];
  }
  SetValues(values: [number]) {
    console.assert(values.length == 2);
    this.first_dice_ = values[0];
    this.second_dice_ = values[1];
    this.Render();
  }
  private GetRandom(): number {
    return Math.floor(Math.random() * Dices.kMaxDice) + Dices.kMinDice;
  }

  private IsPlayable(): boolean {
    return (this.first_dice_ != 0) && (this.second_dice_ != 0);
  }
  private GetRowFromDice(value: number) {
    return this.GetActivePlayer().GetRowFromDice(value);
  }
  GetActivePlayer(): Player {
    console.assert(this.blue_player_ != undefined &&
        this.red_player_ != undefined);
    return this.blue_player_turn_ ? this.blue_player_ : this.red_player_;
  }
  GetMoveData(): [Base.MoveData] {
    return [
      {row: this.GetRowFromDice(this.first_dice_), steps: this.second_dice_},
      {row: this.GetRowFromDice(this.second_dice_), steps: this.first_dice_},
    ];
  }
  GetRows(): [number] {
    return [this.GetRowFromDice(this.first_dice_),
            this.GetRowFromDice(this.second_dice_)];
  }
  Decrement(move_data: Base.MoveData) {
    const rows = this.GetRows();
    if (move_data.row == rows[0]) {
      this.second_dice_ -= move_data.steps;
    } else if (move_data.row == rows[1]) {
      this.first_dice_ -= move_data.steps;
    } else {
      console.error('Invalid move.');
    }
    if (this.first_dice_ == 0 || this.second_dice_ == 0) {
      return this.EndTurn();
    }
    this.Render();
    this.GetActivePlayer().StartTurn();
  }
  EndTurn() {
    this.GetActivePlayer().OnTurnEnded();
    this.blue_player_turn_ = !this.blue_player_turn_;
    this.Shuffle();
    this.GetActivePlayer().OnTurnStarted();
    this.GetActivePlayer().StartTurn();
  }
}


function GetDivFromNode(node: Node): HTMLDivElement {
  return <HTMLDivElement>node;
}