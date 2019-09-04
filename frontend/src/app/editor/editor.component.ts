import {Component, ElementRef, Input, OnDestroy, OnInit, Output} from '@angular/core';
import {Subject} from 'rxjs';
import {HttpService} from '../http.service';
import {HttpHeaders} from '@angular/common/http';

const editorStyles = `
body { font-family: Roboto, "Helvetica Neue", sans-serif; font-size: 14px; }`;

class UploadResult {
    url: string;
}

@Component({
    selector: 'rich-editor',
    templateUrl: './editor.component.html',
    styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, OnDestroy {
    private content = '';

    @Input('uploadUrl')
    private uploadUrl;

    @Output()
    public modelChange = new Subject();

    @Input()
    public set model(m) {
        if (m && m == this.content) {
            return;
        }

        this.content = m;
        if (this.contentBody) {
            this.contentBody.innerHTML = this.content || '';
        }
    }

    private contentBody;
    private document;

    constructor(private element: ElementRef, private http: HttpService) {
    }

    ngOnInit() {
        const frame = this.element.nativeElement.querySelector('.content');
        frame.addEventListener('load', () => {
            this.contentBody = frame.contentDocument.body;
            const style = frame.contentDocument.createElement('style');
            style.innerText = editorStyles;
            frame.contentDocument.head.append(style);
            frame.contentDocument.designMode = 'on';
            this.contentBody.innerHTML = this.content || '';
            this.document = frame.contentWindow.document;
            const uploadUrl = this.uploadUrl;
            this.contentBody.addEventListener('beforeinput', (e) => {
                if (e.inputType === 'insertFromPaste') {
                    if (e.dataTransfer && e.dataTransfer.files.length) {
                        const file = e.dataTransfer.files[0];
                        const formData: FormData = new FormData();
                        formData.append('upload', file, file.name);
                        const headers = new HttpHeaders();
                        headers.set('Accept', 'application/json');
                        headers.delete('Content-Type');
                        this.http.post<UploadResult>(uploadUrl, formData, {headers})
                            .subscribe(data => this.document.execCommand('insertImage', false, data.url));
                    }
                }
            });

            this.contentBody.addEventListener('input', (e) => {
                const currentContent = this.contentBody.innerHTML;
                if (currentContent !== this.content) {
                    this.content = currentContent;
                    this.modelChange.next(currentContent);
                }
            });
        });
    }

    ngOnDestroy() {
        const frame = this.element.nativeElement.querySelector('.content');
    }

    onEvent(e) {
        console.log(e);
    }

    italic() {
        this.document.execCommand('italic');
        // const sel = this.document.getSelection();
        // console.log('selection', sel);
    }

    bold() {
        this.document.execCommand('bold');
        // const sel = this.document.getSelection();
        // console.log('selection', sel);
    }
}
