import {Component} from '@angular/core';
import {NavController, Storage, LocalStorage} from 'ionic-angular';
import {Platform} from 'ionic-angular';

import {OutPatientPage} from '../out-patient/out-patient';
import {SettingsPage} from '../settings/settings';
import {AllergyPage} from '../allergy/allergy';
import {PttypePage} from '../pttype/pttype';
import {VaccinePage} from '../vaccine/vaccine';
import {ScreeningPage} from '../screening/screening';
import {LabPage} from '../lab/lab';
import {DrugPage} from '../drug/drug';
import {IpdPage} from '../ipd/ipd';


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
    this.nav.push(OutPatientPage);
  };

  goAllergy() {
    this.nav.push(AllergyPage);
  }

  goPttype() {
    this.nav.push(PttypePage);
  }

  goVaccine() {
    this.nav.push(VaccinePage);
  }

  goScreening() {
    this.nav.push(ScreeningPage);
  }

  goLab() {
    this.nav.push(LabPage);
  }

  goDrug() {
    this.nav.push(DrugPage);
  }

  goIpd() {
    this.nav.push(IpdPage);
  }

}
