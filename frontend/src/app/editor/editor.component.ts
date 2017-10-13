import { Component, OnInit, OnDestroy, Input, Output, ElementRef } from '@angular/core';
import { Subject } from 'rxjs';
import { DomSanitizer } from '@angular/platform-browser';
import { HttpService } from '../http.service';
import { RequestMethod, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';

@Component({
  selector: 'rich-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.css']
})
export class EditorComponent implements OnInit, OnDestroy {
  private content;

  @Output()
  public modelChange = new Subject();

  @Input()
  public set model(m) {
    if (m && m == this.content) {
      return;
    }

    this.content = m;
    if (this.contentBody) {
      this.contentBody.innerHTML = this.content;
    }
  }

  private contentBody;

  constructor(private element: ElementRef, private http: HttpService) { }

  ngOnInit() {
    let frame = this.element.nativeElement.querySelector('.content');
    frame.addEventListener('load', () => {
      this.contentBody = frame.contentDocument.body;
      frame.contentDocument.designMode = 'on';
      this.contentBody.innerHTML = this.content;
      let fdoc = frame.contentWindow.document;
      this.contentBody.addEventListener('beforeinput', (e) => {
        if (e.inputType == 'insertFromPaste') {
          console.log(e);
          if (e.dataTransfer && e.dataTransfer.files.length) {
            let file = e.dataTransfer.files[0];
            let fd = new FormData();
            fd.append('upload', file, file.name);
            let hd = new Headers();
            hd.append('Content-Type', 'multipart/form-data');
            let uploadURL = '/api/file?type=image&api=ckeditor-uploadimage';
            let formData: FormData = new FormData();
            formData.append('upload', file, file.name);
            let headers = new Headers();
            headers.set('Accept', 'application/json');
            headers.delete('Content-Type');
            let options = new RequestOptions({ headers: headers });
            this.http.post(uploadURL, formData, options)
              .map(res => res.json())
              .catch(error => Observable.throw(error))
              .subscribe(
              data => {
                console.log(data);
                fdoc.execCommand('insertImage', false, data.url);
              },
              error => console.log(error),
              () => { });
          }
        }
      });

      this.contentBody.addEventListener('input', (e) => {
        var currentContent = this.contentBody.innerHTML;
        if (currentContent !== this.content) {
          this.content = currentContent;
          this.modelChange.next(currentContent);
        }
      });
    });
  }

  ngOnDestroy() {
    let frame = this.element.nativeElement.querySelector('.content');
  }

  onEvent(e) {
    console.log(e);
  }
}
