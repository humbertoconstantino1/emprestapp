import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import {
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { arrowBackOutline } from 'ionicons/icons';
import { CardComponent } from '../components/card/card.component';
import { NewEmprestimoComponent } from '../pages/new-emprestimo/new-emprestimo.component';
import { RelatorioComponent } from '../pages/relatorio/relatorio.component';

@Component({
  selector: 'app-folder',
  templateUrl: './folder.page.html',
  styleUrls: ['./folder.page.scss'],
  imports: [
    RouterLink,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonButton,
    IonIcon,
    CardComponent,
    NewEmprestimoComponent,
    RelatorioComponent,
  ],
})
export class FolderPage implements OnInit {
  public folder!: string;
  private activatedRoute = inject(ActivatedRoute);

  constructor() {
    addIcons({ arrowBackOutline });
  }

  ngOnInit() {
    this.folder = this.activatedRoute.snapshot.paramMap.get('id') as string;
  }
}
