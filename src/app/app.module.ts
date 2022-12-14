import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { ButtonModule } from 'primeng/button';
import { ChartModule } from 'primeng/chart';
import { CheckboxModule } from 'primeng/checkbox';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ListboxModule } from 'primeng/listbox';
import { DialogModule } from 'primeng/dialog';
import { InputSwitchModule } from 'primeng/inputswitch';
import { TooltipModule } from 'primeng/tooltip';
import { SliderModule } from 'primeng/slider';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MartingaleComponent } from './martingale/martingale.component';
import { FormComponent } from './form/form.component';
import { from } from 'rxjs';

import { DropdownModule } from 'primeng/dropdown';
import { RouletteComponent } from './roulette/roulette.component';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';

@NgModule({
  declarations: [
    AppComponent,
    MartingaleComponent,
    FormComponent,
    RouletteComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    FormsModule,
    DropdownModule,
    ListboxModule,
    TableModule,
    InputTextModule,
    ButtonModule,
    ChartModule,
    ToggleButtonModule,
    SelectButtonModule,
    CheckboxModule,
    DialogModule,
    InputSwitchModule,
    TooltipModule,
    SliderModule,
    ServiceWorkerModule.register('ngsw-worker.js', { enabled: environment.production })
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
