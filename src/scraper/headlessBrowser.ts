import cheerio, { Root } from 'cheerio';
import { BrowserWindow, remote } from 'electron';

const { BrowserWindow: RemoteBrowserWindow } = remote;

type DomResult = {
  dom: Root;
  didNavigateUrl: string;
  didFinishLoadUrl: string;
};

export default class HeadlessBrowser {
  private window: BrowserWindow;

  public launch(): void {
    this.window = new RemoteBrowserWindow({
      width: 1000,
      height: 600,
      webPreferences: {
        webSecurity: false,
        nodeIntegration: false,
      },
      show: false,
    });
  }

  public close(): void {
    this.window?.destroy();
  }

  public async loadDom(targetUrl: string, timeout = 0): Promise<DomResult> {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.window.loadURL(targetUrl);

    return new Promise<DomResult>((resolveWrapper) => {
      let didNavigateUrl: string = null;

      this.window.webContents.on('did-navigate', (_event, url) => {
        didNavigateUrl = url;
      });

      this.window.webContents.on('did-finish-load', (_event, url) => {
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        Promise.resolve()
          .then(() => {
            if (timeout > 0) {
              return new Promise((resolve) => {
                setTimeout(resolve, timeout);
              });
            }
          })
          .then(() => {
            return this.window.webContents.executeJavaScript(
              `document.querySelector('body').innerHTML`
            );
          })
          .then((html) => {
            const $ = cheerio.load(html);

            resolveWrapper({
              dom: $,
              didNavigateUrl: didNavigateUrl,
              didFinishLoadUrl: url as string,
            });
          });
      });
    });
  }
}
