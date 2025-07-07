
import { csvData1, csvData2, SearchResult } from '@/data/csvData';

export class CSVSearchEngine {
  private data1: string[][];
  private data2: string[][];
  private searchIndex: Map<string, { row: number; source: 'CSV1' | 'CSV2'; column: number }[]>;

  constructor() {
    this.data1 = csvData1.map(line => line.split(';'));
    this.data2 = csvData2.map(line => line.split(';'));
    this.searchIndex = new Map();
    this.buildSearchIndex();
  }

  private buildSearchIndex() {
    // Index CSV1
    this.data1.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.trim()) {
          const words = cell.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.length > 1) {
              if (!this.searchIndex.has(word)) {
                this.searchIndex.set(word, []);
              }
              this.searchIndex.get(word)!.push({
                row: rowIndex,
                source: 'CSV1',
                column: colIndex
              });
            }
          });
        }
      });
    });

    // Index CSV2
    this.data2.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        if (cell.trim()) {
          const words = cell.toLowerCase().split(/\s+/);
          words.forEach(word => {
            if (word.length > 1) {
              if (!this.searchIndex.has(word)) {
                this.searchIndex.set(word, []);
              }
              this.searchIndex.get(word)!.push({
                row: rowIndex,
                source: 'CSV2',
                column: colIndex
              });
            }
          });
        }
      });
    });
  }

  search(query: string): SearchResult[] {
    if (!query.trim()) return [];

    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 1);
    const matches = new Map<string, { score: number; row: number; source: 'CSV1' | 'CSV2' }>();

    queryWords.forEach(word => {
      // Exact matches
      if (this.searchIndex.has(word)) {
        this.searchIndex.get(word)!.forEach(match => {
          const key = `${match.source}-${match.row}`;
          const current = matches.get(key) || { score: 0, row: match.row, source: match.source };
          current.score += 10; // Higher score for exact word matches
          matches.set(key, current);
        });
      }

      // Partial matches
      for (const [indexWord, indexMatches] of this.searchIndex.entries()) {
        if (indexWord.includes(word) && indexWord !== word) {
          indexMatches.forEach(match => {
            const key = `${match.source}-${match.row}`;
            const current = matches.get(key) || { score: 0, row: match.row, source: match.source };
            current.score += 5; // Lower score for partial matches
            matches.set(key, current);
          });
        }
      }
    });

    // Convert to results and sort by score
    const results: SearchResult[] = Array.from(matches.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 50) // Limit results for performance
      .map(match => ({
        id: `${match.source}-${match.row}`,
        data: match.source === 'CSV1' ? this.data1[match.row] : this.data2[match.row],
        score: match.score,
        source: match.source
      }));

    return results;
  }
}
