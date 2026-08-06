import { matchesSearch, normalizeSearchTerm } from '@/helpers/text.helper';

describe('normalizeSearchTerm', () => {
  it('Türkçe harfleri ASCII karşılığına indirir', () => {
    expect(normalizeSearchTerm('Şişli')).toBe('sisli');
    expect(normalizeSearchTerm('Çağrı')).toBe('cagri');
    expect(normalizeSearchTerm('Gümüşhane')).toBe('gumushane');
  });

  it('nokta birleşimi üretmeden `İ` harfini çözer', () => {
    expect(normalizeSearchTerm('İSTANBUL')).toBe('istanbul');
    expect(normalizeSearchTerm('İstanbul')).toBe('istanbul');
    expect(normalizeSearchTerm('istanbul')).toBe('istanbul');
  });

  it('Latin aksanlarını da söker', () => {
    expect(normalizeSearchTerm('Citroën')).toBe('citroen');
    expect(normalizeSearchTerm('Škoda')).toBe('skoda');
    expect(normalizeSearchTerm('Peugeot 208 GTï')).toBe('peugeot 208 gti');
  });

  it('boşlukları tekleştirip kırpar', () => {
    expect(normalizeSearchTerm('  fren   balatası  ')).toBe('fren balatasi');
  });
});

describe('matchesSearch', () => {
  it('aksansız yazılan arama aksanlı hedefi bulur', () => {
    expect(matchesSearch('Şişli Merkez', 'sisli')).toBe(true);
    expect(matchesSearch('İSTANBUL', 'istanbul')).toBe(true);
    expect(matchesSearch('Citroën C3', 'citroen')).toBe(true);
  });

  it('eşleşmeyen aramada false döner', () => {
    expect(matchesSearch('Şişli', 'kadikoy')).toBe(false);
  });

  it('boş arama her hedefi eşler', () => {
    expect(matchesSearch('herhangi bir metin', '')).toBe(true);
  });
});
