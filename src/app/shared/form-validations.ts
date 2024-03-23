import {AbstractControl, UntypedFormControl} from "@angular/forms";
import {isValidCNPJ, isValidCPF, isValidEmail, isValidPhone} from '@brazilian-utils/brazilian-utils';
import moment from 'moment';

export class FormValidations {

  static documentoValidator(control: AbstractControl): any {

    let documento = control.value;
    if (documento && documento !== '') {
      documento = documento.replace(/\D/g, '');
      if (documento.length === 11) {
        return isValidCPF(documento) ? true : {documentoInvalido: true};
      } else if (documento.length === 14) {
        return isValidCNPJ(documento) ? true : {documentoInvalido: true};
      } else {
        return {documentoInvalido: true};
      }
    }
    return null;
  }

  static telefoneValidator(control: UntypedFormControl): any {
    let phone = control.value;
    if (phone && phone !== '') {
      phone = phone.replace(/\D/g, '');
      return isValidPhone(phone) ? true : {telefoneInvalido: true};
    }
    return null;
  }

  static emailValidator(control: UntypedFormControl): any {
    const email = control.value;
    if (email && email !== '') {
      // email = email.replace(/\D/g, '');
      return isValidEmail(email) ? true : {emailInvalido: true};
    }
    return null;
  }

  static dataNascimentoValidator(control: AbstractControl): any {
    let dataNascimento = control.value;
    if (dataNascimento && dataNascimento !== '') {
      dataNascimento = dataNascimento.replace(/\D/g, '');

      let data = moment(dataNascimento, "DD/MM/YYYY");
      let dataNascimentoIsValid = data.isValid() && data.isBefore(moment());
      return dataNascimentoIsValid ? true : {dataNascimentoInvalida: true};
    }
    return null;
  }

  static getErrorMsg(validatorName: string, validatorValue?: any): any {
    const config = {
      required: 'Este campo é obrigatório.',
      documentoInvalido: 'Documento inválido.',
      email: 'E-mail inválido.',
      emailInvalido: 'E-mail inválido.',
      telefoneInvalido: 'Telefone inválido.',
      dataNascimentoInvalida: 'Data de nascimento inválida.'
    };
    // @ts-ignore
    return config[validatorName];
  }

}
