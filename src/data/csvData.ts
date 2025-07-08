
// CSV data will be loaded dynamically from public folder
export let csvData1: string[] = [];
export let csvData2: string[] = [];
export let csvData3: string[] = [];

// Function to load CSV data from files
export const loadCSVData = async (): Promise<void> => {
  try {
    const [response1, response2, response3] = await Promise.all([
      fetch('./deutschland_nr.csv'),
      fetch('./europa.csv'),
      fetch('./grenze.csv')
    ]);
    
    // Get response as ArrayBuffer and decode with UTF-8, handling BOM if present
    const [buffer1, buffer2, buffer3] = await Promise.all([
      response1.arrayBuffer(),
      response2.arrayBuffer(),
      response3.arrayBuffer()
    ]);
    
    const decodeWithBOM = (buffer: ArrayBuffer): string => {
      const uint8Array = new Uint8Array(buffer);
      
      // Check for UTF-8 BOM (EF BB BF)
      if (uint8Array.length >= 3 && 
          uint8Array[0] === 0xEF && 
          uint8Array[1] === 0xBB && 
          uint8Array[2] === 0xBF) {
        // Remove BOM and decode
        const withoutBOM = uint8Array.slice(3);
        return new TextDecoder('utf-8').decode(withoutBOM);
      }
      
      // Try UTF-8 first
      try {
        return new TextDecoder('utf-8', { fatal: true }).decode(uint8Array);
      } catch {
        // Fallback to Windows-1252 (common for CSV files)
        return new TextDecoder('windows-1252').decode(uint8Array);
      }
    };
    
    const [text1, text2, text3] = [
      decodeWithBOM(buffer1),
      decodeWithBOM(buffer2),
      decodeWithBOM(buffer3)
    ];
    
    csvData1 = text1.trim().split('\n').filter(line => line.trim());
    csvData2 = text2.trim().split('\n').filter(line => line.trim());
    csvData3 = text3.trim().split('\n').filter(line => line.trim());
    
    console.log('CSV data loaded successfully');
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
