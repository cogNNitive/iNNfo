import { describe, it, expect, vi, beforeAll } from 'vitest';

describe('useAppUrls', () => {
  beforeAll(() => {
    vi.stubEnv('VITE_FILE_FORMAT_URL', 'http://override.example.com');
    vi.stubEnv('VITE_FOLDER_FORMAT_URL', 'http://override-folder.example.com');
  });

  it('reads URLs from env vars', async () => {
    // Need a fresh import to pick up env changes
    const mod = await import('../../src/composables/useAppUrls');
    const { fileUrl, folderUrl } = mod.useAppUrls();
    expect(fileUrl('doc.md')).toBe('http://override.example.com/?file=doc.md');
    expect(folderUrl('dir')).toBe('http://override-folder.example.com/?folder=dir');
  });

  it('returns same instance on repeated calls', async () => {
    const { fileUrl } = await import('../../src/composables/useAppUrls');
    const { fileUrl: fileUrl2 } = await import('../../src/composables/useAppUrls');
    expect(fileUrl).toBe(fileUrl2);
  });
});
