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

  tab: Roulette[];
  currentIndex: number = -1;
  nbJeux = 0;
  winIndex: number = -1;
  randomProba: number = 0;
  randomRoulette: number = 0;
  ready = false;
  lastNumbers: number[] = [];
  loseStreak: number = 0;

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

  constructor() { }

  ngOnInit(): void {
    this.tab = [];
    this.tab.push(this.martingale);
    let i = 1;
    while(i++ <= 10) {
      this.compute();
    }
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
    const newRoulette = new Roulette(newMise, lastRoulette.gain, lastRoulette.proba * this.martingale.proba);
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
      this.currentIndex++;
    }
    this.onNext.emit(this.tab[this.currentIndex].mise);
  }

  win() {
    this.winIndex = this.currentIndex;
    this.onWin.emit(this.tab[this.currentIndex].mise * this.tab[this.currentIndex].gain);
  }

  generateRandomProba() {
    this.randomProba = Math.floor(Math.random() * 100000) + 1;
  }

  generateRandomRoulette() {
    this.randomRoulette = Math.floor(Math.random() * 37);
  }

  play() {
    this.childRoulette.play();
    this.next();
    this.randomRoulette = this.childRoulette.randomRoulette;
    this.lastNumbers.unshift(this.randomRoulette);
    this.lastNumbers.length = 11;
    this.loseStreak = Math.max(this.loseStreak, this.currentIndex + 1);
    if (this.childRoulette.won) {
      this.win();
    } else {
      if (this.currentIndex + 1 == this.tab.length) {
        this.compute();
      }
    }
  }

  multiplay(times: number) {
    for (let i = 1; i <= times; i++) {
      this.play();
    }
  }
}
