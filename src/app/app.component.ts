import { Component, OnInit } from '@angular/core';
import { Roulette } from './roulette';
import { SelectItem } from 'primeng/api/selectitem';

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
  startCash: number;
  cashHistory: number[] = [];
  data: any;
  showChart = false;
  start = false;

  ngOnInit() {
    this.ajouter(new Roulette(2, 3, 25/37, 'Tiers'));
    this.ajouter(new Roulette(2, 3, 25/37, 'Tiers Gain Mini 1', 1));
    this.ajouter(new Roulette(2, 3, 25/37, 'Tiers Gain Mini 3', 3));
    this.ajouter(new Roulette(2, 3, 25/37, 'Tiers Gain Croissant', 3, 2, true));
    this.ajouter(new Roulette(4, 3, 25/37, 'Tiers Max 32', 8, 2, false, 32));
    this.ajouter(new Roulette(12, 3, 25/37, 'Tiers Cylindre', 1, 12, false));

    this.ajouter(new Roulette(2, 2, 19/37, 'Demi'));
    this.ajouter(new Roulette(2, 2, 19/37, 'Demi Gain Mini 1', 1));
    this.ajouter(new Roulette(2, 2, 19/37, 'Demi Gain Croissant', 1, 2, true));

    this.ajouter(new Roulette(4, 1.5, 13/37, 'Deux-Tiers', 0, 4));
    this.ajouter(new Roulette(4, 1.5, 13/37, 'Deux-Tiers Gain Mini 1', 1, 4));
    this.ajouter(new Roulette(4, 1.5, 13/37, 'Deux-Tiers Croissant', 1, 4, true));

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

  initHistory() {
    if (this.cash) {
      this.startCash = this.cash;
      this.start = true;
      this.cashHistory.length = 0;
      this.cashHistory.push(this.cash);
      this.chart();
    }
  }

  substract(mise: number) {
    this.cash -= mise;
    this.cashHistory.push(this.cash);
    this.chart();
  }

  win(gain: number) {
    this.cash += gain;
    this.cashHistory.push(this.cash);
    this.chart();
  }

  chart() {
    if (this.cashHistory.length > 1) {
      //if (!this.data) {
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
      /*} else {
          // TODO
      }*/
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
}
