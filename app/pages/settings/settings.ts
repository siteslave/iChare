import {Component, OnInit} from '@angular/core';
import {Camera} from 'ionic-native';
import {Modal, ActionSheet, Loading, Platform, NavController, NavParams, ViewController, Storage, LocalStorage} from 'ionic-angular';
import * as _ from 'lodash';

import {Patient} from '../../providers/patient/patient';
import {Configure} from '../../providers/configure/configure';
import {JwtHelper} from 'angular2-jwt';
import {Encrypt} from '../../providers/encrypt/encrypt';

/*
  Generated class for the SettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/settings/settings.html',
  directives: [],
  providers: [Configure, Patient, Encrypt]
})
export class SettingsPage implements OnInit {

  localStorage: any;
  url: string;
  patients: any;
  selectedPatient;

  constructor(public nav: NavController,
    private config: Configure, 
    private patient: Patient,
    private encrypt: Encrypt,
    private platform: Platform
  ) {
    this.localStorage = new Storage(LocalStorage);
    this.url = this.config.getUrl();    
   }

  ngOnInit() {

    // put this inside a method
    let loading = Loading.create({
      content: 'Please wait...'
    });
    
    this.nav.present(loading);
    let getToken = this.localStorage.get('token');
    getToken.then(token => {
      // console.log(token);
      // get member patients
      let url = `${this.url}/api/v1/patient/members?token=${token}`;
      this.patient.getMemberPatients(url)
        .then(data => {
          // console.log(data);
          let encryptedData = data.data;
          // let secretKey = this.config.getSecretKey();
          let decryptText = this.encrypt.decrypt(encryptedData);
          let jsonData = JSON.parse(decryptText);
          // console.log(jsonData);
          this.patients = jsonData;

          this.setSelectedPatient();

          loading.dismiss();
        });
    });
  }
  
  setSelectedPatient() {
    this.localStorage.get('patient')
      .then(patient => {
        if (patient) {
          let _patient = JSON.parse(patient);
          let hn = _patient.hn;

          this.selectedPatient = hn;

        }
      });
  }

  selectPatient() {
    // console.log(this.selectedPatient);
    let idx = _.findIndex(this.patients, { hn: this.selectedPatient });
    if (idx > -1) {
      this.localStorage.set('patient', JSON.stringify(this.patients[idx]));
    }
	  
  }  
  
  // show action sheet
  showTakePhotoAction() {
    let actionSheet = ActionSheet.create({
      title: 'เลือกที่มาของภาพถ่าย',
      cssClass:'action-sheets-basic-page',
      buttons: [
        {
          text: 'แกลอรี่',
          icon: !this.platform.is('ios') ? 'image' : null,
          // role: 'destructive',
          handler: () => {
            this.takePhotoWithGallery()
          }
        }, {
          text: 'กล้อง',
          icon: !this.platform.is('ios') ? 'camera' : null,
          handler: () => {
            this.takePhotoWithCamera()
          }
        }, {
          text: 'ยกเลิก',
          // icon: !this.platform.is('ios') ? 'clear' : null,
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }
      ]
    });
    
  this.nav.present(actionSheet);
  }

  takePhotoWithCamera() {
    this.platform.ready().then(() => {
      let options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.CAMERA,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 100,
        targetHeight: 100,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };


      Camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = "data:image/jpeg;base64," + imageData;
        
      }, (err) => {
      });
    });
  }

  takePhotoWithGallery() {
    this.platform.ready().then(() => {
      let options = {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL,
        sourceType: Camera.PictureSourceType.PHOTOLIBRARY,
        allowEdit: true,
        encodingType: Camera.EncodingType.JPEG,
        targetWidth: 100,
        targetHeight: 100,
        saveToPhotoAlbum: false,
        correctOrientation: true
      };


      Camera.getPicture(options).then((imageData) => {
        // imageData is either a base64 encoded string or a file URI
        // If it's base64:
        let base64Image = "data:image/jpeg;base64," + imageData;
        
      }, (err) => {
      });
    });
  }

}

