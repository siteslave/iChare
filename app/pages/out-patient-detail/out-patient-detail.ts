import {Component} from '@angular/core';
import {NavController} from 'ionic-angular';
import {Platform} from 'ionic-angular';
/*
  Generated class for the OutPatientDetailPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/out-patient-detail/out-patient-detail.html',
})

  
export class OutPatientDetailPage {

 pet: string = "puppies";
 isAndroid: boolean = false;
  
  constructor(public nav: NavController, platform: Platform) { 
    this.isAndroid = platform.is('android');
  };

}
