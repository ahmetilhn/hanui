import { readFileSync } from 'node:fs';

const read = (path: string): string => readFileSync(path, 'utf8');

const SMALL_TARGETS = [
  ['TableCheckbox', 'src/components/TableCheckbox/index.module.scss'],
  ['Combobox__clear', 'src/components/Combobox/index.module.scss'],
  ['Toast__action', 'src/components/Toast/index.module.scss'],
  ['TagInput remove', 'src/components/TagInput/index.module.scss'],
  ['IconButton', 'src/components/IconButton/index.module.scss'],
  ['Switch', 'src/components/Switch/index.module.scss'],
] as const;

describe('dokunma hedefleri', () => {
  it.each(SMALL_TARGETS)('%s vuruş alanını büyütür', (_name, path) => {
    expect(read(path)).toMatch(/@include\s+tap-target/);
  });

  it('mixin GÖRÜNEN ölçüyü değiştirmez — `::after` ile çalışır', () => {
    const mixins = read('src/styles/_mixins.scss');
    const block = mixins.slice(mixins.indexOf('@mixin tap-target'));

    expect(block.slice(0, 400)).toContain('&::after');
  });

  it('varsayılan ölçü 44px — WCAG 2.5.5', () => {
    expect(read('src/styles/_variables.scss')).toMatch(/\$tap-target-size:\s*44px/);
  });
});
