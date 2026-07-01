import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseModel, parseFrontmatter, parseIndexBlock, parseMarkdownTable, validateModel } from '../src/index';

const verifyDir = join(import.meta.dirname!, '..', '..', '..', 'verification');

function readVerify(name: string): string {
  return readFileSync(join(verifyDir, name), 'utf-8');
}

describe('defiNNe (level 0)', () => {
  const content = readVerify('defiNNe_V_0-2-0_FORMAT.md');
  const fm = parseFrontmatter(content)!;

  it('parses frontmatter', () => {
    expect(fm.level).toBe(0);
    expect(fm.specification_version).toBe('V_0-2-0');
    expect(fm.parent).toBeUndefined();
    expect(fm.title).toContain('defiNNe');
  });
});

describe('FORMAT (level 1)', () => {
  const content = readVerify('FORMAT_V_0-2-0_FORMAT.md');
  const fm = parseFrontmatter(content)!;

  it('parses frontmatter', () => {
    expect(fm.level).toBe(1);
    expect(fm.parent).toBeDefined();
    expect(fm.parent!.name).toBe('defiNNe_V_0-2-0');
    expect(fm.modes).toEqual(['FILE', 'FOLDER']);
    expect(fm.relationship_types).toHaveLength(4);
  });
});

describe('business template (level 2)', () => {
  const content = readVerify('business_V_1-0-0_FORMAT.md');
  const fm = parseFrontmatter(content)!;

  it('parses frontmatter', () => {
    expect(fm.level).toBe(2);
    expect(fm.parent!.name).toBe('FORMAT_V_0-2-0');
    expect(fm.mode).toBe('FILE');
    expect(fm.concepts).toBeDefined();
    expect(fm.concepts!.length).toBeGreaterThan(60);
    expect(fm.markers).toBeDefined();
    expect(fm.markers!.length).toBe(5);
    expect(fm.matrices).toBeDefined();
    expect(fm.matrices!.length).toBeGreaterThan(10);
  });

  it('has relationship_declarations', () => {
    expect(fm.relationship_declarations).toBeDefined();
    expect(fm.relationship_declarations!.evaluable_matrix?.enabled).toBe(true);
    expect(fm.relationship_declarations!.graph_edge?.enabled).toBe(false);
  });
});

describe('Ghostbusters model (level 3)', () => {
  const content = readVerify('Ghostbusters_V_0-3-0_business_FORMAT.md');
  const model = parseModel(content);
  const fm = model.frontmatter;

  it('parses frontmatter', () => {
    expect(fm.level).toBe(3);
    expect(fm.parent!.name).toBe('business_V_1-0-0');
    expect(fm.model_version).toBe('V_0-3-0');
    expect(fm.mode).toBe('FILE');
  });

  it('parses taxonomy from index block', () => {
    expect(model.taxonomy.length).toBeGreaterThan(20);
    const marketChild = model.taxonomy.find(e => e.parent === 'Market');
    expect(marketChild).toBeDefined();
    expect(marketChild!.child).toBe('Segments');
  });

  it('parses concept elements', () => {
    expect(model.elements.has('Stakeholders')).toBe(true);
    expect(model.elements.has('Problems')).toBe(true);
    expect(model.elements.has('Value propositions')).toBe(true);

    const stakeholders = model.elements.get('Stakeholders')!;
    expect(stakeholders.length).toBeGreaterThanOrEqual(7);
    expect(stakeholders[0].name).toContain('Ghostbusters Founders');
    expect(stakeholders[0].type).toBe('Stakeholders');
  });

  it('parses matrix values', () => {
    expect(model.matrices.length).toBeGreaterThanOrEqual(1);
    const vpMatrix = model.matrices.find(m => m.name.toLowerCase().includes('problems-value'));
    expect(vpMatrix).toBeDefined();
    expect(vpMatrix!.cells.length).toBeGreaterThan(0);
    expect(vpMatrix!.cells[0].value).toBeTruthy();
  });

  it('parses item-markers matrix into nodeMarkers', () => {
    expect(Object.keys(model.nodeMarkers).length).toBeGreaterThan(0);
    expect(model.nodeMarkers['Paranormal Infestation']).toBeDefined();
    expect(model.nodeMarkers['Paranormal Infestation'].weight).toBe(9);
  });

  it('serializes and re-parses correctly', async () => {
    const { serializeModel } = await import('../src/index');
    const serialized = serializeModel(model);
    expect(serialized).toContain('specification_version: "V_0-2-0"');
    expect(serialized).toContain('<!-- block: concepts --> Stakeholders');
    expect(serialized).toContain('<!-- block: matrices --> problems-value propositions matrix');
  });
});

describe('procedures template (level 2)', () => {
  const content = readVerify('procedures_V_1-0-0_FORMAT.md');
  const fm = parseFrontmatter(content)!;

  it('parses frontmatter', () => {
    expect(fm.level).toBe(2);
    expect(fm.parent!.name).toBe('FORMAT_V_0-2-0');
    expect(fm.mode).toBe('FILE');
    expect(fm.concepts).toHaveLength(7);
    expect(fm.markers).toHaveLength(1);
    expect(fm.matrices).toHaveLength(6);
  });
});

describe('kb template (level 2, FOLDER mode)', () => {
  const content = readVerify('kb_V_1-0-0_FORMAT.md');
  const fm = parseFrontmatter(content)!;

  it('parses frontmatter', () => {
    expect(fm.level).toBe(2);
    expect(fm.parent!.name).toBe('FORMAT_V_0-2-0');
    expect(fm.mode).toBe('FOLDER');
    expect(fm.concepts).toHaveLength(3);
    expect(fm.relationship_declarations?.hierarchy?.enabled).toBe(true);
    expect(fm.relationship_declarations?.graph_edge?.enabled).toBe(true);
  });
});

describe('validator', () => {
  it('validates Ghostbusters against business template', () => {
    const modelContent = readVerify('Ghostbusters_V_0-3-0_business_FORMAT.md');
    const templateContent = readVerify('business_V_1-0-0_FORMAT.md');
    const model = parseModel(modelContent);
    const templateFm = parseFrontmatter(templateContent)!;

    const result = validateModel(model, {
      name: 'business_V_1-0-0',
      level: 2,
      parentName: 'FORMAT_V_0-2-0',
      frontmatter: templateFm,
      rawContent: templateContent,
    }, null);

    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it('rejects model with unknown concept', () => {
    const modelContent = readVerify('Ghostbusters_V_0-3-0_business_FORMAT.md');
    const templateContent = readVerify('business_V_1-0-0_FORMAT.md');
    const model = parseModel(modelContent);
    const templateFm = parseFrontmatter(templateContent)!;

    model.elements.set('NonExistentConcept', [{ type: 'NonExistentConcept', name: 'Test', description: '', fields: {}, markers: {} }]);

    const result = validateModel(model, {
      name: 'business_V_1-0-0',
      level: 2,
      parentName: 'FORMAT_V_0-2-0',
      frontmatter: templateFm,
      rawContent: templateContent,
    }, null);

    expect(result.valid).toBe(false);
    expect(result.errors.some(e => e.message.includes('NonExistentConcept'))).toBe(true);
  });
});
