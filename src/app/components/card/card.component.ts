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
  IonInput,
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
  checkmarkCircleOutline,
  alertCircle,
  checkmarkCircle,
  chatbubbleOutline,
  checkmarkOutline,
  helpCircleOutline,
  refreshOutline,
  cashOutline,
  trashOutline,
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
    IonInput,
    IonTextarea,
  ],
})
export class CardComponent implements OnInit {
  // Inputs
  atrased = input<boolean>(false);
  firstName = input<string>('');
  observation = input<string>('');
  valor = input<number>(0);
  juros = input<number>(0);
  dataVencimento = input<string>('');
  emprestimoId = input<number>(0);

  // Outputs
  finalize = output<number>();
  update = output<{ id: number; novaDataVencimento: string; dataPagamento: string; comentario: string }>();
  renew = output<{ id: number; tipoPagamento: 'juros' | 'total' }>();
  delete = output<number>();

  // Modal state
  isModalOpen = false;
  isConfirmModalOpen = false;
  isRenewModalOpen = false;
  isRenewConfirmModalOpen = false;
  isDeleteModalOpen = false;
  selectedRenewType: 'juros' | 'total' | null = null;
  updateForm: FormGroup;

  constructor(private fb: FormBuilder) {
    addIcons({
      personOutline,
      person,
      calendarOutline,
      documentTextOutline,
      createOutline,
      checkmarkDoneOutline,
      checkmarkCircleOutline,
      alertCircle,
      checkmarkCircle,
      chatbubbleOutline,
      checkmarkOutline,
      helpCircleOutline,
      refreshOutline,
      cashOutline,
      trashOutline,
    });

    this.updateForm = this.fb.group({
      novaDataVencimento: [''],
      dataPagamento: [''],
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
      dataPagamento: formValue.dataPagamento,
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

  openRenewModal() {
    this.isRenewModalOpen = true;
  }

  closeRenewModal() {
    this.isRenewModalOpen = false;
  }

  renewLoan(tipoPagamento: 'juros' | 'total') {
    // Abre modal de confirmação ao invés de executar diretamente
    this.selectedRenewType = tipoPagamento;
    this.isRenewConfirmModalOpen = true;
  }

  confirmRenewLoan() {
    if (this.selectedRenewType) {
      this.renew.emit({
        id: this.emprestimoId(),
        tipoPagamento: this.selectedRenewType,
      });
      this.closeRenewConfirmModal();
      this.closeRenewModal();
      this.closeModal();
    }
  }

  closeRenewConfirmModal() {
    this.isRenewConfirmModalOpen = false;
    this.selectedRenewType = null;
  }

  onDelete() {
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal() {
    this.isDeleteModalOpen = false;
  }

  confirmDelete() {
    this.delete.emit(this.emprestimoId());
    this.isDeleteModalOpen = false;
  }

  get valorJuros(): number {
    const valor = parseFloat(String(this.valor())) || 0;
    const jurosPercentual = parseFloat(String(this.juros())) || 0;
    const jurosDecimal = jurosPercentual / 100;
    const resultado = valor * jurosDecimal;
    // Arredonda para 2 casas decimais para evitar problemas de precisão
    return Math.round(resultado * 100) / 100;
  }

  get valorTotalComJuros(): number {
    const valor = parseFloat(String(this.valor())) || 0;
    const juros = this.valorJuros;
    const resultado = valor + juros;
    // Arredonda para 2 casas decimais para evitar problemas de precisão
    return Math.round(resultado * 100) / 100;
  }
}
