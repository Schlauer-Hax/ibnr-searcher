
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
    
    const queryWords = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
    if (queryWords.length === 0) return text;
    
    // Sort words by length (longest first) to avoid partial matches interfering
    const sortedWords = queryWords.sort((a, b) => b.length - a.length);
    
    // Create a single regex that matches any of the words
    const escapedWords = sortedWords.map(word => word.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    const regex = new RegExp(`(${escapedWords.join('|')})`, 'gi');
    
    return text.replace(regex, '<mark class="bg-yellow-200 px-1 rounded">$1</mark>');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="w-full max-w-6xl mx-auto p-6 space-y-8">
        <div className="text-center space-y-6 py-12">
          <div className="relative">
            <h1 className="text-6xl font-bold bg-gradient-to-r from-primary via-blue-500 to-purple-500 bg-clip-text text-transparent">
              IBNR Searcher
            </h1>
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-blue-500 to-purple-500 opacity-20 blur-3xl -z-10"></div>
          </div>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Search for IBNR station codes used by Deutsche Bahn for railway stations across Germany and Europe
          </p>
        </div>

        <div className="relative max-w-2xl mx-auto">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
          <Input
            type="text"
            placeholder="Search IBNR codes, station names, or locations..."
            value={query}
            onChange={handleInputChange}
            className="pl-12 text-lg py-8 bg-card/80 backdrop-blur-sm border-primary/20 focus:border-primary/50 shadow-lg hover:shadow-glow transition-all duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-purple-500/10 rounded-md -z-10 blur-xl opacity-50"></div>
        </div>

        {query.trim().length > 0 && (
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20">
              <span className="text-sm text-muted-foreground">
                Found <span className="text-primary font-semibold">{results.length}</span> results for "{query}"
              </span>
            </div>
          </div>
        )}

        {results.length > 0 && (
          <div className="border border-primary/20 rounded-xl overflow-hidden bg-card/50 backdrop-blur-sm shadow-2xl">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-24">Sources</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Alternative Names</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {results.map((result) => (
                <TableRow key={result.id} className="hover:bg-primary/5 transition-colors duration-200 border-border/50">
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {result.sources.map((source, idx) => (
                        <Badge 
                          key={idx}
                          variant={
                            source === 'Deutschland' ? 'default' : 
                            source === 'Europe' ? 'secondary' : 'outline'
                          } 
                          className="shadow-sm text-xs"
                        >
                          {source}
                        </Badge>
                      ))}
                    </div>
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
    </div>
  );
};

export default SearchInterface;
