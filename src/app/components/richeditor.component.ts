import { Component, OnDestroy, AfterViewInit, EventEmitter, Input, Output, ElementRef, OnChanges } from '@angular/core';

declare var tinymce: any;

@Component({
  selector: 'rich-editor',
  template: `<textarea id={{elementId}}>{{content}}</textarea>`
})
export class RichEditorComponent implements OnChanges, AfterViewInit, OnDestroy {
  static lastid = 1;
  @Input() content;
  @Output() contentChange = new EventEmitter();
  editor;
  elementId;

  constructor() {
    this.elementId = "rich-editor-" + (RichEditorComponent.lastid++);
  }

  ngOnChanges(changes) {
    if (this.editor != null && changes != null && changes.content != null) {
      let nv = changes.content.currentValue || '';
      let cv = this.editor.getContent();
      if (nv != cv) {  
          this.editor.setContent(nv);
      }
    }
  }

  ngAfterViewInit() {
    tinymce.init({
      selector: '#' + this.elementId,
      plugins: ['link', 'paste', 'table', 'image'],
      menubar: false,
      toolbar: 'undo redo | styleselect | bold italic | alignleft aligncenter alignright | link image',
      skin_url: 'assets/skins/lightgray',
      images_upload_url: '/api/file?type=image&api=tinymce',
      images_upload_base_path: '/api/file/',
      automatic_uploads: true,
      setup: editor => {
        this.editor = editor;
        // editor.uploadImages(function(success) {
        //   console.log("Uploaded image.");
        // });
        editor.on('keyup', () => {
          let c = editor.getContent();
          if (this.content != c)
            this.contentChange.next(c);
        });
      },
    });
  }

  ngOnDestroy() {
    tinymce.remove(this.editor);
  }
}