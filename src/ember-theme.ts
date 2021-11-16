import * as fs from 'fs';
import { RendererEvent, Renderer } from 'typedoc';
import { MarkdownTheme } from 'typedoc-plugin-markdown/dist/theme';

const CATEGORY_POSITIONS = {
  components: 1,
  services: 2,
  utils: 3,
  helpers: 4,
};

const writeCategoryYaml = (
  categoryPath: string,
  label: string,
  position: number | null,
) => {
  const yaml: string[] = [`label: "${label}"`];
  if (position !== null) {
    yaml.push(`position: ${position}`);
  }
  if (fs.existsSync(categoryPath)) {
    fs.writeFileSync(`${categoryPath}/_category_.yml`, yaml.join('\n'));
  }
};

export default class EmberTheme extends MarkdownTheme {
  constructor(renderer: Renderer) {
    super(renderer);

    this.listenTo(this.owner, {
      [RendererEvent.END]: this.onRenderEnd,
    });
  }

  onRenderEnd(renderer: RendererEvent) {
    const categories = {
      components: false,
      services: false,
      utils: false,
    };

    // Get all the files
    const urls = this.getUrls(renderer.project);

    // Create Ember-specific directories
    urls.forEach((url) => {
      const partialCat = url.model.url.split('/')[1];
      if (partialCat) {
        const [category]: String = partialCat.split('_');
        if (category && categories[category] !== undefined) {
          // If this is the first time we've seen this category, create its dir and _category_.yml
          if (categories[category] === false) {
            categories[category] = true;
            const catDir = `${renderer.outputDirectory}/${category}`;
            const catTitleCase = `${category.charAt(0).toUpperCase()}${category.slice(1,)}`;
            if (fs.existsSync(renderer.outputDirectory) && !fs.existsSync(catDir)) {
              fs.mkdirSync(catDir);
              writeCategoryYaml(catDir, catTitleCase, CATEGORY_POSITIONS[category]);
            }
          }

          // Create symlinks to original markdown files
          fs.symlinkSync(`${renderer.outputDirectory}/${url.url}`, `${renderer.outputDirectory}/${category}/${partialCat}`);
        }
      }
    });
  }
}
