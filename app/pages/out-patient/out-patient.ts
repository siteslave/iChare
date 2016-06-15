import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {OutPatientDetailPage} from '../out-patient-detail/out-patient-detail';
/*
  Generated class for the OutPatientPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/out-patient/out-patient.html',
})
export class OutPatientPage {
  constructor(public nav: NavController) { }
  
  gotoDetail() {
    this.nav.push(OutPatientDetailPage)
  }

  doRefresh(refresher) {
    console.log('Begin async operation', refresher);

    setTimeout(() => {
      console.log('Async operation has ended');
      refresher.complete();
    }, 2000);
  
  }
}