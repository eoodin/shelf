import { ShelfServerPage } from './app.po';

describe('shelf-server App', function() {
  let page: ShelfServerPage;

  beforeEach(() => {
    page = new ShelfServerPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('shelf-server works!');
  });
});
