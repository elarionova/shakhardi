/// <reference path="./chip.ts"/>
/// <reference path="./dices.ts"/>

class Field {
  static kFieldClassName = 'field';
  static kFieldHeight = 24;
  static kFieldWidth = 12;

  private dices_: Dices;
  private field_element_: Node;
  private render_task_ : number;
  private model_: [[Chip]];

  constructor(dices: Dices) {
    this.dices_ = dices;
    this.field_element_ =
        document.getElementsByClassName(Field.kFieldClassName).item(0);
    this.render_task_ = 0;
    // model is array of rows. So to access cell yout should use model[y][x]
    // notation.
    this.model_ = <[[Chip]]>[];
    this.SetInitial();
  }

  RenderWhenIdle(): void {
    if (this.render_task_)
      return;
    this.render_task_ = setTimeout(this.Render.bind(this), 0);
  }

  RenderEdgeRow(reverse: boolean): HTMLTableRowElement {
    var row: [HTMLTableCellElement] = <[HTMLTableCellElement]>[];
    var margin: number = Field.kFieldWidth + 3;
    for (var counter = 1; counter < margin; ++counter) {
      var value = 0;
      if ((counter % 2 == 0) && (counter / 2 != 7))
        value = counter / 2;
      row.push(this.CreateTd(value));
    }
    if (reverse)
      row.reverse();
    return this.CreateTr(row);
  }

  // Returns <tr> with fulfilled <td>'s
  RenderRow(counter: number): HTMLTableRowElement {
    var row: [HTMLTableCellElement] = <[HTMLTableCellElement]>[];
    row.push(this.CreateTd(counter + 1));
    for (var i = 0; i < Field.kFieldWidth; ++i) {
      row.push(this.model_[counter][i].Render());
    }
    row.push(this.CreateTd(Field.kFieldHeight - counter));
    return this.CreateTr(row);
  }

  Render(): void {
    this.render_task_ = 0;
    // Clear all fields, then reappend new ones.
    var first_row = this.RenderEdgeRow(true);
    var middle_rows: [HTMLTableRowElement] = <[HTMLTableRowElement]>[];
    for (var counter = Field.kFieldHeight - 1; counter >= 0; --counter)
      middle_rows.push(this.RenderRow(counter));
    var last_row = this.RenderEdgeRow(false);


    while (this.field_element_.firstChild) {
      this.field_element_.removeChild(this.field_element_.firstChild);
    }
    this.field_element_.appendChild(first_row);
    for (var counter = 0; counter < Field.kFieldHeight; ++counter)
      this.field_element_.appendChild(middle_rows[counter]);
    this.field_element_.appendChild(last_row);
  }
  SetInitial(): void {
    for (var y = 0; y < Field.kFieldHeight; ++y) {
      this.model_[y] = <[Chip]>[];
      for (var x = 0; x < Field.kFieldWidth; ++x) {
        var chip = new Chip(this, {x:x, y:y});
        if (y < 6 && x % 2 == 0)
          chip.SetType(ChipType.kBlue);
        if (y > 17 && x % 2)
          chip.SetType(ChipType.kRed);
        this.model_[y][x] = chip;
      }
    }
  }

  CollectColumn(x: number): [Chip] {
    var column: [Chip] = <[Chip]>[];
    for (var y = 0; y < Field.kFieldHeight; ++y)
      column.push(this.model_[y][x]);
    return column;
  }
  // Check if a blue chip from position |from| can make a step within |number|
  // steps available.
  CanMakeStep(column_data: [Chip],
                         from: number,
                         step_count: number): boolean {
    var margin = Math.min(column_data.length, from + step_count + 1);
    for (var x = from + 1; x < margin; ++x) {
      if (column_data[x].IsEmpty())
        return true;
    }
    return false;
  }
  // Check if there's a blue chip available in |number| steps from |from|.
  CanStepInto(column_data: [Chip],
                         from: number,
                         step_count: number): boolean {
    var margin = Math.max(0, from - step_count - 1);
    for (var x = from - 1; x > margin; --x) {
      if (column_data[x].IsEmpty())
        return true;
    }
    return false;
  }
  SelectColumn(x: number, step_count: number): boolean {
    const column_data = this.CollectColumn(x);
    var selected_at_least_one = false;
    for (var y = 0; y < Field.kFieldHeight; ++y) {
      if (column_data[y].IsBlue() &&
          this.CanMakeStep(column_data, y, step_count)) {
        this.model_[y][x].Highlight();
        selected_at_least_one = true;
      }
    }
    return selected_at_least_one;
  }
  MakeStep(coords_to: Base.Point): void {
    var coords_from: Base.Point = this.MoveHightlightedChip(coords_to);
    this.Clean();
    var steps = Math.abs(coords_to.y - coords_from.y);
    this.dices_.Decrement({row: coords_to.x, steps: steps});
  }
  RemoveShownSteps(): void {
    for (var y = 0; y < Field.kFieldHeight; ++y) {
      for (var x = 0; x < Field.kFieldWidth; ++x) {
        var chip = this.model_[y][x];
        if (chip.IsEmpty()) {
          chip.Clean();
        }
      }
    }
  }
  RemoveSelectedChips(): void {
    for (var y = 0; y < Field.kFieldHeight; ++y) {
      for (var x = 0; x < Field.kFieldWidth; ++x) {
        var chip = this.model_[y][x];
        if (chip.IsBlue() && chip.IsSelected()) {
          chip.Highlight();
        }
      }
    }
  }
  ShowStepsForChip(coords: Base.Point): void {
    this.RemoveShownSteps();
    this.RemoveSelectedChips();
    this.model_[coords.y][coords.x].Select();
    const column_data = this.CollectColumn(coords.x);
    const margin =
        Math.min(Field.kFieldHeight, coords.y + this.GetMaxStep(coords.x) + 1);
    for (var y = coords.y; y < margin; ++y) {
      var chip = column_data[y];
      if (chip.IsEmpty())
        chip.Highlight();
    }
  }
  Clean(): void {
    for (var y = 0; y < Field.kFieldHeight; ++y) {
      for (var x = 0; x < Field.kFieldWidth; ++x) {
        this.model_[y][x].Clean();
      }
    }
  }

