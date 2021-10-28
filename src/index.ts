import { Application } from 'typedoc';
import EmberTheme from './ember-theme';

export function load(app: Application) {
  // eslint-disable-next-line no-param-reassign
  app.renderer.theme = new EmberTheme(app.renderer);
}
