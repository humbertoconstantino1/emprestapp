import { Component, input, OnInit } from '@angular/core';
import {IonCardTitle,IonCardSubtitle,IonCardHeader,IonCardContent,IonCard,IonButton} from '@ionic/angular/standalone';
@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  imports:[IonCard, IonCardContent, IonCardHeader, IonCardSubtitle, IonCardTitle,IonButton]
})
export class CardComponent  implements OnInit {

  atrased = input<boolean>();
  firstName = input<string>();
  observation = input<string>();
  constructor() { }

  ngOnInit() {}

}
