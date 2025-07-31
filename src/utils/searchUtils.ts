import { csvData1, csvData2, csvData3, csvData4, SearchResult, loadCSVData } from '@/data/csvData';

export class CSVSearchEngine {
  private data1: string[][];
  private data2: string[][];
  private data3: string[][];
  private data4: string[][];
  private searchIndex: Map<string, { row: number; source: 'Deutschland' | 'Europe' | 'Grenze' | 'DS100'; column: number }[]>;
  private isLoaded: boolean = false;

  constructor() {
    this.data1 = [];
    this.data2 = [];
    this.data3 = [];
    this.data4 = [];
    this.searchIndex = new Map();
    this.initializeData();
  }

  private async initializeData() {
    await loadCSVData();
    this.data1 = csvData1.map(line => line.split(';'));
    this.data2 = csvData2.map(line => line.split(';'));
    this.data3 = csvData3.map(line => line.split(';'));
    this.data4 = csvData4.map(line => line.split('|'));
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

    // Index DS100 data
    this.data4.forEach((row, rowIndex) => {
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
                source: 'DS100',
                column: colIndex
              });
            }
          });
        }
      });
    });
  }

  private generateEntryKey(data: string[]): string {
    // Use the first two columns (ID and Name) to create a unique key for deduplication
    return `${data[0]?.trim()}-${data[1]?.trim()}`.toLowerCase();
  }

  search(query: string, allowedDatasets: string[] = ['Deutschland', 'Europe', 'Grenze', 'DS100']): SearchResult[] {
    if (!query.trim() || !this.isLoaded) return [];

    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 1);
    const directMatches = new Map<string, { score: number; row: number; source: 'Deutschland' | 'Europe' | 'Grenze' | 'DS100' }>();

    // First pass: direct matches in allowed datasets only
    queryWords.forEach(word => {
      // Exact matches
      if (this.searchIndex.has(word)) {
        this.searchIndex.get(word)!.forEach(match => {
          if (allowedDatasets.includes(match.source)) {
            const key = `${match.source}-${match.row}`;
            const current = directMatches.get(key) || { score: 0, row: match.row, source: match.source };
            current.score += 10; // Higher score for exact word matches
            directMatches.set(key, current);
          }
        });
      }

      // Partial matches
      for (const [indexWord, indexMatches] of this.searchIndex.entries()) {
        if (indexWord.includes(word) && indexWord !== word) {
          indexMatches.forEach(match => {
            if (allowedDatasets.includes(match.source)) {
              const key = `${match.source}-${match.row}`;
              const current = directMatches.get(key) || { score: 0, row: match.row, source: match.source };
              current.score += 5; // Lower score for partial matches
              directMatches.set(key, current);
            }
          });
        }
      }
    });

    // Second pass: cross-reference DS100 based on station names from other datasets
    const crossReferenceMatches = new Map<string, { score: number; row: number; source: 'DS100' }>();
    
    // Check if query looks like an ID from other datasets
    const isIdQuery = /^\d/.test(query.trim());
    
    if (isIdQuery && allowedDatasets.includes('DS100')) {
      // For ID queries, find station names from other datasets and search DS100
      Array.from(directMatches.values()).forEach(match => {
        if (match.source !== 'DS100') {
          const data = match.source === 'Deutschland' ? this.data1[match.row] : 
                       match.source === 'Europe' ? this.data2[match.row] : this.data3[match.row];
          
          // Get station name (second column for most datasets)
          const stationName = data[1]?.toLowerCase();
          if (stationName) {
            // Search for this station name in DS100 data
            this.data4.forEach((row, rowIndex) => {
              const ds100StationName = row[1]?.toLowerCase();
              if (ds100StationName && ds100StationName.includes(stationName)) {
                const key = `DS100-${rowIndex}`;
                crossReferenceMatches.set(key, {
                  score: match.score * 0.8, // Slightly lower score for cross-references
                  row: rowIndex,
                  source: 'DS100'
                });
              }
            });
          }
        }
      });
    }

    // Combine all matches
    const allMatches = new Map([...directMatches, ...crossReferenceMatches]);

    // Convert to results and deduplicate
    const resultMap = new Map<string, SearchResult>();
    
    Array.from(allMatches.values()).forEach(match => {
      const data = match.source === 'Deutschland' ? this.data1[match.row] : 
                   match.source === 'Europe' ? this.data2[match.row] : 
                   match.source === 'Grenze' ? this.data3[match.row] : this.data4[match.row];
      
      const entryKey = this.generateEntryKey(data);
      
      if (resultMap.has(entryKey)) {
        // Entry already exists, combine sources and update score
        const existing = resultMap.get(entryKey)!;
        existing.sources = [...existing.sources, match.source];
        existing.score = Math.max(existing.score, match.score);
      } else {
        // New entry
        resultMap.set(entryKey, {
          id: `${match.source}-${match.row}`,
          data: data,
          score: match.score,
          source: match.source,
          sources: [match.source]
        });
      }
    });

    // Sort by score and limit results
    const results: SearchResult[] = Array.from(resultMap.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 50);

    return results;
  }
}
