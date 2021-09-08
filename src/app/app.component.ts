import { Component, OnInit, ViewChild } from '@angular/core';
import { Roulette } from './roulette';
import { SelectItem } from 'primeng/api/selectitem';
import { UIChart } from 'primeng/chart';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Martingale';

  martingales = [];
  options: SelectItem[] = [];
  martingale: Roulette;
  init = false;
  add = false;
  list = true;
  cash: number;
  minCash: number;
  maxCash: number;
  startCash: number;
  cashHistory: number[] = [];
  data: any;
  showChart = false;
  start = false;
  showRoulette = false;
  objectif: number;
  state: string;
  nbVictory: number = 0;
  nbBankruptcy: number = 0;
  prevMartingale: Roulette;

  @ViewChild(UIChart)
  chartComp: UIChart;

  ngOnInit() {
    this.ajouter(new Roulette(2, 3, 25/37, 'Tiers'));
    this.ajouter(new Roulette(2, 3, 25/37, 'Tiers Min 4', 4));
    this.ajouter(new Roulette(2, 3, 25/37, 'Tiers Gain', 4, 2, true));
    this.ajouter(new Roulette(4, 3, 25/37, 'Tiers Max 32', 8, 2, false, 32));
    this.ajouter(new Roulette(12, 3, 25/37, 'Tiers Gap 12', 1, 12, false));
    this.ajouter(new Roulette(12, 3, 25/37, 'Tiers Max Try 5', 1, 12, false, 1000000, 5));
    this.ajouter(new Roulette(12, 3, 25/37, 'Tiers Dynamic Max Try', 1, 12, false, 1000000, 2, true));

    this.ajouter(new Roulette(2, 2, 19/37, 'Demi'));
    this.ajouter(new Roulette(2, 2, 19/37, 'Demi Min 4', 2));
    this.ajouter(new Roulette(2, 2, 19/37, 'Demi Gain', 1, 2, true));

    this.ajouter(new Roulette(4, 1.5, 13/37, 'Deux-Tiers', 0, 4));
    this.ajouter(new Roulette(4, 1.5, 13/37, 'Deux-Tiers Min 4', 4, 4));
    this.ajouter(new Roulette(4, 1.5, 13/37, 'Deux-Tiers Gain', 1, 4, true));

    this.ajouter(new Roulette(2, 9, 33/37, 'Carre', 8, 2, false));
    this.ajouter(new Roulette(4, 4.5, 29/37, 'DoubleCarre', 8, 4, false));
    this.ajouter(new Roulette(6, 3, 25/37, 'TripleCarre', 2, 6, false));
    this.ajouter(new Roulette(8, 2.25, 21/37, 'QuadriCarre', 4, 8, false));
    this.init = true;
  }

  ajouter(roulette, select = false) {
    this.martingales.push(roulette);
    this.options.push({value: roulette.titre, label: roulette.titre});
    this.add = false;
    if (select) {
      this.select({ value: this.martingales[this.martingales.length - 1].titre });
    }
  }

  supprimer() {
    const index = this.martingales.indexOf(this.martingale);
    this.martingales.splice(index, 1);
    this.options.splice(index, 1);
    this.martingale = null;
    this.list = true;
  }

  select(name) {
    this.martingale = null;
    setTimeout(() => this.martingale = this.martingales.find((m) => m.titre === name.value));
    this.list = false;
    this.showChart = false;
  }

  plus() {
    this.add = true;
    this.list = true;
  }

  initData() {
    if (this.cash) {
      this.startCash = this.cash;
      this.start = true;
      this.cashHistory.length = 0;
      this.cashHistory.push(this.cash);
      this.chart();
      this.minCash = this.cash;
      this.maxCash = this.cash;
    }
  }

  substract(mise: number) {
    this.cash -= mise;
    if (!this.minCash || this.minCash > this.cash) {
      this.minCash = this.cash;
    }
    this.cashHistory.push(this.cash);
    this.chart();
    if (!!this.objectif && this.cash <= 0) {
      this.state = 'BANKRUPTCY';
      this.prevMartingale = this.martingale;
      this.martingale = null;
      this.nbBankruptcy++;
      const tmpCash = this.cash;
      setTimeout(() => {
        this.cash = tmpCash;
        this.minCash = tmpCash;
      });
    }
  }

  win(gain: number) {
    this.cash += gain;
    if (!this.maxCash || this.maxCash < this.cash) {
      this.maxCash = this.cash;
    }
    this.cashHistory.push(this.cash);
    this.chart();
    if (!!this.objectif && this.cash >= this.objectif) {
      this.state = 'VICTORY';
      this.prevMartingale = this.martingale;
      this.martingale = null;
      this.nbVictory++;
      const tmpCash = this.cash;
      setTimeout(() => {
        this.cash = tmpCash;
        this.maxCash = tmpCash;
      });
    }
  }

  chart() {
    if (this.cashHistory.length > 1) {
      this.data = {
        labels: [...Array(this.cashHistory.length).keys()],
        datasets: [
          {
            label: this.martingale.titre,
            data: this.cashHistory,
            fill: false,
            borderColor: '#da7070'
          }, {
              label: 'Cash-in',
              data: Array(this.cashHistory.length).fill(this.startCash),
              fill: false,
              borderColor: '#8ee070'
          }
        ]
      }
      this.showChart = true;
      setTimeout(() => {
        this.chartComp.el.nativeElement.scrollIntoView();
      });
    } else {
      this.showChart = false;
      this.data = null;
    }
  }

  getCashClass() {
    if (this.cash >= this.startCash) {
      return 'green';
    } else if (this.cash > this.startCash / 2) {
      return 'orange';
    } else if (this.cash > 0) {
      return 'red';
    } else {
      return 'black';
    }
  }

  refresh() {
    this.start = false;
    this.minCash = null;
    this.maxCash = null;
    this.cash = this.startCash;
    this.objectif = null;
    this.state = null;
    this.nbBankruptcy = 0;
    this.nbVictory = 0;
    this.list = true;
  }

  retry() {
    this.state = null;
    this.martingale = this.prevMartingale;
    this.prevMartingale = null;
    this.cashHistory.length = 0;
    this.cash = this.startCash;
    this.minCash = this.startCash;
    this.maxCash = this.startCash;
  }
}
