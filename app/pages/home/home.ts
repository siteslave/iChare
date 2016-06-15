import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';

import {OutPatientPage} from '../out-patient/out-patient';

/*
  Generated class for the HomePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/home/home.html',
})
export class HomePage {
  constructor(public nav: NavController) { }
  
  goOutPatient() {
      this.nav.push(OutPatientPage)
  };

}
