export class ShelfServerPage {
  navigateTo() {
    return browser.get('/');
  }

  getParagraphText() {
    return element(by.css('shelf-server-app h1')).getText();
  }
}
