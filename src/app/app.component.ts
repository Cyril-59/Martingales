import { Component, OnInit, ViewChild } from '@angular/core';
import { Roulette, RouletteType, Methode } from './roulette';
import { SelectItem } from 'primeng/api/selectitem';
import { UIChart } from 'primeng/chart';
import { SelectItemGroup } from 'primeng/api/public_api';
import { MartingaleComponent } from './martingale/martingale.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Martingale';

  martingales: Roulette[] = [];
  options: SelectItem[] = [];
  groupedOptions: SelectItemGroup[];
  listOptions: SelectItem[] = [];
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
  showInfo = false;
  
  showParams = false;
  historySize = 13;
  guessSize = null;
  quietMode = false;
  tabSize = 5;
  lastTabSize = 5;
  guessScore = 0;
  randomScore = 0;
  lastNumbers: number[] = [];

  @ViewChild(UIChart)
  chartComp: UIChart;

  @ViewChild(MartingaleComponent)
  childMartingale: MartingaleComponent;

  ngOnInit() {
    this.initGroup();

    this.ajouter(new Roulette(RouletteType.TIERS, 2, 3, 25/37, 'Tiers Min 4', 4));
    this.ajouter(new Roulette(RouletteType.TIERS, 2, 3, 25/37, 'Tiers Croissant', 4, 2, true));
    this.ajouter(new Roulette(RouletteType.TIERS, 4, 3, 25/37, 'Tiers Max 32', 8, 2, false, 32));
    this.ajouter(new Roulette(RouletteType.TIERS, 12, 3, 25/37, 'Tiers Cylindre', 1, 12, false));
    //this.ajouter(new Roulette(RouletteType.TIERS, 8, 3, 25/37, 'Tiers Transversales', 1, 8, false));
    //this.ajouter(new Roulette(RouletteType.TIERS, 12, 3, 25/37, 'Tiers Max Try 5', 1, 12, false, 100, 5));
    //this.ajouter(new Roulette(RouletteType.TIERS, 12, 3, 25/37, 'Tiers Dynamic', 1, 12, false, 100, 2, true));

    this.ajouter(new Roulette(RouletteType.DEMI, 4, 2, 19/37, 'Demi Min 4', 4));
    this.ajouter(new Roulette(RouletteType.DEMI, 2, 2, 19/37, 'Demi Gain', 1, 2, true));
    this.ajouter(new Roulette(RouletteType.DEMI, 12, 2, 19/37, 'Demi Gap 12', 1, 12, false));

    this.ajouter(new Roulette(RouletteType.DOUBLE_TIERS, 4, 1.5, 13/37, 'Deux-Tiers Min 4', 4, 4));
    this.ajouter(new Roulette(RouletteType.DOUBLE_TIERS, 4, 1.5, 13/37, 'Deux-Tiers Gain', 1, 4, true));
    this.ajouter(new Roulette(RouletteType.DOUBLE_TIERS, 24, 1.5, 13/37, 'Deux-Tiers Gap 24', 1, 24, false));

    this.ajouter(new Roulette(RouletteType.CARRE, 2, 9, 33/37, 'Carre', 8, 2, false));
    this.ajouter(new Roulette(RouletteType.CARRE, 4, 4.5, 29/37, 'DoubleCarre', 8, 4, false));
    //this.ajouter(new Roulette(RouletteType.CARRE, 6, 3, 25/37, 'TripleCarre', 2, 6, false));
    this.ajouter(new Roulette(RouletteType.CARRE, 8, 2.25, 21/37, 'QuadriCarre', 4, 8, false));

    this.ajouter(new Roulette(RouletteType.ZONE, 12, 3, 25/37, 'Tiers Cylindre', 1, 12, false));
    this.ajouter(new Roulette(RouletteType.ZONE, 10, 2.6, 29/37, 'Orphelins', 1, 10, false));
    this.ajouter(new Roulette(RouletteType.ZONE, 18, 2, 20/37, 'Voisins Zéro', 1, 18, false));
    this.ajouter(new Roulette(RouletteType.ZONE, 8, 3.5, 30/37, 'Jeu Zéro', 1, 8, false));

    this.ajouter(new Roulette(RouletteType.AUTRE, 2, 36, 36/37, 'Single', 2, 2, false, 100, 1000));

    this.ajouter(new Roulette(RouletteType.METHODE, null, 2, 19/37, 'Labouchère').withMethod(Methode.LABOUCHERE));
    this.ajouter(new Roulette(RouletteType.METHODE, null, 2, 19/37, 'Labouchère inv').withMethod(Methode.LABOUCHERE_INVERSEE));
    this.ajouter(new Roulette(RouletteType.METHODE, null, 2, 19/37, 'Fibonacci').withMethod(Methode.FIBONACCI));
  }

  initGroup() {
  this.groupedOptions = [
    {
      label: 'Tiers',
      value: RouletteType.TIERS,
      items: [
      ]
    },
    {
      label: 'Demi',
      value: RouletteType.DEMI,
      items: [
      ]
    },
    {
      label: 'Double Tiers',
      value: RouletteType.DOUBLE_TIERS,
      items: [
      ]
    },
    {
      label: 'Carrés',
      value: RouletteType.CARRE,
      items: [
      ]
    },
    {
      label: 'Zones',
      value: RouletteType.ZONE,
      items: [
      ]
    },
    {
      label: 'Méthodes',
      value: RouletteType.METHODE,
      items: [
      ]
    },
    {
      label: 'Autres',
      value: RouletteType.AUTRE,
      items: [
      ]
    }
  ];
}

  ajouter(roulette: Roulette, select = false) {
    this.init = false;
    this.martingales.push(roulette);
    switch (roulette.type) {
      case RouletteType.TIERS:
        this.groupedOptions[0].items.push({value: roulette.titre, label: roulette.titre});
        break;
      case RouletteType.DEMI:
        this.groupedOptions[1].items.push({value: roulette.titre, label: roulette.titre});
        break;
      case RouletteType.DOUBLE_TIERS:
        this.groupedOptions[2].items.push({value: roulette.titre, label: roulette.titre});
        break;
      case RouletteType.CARRE:
        this.groupedOptions[3].items.push({value: roulette.titre, label: roulette.titre});
        break;
      case RouletteType.ZONE:
        this.groupedOptions[4].items.push({value: roulette.titre, label: roulette.titre});
        break;
      case RouletteType.METHODE:
        this.groupedOptions[5].items.push({value: roulette.titre, label: roulette.titre});
        break;
      case RouletteType.AUTRE:
        this.groupedOptions[6].items.push({value: roulette.titre, label: roulette.titre});
        break;
    }
    this.listOptions.push({value: roulette.titre, label: roulette.titre});
    this.add = false;
    if (select) {
      this.select({ value: this.martingales[this.martingales.length - 1].titre });
    }
    setTimeout(() => this.init = true);
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
    this.showChart = false;
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

  back() {
    this.cashHistory.pop();
    this.chart();
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
            borderColor: '#ffa000'
          }, {
              label: 'Cash-in',
              data: Array(this.cashHistory.length).fill(this.startCash),
              fill: false,
              borderColor: '#da7070'
          }, {
            label: 'Cash-out',
            data: Array(this.cashHistory.length).fill(this.objectif),
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
    if (!this.quietMode) {
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
    return '';
  }

  refresh() {
    this.start = false;
    this.minCash = null;
    this.maxCash = null;
    this.cash = this.startCash;
    this.state = null;
    this.nbBankruptcy = 0;
    this.nbVictory = 0;
    this.list = true;
  }

  retry() {
    this.state = null;
    this.martingale = this.prevMartingale;
    if (this.martingale.gainCroissant) {
      this.martingale.gainMini = 4;
    }
    this.prevMartingale = null;
    this.cashHistory.length = 0;
    this.cash = this.startCash;
    this.minCash = this.startCash;
    this.maxCash = this.startCash;
    this.showChart = false;
  }

  params() {
    this.showParams = true;
  }

  onQuiet() {
    if (this.quietMode) {
      this.lastTabSize = this.tabSize;
      this.tabSize = 15;
    } else {
      this.tabSize = this.lastTabSize;
    }
    this.showParams = false;
  }
}
