export class Timer {
  kickingInactive: number|boolean = false;
  totalTimeLeft: number = 0;
  graceTimeLeft: number = 0;
  timerInterval: number = 0;

  constructor(readonly userID?: ID) {
    this.userID = userID;
  }

  // TODO
  tick(nextTick: boolean) {
   

    if (!nextTick) {
      if (this.timerInterval) {
        clearInterval(this.timerInterval);
        this.timerInterval = 0;
      }
     
      var timerTicking = (this.battle.kickingInactive &&
      this.request && !this.request.wait &&
      !(this.choice && this.choice.waiting));

      if (timerTicking) this.timerInterval = setInterval(() => {
        var $timerButton = this.$('.timerbutton');
        if ($timerButton.length) {
          this.tick(true);
        } else {
          clearInterval(this.timerInterval);
          this.timerInterval = 0;
        }
      }, 1000);

    } else if (this.kickingInactive > 1) {
      this.kickingInactive--;
      if (this.graceTimeLeft) this.graceTimeLeft--;
      else if (this.totalTimeLeft) this.totalTimeLeft--;
    }
  }

  onInactive(params: Params) {
    if (!this.kickingInactive) this.kickingInactive = true;

    const arg = params.args[1];
    if (arg.startsWith("Time left: ")) {
      const [time, totalTime, graceTime] = arg.split(' | ');

      this.kickingInactive = parseInt(time.slice(11), 10) || true;
      this.totalTimeLeft = parseInt(totalTime, 10);
      this.graceTimeLeft = parseInt(graceTime || '', 10) || 0;

      if (this.totalTimeLeft === this.kickingInactive) this.totalTimeLeft = 0;
    } else if (arg.startsWith("You have ")) {
      this.kickingInactive = parseInt(args.slice(9), 10) || true;
    } else if (arg.endsWith(' seconds left.')) {
      const hasIndex = arg.indexOf(' has ');
      if (toID(arg.slice(0, hasIndex)) === this.userID) {
        this.kickingInactive = parseInt(arg.slice(hasIndex + 5), 10) || true;
      }
    }
  }

  onInactiveOff(params: Params) {
    this.kickingInactive = false;
  }

  time(): {secondsLeft: number|true, totalTimeLeft: number}|undefined {
    return (!this.kickingInactive) ? undefined : {
      secondsLeft: this.kickingInactive,
      totalTimeLeft: this.totalTimeLeft};
  }

  toString(): string {
    const time = this.time();
    if (!time) return '';
    const {secondsLeft, totalTimeLeft} = time;
    if (secondsLeft === true) return '-:--';

    let str = this.display(secondsLeft);
    if (totalTimeLeft) {
      str += ` | ${this.display(totalTimeLeft)} total`;
    }
  }
 
  private display(s: number) {
    var m = Math.floor(s / 60);
    s -= m * 60;
    time = `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
