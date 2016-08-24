import {NgModule}       from '@angular/core';
import {DROPDOWN_DIRECTIVES,
    BUTTON_DIRECTIVES,
    DropdownMenuDirective,
    DropdownToggleDirective,
    ButtonCheckboxDirective,
    DropdownDirective,
    ButtonRadioDirective} from  'ng2-bootstrap/ng2-bootstrap';

@NgModule({
    declarations: [DropdownDirective,
        DropdownToggleDirective,
        DropdownMenuDirective,
        ButtonCheckboxDirective,
        ButtonRadioDirective],
    exports: [DROPDOWN_DIRECTIVES, BUTTON_DIRECTIVES],
})
export class Ng2BSModule {
}

