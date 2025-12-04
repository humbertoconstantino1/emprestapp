import { Component, input, output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonButton,
  IonIcon,
  IonModal,
  IonContent,
  IonItem,
  IonTextarea,
  IonDatetime,
  IonDatetimeButton,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  person,
  calendarOutline,
  documentTextOutline,
  createOutline,
  checkmarkDoneOutline,
  alertCircle,
  checkmarkCircle,
  chatbubbleOutline,
  checkmarkOutline,
  helpCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    IonCard,
    IonCardContent,
    IonCardHeader,
    IonCardSubtitle,
    IonCardTitle,
    IonButton,
    IonIcon,
    IonModal,
    IonContent,
    IonItem,
    IonTextarea,
    IonDatetime,
    IonDatetimeButton,
  ],
})
export class CardComponent implements OnInit {
  // Inputs
  atrased = input<boolean>(false);
  firstName = input<string>('');
  observation = input<string>('');
  valor = input<number>(0);
  dataVencimento = input<string>('');
  emprestimoId = input<number>(0);

  // Outputs
  finalize = output<number>();
  update = output<{ id: number; novaDataVencimento: string; comentario: string }>();

  // Modal state
  isModalOpen = false;
  isConfirmModalOpen = false;
  updateForm: FormGroup;

  constructor(private fb: FormBuilder) {
    addIcons({
      personOutline,
      person,
      calendarOutline,
      documentTextOutline,
      createOutline,
      checkmarkDoneOutline,
      alertCircle,
      checkmarkCircle,
      chatbubbleOutline,
      checkmarkOutline,
      helpCircleOutline,
    });

    this.updateForm = this.fb.group({
      novaDataVencimento: [''],
      comentario: [''],
    });
  }

  ngOnInit() {
    // Inicializa o form com a data atual do empréstimo
    this.updateForm.patchValue({
      novaDataVencimento: this.dataVencimento() || new Date().toISOString(),
    });
  }

  openUpdateModal() {
    this.updateForm.patchValue({
      novaDataVencimento: this.dataVencimento() || new Date().toISOString(),
      comentario: '',
    });
    this.isModalOpen = true;
  }

  closeModal() {
    this.isModalOpen = false;
  }

  submitUpdate() {
    const formValue = this.updateForm.value;
    this.update.emit({
      id: this.emprestimoId(),
      novaDataVencimento: formValue.novaDataVencimento,
      comentario: formValue.comentario,
    });
    this.closeModal();
  }

  onFinalize() {
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal() {
    this.isConfirmModalOpen = false;
  }

  confirmFinalize() {
    this.finalize.emit(this.emprestimoId());
    this.isConfirmModalOpen = false;
  }
}
