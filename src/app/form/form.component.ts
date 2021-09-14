import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Roulette, RouletteType } from '../roulette';
import { SelectItem } from 'primeng/api/selectitem';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  mise = 2;
  // gain = 1;
  mini = 0;
  luck = 12;
  gap = 2;
  titre = '';
  croissant = false;
  maxi = 1000;
  try = 100;
  dynamic = false;
  type: RouletteType = RouletteType.TIERS;
  options: SelectItem[] = [];

  @Output()
  roulette = new EventEmitter<Roulette>();

  @Output()
  onCancel = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
    let cpt = 0;
    for (const rouletteType of  Object.keys(RouletteType).filter((item) => { return isNaN(Number(item));})) {
      this.options.push({value: cpt, label: rouletteType.toString()});
      cpt++;
    }
  }

  selectType(type) {
    this.type = type.value;
    switch(this.type) {
      case 0:
        this.luck = 12;
        break;
      case 1:
        this.luck = 18;
        break;
      case 2:
        this.luck = 24;
        break;
    }
  }

  click() {
    const gain = 36 / this.luck;
    if (this.croissant) {
      this.maxi = 1000000;
    }
    this.roulette.emit(new Roulette(this.type, this.mise, gain, 1 - this.luck / 37, this.titre, this.mini, this.gap, this.croissant, this.maxi, this.try, this.dynamic));
    console.log("this.martingales.push(new Roulette(" + this.mise + ", " + gain + ", " + (1 - this.luck / 37) + ", '" + this.titre + "', " + this.mini +  "', " + this.gap + "', " + this.croissant + "', " + this.maxi + "', " + this.try + "', " + this.dynamic + "));");
  }

  cancel() {
    this.onCancel.emit();
  }
}
