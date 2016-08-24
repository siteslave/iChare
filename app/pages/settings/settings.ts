import {Component, OnInit} from '@angular/core';
import {Camera, Toast, SecureStorage, ActionSheet, SpinnerDialog} from 'ionic-native';
import {ModalController, Platform, NavController, NavParams, ViewController } from 'ionic-angular';
import * as _ from 'lodash';

import {Settings} from '../../providers/settings/settings';
import {Configure} from '../../providers/configure/configure';
import {Encrypt} from '../../providers/encrypt/encrypt';
import {BarcodePage} from '../barcode/barcode';

import {JwtHelper} from 'angular2-jwt';

interface SessionData {
  sessionKey?: any,
  token?: any,
  memberId?: any,
  fullname?: any
}

interface PatientData {
  age?: any,
  hash_key?: any,
  image?: any,
  is_default?: any,
  ptname?: any
}

interface AlertData {
  alert_news?: any;
  alert_appoint?: any;
  alert_service?: any;
}

interface httpData {
  ok: boolean,
  msg?: any,
  rows?: any,
  data?: Object
}

@Component({
  templateUrl: 'build/pages/settings/settings.html',
  directives: [],
  providers: [Configure, Settings, Encrypt]
})

export class SettingsPage implements OnInit {

  // localStorage: any;
  url: string;
  patients: any;
  token: any;
  selectedPatient;
  alertAppoint: boolean = false;
  alertNews: boolean = false;
  alertService: boolean = false;
  secureStorage: SecureStorage;
  sessionData;

  constructor(public nav: NavController,
    private config: Configure,
    private settings: Settings,
    private encrypt: Encrypt,
    private platform: Platform
  ) {
    // this.localStorage = new Storage(LocalStorage);
    this.url = this.config.getUrl();
    this.secureStorage = new SecureStorage();
    this.secureStorage.create('iChare')
      .then(() => { });

   }

  ngOnInit() {
  
  }

  ionViewDidEnter() {
    this.getPatient();  
    this.getAlertSetting();
  }

