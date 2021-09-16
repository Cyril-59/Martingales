import { Component, OnInit, Input, Output, EventEmitter, ViewChild } from '@angular/core';
import { Roulette } from '../roulette';
import { RouletteComponent } from '../roulette/roulette.component';

@Component({
  selector: 'app-martingale',
  templateUrl: './martingale.component.html',
  styleUrls: ['./martingale.component.css']
})
export class MartingaleComponent implements OnInit {

  @Input()
  martingale: Roulette;

  @Input()
  cash: number;

  @Input()
  objectif: number;

  @Input()
  historySize = 13;

  @Input()
  tabSize = 5;

  @Input()
  guessSize: number;

  tab: Roulette[];
  currentIndex: number = -1;
  nbJeux = 0;
  winIndex: number = -1;
  randomProba: number = 0;
  randomRoulette: number = 0;
  ready = false;
  lastNumbers: number[] = [];
  loseStreak: number = 0;
  prevLoseStreak: number = 0;
  liveDialog = false;
  liveValue: number;
  maxTryReached = false;
  firstMaxTry: number;
  modeLive = false;
  modeGuess = false;
  guessLabel: string = 'Wait';
  showChangeCash = false;
  newCash = this.cash;

  batchCash: number;
  batchGoal: number;
  nbIterations: number = 100;
  guessScore: number;
  randomScore: number;

  modeBatch = false;

  @ViewChild(RouletteComponent)
  childRoulette: RouletteComponent;

  @Output()
  onDelete: EventEmitter<void> = new EventEmitter();

  @Output()
  onClose: EventEmitter<void> = new EventEmitter();

  @Output()
  onNext: EventEmitter<number> = new EventEmitter();

  @Output()
  onWin: EventEmitter<number> = new EventEmitter();

  @Output()
  onChangeCash: EventEmitter<number> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    this.tab = [];
    this.tab.push(this.martingale);
    let i = 1;
    let maxCompute = this.tabSize;
    if (this.martingale.maxTry && this.martingale.maxTry < maxCompute) {
      maxCompute = this.martingale.maxTry;
    }
    while(i++ < maxCompute) {
      this.compute();
    }
    this.firstMaxTry = this.martingale.maxTry;

