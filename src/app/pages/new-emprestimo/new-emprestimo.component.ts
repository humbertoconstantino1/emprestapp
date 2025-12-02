import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {IonButton,IonItem,IonTextarea,IonLabel,IonInput,IonDatetime,IonSelect,IonSelectOption,IonModal,IonDatetimeButton} from '@ionic/angular/standalone';
@Component({
  selector: 'app-new-emprestimo',
  templateUrl: './new-emprestimo.component.html',
  styleUrls: ['./new-emprestimo.component.scss'],
  imports:[IonButton,IonItem,IonTextarea,IonLabel,IonInput,IonDatetime,IonSelect,IonSelectOption,ReactiveFormsModule,IonModal,IonDatetimeButton]
})
export class NewEmprestimoComponent  implements OnInit {

  clientForm: FormGroup;
   constructor(private fb: FormBuilder) {
    this.clientForm = this.fb.group({
      nome: ['', ],
      telefone: ['', ],
      valor: [null],
      data: ['', ],
      juros: [null, ],
      endereco: [''],
      observacoes: ['']
    });
  }

    submitForm() {
    if (this.clientForm.valid) {
      console.log('Formulário enviado:', this.clientForm.value);
      // Aqui você pode enviar para API ou salvar localmente
    }
  }
  ngOnInit() {}

}
