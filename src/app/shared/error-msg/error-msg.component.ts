import {Component, Input} from '@angular/core';
import {UntypedFormControl} from "@angular/forms";
import {FormValidations} from "../form-validations";

@Component({
  selector: 'app-error-msg',
  standalone: true,
  imports: [],
  templateUrl: './error-msg.component.html'
})
export class ErrorMsgComponent {

  @Input() control: UntypedFormControl = new UntypedFormControl();

  get errorMessage(): any {

    for (const propertyName in this.control.errors) {
      if (this.control.errors.hasOwnProperty(propertyName) &&
        this.control.touched) {
        return FormValidations.getErrorMsg(propertyName, this.control.errors[propertyName]);
      }
    }
    return null;
  }

}