  getPatient() {

    SpinnerDialog.show('', 'กรุณารอซักครู่...');


    this.secureStorage.get('data')
      .then(sessionData => { 
        
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
        
        let url = `${this.url}/api/patient/members`;

        this.settings.getMemberPatients(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {

            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);
            let rows = <Array<any>>jsonData;

            this.patients = [];

            for (let row of rows) {
              let data = <PatientData>row;
              data.age = row.age;
              data.hash_key = row.hash_key;
              data.image = row.image;
              data.is_default = row.is_default;
              data.ptname = row.ptname;

              this.patients.push(data);
            }

            SpinnerDialog.hide();
            Toast.show("เสร็จเรียบร้อย", '2000', 'center').subscribe(toast => { });
            
          }, err => {
            console.log(err);
            SpinnerDialog.hide();
            // loading.dismiss();
            Toast.show("เกิดข้อผิดพลาด", '2000', 'center').subscribe(
              toast => {
                // console.log(toast);
              });
            
          });
        
      },
       error => console.log(error)
    ); 
    
  }

  setDefault(hashKey) {

    SpinnerDialog.show('', 'กรุณารอซักครู่...')
    
    let url = `${this.url}/api/patient/set-default`;

    this.secureStorage.get('data')
      .then(sessionData => {

        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token, hashKey: hashKey };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);

        this.settings.setDefault(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {
            let result = <httpData>data;
            if (result.ok) {
              SpinnerDialog.hide();
              Toast.show("เสร็จเรียบร้อย", '2000', 'center').subscribe(toast => { });
              this.getPatient();
            } else {
              console.log(result.msg);
              SpinnerDialog.hide();
              Toast.show("เกิดข้อผิดพลาด", '2000', 'center').subscribe(toast => { });
            }
          }, err => {
            console.log(err);
            SpinnerDialog.hide();
            Toast.show("เกิดข้อผิดพลาด", '2000', 'center').subscribe(toast => { });
          });
      });
  }

  // show action sheet
  showTakePhotoAction(hashKey) {

    let buttonLabels = ['แกลอรี่', 'กล้องถ่ายรูป'];
    ActionSheet.show({
      'title': 'เลือกที่มาของภาพ?',
      'buttonLabels': buttonLabels,
      'androidTheme': 3,
      'addCancelButtonWithLabel': 'ยกเลิก',
      'androidEnableCancelButton': true,
      // 'addDestructiveButtonWithLabel': 'Delete'
    }).then((buttonIndex: number) => {
      // console.log('Button pressed: ' + buttonIndex);
      if (buttonIndex == 1) {
        this.takePhotoWithGallery(hashKey)
      } else if (buttonIndex == 2) {
        this.takePhotoWithCamera(hashKey)
      } else {
        // no action
      }
      });
  }

  takePhotoWithCamera(hashKey) {
    this.platform.ready().then(() => {
      let options = {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 400,
        targetHeight: 400,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };

      Camera.getPicture(options).then((imageData) => {
        let base64Image = "data:image/jpeg;base64," + imageData;
        this.savePhoto(hashKey, base64Image);
      }, (err) => {
        Toast.show('เกิดข้อผิดพลาด : ' + JSON.stringify(err), '2000', 'center').subscribe(() => { });
      });
      
    });
  }

  takePhotoWithGallery(hashKey) {
    this.platform.ready().then(() => {
      let options = {
        quality: 80,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 400,
        targetHeight: 400,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };

      Camera.getPicture(options).then((imageData) => {
        let base64Image = "data:image/jpeg;base64," + imageData;
        this.savePhoto(hashKey, base64Image);
      }, (err) => {
        Toast.show('เกิดข้อผิดพลาด : ' + JSON.stringify(err), '2000', 'center').subscribe(() => { });
      });
      
    });
  }

  savePhoto(hashKey, image) {

    SpinnerDialog.show('', 'กำลังบันทึกรูปภาพ...');

    this.secureStorage.get('data')
      .then(sessionData => {

        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token, hashKey: hashKey, image: image };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
    
        let url = `${this.url}/api/patient/save-photo`;

        this.settings.savePhoto(url, this.sessionData.memberId, _encryptedParams)
          .then(() => {
            this.getPatient();
            SpinnerDialog.hide();
            
            Toast.show("เสร็จเรียบร้อย", '2000', 'center').subscribe(toast => { });
          }, err => {
            console.log(err);
            SpinnerDialog.hide();

            Toast.show("เกิดข้อผิดพลาด", '2000', 'center').subscribe(
              toast => { });
          });
      });
    
  }

  getBarcode(hashKey) {
    this.nav.push(BarcodePage, {hashKey: hashKey});
  }

  toggleAppoint() {
    // alert(this.alertAppoint);
    // type : 1 = news, 2 = appoint, 3 = service
    let status = this.alertAppoint ? 'Y' : 'N';
    let url = `${this.url}/api/member/toggle-alert`;

    this.secureStorage.get('data')
      .then(sessionData => {

        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token, type: 2, status: status };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
    
        SpinnerDialog.show('', 'กำลังบันทึก...');

        this.settings.setAlert(url, this.sessionData.memberId, _encryptedParams)
          .then(() => {
            SpinnerDialog.hide();
            Toast.show("เสร็จเรียบร้อย", '2000', 'center').subscribe(toast => { });
          }, err => {
            SpinnerDialog.hide();
            Toast.show("เกิดข้อผิดพลาด", '2000', 'center').subscribe(toast => { });
          });
      });
  
  }

  toggleService() {

   let status = this.alertAppoint ? 'Y' : 'N';
    let url = `${this.url}/api/member/toggle-alert`;

    this.secureStorage.get('data')
      .then(sessionData => {

        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token, type: 3, status: status };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
    
        SpinnerDialog.show('', 'กำลังบันทึก...');

        this.settings.setAlert(url, this.sessionData.memberId, _encryptedParams)
          .then(() => {
            SpinnerDialog.hide();
            Toast.show("เสร็จเรียบร้อย", '2000', 'center').subscribe(toast => { });
          }, err => {
            SpinnerDialog.hide();
            Toast.show("เกิดข้อผิดพลาด", '2000', 'center').subscribe(toast => { });
          });
      });
    
  }

  toggleNews() {
    let status = this.alertAppoint ? 'Y' : 'N';
    let url = `${this.url}/api/member/toggle-alert`;

    this.secureStorage.get('data')
      .then(sessionData => {

        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token, type: 1, status: status };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);
    
        SpinnerDialog.show('', 'กำลังบันทึก...');

        this.settings.setAlert(url, this.sessionData.memberId, _encryptedParams)
          .then(() => {
            SpinnerDialog.hide();
            Toast.show("เสร็จเรียบร้อย", '2000', 'center').subscribe(toast => { });
          }, err => {
            SpinnerDialog.hide();
            Toast.show("เกิดข้อผิดพลาด", '2000', 'center').subscribe(toast => { });
          });
      });
  }

  getAlertSetting() {

    let url = `${this.url}/api/member/get-alert-setting`;
    this.secureStorage.get('data')
      .then(sessionData => {
      
        let _sessionData = JSON.parse(sessionData);
        this.sessionData = <SessionData>_sessionData;
        let _params = { token: this.sessionData.token, type: 1, status: status };
        let _encryptedParams = this.encrypt.encrypt(_params, this.sessionData.sessionKey);

        this.settings.getAlertSetting(url, this.sessionData.memberId, _encryptedParams)
          .then(data => {

            let decryptedText = this.encrypt.decrypt(data, this.sessionData.sessionKey);
            let _decryptedText = <string>decryptedText;
            let jsonData = JSON.parse(_decryptedText);
            let rows = <Array<any>>jsonData;
            let _alert = <AlertData>rows[0];

            this.alertAppoint = _alert.alert_appoint == 'Y' ? true : false;
            this.alertNews = _alert.alert_news == 'Y' ? true : false;
            this.alertService = _alert.alert_service == 'Y' ? true : false;

          }, err => {
            console.log(err);
          });
        
      });
  }
  

}

