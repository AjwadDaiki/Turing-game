import { selectEpreuves, SelectedEpreuve } from '../game/epreuveSelector';
import { EpreuveFamily } from '../types';

const ALL_FAMILIES: EpreuveFamily[] = ['verbale', 'visuelle', 'dessin', 'numerique', 'chaotique'];

describe('selectEpreuves', () => {
  it('returns exactly 5 epreuves', () => {
    expect(selectEpreuves()).toHaveLength(5);
  });

  it('covers all 5 families', () => {
    const selected = selectEpreuves();
    const families = new Set(selected.map((e: SelectedEpreuve) => e.family));
    expect(families.size).toBe(5);
    ALL_FAMILIES.forEach((f) => expect(families.has(f)).toBe(true));
  });

  it('never has 2 epreuves from the same family', () => {
    const selected = selectEpreuves();
    const families = selected.map((e: SelectedEpreuve) => e.family);
    const unique = new Set(families);
    expect(unique.size).toBe(families.length);
  });

  it('resolvedPrompt never contains [X]', () => {
    const selected = selectEpreuves();
    selected.forEach((e: SelectedEpreuve) => {
      expect(e.resolvedPrompt).not.toContain('[X]');
    });
  });

  it('is random across 50 calls (not always the same set)', () => {
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      const ids = selectEpreuves()
        .map((e: SelectedEpreuve) => e.id)
        .sort()
        .join(',');
      results.add(ids);
    }
    // With 3 épreuves per verbale family and randomness, expect >1 unique combination
    expect(results.size).toBeGreaterThan(1);
  });

  it('each returned epreuve has required fields: id, family, inputType, timeLimit, resolvedPrompt', () => {
    const selected = selectEpreuves();
    selected.forEach((e: SelectedEpreuve) => {
      expect(typeof e.id).toBe('string');
      expect(typeof e.family).toBe('string');
      expect(typeof e.inputType).toBe('string');
      expect(typeof e.timeLimit).toBe('number');
      expect(typeof (e as any).resolvedPrompt).toBe('string');
    });
  });
});
