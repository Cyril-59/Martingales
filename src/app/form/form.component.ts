import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Roulette } from '../roulette';

@Component({
  selector: 'app-form',
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.css']
})
export class FormComponent implements OnInit {

  mise = 2;
  // gain = 1;
  mini = 0;
  luck = 0;
  gap = 2;
  titre = '';
  croissant = false;
  maxi = 1000000;
  try = 100;

  @Output()
  roulette = new EventEmitter<Roulette>();

  @Output()
  onCancel = new EventEmitter<void>();

  constructor() { }

  ngOnInit(): void {
  }

  click() {
    const gain = 36 / this.luck
    this.roulette.emit(new Roulette(this.mise, gain, 1 - this.luck / 37, this.titre, this.mini, this.gap, this.croissant, this.maxi, this.try));
    console.log("this.martingales.push(new Roulette(" + this.mise + ", " + gain + ", " + (1 - this.luck / 37) + ", '" + this.titre + "', " + this.mini +  "', " + this.gap + "', " + this.croissant + "', " + this.maxi + "', " + this.try +"));");
  }

  cancel() {
    this.onCancel.emit();
  }
}
