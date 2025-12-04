import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import {
  IonContent,
  IonButton,
  IonItem,
  IonTextarea,
  IonInput,
  IonDatetime,
  IonSelect,
  IonSelectOption,
  IonModal,
  IonDatetimeButton,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  personOutline,
  callOutline,
  cashOutline,
  trendingUpOutline,
  locationOutline,
  calendarOutline,
  documentTextOutline,
  checkmarkCircleOutline,
  arrowBackOutline,
  addCircleOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-new-emprestimo',
  templateUrl: './new-emprestimo.component.html',
  styleUrls: ['./new-emprestimo.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ReactiveFormsModule,
    IonContent,
    IonButton,
    IonItem,
    IonTextarea,
    IonInput,
    IonDatetime,
    IonSelect,
    IonSelectOption,
    IonModal,
    IonDatetimeButton,
    IonCard,
    IonCardContent,
    IonIcon,
    IonSpinner,
  ],
})
export class NewEmprestimoComponent implements OnInit {
  clientForm: FormGroup;
  isLoading = false;

  constructor(private fb: FormBuilder, private router: Router) {
    addIcons({
      personOutline,
      callOutline,
      cashOutline,
      trendingUpOutline,
      locationOutline,
      calendarOutline,
      documentTextOutline,
      checkmarkCircleOutline,
      arrowBackOutline,
      addCircleOutline,
    });

    this.clientForm = this.fb.group({
      nome: ['', Validators.required],
      telefone: ['', Validators.required],
      valor: [null, [Validators.required, Validators.min(1)]],
      juros: [null, Validators.required],
      endereco: [''],
      dataVencimento: ['', Validators.required],
      observacoes: [''],
    });
  }

  ngOnInit() {}

  submitForm() {
    if (this.clientForm.valid) {
      this.isLoading = true;
      console.log('Formulário enviado:', this.clientForm.value);

      // Simular envio para API
      setTimeout(() => {
        this.isLoading = false;
        this.router.navigate(['/home']);
      }, 1500);
    }
  }
}
