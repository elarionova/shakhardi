module Mode {

export interface Manager {
  OnPlayerTurnEnded(blue_player: boolean,
                    time: number,
                    eaten: Base.EatenChips): void;
}

interface PlayerData {
  name: string;
  turn_time: number;
  lost_chips: number;
  el: HTMLDivElement;
  timer_el: HTMLDivElement;
}

function LostChipsToPointsString(lost_chips: number) {
  var points = 500 - (lost_chips * 10);
  return "<b>" + String(points) + "</b>";
}

function PadTime(time: number): string {
  var result = '';
  if (time < 10) {
    result = '0';
  }
  return result + String(time);
}

function MsecToTimeString(msec: number) {
  const seconds = Math.floor(msec / 1000);

  return PadTime(Math.floor(seconds / 60)) + ":" + PadTime(seconds % 60);
}

export class Master implements Manager {
  private static kPlayerClass = "player";
  private static kTimerClass = "timer";

  private red_player_: PlayerData;
  private blue_player_: PlayerData;

  constructor(red_player_name: string, blue_player_name: string) {
    var players = document.getElementsByClassName(Master.kPlayerClass);
    var timers = document.getElementsByClassName(Master.kTimerClass);
    this.red_player_ = {
      name: red_player_name,
      turn_time: 0,
      lost_chips: 0,
      el: <HTMLDivElement>players.item(0),
      timer_el: <HTMLDivElement>timers.item(0)
    };

    this.blue_player_ = {
      name: blue_player_name,
      turn_time: 0,
      lost_chips: 0,
      el: <HTMLDivElement>players.item(1),
      timer_el: <HTMLDivElement>timers.item(1)
    }

    this.Render();
  }

  OnPlayerTurnEnded(blue_player: boolean,
                    time: number,
                    eaten: Base.EatenChips): void {
    this.red_player_.lost_chips += eaten.red;
    this.blue_player_.lost_chips += eaten.blue;
    this.OnPlayerTurnEndedInternal(blue_player ?
        this.blue_player_: this.red_player_, time);
  }

  private OnPlayerTurnEndedInternal(player: PlayerData, time: number) {
    player.turn_time += time;
    this.Render();
  }

  private Render(): void {
    this.red_player_.el.innerHTML = this.red_player_.name + " : " +
        LostChipsToPointsString(this.red_player_.lost_chips);
    this.red_player_.timer_el.innerHTML =
        MsecToTimeString(this.red_player_.turn_time);

    this.blue_player_.el.innerHTML = this.blue_player_.name + " : " +
        LostChipsToPointsString(this.blue_player_.lost_chips);
    this.blue_player_.timer_el.innerHTML =
        MsecToTimeString(this.blue_player_.turn_time);
  }
}
}