    this.batchCash = this.cash;
    this.batchGoal = this.objectif;
  }

  compute() {
    const perte = this.getTotal();
    const lastRoulette = this.tab[this.tab.length - 1];
    let newMise = lastRoulette.mise;
    while (perte + newMise > newMise * lastRoulette.gain - this.martingale.gainMini) {
      newMise += this.martingale.gap;
      if (newMise >= this.martingale.miseMax) {
        newMise = this.martingale.miseMax;
        break;
      }
    }
    const newRoulette = new Roulette(this.martingale.type, newMise, lastRoulette.gain, lastRoulette.proba * this.martingale.proba);
    newRoulette.perte = perte;
    if (this.martingale.gainCroissant) {
      this.martingale.gainMini = this.martingale.gainMini + 2;
    }
    this.tab.push(newRoulette);
  }

  getTotal() {
    return this.tab.map(t => t.mise).reduce((s, v) => s += v);
  }

  delete() {
    this.onDelete.emit();
  }

  close() {
    this.onClose.emit();
  }

  next() {
    this.nbJeux++;
    if (this.winIndex != undefined && this.winIndex != null) {
      this.currentIndex = 0;
      this.winIndex = null;
    } else {
      if (this.maxTryReached) {
        if (this.martingale.dynamic) {
          this.martingale.maxTry = this.firstMaxTry;
        }
        this.maxTryReached = false;
        this.currentIndex = 0;
      } else {
        this.currentIndex++;
      }
    }
    if (!this.modeBatch) {
      this.onNext.emit(this.tab[this.currentIndex].mise);
    } else {
      this.batchCash -= this.tab[this.currentIndex].mise;
    }
  }

  win() {
    this.prevLoseStreak = 0;
    this.winIndex = this.currentIndex;
    if (!this.modeBatch) {
      this.onWin.emit(this.tab[this.currentIndex].mise * this.tab[this.currentIndex].gain);
    } else {
      this.batchCash += this.tab[this.currentIndex].mise * this.tab[this.currentIndex].gain;
    }
  }

  generateRandomProba() {
    this.randomProba = Math.floor(Math.random() * 100000) + 1;
  }

  generateRandomRoulette() {
    this.randomRoulette = Math.floor(Math.random() * 37);
  }

  playLive() {
    this.liveDialog = false;
    this.play(true);
  }

  play(live = false) {
    if (live) {
      this.childRoulette.play(this.liveValue);
    } else {
      this.childRoulette.play();
    }
    this.next();
    this.randomRoulette = this.childRoulette.randomRoulette;
    this.lastNumbers.unshift(this.randomRoulette);
    if (this.lastNumbers.length > this.historySize) {
      this.lastNumbers.length = this.historySize;
    }
    this.loseStreak = Math.max(this.loseStreak, this.currentIndex + 1 + this.prevLoseStreak);
    if (this.childRoulette.won) {
      this.win();
    } else {
      if (this.currentIndex + 1 == this.tab.length) {
        this.compute();
      }
      if (this.currentIndex + 1 >= this.martingale.maxTry) {
        if (this.martingale.dynamic && this.cash - this.tab[this.currentIndex].mise > this.tab[this.currentIndex + 1].mise) {
          this.martingale.maxTry++;
        } else {
          this.maxTryReached = true;
          this.prevLoseStreak += this.martingale.maxTry;
        }
      }
    }
    this.guess();
  }

  simulateLive() {
    this.liveDialog = false;
    this.simulate(true);
  }

  simulate(live = false) {
    if (live) {
      this.childRoulette.play(this.liveValue);
    } else {
      if (this.lastNumbers.length == 0) {
        for (let i = 1; i < this.historySize; i++) {
          this.childRoulette.generateRandomRoulette()
          this.lastNumbers.unshift(this.childRoulette.randomRoulette);
        }
      }
      this.childRoulette.play();
    }
    this.randomRoulette = this.childRoulette.randomRoulette;
    this.lastNumbers.unshift(this.randomRoulette);
    if (this.lastNumbers.length > this.historySize) {
      this.lastNumbers.length = this.historySize;
    }
    this.guess();
  }

  multiplay(times: number) {
    let cpt = 0;
    for (let i = 1; i <= times; i++) {
      if (this.modeGuess && this.guessLabel == 'Wait') {
        this.simulate();
      } else {
        cpt++;
        this.play();
      }
      if (this.modeBatch && (this.batchCash <= 0 || this.batchCash >= this.batchGoal)) {
        break;
      }
    }
    return cpt;
  }

  live() {
    this.liveValue = null;
    this.liveDialog = true;
  }

  guess() {
    if (this.martingale.gain == 3) {
      this.guessTiers(this.guessSize != null ? this.guessSize : 5);
    } else if (this.martingale.gain == 2) {
      this.guessDemi(this.guessSize != null ? this.guessSize : 4);
    } else if (this.martingale.gain == 1.5) {
      this.guessDeuxTiers(this.guessSize != null ? this.guessSize : 3);
    }
  }

  guessDemi(guessSize) {
    let indexes = [0, 0, 0, 0, 0, 0];
      for (let i = 0; i < this.lastNumbers.length; i++) {
        if (indexes[0] == i && !(this.lastNumbers[i] > 0 && this.lastNumbers[i] <= 18)) {
          indexes[0]++;
        }
        if (indexes[1] == i && !(this.lastNumbers[i] > 18 && this.lastNumbers[i] <= 36)) {
          indexes[1]++;
        }
        if (indexes[2] == i && this.lastNumbers[i] % 2 != 0) {
          indexes[2]++;
        }
        if (indexes[3] == i && this.lastNumbers[i] % 2 != 1) {
          indexes[3]++;
        }
        if (indexes[4] == i && !this.childRoulette.reds.includes(this.lastNumbers[i])) {
          indexes[4]++;
        }
        if (indexes[5] == i && !this.childRoulette.blacks.includes(this.lastNumbers[i])) {
          indexes[5]++;
        }
      }
      let i = indexes.indexOf(Math.max(...indexes));
      if (indexes[i] < guessSize) {
        this.guessLabel = 'Wait';
      } else {
        if (this.modeGuess) {
          this.childRoulette.reset();
        }
        switch(i) {
          case 0:
            this.guessLabel = '1-18';
            if (this.modeGuess) {
              this.childRoulette.numbers[43] = true;
            }
            break;
          case 1:
              this.guessLabel = '19-36';
              if (this.modeGuess) {
                this.childRoulette.numbers[48] = true;
              }
              break;
          case 2:
            this.guessLabel = 'EVEN';
            if (this.modeGuess) {
              this.childRoulette.numbers[44] = true;
            }
            break;
          case 3:
            this.guessLabel = 'ODD';
            if (this.modeGuess) {
              this.childRoulette.numbers[47] = true;
            }
            break;
          case 4:
            this.guessLabel = 'RED';
            if (this.modeGuess) {
              this.childRoulette.numbers[45] = true;
            }
            break;
          case 5:
            this.guessLabel = 'BLACK';
            if (this.modeGuess) {
              this.childRoulette.numbers[46] = true;
            }
            break;
        }
      }
  }

  guessTiers(guessSize) {
    let indexes = [0, 0, 0, 0, 0, 0, 0];
    for (let i = 0; i < this.lastNumbers.length; i++) {
      if (indexes[0] == i && !(this.lastNumbers[i] > 0 && this.lastNumbers[i] <= 12)) {
        indexes[0]++;
      }
      if (indexes[1] == i && !(this.lastNumbers[i] > 12 && this.lastNumbers[i] <= 24)) {
        indexes[1]++;
      }
      if (indexes[2] == i && !(this.lastNumbers[i] > 24 && this.lastNumbers[i] <= 36)) {
        indexes[2]++;
      }
      if (indexes[3] == i && this.lastNumbers[i] % 3 != 1) {
        indexes[3]++;
      }
      if (indexes[4] == i && this.lastNumbers[i] % 3 != 2) {
        indexes[4]++;
      }
      if (indexes[5] == i && this.lastNumbers[i] % 3 != 0) {
        indexes[5]++;
      }
      if (indexes[6] == i && !this.childRoulette.cylindre.includes(this.lastNumbers[i])) {
        indexes[6]++;
      }
    }
    let i = indexes.indexOf(Math.max(...indexes));
    if (indexes[i] < guessSize) {
      this.guessLabel = 'Wait';
    } else {
        if (this.modeGuess) {
          this.childRoulette.reset();
        }
        switch(i) {
          case 0:
            this.guessLabel = '1-12';
            if (this.modeGuess) {
              this.childRoulette.numbers[40] = true;
            }
            break;
          case 1:
            this.guessLabel = '13-24';
            if (this.modeGuess) {
              this.childRoulette.numbers[41] = true;
            }
            break;
          case 2:
            this.guessLabel = '25-36';
            if (this.modeGuess) {
              this.childRoulette.numbers[42] = true;
            }
            break;
          case 3:
            this.guessLabel = '1%3';
            if (this.modeGuess) {
              this.childRoulette.numbers[37] = true;
            }
            break;
          case 4:
            this.guessLabel = '2%3';
            if (this.modeGuess) {
              this.childRoulette.numbers[38] = true;
            }
            break;
          case 5:
            this.guessLabel = '0%3';
            if (this.modeGuess) {
              this.childRoulette.numbers[39] = true;
            }
            break;
          case 6:
            this.guessLabel = 'CYL';
            if (this.modeGuess) {
              this.childRoulette.numbers[52] = true;
            }
            break;
      }
    }
  }

  guessDeuxTiers(guessSize) {
    let indexes = [0, 0, 0, 0, 0, 0];
    for (let i = 0; i < this.lastNumbers.length; i++) {
      if (indexes[0] == i && !(this.lastNumbers[i] > 0 && this.lastNumbers[i] <= 24)) {
        indexes[0]++;
      }
      if (indexes[1] == i && !(this.lastNumbers[i] > 12 && this.lastNumbers[i] <= 36)) {
        indexes[1]++;
      }
      if (indexes[2] == i && !(this.lastNumbers[i] > 0 && this.lastNumbers[i] <= 12) && !(this.lastNumbers[i] > 24 && this.lastNumbers[i] <= 36)) {
        indexes[2]++;
      }
      if (indexes[3] == i && this.lastNumbers[i] % 3 == 0) {
        indexes[3]++;
      }
      if (indexes[4] == i && (this.lastNumbers[i] == 0 || this.lastNumbers[i] % 3 == 2)) {
        indexes[4]++;
      }
      if (indexes[5] == i && (this.lastNumbers[i] == 0 || this.lastNumbers[i] % 3 == 1)) {
        indexes[5]++;
      }
    }
    let i = indexes.indexOf(Math.max(...indexes));
    if (indexes[i] < guessSize) {
      this.guessLabel = 'Wait';
    } else {
        if (this.modeGuess) {
          this.childRoulette.reset();
        }
        switch(i) {
          case 0:
            this.guessLabel = '1-24';
            if (this.modeGuess) {
              this.childRoulette.numbers[40] = true;
              this.childRoulette.numbers[41] = true;
            }
            break;
          case 1:
            this.guessLabel = '13-36';
            if (this.modeGuess) {
              this.childRoulette.numbers[41] = true;
              this.childRoulette.numbers[42] = true;
            }
            break;
          case 2:
            this.guessLabel = '1-12/25-36';
            if (this.modeGuess) {
              this.childRoulette.numbers[40] = true;
              this.childRoulette.numbers[42] = true;
            }
            break;
          case 3:
            this.guessLabel = '1%3/2%3';
            if (this.modeGuess) {
              this.childRoulette.numbers[37] = true;
              this.childRoulette.numbers[38] = true;
            }
            break;
          case 4:
            this.guessLabel = '1%3/0%3';
            if (this.modeGuess) {
              this.childRoulette.numbers[37] = true;
              this.childRoulette.numbers[39] = true;
            }
            break;
          case 5:
            this.guessLabel = '2%3/0%3';
            if (this.modeGuess) {
              this.childRoulette.numbers[38] = true;
              this.childRoulette.numbers[39] = true;
            }
            break;
      }
    }
  }

  changeCash() {
    this.showChangeCash = true;
    this.newCash = this.cash;
  }

  validCash() {
    this.onChangeCash.emit(this.newCash);
    this.showChangeCash = false;
  }

  getMiseCourante() {
    if (this.martingale.type == 0) {
        if (this.childRoulette.numbers[40]) {
          return '1-12';
        } else if (this.childRoulette.numbers[41]) {
          return '13-24';
        } else if (this.childRoulette.numbers[42]) {
          return '25-36';
        } else if (this.childRoulette.numbers[37]) {
          return '1%3';
        } else if (this.childRoulette.numbers[38]) {
          return '2%3';
        } else if (this.childRoulette.numbers[39]) {
          return '0%3';
        } else if (this.childRoulette.numbers[52]) {
          return 'CYL';
        }
    } else if (this.martingale.type == 1) {
      if (this.childRoulette.numbers[43]) {
        return '1-18';
      } else if (this.childRoulette.numbers[44]) {
        return 'EVEN';
      } else if (this.childRoulette.numbers[45]) {
        return 'RED';
      } else if (this.childRoulette.numbers[46]) {
        return 'BLACK';
      } else if (this.childRoulette.numbers[47]) {
        return 'ODD';
      } else if (this.childRoulette.numbers[48]) {
        return '19-36';
      }
    } else if (this.martingale.type == 2) {
      if (this.childRoulette.numbers[40] && this.childRoulette.numbers[41]) {
        return '1-24';
      } else if (this.childRoulette.numbers[41] && this.childRoulette.numbers[42]) {
        return '13-36';
      } else if (this.childRoulette.numbers[40] && this.childRoulette.numbers[42]) {
        return '1-12/25-36';
      } else if (this.childRoulette.numbers[37] && this.childRoulette.numbers[38]) {
        return '1%3/2%3';
      } else if (this.childRoulette.numbers[37] && this.childRoulette.numbers[39]) {
        return '1%3/0%3';
      } else if (this.childRoulette.numbers[38] && this.childRoulette.numbers[39]) {
        return '2%3/0%3';
      }
    }
  }

  guessed() {
    if (this.modeGuess) {
      this.guess();
    }
  }

  startBatch() {
    if (!this.batchCash || !this.batchGoal) {
      return;
    }
    const resultGuess = [];
    const resultRandom = [];
    const batchCash = this.batchCash;
    for (let i = 0; i < this.nbIterations; i++) {
      this.batchCash = batchCash;
      this.batchGoalOrNegative(true);
      resultGuess.push(this.batchCash >= this.batchGoal ? 1 : 0);

      this.batchCash = batchCash;
      this.batchGoalOrNegative(false);
      resultRandom.push(this.batchCash >= this.batchGoal ? 1 : 0);
    }
    //resultGuess.sort(function(a, b) { return a - b;});
    this.guessScore = resultGuess.reduce((partial_sum, a) => partial_sum + a, 0);
    this.randomScore = resultRandom.reduce((partial_sum, a) => partial_sum + a, 0);
    this.batchCash = batchCash;
  }

  batchGoalOrNegative(isGuess) {
    if (isGuess) {
      this.modeGuess = true;
      this.guess();
    } else {
      this.modeGuess = false;
      this.childRoulette.reset();
      if (this.martingale.gain == 3) {
        this.childRoulette.numbers[Math.floor(Math.random() * 6) + 37] = true;
      }
    }
    this.currentIndex = -1;
    this.winIndex = -1;

    let cpt = 0;
    while (true) {
      cpt += this.multiplay(100);
      if (this.batchCash >= this.batchGoal || this.batchCash <= 0) {
        break;
      }
    }
    this.currentIndex = -1;
    this.winIndex = -1;
    return cpt;
  }
}
