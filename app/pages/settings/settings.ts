import {Component} from '@angular/core';
import {Modal, Platform, NavController, NavParams, ViewController} from 'ionic-angular';
import {QRCodeComponent} from 'ng2-qrcode';

/*
  Generated class for the SettingsPage page.

  See http://ionicframework.com/docs/v2/components/#navigation for more info on
  Ionic pages and navigation.
*/
@Component({
  templateUrl: 'build/pages/settings/settings.html',
  directives: [QRCodeComponent] 
})
export class SettingsPage {
  constructor(public nav: NavController) { }
  
    openModal() {
      let modal = Modal.create(ModalsContentPage);
      this.nav.present(modal);
    }

}

@Component({
  templateUrl: './build/pages/settings/qrcode.html',
  directives: [QRCodeComponent] 
})
class ModalsContentPage {
  character;

  constructor(
      public platform: Platform,
      public params: NavParams,
      public viewCtrl: ViewController
  ) {
    
  }

  dismiss() {
    this.viewCtrl.dismiss();
  }
}
