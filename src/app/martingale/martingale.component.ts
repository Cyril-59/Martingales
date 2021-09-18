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
  rngNumber = 100;
  rngArray: number[] = [];
  reportResult: string;
  tiersBets = ['1-12', '13-24', '25-36', '1%3', '2%3', '0%3', 'CYL'];
  demiBets = ['RED', 'BLACK', '1-18', '19-36', 'EVEN', 'ODD'];
  doubleTiersBets = ['1-24', '13-36', '1-12/25-36', '1%3/2%3', '1%3/0%3', '2%3/0%3'];
  randomBet: string[];
  betNumber: number = 1;
  onlyColor = false;
  onlyTiers = false;

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
    if (this.martingale.type == 0) {
      this.guessTiers(this.guessSize != null ? this.guessSize : 5);
    } else if (this.martingale.type == 1) {
      this.guessDemi(this.guessSize != null ? this.guessSize : 4);
    } else if (this.martingale.type == 2) {
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
      if (this.martingale.type == 0) {
        this.childRoulette.numbers[Math.floor(Math.random() * 6) + 37] = true;
      }
      if (this.martingale.type == 1) {
        this.childRoulette.numbers[Math.floor(Math.random() * 6) + 43] = true;
      }
      if (this.martingale.type == 2) {
        const j = Math.floor(Math.random() * 6) + 37;
        if (j < 40) {
          this.childRoulette.numbers[j] = true;
          if (j == 39) {
            this.childRoulette.numbers[37] = true;
          } else {
            this.childRoulette.numbers[j + 1] = true;
          }
        } else {
          this.childRoulette.numbers[j] = true;
          if (j == 42) {
            this.childRoulette.numbers[40] = true;
          } else {
            this.childRoulette.numbers[j + 1] = true;
          }
        }
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

  startRandomBet() {
    this.randomBet = [];
    for (let i = 0; i < this.betNumber; i++) {
      const rng = Math.floor(Math.random() * 37);
      if (rng == 0) {
        this.randomBet.push('0');
      } else {
        if (this.martingale.type == 0) {
          if (!this.onlyTiers) {
            this.randomBet.push(this.tiersBets[Math.floor(Math.random() * 7)]);
          } else {
            this.randomBet.push(this.tiersBets[Math.floor(Math.random() * 3)]);
          }
        } else if (this.martingale.type == 1) {
          if (!this.onlyColor) {
            this.randomBet.push(this.demiBets[Math.floor(Math.random() * 6)]);
          } else {
            this.randomBet.push(this.demiBets[Math.floor(Math.random() * 2)]);
          }
        } else if (this.martingale.type == 2) {
          this.randomBet.push(this.doubleTiersBets[Math.floor(Math.random() * 6)]);
        } else {
          this.randomBet.length = 0;
        }
      }
    }
  }

  startRNG() {
    this.rngArray.length = 0;
    for (let i = 0; i < this.rngNumber; i++) {
      this.rngArray.push(Math.floor(Math.random() * 37));
    }
    this.reportRNG();
  }

  reportRNG() {
    if (this.martingale.type == 0) {
      this.reportTiers();
    }
    if (this.martingale.type == 1) {
      this.reportDemi();
    }
    if (this.martingale.type == 2) {
      this.reportDeuxTiers();
    }
  }

  reportDemi() {
    let nbRed = 0, nbBlack = 0, nbEven = 0, nbOdd = 0, nbManque = 0, nbPasse = 0, nbZero = 0;
    let maxRed = 0, maxBlack = 0, maxEven = 0, maxOdd = 0, maxManque = 0, maxPasse = 0;
    let maxNotRed = 0, maxNotBlack = 0, maxNotEven = 0, maxNotOdd = 0, maxNotManque = 0, maxNotPasse = 0;
    let cptRed = 0, cptBlack = 0, cptEven = 0, cptOdd = 0, cptManque = 0, cptPasse = 0;
    let cptNotRed = 0, cptNotBlack = 0, cptNotEven = 0, cptNotOdd = 0, cptNotManque = 0, cptNotPasse = 0;

    for (let i = 0; i < this.rngArray.length; i++) {
      const rng = this.rngArray[i];
      if (rng == 0) {
        nbZero++;
        cptRed = cptBlack = cptEven = cptOdd = cptManque = cptPasse = 0;
        cptNotRed++; cptNotBlack++; cptNotEven++; cptNotOdd++; cptNotManque++; cptNotPasse++;
      } else if (rng <= 18) {
        nbManque++;
        cptManque++;
        if (cptManque > maxManque) {
          maxManque = cptManque;
        }
        cptPasse = 0;
        cptNotPasse++;
        cptNotManque = 0;
      } else {
        nbPasse++;
        cptPasse++;
        if (cptPasse > maxPasse) {
          maxPasse = cptPasse;
        }
        cptManque = 0;
        cptNotManque++;
        cptNotPasse = 0;
      }

      if (this.childRoulette.blacks.includes(rng)) {
        nbBlack++;
        cptBlack++;
        if (cptBlack > maxBlack) {
          maxBlack = cptBlack;
        }
        cptNotBlack = 0;
        cptNotRed++;
        cptRed = 0;
      } else if (rng != 0) {
        nbRed++;
        cptRed++;
        if (cptRed > maxRed) {
          maxRed = cptRed;
        }
        cptNotRed = 0;
        cptNotBlack++;
        cptBlack = 0;
      }

      if (rng % 2 == 1) {
        nbOdd++;
        cptOdd++;
        if (cptOdd > maxOdd) {
          maxOdd = cptOdd;
        }
        cptNotOdd = 0;
        cptNotEven++;
        cptEven = 0;
      } else if (rng != 0) {
        nbEven++;
        cptEven++;
        if (cptEven > maxEven) {
          maxEven = cptEven;
        }
        cptNotEven = 0;
        cptNotOdd++;
        cptOdd = 0;
      }

      if (cptNotRed > maxNotRed) {
        maxNotRed = cptNotRed;
      }
      if (cptNotBlack > maxNotBlack) {
        maxNotBlack = cptNotBlack;
      }
      if (cptNotManque > maxNotManque) {
        maxNotManque = cptNotManque;
      }
      if (cptNotPasse > maxNotPasse) {
        maxNotPasse = cptNotPasse;
      }
      if (cptNotEven > maxNotEven) {
        maxNotEven = cptNotEven;
      }
      if (cptNotOdd > maxNotOdd) {
        maxNotOdd = cptNotOdd;
      }
    }

    this.reportResult = "<table> \
    <thead> \
      <tr> \
        <th>0 : " + nbZero + " </th> \
        <th>RED</th> \
        <th>BLACK</th> \
        <th>EVEN</th> \
        <th>ODD</th> \
        <th>1-18</th> \
        <th>19-36</th> \
      </tr> \
    </thead> \
    <tbody> \
      <tr> \
        <td>Total</td> \
        <td>" + nbRed + "</td> \
        <td>" + nbBlack + "</td> \
        <td>" + nbEven + "</td> \
        <td>" + nbOdd + "</td> \
        <td>" + nbManque + "</td> \
        <td>" + nbPasse + "</td> \
      </tr> \
      <tr> \
        <td>Max Streak</td> \
        <td>" + maxRed + "</td> \
        <td>" + maxBlack + "</td> \
        <td>" + maxEven + "</td> \
        <td>" + maxOdd + "</td> \
        <td>" + maxManque + "</td> \
        <td>" + maxPasse + "</td> \
      </tr> \
      <tr> \
        <td> Max Not Streak</td> \
        <td>" + maxNotRed + "</td> \
        <td>" + maxNotBlack + "</td> \
        <td>" + maxNotEven + "</td> \
        <td>" + maxNotOdd + "</td> \
        <td>" + maxNotManque + "</td> \
        <td>" + maxNotPasse + "</td> \
      </tr> \
    </tbody> \
    </table>";
  }

  reportDeuxTiers() {
    let nbT1T2 = 0, nbT1T3 = 0, nbT2T3 = 0, nbM1M2 = 0, nbM1M3 = 0, nbM2M3 = 0, nbZero = 0;
    let maxT1T2 = 0, maxT1T3 = 0, maxT2T3 = 0, maxM1M2 = 0, maxM1M3 = 0, maxM2M3 = 0;
    let maxNotT1T2 = 0, maxNotT1T3 = 0, maxNotT2T3 = 0, maxNotM1M2 = 0, maxNotM1M3 = 0, maxNotM2M3 = 0;
    let cptT1T2 = 0, cptT1T3 = 0, cptT2T3 = 0, cptM1M2 = 0, cptM1M3 = 0, cptM2M3 = 0;
    let cptNotT1T2 = 0, cptNotT1T3 = 0, cptNotT2T3 = 0, cptNotM1M2 = 0, cptNotM1M3 = 0, cptNotM2M3 = 0;

    for (let i = 0; i < this.rngArray.length; i++) {
      const rng = this.rngArray[i];
      if (rng == 0) {
        nbZero++;
        cptT1T2 = cptT2T3 = cptT1T3 = cptM1M2 = cptM2M3 = cptM1M3 = 0;
        cptNotT1T2++; cptNotT2T3++; cptNotT1T3++; cptNotM1M2++; cptNotM2M3++; cptNotM1M3++;
      } else if (rng <= 12) {
        nbT1T2++;
        nbT1T3++;
        cptT1T2++;
        cptT1T3++;
        if (cptT1T2 > maxT1T2) {
          maxT1T2 = cptT1T2;
        }
        if (cptT1T3 > maxT1T3) {
          maxT1T3 = cptT1T3;
        }
        cptT2T3 = 0;
        cptNotT2T3++;
        cptNotT1T2 = 0;
        cptNotT1T3 = 0;
      } else if (rng <= 24) {
        nbT1T2++;
        nbT2T3++;
        cptT1T2++;
        cptT2T3++;
        if (cptT1T2 > maxT1T2) {
          maxT1T2 = cptT1T2;
        }
        if (cptT2T3 > maxT2T3) {
          maxT2T3 = cptT2T3;
        }
        cptT1T3 = 0;
        cptNotT1T3++;
        cptNotT1T2 = 0;
        cptNotT2T3 = 0;
      } else if (rng <= 36) {
        nbT1T3++;
        nbT2T3++;
        cptT1T3++;
        cptT2T3++;
        if (cptT1T3 > maxT1T3) {
          maxT1T3 = cptT1T3;
        }
        if (cptT2T3 > maxT2T3) {
          maxT2T3 = cptT2T3;
        }
        cptT1T2 = 0;
        cptNotT1T2++;
        cptNotT1T3 = 0;
        cptNotT2T3 = 0;
      }

      if (rng % 3 == 1) {
        nbM1M2++;
        nbM1M3++;
        cptM1M2++;
        cptM1M3++;
        if (cptM1M2 > maxM1M2) {
          maxM1M2 = cptM1M2;
        }
        if (cptM1M3 > maxM1M3) {
          maxM1M3 = cptM1M3;
        }
        cptM2M3 = 0;
        cptNotM2M3++;
        cptNotM1M2 = 0;
        cptNotM1M3 = 0;
      } else if (rng % 3 == 2) {
        nbM1M2++;
        nbM2M3++;
        cptM1M2++;
        cptM2M3++;
        if (cptM1M2 > maxM1M2) {
          maxM1M2 = cptM1M2;
        }
        if (cptM2M3 > maxM2M3) {
          maxM2M3 = cptM2M3;
        }
        cptM1M3 = 0;
        cptNotM1M3++;
        cptNotM1M2 = 0;
        cptNotM2M3 = 0;
      } else if (rng != 0) {
        nbM1M3++;
        nbM2M3++;
        cptM1M3++;
        cptM2M3++;
        if (cptM1M3 > maxM1M3) {
          maxM1M3 = cptM1M3;
        }
        if (cptM2M3 > maxM2M3) {
          maxM2M3 = cptM2M3;
        }
        cptM1M2 = 0;
        cptNotM1M2++;
        cptNotM1M3 = 0;
        cptNotM2M3 = 0;
      }

      if (cptNotT1T2 > maxNotT1T2) {
        maxNotT1T2 = cptNotT1T2;
      }
      if (cptNotT2T3 > maxNotT2T3) {
        maxNotT2T3 = cptNotT2T3;
      }
      if (cptNotT1T3 > maxNotT1T3) {
        maxNotT1T3 = cptNotT1T3;
      }
      if (cptNotM1M2 > maxNotM1M2) {
        maxNotM1M2 = cptNotM1M2;
      }
      if (cptNotM2M3 > maxNotM2M3) {
        maxNotM2M3 = cptNotM2M3;
      }
      if (cptNotM1M3 > maxNotM1M3) {
        maxNotM1M3 = cptNotM1M3;
      }
    }

    this.reportResult = "<table> \
    <thead> \
      <tr> \
        <th>0 : " + nbZero + " </th> \
        <th>T1T2</th> \
        <th>T2T3</th> \
        <th>T1T3</th> \
        <th>M1M2</th> \
        <th>M2M3</th> \
        <th>M1M3</th> \
      </tr> \
    </thead> \
    <tbody> \
      <tr> \
        <td>Total</td> \
        <td>" + nbT1T2 + "</td> \
        <td>" + nbT2T3 + "</td> \
        <td>" + nbT1T3 + "</td> \
        <td>" + nbM1M2 + "</td> \
        <td>" + nbM2M3 + "</td> \
        <td>" + nbM1M3 + "</td> \
      </tr> \
      <tr> \
        <td>Max Streak</td> \
        <td>" + maxT1T2 + "</td> \
        <td>" + maxT2T3 + "</td> \
        <td>" + maxT1T3 + "</td> \
        <td>" + maxM1M2 + "</td> \
        <td>" + maxM2M3 + "</td> \
        <td>" + maxM1M3 + "</td> \
      </tr> \
      <tr> \
        <td> Max Not Streak</td> \
        <td>" + maxNotT1T2 + "</td> \
        <td>" + maxNotT2T3 + "</td> \
        <td>" + maxNotT1T3 + "</td> \
        <td>" + maxNotM1M2 + "</td> \
        <td>" + maxNotM2M3 + "</td> \
        <td>" + maxNotM1M3 + "</td> \
      </tr> \
    </tbody> \
    </table>";
  }

  reportTiers() {
    let nbT1 = 0, nbT2 = 0, nbT3 = 0, nbM1 = 0, nbM2 = 0, nbM3 = 0, nbCy = 0, nbZero = 0;
    let maxT1 = 0, maxT2 = 0, maxT3 = 0, maxM1 = 0, maxM2 = 0, maxM3 = 0, maxCy = 0;
    let maxNotT1 = 0, maxNotT2 = 0, maxNotT3 = 0, maxNotM1 = 0, maxNotM2 = 0, maxNotM3 = 0, maxNotCy = 0;
    let cptT1 = 0, cptT2 = 0, cptT3 = 0, cptM1 = 0, cptM2 = 0, cptM3 = 0, cptCy = 0;
    let cptNotT1 = 0, cptNotT2 = 0, cptNotT3 = 0, cptNotM1 = 0, cptNotM2 = 0, cptNotM3 = 0, cptNotCy = 0;

    for (let i = 0; i < this.rngArray.length; i++) {
      const rng = this.rngArray[i];
      if (rng == 0) {
        nbZero++;
        cptT1 = cptT2 = cptT3 = cptM1 = cptM2 = cptM3 = cptCy = 0;
        cptNotT1++; cptNotT2++; cptNotT3++; cptNotM1++; cptNotM2++; cptNotM3++; cptNotCy++;
      } else if (rng <= 12) {
        nbT1++;
        cptT1++;
        if (cptT1 > maxT1) {
          maxT1 = cptT1;
        }
        cptT2 = cptT3 = 0;
        cptNotT2++; cptNotT3++;
        cptNotT1 = 0;
      } else if (rng <= 24) {
        nbT2++;
        cptT2++;
        if (cptT2 > maxT2) {
          maxT2 = cptT2;
        }
        cptT1 = cptT3 = 0;
        cptNotT1++; cptNotT3++;
        cptNotT2 = 0;
      } else {
        nbT3++;
        cptT3++;
        if (cptT3 > maxT3) {
          maxT3 = cptT3;
        }
        cptT1 = cptT2 = 0;
        cptNotT1++; cptNotT2++;
        cptNotT3 = 0;
      }
      if (rng % 3 == 1) {
        nbM1++;
        cptM1++;
        if (cptM1 > maxM1) {
          maxM1 = cptM1;
        }
        cptM2 = cptM3 = 0;
        cptNotM2++; cptNotM3++;
        cptNotM1 = 0;
      } else if (rng % 3 == 2) {
        nbM2++;
        cptM2++;
        if (cptM2 > maxM2) {
          maxM2 = cptM2;
        }
        cptM1 = cptM3 = 0;
        cptNotM1++; cptNotM3++;
        cptNotM2 = 0;
      } else if (rng != 0) {
        nbM3++;
        cptM3++;
        if (cptM3 > maxM3) {
          maxM3 = cptM3;
        }
        cptM1 = cptM2 = 0;
        cptNotM1++; cptNotM2++;
        cptNotM3 = 0;
      }
      if (this.childRoulette.cylindre.includes(rng)) {
        nbCy++;
        cptCy++;
        if (cptCy > maxCy) {
          maxCy = cptCy;
        }
        cptNotCy = 0;
      } else {
        cptCy = 0;
        cptNotCy++;
      }
      if (cptNotT1 > maxNotT1) {
        maxNotT1 = cptNotT1;
      }
      if (cptNotT2 > maxNotT2) {
        maxNotT2 = cptNotT2;
      }
      if (cptNotT3 > maxNotT3) {
        maxNotT3 = cptNotT3;
      }
      if (cptNotM1 > maxNotM1) {
        maxNotM1 = cptNotM1;
      }
      if (cptNotM2 > maxNotM2) {
        maxNotM2 = cptNotM2;
      }
      if (cptNotM3 > maxNotM3) {
        maxNotM3 = cptNotM3;
      }
      if (cptNotCy > maxNotCy) {
        maxNotCy = cptNotCy;
      }
    }

    this.reportResult = "<table> \
    <thead> \
      <tr> \
        <th>0 : " + nbZero + " </th> \
        <th>T1</th> \
        <th>T2</th> \
        <th>T3</th> \
        <th>M1</th> \
        <th>M2</th> \
        <th>M3</th> \
        <th>CY</th> \
      </tr> \
    </thead> \
    <tbody> \
      <tr> \
        <td>Total</td> \
        <td>" + nbT1 + "</td> \
        <td>" + nbT2 + "</td> \
        <td>" + nbT3 + "</td> \
        <td>" + nbM1 + "</td> \
        <td>" + nbM2 + "</td> \
        <td>" + nbM3 + "</td> \
        <td>" + nbCy + "</td> \
      </tr> \
      <tr> \
        <td>Max Streak</td> \
        <td>" + maxT1 + "</td> \
        <td>" + maxT2 + "</td> \
        <td>" + maxT3 + "</td> \
        <td>" + maxM1 + "</td> \
        <td>" + maxM2 + "</td> \
        <td>" + maxM3 + "</td> \
        <td>" + maxCy + "</td> \
      </tr> \
      <tr> \
        <td> Max Not Streak</td> \
        <td>" + maxNotT1 + "</td> \
        <td>" + maxNotT2 + "</td> \
        <td>" + maxNotT3 + "</td> \
        <td>" + maxNotM1 + "</td> \
        <td>" + maxNotM2 + "</td> \
        <td>" + maxNotM3 + "</td> \
        <td>" + maxNotCy + "</td> \
      </tr> \
    </tbody> \
    </table>";
  }
}
