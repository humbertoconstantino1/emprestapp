import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle, IonContent, IonGrid,IonRow,IonCol,IonCardTitle,IonCardSubtitle,IonCardHeader,IonCardContent,IonCard,IonButton} from '@ionic/angular/standalone';
import { CardComponent } from '../components/card/card.component';
import { NewEmprestimoComponent } from '../pages/new-emprestimo/new-emprestimo.component';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  imports: [IonHeader, IonToolbar, IonButtons, IonMenuButton, IonTitle,   IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  CardComponent,
  NewEmprestimoComponent
],
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);
  constructor() {}

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }
}
