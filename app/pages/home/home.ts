import {Component} from '@angular/core';
import {NavController, Storage, LocalStorage} from 'ionic-angular';
import {Platform} from 'ionic-angular';

import {OutPatientPage} from '../out-patient/out-patient';
import {SettingsPage} from '../settings/settings';

/*
  Generated class for the HomePage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/home/home.html',
})
export class HomePage {
  localStorage: any;
  isAndroid: boolean = false;
  patientHn: any;


  constructor(public nav: NavController, platform: Platform) {
    this.isAndroid = platform.is('android');
  }
  
  goOutPatient() {
      this.nav.push(OutPatientPage)
  };

}
