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
  IonSelect,
  IonSelectOption,
  IonCard,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonText,
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
import { LoanService, CreateLoanDto } from '../../services/loan.service';

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
    IonSelect,
    IonSelectOption,
    IonCard,
    IonCardContent,
    IonIcon,
    IonSpinner,
    IonText,
  ],
})
export class NewEmprestimoComponent implements OnInit {
  clientForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private loanService: LoanService
  ) {
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
      telefone: [''],
      valor: [null, [Validators.required, Validators.min(1)]],
      juros: [null],
      endereco: [''],
      dataVencimento: ['', Validators.required],
      observacoes: [''],
    });
  }

  ngOnInit() {
    // Define a data padrão como um mês a partir de hoje
    const today = new Date();
    const nextMonth = new Date(today);
    nextMonth.setMonth(today.getMonth() + 1);
    
    // Formata para YYYY-MM-DD (formato do input type="date")
    const defaultDate = nextMonth.toISOString().split('T')[0];
    
    this.clientForm.patchValue({
      dataVencimento: defaultDate
    });
  }

  submitForm() {
    if (this.clientForm.valid) {
      this.isLoading = true;
      this.errorMessage = '';

      const formValue = this.clientForm.value;

      // Formata a data para YYYY-MM-DD
      let dataVencimento = formValue.dataVencimento;
      if (dataVencimento) {
        const date = new Date(dataVencimento);
        dataVencimento = date.toISOString().split('T')[0];
      }

      const loanData: CreateLoanDto = {
        nome: formValue.nome,
        telefone: formValue.telefone || undefined,
        valor: formValue.valor,
        dataVencimento: dataVencimento,
        juros: formValue.juros || undefined,
        endereco: formValue.endereco || undefined,
        observacoes: formValue.observacoes || undefined,
      };

      this.loanService.create(loanData).subscribe({
        next: () => {
          this.isLoading = false;
          this.successMessage = 'Empréstimo registrado com sucesso!';

          setTimeout(() => {
            this.router.navigate(['/folder/emprestimos']);
          }, 1000);
        },
        error: (err) => {
          this.isLoading = false;
          this.errorMessage =
            err.error?.message || 'Erro ao registrar empréstimo';
        },
      });
    }
  }
}
