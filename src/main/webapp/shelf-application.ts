import {Component, View, bootstrap, CORE_DIRECTIVES, FORM_DIRECTIVES} from 'angular2/angular2';
import {Alert} from 'ng2-bootstrap/ng2-bootstrap.ts';

@Component({
    selector: '[shelf-application]'
})
@View({
    template: `
    <h1>Welcome to Shelf</h1>

    <alert dismissible="true" (close)="message='Closed'">
    Now this tool is under developing, problem might occur. Once you have found something wrong, or you have any ideas, please
    <a href="mailto:jeffrey.liu@nokia.com?Subject=Shelf%20support%20request" target="_top">send me a mail</a>
    </alert>
  `,
    directives: [
        Alert,
        CORE_DIRECTIVES,
        FORM_DIRECTIVES
    ]
})
class ShelfApplication {
    private message;
    private user;

    constructor() {
        this.message = 'hello';
        this.user = 'Demo';
    }
}

bootstrap(ShelfApplication);

