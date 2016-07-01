"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var core_1 = require('@angular/core');
var Subject_1 = require('rxjs/Subject');
var quill_0_20_1_js_1 = require('../../quill-0.20.1.js');
var ng2_file_upload_1 = require('ng2-file-upload');
var file_select_directive_1 = require('ng2-file-upload/components/file-upload/file-select.directive');
var RichEditor = (function () {
    function RichEditor(ele) {
        var _this = this;
        this.ele = ele;
        this.editor = null;
        this.showToolbar = false;
        this.uploader = new ng2_file_upload_1.FileUploader({ url: '/api/file/', autoUpload: true });
        this.update = new core_1.EventEmitter();
        this.textChange = new Subject_1.Subject();
        this.textChange
            .debounceTime(250)
            .do(function () { return _this.contentCache = _this.getEditor().getHTML(); })
            .subscribe(function () { return _this.update.next(_this.getEditor().getHTML()); });
        var editor = this;
        this.uploader.onCompleteItem = function (item, id) {
            var last = _this.getEditor().getLength() - 1;
            editor.getEditor().insertEmbed(last, 'image', '/api/file/' + id);
        };
    }
    Object.defineProperty(RichEditor.prototype, "content", {
        set: function (html) {
            html = html || '';
            if (typeof html == 'string' && this.contentCache != html) {
                this.contentCache = html;
                this.getEditor().setHTML(html);
            }
        },
        enumerable: true,
        configurable: true
    });
    RichEditor.prototype.getEditor = function () {
        if (!this.editor) {
            var el = this.ele.nativeElement;
            var editorEle = el.getElementsByClassName("quill-editor")[0];
            var toolbarEle = el.getElementsByClassName('quill-toolbar')[0];
            this.editor = new quill_0_20_1_js_1["default"](editorEle, {
                'modules': {
                    'authorship': { authorId: 'galadriel', enabled: true },
                    'multi-cursor': true,
                    'link-tooltip': true,
                    'toolbar': { 'container': toolbarEle }
                },
                'theme': 'snow'
            });
            var that = this;
            this.editor.on('text-change', function (delta, source) {
                that.textChange.next(delta);
            });
        }
        return this.editor;
    };
    __decorate([
        core_1.Output()
    ], RichEditor.prototype, "update");
    __decorate([
        core_1.Input()
    ], RichEditor.prototype, "content");
    RichEditor = __decorate([
        core_1.Component({
            selector: 'rich-editor',
            directives: [file_select_directive_1.FileSelectDirective],
            template: "\n    <div class=\"rich-editor\">\n        <label class=\"toolbar-toggle\" [style.background]=\"showToolbar?'gray':'white'\">\n            <input type=\"file\" ng2FileSelect [uploader]=\"uploader\" style=\"display:none;\"/>\n            P\n        </label>\n        <label class=\"toolbar-toggle\" [style.background]=\"showToolbar?'gray':'white'\">\n            <input type=\"checkbox\" [(ngModel)]=\"showToolbar\" style=\"display:none;\">\n            T\n        </label>\n        \n        <div [style.display]=\"showToolbar?'inherit':'none'\" class=\"quill-toolbar toolbar\">\n            <span class=\"ql-format-group\">\n            <select title=\"Font\" class=\"ql-font\">\n                <option value=\"sans-serif\" selected=\"\">Sans Serif</option>\n                <option value=\"serif\">Serif</option>\n                <option value=\"monospace\">Monospace</option>\n            </select>\n            <select title=\"Size\" class=\"ql-size\">\n                <option value=\"10px\">Small</option>\n                <option value=\"13px\" selected=\"\">Normal</option>\n                <option value=\"18px\">Large</option>\n                <option value=\"32px\">Huge</option>\n            </select>\n            </span>\n            <span class=\"ql-format-group\">\n            <span title=\"Bold\" class=\"ql-format-button ql-bold\"></span>\n            <span class=\"ql-format-separator\"></span>\n            <span title=\"Italic\" class=\"ql-format-button ql-italic\"></span>\n            <span class=\"ql-format-separator\"></span>\n            <span title=\"Underline\" class=\"ql-format-button ql-underline\"></span>\n            <span class=\"ql-format-separator\"></span>\n            <span title=\"Strikethrough\" class=\"ql-format-button ql-strike\"></span>\n            </span>\n            <span class=\"ql-format-group\">\n            <select title=\"Text Color\" class=\"ql-color\">\n                <option value=\"rgb(0, 0, 0)\" label=\"rgb(0, 0, 0)\" selected=\"\"></option>\n                <option value=\"rgb(230, 0, 0)\" label=\"rgb(230, 0, 0)\"></option>\n                <option value=\"rgb(255, 153, 0)\" label=\"rgb(255, 153, 0)\"></option>\n                <option value=\"rgb(255, 255, 0)\" label=\"rgb(255, 255, 0)\"></option>\n                <option value=\"rgb(0, 138, 0)\" label=\"rgb(0, 138, 0)\"></option>\n                <option value=\"rgb(0, 102, 204)\" label=\"rgb(0, 102, 204)\"></option>\n                <option value=\"rgb(153, 51, 255)\" label=\"rgb(153, 51, 255)\"></option>\n                <option value=\"rgb(255, 255, 255)\" label=\"rgb(255, 255, 255)\"></option>\n                <option value=\"rgb(250, 204, 204)\" label=\"rgb(250, 204, 204)\"></option>\n                <option value=\"rgb(255, 235, 204)\" label=\"rgb(255, 235, 204)\"></option>\n                <option value=\"rgb(255, 255, 204)\" label=\"rgb(255, 255, 204)\"></option>\n                <option value=\"rgb(204, 232, 204)\" label=\"rgb(204, 232, 204)\"></option>\n                <option value=\"rgb(204, 224, 245)\" label=\"rgb(204, 224, 245)\"></option>\n                <option value=\"rgb(235, 214, 255)\" label=\"rgb(235, 214, 255)\"></option>\n                <option value=\"rgb(187, 187, 187)\" label=\"rgb(187, 187, 187)\"></option>\n                <option value=\"rgb(240, 102, 102)\" label=\"rgb(240, 102, 102)\"></option>\n                <option value=\"rgb(255, 194, 102)\" label=\"rgb(255, 194, 102)\"></option>\n                <option value=\"rgb(255, 255, 102)\" label=\"rgb(255, 255, 102)\"></option>\n                <option value=\"rgb(102, 185, 102)\" label=\"rgb(102, 185, 102)\"></option>\n                <option value=\"rgb(102, 163, 224)\" label=\"rgb(102, 163, 224)\"></option>\n                <option value=\"rgb(194, 133, 255)\" label=\"rgb(194, 133, 255)\"></option>\n                <option value=\"rgb(136, 136, 136)\" label=\"rgb(136, 136, 136)\"></option>\n                <option value=\"rgb(161, 0, 0)\" label=\"rgb(161, 0, 0)\"></option>\n                <option value=\"rgb(178, 107, 0)\" label=\"rgb(178, 107, 0)\"></option>\n                <option value=\"rgb(178, 178, 0)\" label=\"rgb(178, 178, 0)\"></option>\n                <option value=\"rgb(0, 97, 0)\" label=\"rgb(0, 97, 0)\"></option>\n                <option value=\"rgb(0, 71, 178)\" label=\"rgb(0, 71, 178)\"></option>\n                <option value=\"rgb(107, 36, 178)\" label=\"rgb(107, 36, 178)\"></option>\n                <option value=\"rgb(68, 68, 68)\" label=\"rgb(68, 68, 68)\"></option>\n                <option value=\"rgb(92, 0, 0)\" label=\"rgb(92, 0, 0)\"></option>\n                <option value=\"rgb(102, 61, 0)\" label=\"rgb(102, 61, 0)\"></option>\n                <option value=\"rgb(102, 102, 0)\" label=\"rgb(102, 102, 0)\"></option>\n                <option value=\"rgb(0, 55, 0)\" label=\"rgb(0, 55, 0)\"></option>\n                <option value=\"rgb(0, 41, 102)\" label=\"rgb(0, 41, 102)\"></option>\n                <option value=\"rgb(61, 20, 102)\" label=\"rgb(61, 20, 102)\"></option>\n            </select>\n            <span class=\"ql-format-separator\"></span>\n            <select title=\"Background Color\" class=\"ql-background\">\n                <option value=\"rgb(0, 0, 0)\" label=\"rgb(0, 0, 0)\"></option>\n                <option value=\"rgb(230, 0, 0)\" label=\"rgb(230, 0, 0)\"></option>\n                <option value=\"rgb(255, 153, 0)\" label=\"rgb(255, 153, 0)\"></option>\n                <option value=\"rgb(255, 255, 0)\" label=\"rgb(255, 255, 0)\"></option>\n                <option value=\"rgb(0, 138, 0)\" label=\"rgb(0, 138, 0)\"></option>\n                <option value=\"rgb(0, 102, 204)\" label=\"rgb(0, 102, 204)\"></option>\n                <option value=\"rgb(153, 51, 255)\" label=\"rgb(153, 51, 255)\"></option>\n                <option value=\"rgb(255, 255, 255)\" label=\"rgb(255, 255, 255)\" selected=\"\"></option>\n                <option value=\"rgb(250, 204, 204)\" label=\"rgb(250, 204, 204)\"></option>\n                <option value=\"rgb(255, 235, 204)\" label=\"rgb(255, 235, 204)\"></option>\n                <option value=\"rgb(255, 255, 204)\" label=\"rgb(255, 255, 204)\"></option>\n                <option value=\"rgb(204, 232, 204)\" label=\"rgb(204, 232, 204)\"></option>\n                <option value=\"rgb(204, 224, 245)\" label=\"rgb(204, 224, 245)\"></option>\n                <option value=\"rgb(235, 214, 255)\" label=\"rgb(235, 214, 255)\"></option>\n                <option value=\"rgb(187, 187, 187)\" label=\"rgb(187, 187, 187)\"></option>\n                <option value=\"rgb(240, 102, 102)\" label=\"rgb(240, 102, 102)\"></option>\n                <option value=\"rgb(255, 194, 102)\" label=\"rgb(255, 194, 102)\"></option>\n                <option value=\"rgb(255, 255, 102)\" label=\"rgb(255, 255, 102)\"></option>\n                <option value=\"rgb(102, 185, 102)\" label=\"rgb(102, 185, 102)\"></option>\n                <option value=\"rgb(102, 163, 224)\" label=\"rgb(102, 163, 224)\"></option>\n                <option value=\"rgb(194, 133, 255)\" label=\"rgb(194, 133, 255)\"></option>\n                <option value=\"rgb(136, 136, 136)\" label=\"rgb(136, 136, 136)\"></option>\n                <option value=\"rgb(161, 0, 0)\" label=\"rgb(161, 0, 0)\"></option>\n                <option value=\"rgb(178, 107, 0)\" label=\"rgb(178, 107, 0)\"></option>\n                <option value=\"rgb(178, 178, 0)\" label=\"rgb(178, 178, 0)\"></option>\n                <option value=\"rgb(0, 97, 0)\" label=\"rgb(0, 97, 0)\"></option>\n                <option value=\"rgb(0, 71, 178)\" label=\"rgb(0, 71, 178)\"></option>\n                <option value=\"rgb(107, 36, 178)\" label=\"rgb(107, 36, 178)\"></option>\n                <option value=\"rgb(68, 68, 68)\" label=\"rgb(68, 68, 68)\"></option>\n                <option value=\"rgb(92, 0, 0)\" label=\"rgb(92, 0, 0)\"></option>\n                <option value=\"rgb(102, 61, 0)\" label=\"rgb(102, 61, 0)\"></option>\n                <option value=\"rgb(102, 102, 0)\" label=\"rgb(102, 102, 0)\"></option>\n                <option value=\"rgb(0, 55, 0)\" label=\"rgb(0, 55, 0)\"></option>\n                <option value=\"rgb(0, 41, 102)\" label=\"rgb(0, 41, 102)\"></option>\n                <option value=\"rgb(61, 20, 102)\" label=\"rgb(61, 20, 102)\"></option>\n            </select>\n            </span>\n            <span class=\"ql-format-group\">\n            <span title=\"List\" class=\"ql-format-button ql-list\"></span>\n            <span class=\"ql-format-separator\"></span>\n            <span title=\"Bullet\" class=\"ql-format-button ql-bullet\"></span>\n            <span class=\"ql-format-separator\"></span>\n            <select title=\"Text Alignment\" class=\"ql-align\">\n                <option value=\"left\" label=\"Left\" selected=\"\"></option>\n                <option value=\"center\" label=\"Center\"></option>\n                <option value=\"right\" label=\"Right\"></option>\n                <option value=\"justify\" label=\"Justify\"></option>\n            </select>\n            </span>\n            <span class=\"ql-format-group\">\n            <span title=\"Link\" class=\"ql-format-button ql-link\"></span>\n            </span>\n        </div>\n        <div class=\"quill-editor\"></div>\n    </div>\n    ",
            styles: ["\n    .rich-editor {border: 1px solid #aaa;}\n    .toolbar-toggle {padding-left: 7px;font-size:18px;border: 1px solid #bbb; border-radius: 3px; overflow: hidden;\n        display:inline-block;float:right;width: 28px; height:28px;background: gray;margin: 5px;}\n    .description-editor { width: 100%; border: 1px solid #ccc; height: 18em; }\n    .quill-toolbar {border-bottom:  1px solid #ccc;}\n    "]
        })
    ], RichEditor);
    return RichEditor;
}());
exports.RichEditor = RichEditor;
//# sourceMappingURL=rich-editor.js.map