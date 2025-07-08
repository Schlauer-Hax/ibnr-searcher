
// CSV data will be loaded dynamically from public folder
export let csvData1: string[] = [];
export let csvData2: string[] = [];

// Function to load CSV data from files
export const loadCSVData = async (): Promise<void> => {
  try {
    const [response1, response2] = await Promise.all([
      fetch('/deutschland_nr.csv'),
      fetch('/europa.csv')
    ]);
    
    const [text1, text2] = await Promise.all([
      response1.text(),
      response2.text()
    ]);
    
    csvData1 = text1.trim().split('\n').filter(line => line.trim());
    csvData2 = text2.trim().split('\n').filter(line => line.trim());
  } catch (error) {
    console.error('Error loading CSV data:', error);
    // Fallback to empty arrays if loading fails
    csvData1 = [];
    csvData2 = [];
  }
};

export interface SearchResult {
  id: string;
  data: string[];
  score: number;
  source: 'Deutschland' | 'Europe';
}
