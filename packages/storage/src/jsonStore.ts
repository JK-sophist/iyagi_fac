import { promises as fs } from 'node:fs';
import path from 'node:path';

export class JsonStore<T extends { id: string }> {
  constructor(private readonly filePath: string) {}

  private async ensureFile() {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    try { await fs.access(this.filePath); } catch { await fs.writeFile(this.filePath, '[]', 'utf-8'); }
  }

  async getAll(): Promise<T[]> {
    await this.ensureFile();
    const raw = await fs.readFile(this.filePath, 'utf-8');
    return JSON.parse(raw) as T[];
  }

  async saveAll(items: T[]): Promise<void> {
    await this.ensureFile();
    await fs.writeFile(this.filePath, JSON.stringify(items, null, 2), 'utf-8');
  }

  async add(item: T): Promise<T> {
    const all = await this.getAll();
    all.push(item);
    await this.saveAll(all);
    return item;
  }

  async update(id: string, updater: (item: T) => T): Promise<T | null> {
    const all = await this.getAll();
    const idx = all.findIndex((i) => i.id === id);
    if (idx < 0) return null;
    all[idx] = updater(all[idx]);
    await this.saveAll(all);
    return all[idx];
  }

  async findById(id: string): Promise<T | null> {
    const all = await this.getAll();
    return all.find((i) => i.id === id) ?? null;
  }
}
