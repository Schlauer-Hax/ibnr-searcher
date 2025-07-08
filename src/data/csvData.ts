
// CSV data will be loaded dynamically from public folder
export let csvData1: string[] = [];
export let csvData2: string[] = [];
export let csvData3: string[] = [];

// Function to load CSV data from files
export const loadCSVData = async (): Promise<void> => {
  try {
    const [response1, response2, response3] = await Promise.all([
      fetch('/deutschland_nr.csv'),
      fetch('/europa.csv'),
      fetch('/grenze.csv')
    ]);
    
    // Read as ArrayBuffer first, then decode with proper UTF-8 handling
    const [buffer1, buffer2, buffer3] = await Promise.all([
      response1.arrayBuffer(),
      response2.arrayBuffer(),
      response3.arrayBuffer()
    ]);
    
    // Use TextDecoder to properly handle UTF-8 encoding
    const decoder = new TextDecoder('utf-8');
    const [text1, text2, text3] = [
      decoder.decode(buffer1),
      decoder.decode(buffer2),
      decoder.decode(buffer3)
    ];
    
    csvData1 = text1.trim().split('\n').filter(line => line.trim());
    csvData2 = text2.trim().split('\n').filter(line => line.trim());
    csvData3 = text3.trim().split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('Error loading CSV data:', error);
    // Fallback to empty arrays if loading fails
    csvData1 = [];
    csvData2 = [];
    csvData3 = [];
  }
};

export interface SearchResult {
  id: string;
  data: string[];
  score: number;
  source: 'Deutschland' | 'Europe' | 'Grenze';
  sources: ('Deutschland' | 'Europe' | 'Grenze')[]; // Array of all sources where this entry appears
}
