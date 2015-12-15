/// <reference path="./base.ts"/>
/// <reference path="./player.ts"/>

enum ChipType {
  kEmpty,
  kBlue,
  kRed,
}

enum ChipState {
  kNone,
  kHighlight,
  kSelected,
}

class Chip {
  private static kRedClass = 'red';
  private static kBlueClass = 'blue'
  private static kHighlightedBlue = 'highlighted-blue';
  private static kSelectedBlueClass = 'selected-blue';
  private static kEnabledYellowClass = 'enabled-yellow';

  private field_: any;
  private coords_: Base.Point;
  private type_: ChipType;
  private flagged_: ChipState;

  constructor(field: any, coords: Base.Point) {
    this.field_ = field;
    this.coords_ = coords;

    this.type_ = ChipType.kEmpty;

    // If chip is flagged, then:
    // 1. for EMPTY chip it means it should be yellow-highlighted;
    // 2. for BLUE chip it means it should be blue-selected.
    // 3. It's invalid state for RED to be flagged. So assert on this while
    // flagging.
    this.flagged_ = ChipState.kNone;
  }

  SetType(type: ChipType): void {
    this.type_ = type;
    this.field_.RenderWhenIdle();
  }

  GetType(): ChipType { return this.type_; }
  IsBlue(): boolean { return this.type_ == ChipType.kBlue; }
  IsRed(): boolean { return this.type_ == ChipType.kRed; }
  IsEmpty(): boolean { return this.type_ == ChipType.kEmpty; }

  IsSelected(): boolean {
    return this.flagged_ == ChipState.kSelected;
  }
  IsHighlighted(): boolean {
    return this.flagged_ == ChipState.kHighlight;
  }

  Render(): HTMLTableCellElement {
    const el: HTMLTableCellElement = document.createElement('td');
    if (this.type_ != ChipType.kEmpty) {
      el.classList.add(this.IsBlue() ? Chip.kBlueClass : Chip.kRedClass);
    }

    if (!this.IsRed() && this.flagged_ != ChipState.kNone) {
      el.classList.add(this.AppendClickListener(el, Chip.kEnabledYellowClass));
    }
    return el;
  }

  AppendClickListener(el: HTMLElement, style: string): string {
    if (this.IsEmpty()) {
      el.addEventListener('click',
          this.field_.MakeStep.bind(this.field_, this.coords_));
      return style;
    }

    // From here on we work with BLUE only:
    if (this.flagged_ == ChipState.kHighlight) {
      el.addEventListener('click',
          this.field_.ShowStepsForChip.bind(this.field_, this.coords_));
      return Chip.kHighlightedBlue;
    }
    if (this.flagged_ = ChipState.kSelected) {
      el.addEventListener('click', this.Deselect.bind(this));
      return Chip.kSelectedBlueClass;
    }
    return '';
  }

  Deselect() {
    this.field_.RemoveShownSteps();
    this.Highlight();
  }
  Highlight() {
    if (this.IsRed()) {
      console.assert(false, 'Red chip should never be highlighted');
      return;
    }
    this.SetFlag(ChipState.kHighlight);
  }
  Select() {
    if (this.IsRed()) {
      console.assert(false, 'Red chip should never be selected');
      return;
    }
    this.SetFlag(ChipState.kSelected);
  }
  Clean() {
    this.SetFlag(ChipState.kNone);
  }
  SetFlag(flag: ChipState) {
    this.flagged_ = flag;
    this.field_.RenderWhenIdle();
  }
}
