
import { csvData1, csvData2, csvData3, SearchResult, loadCSVData } from '@/data/csvData';

export class CSVSearchEngine {
  private data1: string[][];
  private data2: string[][];
  private data3: string[][];
  private searchIndex: Map<string, { row: number; source: 'Deutschland' | 'Europe' | 'Grenze'; column: number }[]>;
  private isLoaded: boolean = false;

  constructor() {
    this.data1 = [];
    this.data2 = [];
    this.data3 = [];
    this.searchIndex = new Map();
    this.initializeData();
  }

  private async initializeData() {
    await loadCSVData();
    this.data1 = csvData1.map(line => line.split(';'));
    this.data2 = csvData2.map(line => line.split(';'));
    this.data3 = csvData3.map(line => line.split(';'));
    this.buildSearchIndex();
    this.isLoaded = true;
  }

  private buildSearchIndex() {
    // Index Deutschland data
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
                source: 'Deutschland',
                column: colIndex
              });
            }
          });
        }
      });
    });

    // Index Europe data
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
                source: 'Europe',
                column: colIndex
              });
            }
          });
        }
      });
    });

    // Index Grenze data
    this.data3.forEach((row, rowIndex) => {
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
                source: 'Grenze',
                column: colIndex
              });
            }
          });
        }
      });
    });
  }

  search(query: string): SearchResult[] {
    if (!query.trim() || !this.isLoaded) return [];

    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 1);
    const matches = new Map<string, { score: number; row: number; source: 'Deutschland' | 'Europe' | 'Grenze' }>();

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
        data: match.source === 'Deutschland' ? this.data1[match.row] : 
              match.source === 'Europe' ? this.data2[match.row] : this.data3[match.row],
        score: match.score,
        source: match.source
      }));

    return results;
  }
}
