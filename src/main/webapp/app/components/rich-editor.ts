import {Component, Input, Output, EventEmitter, ElementRef} from 'angular2/core';
import Quill from 'quill';

@Component({
    selector: 'rich-editor',
    template: `
    <div>
        <label class="toolbar-toggle" [style.background]="showToolbar?'gray':'white'">
            <input type="checkbox" [(ngModel)]="showToolbar" style="display:none;">
            T
        </label>
        <div [style.display]="showToolbar?'inherit':'none'" class="quill-toolbar toolbar">
            <span class="ql-format-group">
            <select title="Font" class="ql-font">
                <option value="sans-serif" selected="">Sans Serif</option>
                <option value="serif">Serif</option>
                <option value="monospace">Monospace</option>
            </select>
            <select title="Size" class="ql-size">
                <option value="10px">Small</option>
                <option value="13px" selected="">Normal</option>
                <option value="18px">Large</option>
                <option value="32px">Huge</option>
            </select>
            </span>
            <span class="ql-format-group">
            <span title="Bold" class="ql-format-button ql-bold"></span>
            <span class="ql-format-separator"></span>
            <span title="Italic" class="ql-format-button ql-italic"></span>
            <span class="ql-format-separator"></span>
            <span title="Underline" class="ql-format-button ql-underline"></span>
            <span class="ql-format-separator"></span>
            <span title="Strikethrough" class="ql-format-button ql-strike"></span>
            </span>
            <span class="ql-format-group">
            <select title="Text Color" class="ql-color">
                <option value="rgb(0, 0, 0)" label="rgb(0, 0, 0)" selected=""></option>
                <option value="rgb(230, 0, 0)" label="rgb(230, 0, 0)"></option>
                <option value="rgb(255, 153, 0)" label="rgb(255, 153, 0)"></option>
                <option value="rgb(255, 255, 0)" label="rgb(255, 255, 0)"></option>
                <option value="rgb(0, 138, 0)" label="rgb(0, 138, 0)"></option>
                <option value="rgb(0, 102, 204)" label="rgb(0, 102, 204)"></option>
                <option value="rgb(153, 51, 255)" label="rgb(153, 51, 255)"></option>
                <option value="rgb(255, 255, 255)" label="rgb(255, 255, 255)"></option>
                <option value="rgb(250, 204, 204)" label="rgb(250, 204, 204)"></option>
                <option value="rgb(255, 235, 204)" label="rgb(255, 235, 204)"></option>
                <option value="rgb(255, 255, 204)" label="rgb(255, 255, 204)"></option>
                <option value="rgb(204, 232, 204)" label="rgb(204, 232, 204)"></option>
                <option value="rgb(204, 224, 245)" label="rgb(204, 224, 245)"></option>
                <option value="rgb(235, 214, 255)" label="rgb(235, 214, 255)"></option>
                <option value="rgb(187, 187, 187)" label="rgb(187, 187, 187)"></option>
                <option value="rgb(240, 102, 102)" label="rgb(240, 102, 102)"></option>
                <option value="rgb(255, 194, 102)" label="rgb(255, 194, 102)"></option>
                <option value="rgb(255, 255, 102)" label="rgb(255, 255, 102)"></option>
                <option value="rgb(102, 185, 102)" label="rgb(102, 185, 102)"></option>
                <option value="rgb(102, 163, 224)" label="rgb(102, 163, 224)"></option>
                <option value="rgb(194, 133, 255)" label="rgb(194, 133, 255)"></option>
                <option value="rgb(136, 136, 136)" label="rgb(136, 136, 136)"></option>
                <option value="rgb(161, 0, 0)" label="rgb(161, 0, 0)"></option>
                <option value="rgb(178, 107, 0)" label="rgb(178, 107, 0)"></option>
                <option value="rgb(178, 178, 0)" label="rgb(178, 178, 0)"></option>
                <option value="rgb(0, 97, 0)" label="rgb(0, 97, 0)"></option>
                <option value="rgb(0, 71, 178)" label="rgb(0, 71, 178)"></option>
                <option value="rgb(107, 36, 178)" label="rgb(107, 36, 178)"></option>
                <option value="rgb(68, 68, 68)" label="rgb(68, 68, 68)"></option>
                <option value="rgb(92, 0, 0)" label="rgb(92, 0, 0)"></option>
                <option value="rgb(102, 61, 0)" label="rgb(102, 61, 0)"></option>
                <option value="rgb(102, 102, 0)" label="rgb(102, 102, 0)"></option>
                <option value="rgb(0, 55, 0)" label="rgb(0, 55, 0)"></option>
                <option value="rgb(0, 41, 102)" label="rgb(0, 41, 102)"></option>
                <option value="rgb(61, 20, 102)" label="rgb(61, 20, 102)"></option>
            </select>
            <span class="ql-format-separator"></span>
            <select title="Background Color" class="ql-background">
                <option value="rgb(0, 0, 0)" label="rgb(0, 0, 0)"></option>
                <option value="rgb(230, 0, 0)" label="rgb(230, 0, 0)"></option>
                <option value="rgb(255, 153, 0)" label="rgb(255, 153, 0)"></option>
                <option value="rgb(255, 255, 0)" label="rgb(255, 255, 0)"></option>
                <option value="rgb(0, 138, 0)" label="rgb(0, 138, 0)"></option>
                <option value="rgb(0, 102, 204)" label="rgb(0, 102, 204)"></option>
                <option value="rgb(153, 51, 255)" label="rgb(153, 51, 255)"></option>
                <option value="rgb(255, 255, 255)" label="rgb(255, 255, 255)" selected=""></option>
                <option value="rgb(250, 204, 204)" label="rgb(250, 204, 204)"></option>
                <option value="rgb(255, 235, 204)" label="rgb(255, 235, 204)"></option>
                <option value="rgb(255, 255, 204)" label="rgb(255, 255, 204)"></option>
                <option value="rgb(204, 232, 204)" label="rgb(204, 232, 204)"></option>
                <option value="rgb(204, 224, 245)" label="rgb(204, 224, 245)"></option>
                <option value="rgb(235, 214, 255)" label="rgb(235, 214, 255)"></option>
                <option value="rgb(187, 187, 187)" label="rgb(187, 187, 187)"></option>
                <option value="rgb(240, 102, 102)" label="rgb(240, 102, 102)"></option>
                <option value="rgb(255, 194, 102)" label="rgb(255, 194, 102)"></option>
                <option value="rgb(255, 255, 102)" label="rgb(255, 255, 102)"></option>
                <option value="rgb(102, 185, 102)" label="rgb(102, 185, 102)"></option>
                <option value="rgb(102, 163, 224)" label="rgb(102, 163, 224)"></option>
                <option value="rgb(194, 133, 255)" label="rgb(194, 133, 255)"></option>
                <option value="rgb(136, 136, 136)" label="rgb(136, 136, 136)"></option>
                <option value="rgb(161, 0, 0)" label="rgb(161, 0, 0)"></option>
                <option value="rgb(178, 107, 0)" label="rgb(178, 107, 0)"></option>
                <option value="rgb(178, 178, 0)" label="rgb(178, 178, 0)"></option>
                <option value="rgb(0, 97, 0)" label="rgb(0, 97, 0)"></option>
                <option value="rgb(0, 71, 178)" label="rgb(0, 71, 178)"></option>
                <option value="rgb(107, 36, 178)" label="rgb(107, 36, 178)"></option>
                <option value="rgb(68, 68, 68)" label="rgb(68, 68, 68)"></option>
                <option value="rgb(92, 0, 0)" label="rgb(92, 0, 0)"></option>
                <option value="rgb(102, 61, 0)" label="rgb(102, 61, 0)"></option>
                <option value="rgb(102, 102, 0)" label="rgb(102, 102, 0)"></option>
                <option value="rgb(0, 55, 0)" label="rgb(0, 55, 0)"></option>
                <option value="rgb(0, 41, 102)" label="rgb(0, 41, 102)"></option>
                <option value="rgb(61, 20, 102)" label="rgb(61, 20, 102)"></option>
            </select>
            </span>
            <span class="ql-format-group">
            <span title="List" class="ql-format-button ql-list"></span>
            <span class="ql-format-separator"></span>
            <span title="Bullet" class="ql-format-button ql-bullet"></span>
            <span class="ql-format-separator"></span>
            <select title="Text Alignment" class="ql-align">
                <option value="left" label="Left" selected=""></option>
                <option value="center" label="Center"></option>
                <option value="right" label="Right"></option>
                <option value="justify" label="Justify"></option>
            </select>
            </span>
            <span class="ql-format-group">
            <span title="Link" class="ql-format-button ql-link"></span>
            </span>
        </div>
        <div class="quill-editor"></div>
    </div>
    `,
    styles: [`
    .toolbar-toggle {padding-left: 7px;font-size:18px;border: 1px solid #bbb; border-radius: 3px; overflow: hidden;
        display:inline-block;float:right;width: 28px; height:28px;background: gray;margin: 5px;}
    .description-editor { width: 100%; border: 1px solid #ccc; height: 18em; }
    .quill-toolbar {border-bottom:  1px solid #ccc;}
    `]
})
export class RichEditor {
    private editor = null;
    private _content: string;
    private showToolbar = false;

    @Output() update: EventEmitter = new EventEmitter();

    constructor(private ele: ElementRef) { }

    getEditor() {
        if (!this.editor) {
            var el = this.ele.nativeElement;
            var editorEle = el.getElementsByClassName("quill-editor")[0];
            var toolbarEle = el.getElementsByClassName('quill-toolbar')[0];
            this.editor = new Quill(editorEle, {
                'modules': {
                    'authorship': {authorId: 'galadriel', enabled: true},
                    'multi-cursor': true,
                    'link-tooltip': true,
                    'toolbar': {'container': toolbarEle}
                },
                'theme': 'snow'
            });
            var that = this;
            this.editor.on('text-change', function(delta, source) {
                that._content = that.editor.getHTML();
                that.update.next(that._content);
            });
        }
        
        return this.editor;
    }

    @Input() set content(html) {
        if (typeof html != 'string') return;

        if (this._content != html) {
            this._content = html;
            this.getEditor().setHTML(html);
        }
    }
    //
    // @Output() get content() {
    //     return this._content;
    // }
}
