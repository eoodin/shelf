import {Component, Input, Output, EventEmitter, ElementRef} from '@angular/core';
import {Subject} from 'rxjs/Subject';
import {FileSelectDirective, FileUploader} from 'ng2-file-upload';

declare var CKEDITOR: any;

@Component({
    selector: 'rich-editor',
    directives: [FileSelectDirective],
    template: `
    <div class="rich-editor">
        <div class="editor-placeholder"></div>
    </div>
    `,
    styles: [`
    .rich-editor {border: 1px solid #aaa;}
    `]
})
export class RichEditor {
    private editor = null;
    private contentCache: string;
    private showToolbar;
    private textChange;
    public uploader: FileUploader = new FileUploader({url: '/api/file/', autoUpload: true});

    @Output() update = new EventEmitter();

    constructor(private ele: ElementRef) {
        this.textChange = new Subject();
        this.textChange
            .debounceTime(250)
            .do(()=>this.contentCache = this.getEditor().getData())
            .subscribe(() => this.update.next(this.getEditor().getData()));
        var editor = this;
        this.uploader.onCompleteItem = (item, id) => {
            let last = this.getEditor().getLength() - 1;
            editor.getEditor().insertEmbed(last, 'image', '/api/file/' + id);
        };
        this.showToolbar = true;
    }

    @Input() set content(html) {
        html = html || '';

        if (typeof html == 'string' && this.contentCache != html) {
            this.contentCache = html;
            this.getEditor().setData(html);
        }
    }

    private getEditor() {
        if (!this.editor) {
            var el = this.ele.nativeElement;
            var editorEle = el.getElementsByClassName("editor-placeholder")[0];
            CKEDITOR.editorConfig = function (config) {
                config.toolbar = [
                    {name: 'insert', items: ['Table', 'HorizontalRule', 'SpecialChar']},
                    {name: 'tools', items: ['Maximize']},
                    {
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat', '-', 'Styles', 'Format']
                    },
                    {
                        name: 'paragraph',
                        items: ['NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
                    }
                ];
            };
            this.editor = CKEDITOR.replace(editorEle, {
                extraPlugins: 'uploadimage',
                imageUploadUrl: '/api/file?type=image&api=ckeditor-uploadimage',
                toolbar: [
                    {
                        name: 'styles',
                        items: ['Bold', 'Italic', 'Strike', '-', 'RemoveFormat', '-', 'Styles', 'Format', '-', 'NumberedList', 'BulletedList', '-', 'Outdent', 'Indent', '-', 'Blockquote']
                    },
                    {name: 'insert', items: ['Image', 'Table', 'HorizontalRule', 'SpecialChar']},
                    {name: 'tools', items: ['Maximize']}
                ]
            });
            var that = this;
            this.editor.on('change', function () {
                that.textChange.next(that.editor.getData());
            });
        }

        return this.editor;
    }
}
