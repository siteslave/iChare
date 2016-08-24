import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Platform} from 'ionic-angular';
import {SecureStorage, SpinnerDialog, Toast} from 'ionic-native';

import {OutPatientPage} from '../out-patient/out-patient';
import {SettingsPage} from '../settings/settings';
import {AllergyPage} from '../allergy/allergy';
import {PttypePage} from '../pttype/pttype';
import {VaccinePage} from '../vaccine/vaccine';
import {ScreeningPage} from '../screening/screening';
import {LabPage} from '../lab/lab';
import {DrugPage} from '../drug/drug';
import {IpdPage} from '../ipd/ipd';
import {AboutPage} from '../about/about';
import {PrivacyPage} from '../privacy/privacy';

import {LoginPage} from '../login/login';
import {Login} from '../../providers/login/login';
import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

@Component({
  templateUrl: 'build/pages/home/home.html',
  providers: [Login, Configure, Encrypt]
})
export class HomePage {
  isAndroid: boolean = false;
  secureStorage: SecureStorage;
  url;
  sessionData;
  
  constructor(
    public nav: NavController,
    platform: Platform,
    private login: Login,
    private encrypt: Encrypt,
    private config: Configure
  ) {
    this.isAndroid = platform.is('android');
    this.url = this.config.getUrl();
    
    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
          .then(() => { });
    
  }
  
  goLogout() {
    SpinnerDialog.show('', 'ออกจากระบบ...');
    
    this.secureStorage.get('data')
      .then(sessionData => {
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
      
        return this.login.logout(this.url, this.sessionData.memberId, _encryptedParams);
      })
      .then(() => {
        this.secureStorage.remove('data')
          .then(() => {
            SpinnerDialog.hide();
            this.nav.setRoot(LoginPage);
          });
      }, err => {
        SpinnerDialog.hide();
        Toast.show('เกิดข้อผิดพลาด', '2000', 'center').subscribe(() => { });
      });
  }

  goPrivacy() {
    this.nav.push(PrivacyPage);
  };
  
  goAbout() {
    this.nav.push(AboutPage);
  };
  
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
