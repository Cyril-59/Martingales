import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Roulette } from '../roulette';

@Component({
  selector: 'app-roulette',
  templateUrl: './roulette.component.html',
  styleUrls: ['./roulette.component.css']
})
export class RouletteComponent implements OnInit {

  @Input()
  martingale: Roulette;

  numbers: boolean[] = [];
  randomRoulette: number;
  won: boolean;
  reds: number[] = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36];
  blacks: number[] = [2, 4, 6, 8, 10, 11, 13, 15, 17, 20, 22, 24, 26, 28, 29, 31, 33, 35];
  randomShow = false;
  weights: number[] = [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 12, 12, 12, 12, 12, 12, 18, 18, 18, 18, 18, 18];
  modeZone = false;
  // ordre : 0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26
  jeuZero: number[] = [12, 35, 3, 26, 0, 32, 15];
  voisins: number[] = [22, 18, 29, 7, 28, 12, 35, 3, 26, 0, 32, 15, 19, 4, 21, 2, 25];
  orphelins: number[] = [17, 34, 6, 1, 20, 14, 31, 9];
  cylindre: number[] = [27, 13, 36, 11, 30, 8, 23, 10, 5, 24, 16, 33];
  showInfo = false;

  @Output()
  onClose: EventEmitter<void> = new EventEmitter();

  @Output()
  onContinue: EventEmitter<void> = new EventEmitter();

  constructor() { }

  ngOnInit(): void {
    for (let i = 0; i <= 52; i++) {
      this.numbers.push(false);
    }
  }

  reset() {
    for (let i = 0; i <= 52; i++) {
      this.numbers[i] = false;
    }
  }

  close () {
    this.onClose.emit();
  }

  play(live: number = null) {
    if (live == null) {
      this.generateRandomRoulette();
    } else {
      this.randomRoulette = live;
    }
    const n = this.randomRoulette;
    if (!this.modeZone) {
      if (this.numbers[n]) {
        this.won = true;
      } else if (1 <= n && 12 >= n && this.numbers[40]) {
        this.won = true;
      } else if (13 <= n && 24 >= n && this.numbers[41]) {
        this.won = true;
      } else if (25 <= n && 36 >= n && this.numbers[42]) {
        this.won = true;
      } else if (1 <= n && 18 >= n && this.numbers[43]) {
        this.won = true;
      } else if (19 <= n && 36 >= n && this.numbers[48]) {
        this.won = true;
      } else if (n%3 == 1 && this.numbers[37]) {
        this.won = true;
      } else if (n%3 == 2 && this.numbers[38]) {
        this.won = true;
      } else if (n > 0 && n%3 == 0 && this.numbers[39]) {
        this.won = true;
      } else if (n > 0 && n%2 == 0 && this.numbers[44]) {
        this.won = true;
      } else if (n%2 == 1 && this.numbers[47]) {
        this.won = true;
      } else if (this.numbers[45] && this.reds.includes(n)) {
        this.won = true;
      } else if (this.numbers[46] && this.blacks.includes(n)) {
        this.won = true;
      } else {
        this.won = false;
      }
    } else {
      if (this.numbers[49] && this.jeuZero.includes(n)) {
        this.won = true;
      } else if (this.numbers[50] && this.voisins.includes(n)) {
        this.won = true;
      } else if (this.numbers[51] && this.orphelins.includes(n)) {
        this.won = true;
      } else if (this.numbers[52] && this.cylindre.includes(n)) {
        this.won = true;
      } else {
        this.won = false;
      }
    }
  }

  generateRandomRoulette() {
    this.randomRoulette = Math.floor(Math.random() * 37);
    this.randomShow = false;
    setTimeout(() => {
      this.randomShow = true;
    }, 500)
  }

  continue() {
    if (!this.modeZone) {
      let cpt = 0;
      for (let i = 0; i <= 48; i++) {
        if (this.numbers[i]) {
          cpt += this.weights[i];
        }
      }
      if (cpt == 36 / this.martingale.gain) {
        this.onContinue.emit();
      }
    } else if (this.numbers[49] || this.numbers[50] ||this.numbers[51] || this.numbers[52]) {
      this.onContinue.emit();
    }
  }

  switchMode() {
    this.modeZone = !this.modeZone;
    this.reset();
  }
}
