import {ID, toID} from '@pkmn.cc/data';

import {Listeners} from './listeners';
import {Params} from './parser';

export class Timer {
  kickingInactive: number|boolean = false;
  totalTimeLeft = 0;
  graceTimeLeft = 0;
  timerInterval = 0;

  constructor(listeners: Listeners, readonly user?: ID) {
    this.user = user;

    listeners['inactive'] = p => this.onInactive(p);
    listeners['inactiveoff'] = p => this.onInactiveOff(p);
  }

  /* TODO
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
  }*/

  onInactive(params: Params) {
    if (!this.kickingInactive) this.kickingInactive = true;

    const arg = params.args[1];
    if (arg.startsWith('Time left: ')) {
      const [time, totalTime, graceTime] = arg.split(' | ');

      // tslint:disable-next-line:ban
      this.kickingInactive = parseInt(time.slice(11), 10) || true;
      // tslint:disable-next-line:ban
      this.totalTimeLeft = parseInt(totalTime, 10);
      // tslint:disable-next-line:ban
      this.graceTimeLeft = parseInt(graceTime || '', 10) || 0;

      if (this.totalTimeLeft === this.kickingInactive) this.totalTimeLeft = 0;
    } else if (arg.startsWith('You have ')) {
      // tslint:disable-next-line:ban
      this.kickingInactive = parseInt(arg.slice(9), 10) || true;
    } else if (arg.endsWith(' seconds left.')) {
      const hasIndex = arg.indexOf(' has ');
      if (toID(arg.slice(0, hasIndex)) === this.user) {
        // tslint:disable-next-line:ban
        this.kickingInactive = parseInt(arg.slice(hasIndex + 5), 10) || true;
      }
    }
  }

  onInactiveOff(params: Params) {
    this.kickingInactive = false;
  }

  time(): {secondsLeft: number|true, totalTimeLeft: number}|undefined {
    return (!this.kickingInactive) ?
        undefined :
        {secondsLeft: this.kickingInactive, totalTimeLeft: this.totalTimeLeft};
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
    return str;
  }

  private display(s: number) {
    const m = Math.floor(s / 60);
    s -= m * 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  }
}