  CreateTd(value: number, id?: string): HTMLTableCellElement {
    var el = document.createElement('td');
    el.innerHTML = value ? String(value) : '';
    el.id = id ? id : '';
    return el;
  }
  CreateTr(row: [HTMLTableCellElement]): HTMLTableRowElement {
    var tr = document.createElement('tr');
    row.forEach(td => tr.appendChild(td));
    return tr;
  }
  GetMaxStep(x: number): number {
    const rows = this.dices_.GetRows();
    const values = this.dices_.GetValues();
    if (x == rows[0]) {
      return values[1];
    } else if (x == rows[1]) {
      return values[0];
    }
    console.error('Attempt to get step for forbidden column :(');
  }
  CanMoveChip(coords_from: Base.Point,
                         coords_to: Base.Point): boolean {
    return this.model_[coords_to.y][coords_to.x].IsEmpty() &&
        !this.model_[coords_from.y][coords_from.x].IsEmpty();
  }
  MoveChip(coords_from: Base.Point, coords_to: Base.Point): void {
    // TODO(matthewtff): Add some kind of counter here.
    if (coords_to.y != Field.kFieldHeight - 1) {
      const new_blue_chip = this.model_[coords_to.y][coords_to.x];
      new_blue_chip.Clean();
      new_blue_chip.SetType(this.ChipTypeFromRow(coords_to.x));
    }

    const was_blue_chip = this.model_[coords_from.y][coords_from.x];
    was_blue_chip.Clean();
    was_blue_chip.SetType(ChipType.kEmpty);
  }

  MoveHightlightedChip(coords_to: Base.Point): Base.Point {
    for (var counter = 0; counter < coords_to.y; ++counter) {
      var chip = this.model_[counter][coords_to.x];
      if (chip.IsBlue() && chip.IsSelected()) {
        break;  // Early return
      }
    }

    const coords_from = {x: coords_to.x, y: counter};
    this.MoveChip(coords_from, coords_to);
    return coords_from;
  }
  CheckEatenChips(): Base.EatenChips {
    var total_eaten = {
      red: 0,
      blue: 0
    };
    for (var y = 0; y < Field.kFieldHeight; ++y) {
      var blue_number = 0;
      var red_number = 0;
      for (var x = 0; x < Field.kFieldWidth; ++x) {
        var chip = this.model_[y][x];
        if (chip.IsBlue())
          ++blue_number;
        if (chip.IsRed())
          ++red_number;
      }

      var type_to_remove = ChipType.kEmpty;
      if (blue_number > red_number) {
        type_to_remove = ChipType.kRed;
      } else if (red_number > blue_number) {
        type_to_remove = ChipType.kBlue;
      }

      if (type_to_remove != ChipType.kEmpty) {
        for (var x = 0; x < Field.kFieldWidth; ++x) {
          var chip = this.model_[y][x];
          if (chip.GetType() == type_to_remove) {
            if (chip.IsRed) {
              ++total_eaten.red;
            } else if (chip.IsBlue()){
              ++total_eaten.blue;
            }
            chip.Clean();
            chip.SetType(ChipType.kEmpty);
          }
        }
      }
    }
    return total_eaten;
  }
  private ChipTypeFromRow(row: number): ChipType {
    return row % 2 ? ChipType.kRed : ChipType.kBlue;
  }
}
