
import { useState, useMemo, useCallback } from 'react';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Search } from 'lucide-react';
import { CSVSearchEngine } from '@/utils/searchUtils';
import { SearchResult } from '@/data/csvData';

const SearchInterface = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);

  // Initialize search engine once
  const searchEngine = useMemo(() => new CSVSearchEngine(), []);

  // Debounced search function
  const handleSearch = useCallback((searchQuery: string) => {
    if (searchQuery.trim().length < 2) {
      setResults([]);
      return;
    }
    
    const searchResults = searchEngine.search(searchQuery);
    setResults(searchResults);
  }, [searchEngine]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    handleSearch(value);
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const queryWords = query.toLowerCase().split(/\s+/);
    let highlightedText = text;
    
    queryWords.forEach(word => {
      const regex = new RegExp(`(${word})`, 'gi');
      highlightedText = highlightedText.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
    });
    
    return highlightedText;
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">CSV Search Engine</h1>
        <p className="text-muted-foreground">
          Search across multiple CSV datasets with instant results
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          type="text"
          placeholder="Search across CSV data..."
          value={query}
          onChange={handleInputChange}
          className="pl-10 text-lg py-6"
        />
      </div>

      {query.trim().length > 0 && (
        <div className="text-sm text-muted-foreground">
          Found {results.length} results for "{query}"
        </div>
      )}

      {results.length > 0 && (
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-20">Source</TableHead>
                <TableHead className="w-20">Score</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Alternative Names</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id} className="hover:bg-muted/50">
                  <TableCell>
                    <Badge variant={result.source === 'CSV1' ? 'default' : 'secondary'}>
                      {result.source}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{result.score}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    <span 
                      dangerouslySetInnerHTML={{ 
                        __html: highlightMatch(result.data[0] || '', query) 
                      }} 
                    />
                  </TableCell>
                  <TableCell className="font-medium">
                    <span 
                      dangerouslySetInnerHTML={{ 
                        __html: highlightMatch(result.data[1] || '', query) 
                      }} 
                    />
                  </TableCell>
                  <TableCell>
                    <span 
                      dangerouslySetInnerHTML={{ 
                        __html: highlightMatch(result.data[2] || '', query) 
                      }} 
                    />
                  </TableCell>
                  <TableCell className="max-w-md">
                    <div className="flex flex-wrap gap-1">
                      {result.data.slice(3).filter(Boolean).map((alt, idx) => (
                        <span 
                          key={idx}
                          className="text-sm text-muted-foreground"
                          dangerouslySetInnerHTML={{ 
                            __html: highlightMatch(alt, query) 
                          }} 
                        />
                      )).reduce((prev, curr, idx) => 
                        idx === 0 ? [curr] : [...prev, <span key={`sep-${idx}`} className="text-muted-foreground mx-1">•</span>, curr], 
                        [] as React.ReactNode[]
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default SearchInterface;
