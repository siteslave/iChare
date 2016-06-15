import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {BloodPressurePage} from '../blood-pressure/blood-pressure';

@Component({
  templateUrl: 'build/pages/dash/dash.html',
})
  
export class DashPage {

  constructor(public nav: NavController) { }

   goBloodPressure() {
      this.nav.push(BloodPressurePage)
  };

  
}
