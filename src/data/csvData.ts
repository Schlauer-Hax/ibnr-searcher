
export const csvData1 = [
  "8000001;Aachen Hbf;AC;Aken C;Aquisgrana;Aix-la-Chapelle;Aquisgrán",
  "8000002;Aalen;AA;;;;",
  "8000003;Furth i Wald(Gr);;;;;",
  "8000004;Altenbeken;;;;;",
  "8000007;Alzey;AZ;;;;",
  "8000008;Kehl(Gr);;;;;",
  "8000009;Ansbach;AN;;;;",
  "8000010;Aschaffenburg Hbf;AB;;;;",
  "8000011;Ascheberg(Holst);;;;;",
  "8000012;Au(Sieg);Windeck-Au(Sieg);;;;",
  "8000013;Augsburg Hbf;A;Augsbourg;;;",
  "8000014;Aulendorf;;;;;",
  "8000015;Babenhausen(Hess);;;;;",
  "8000016;Backnang;BK;;;;",
  "8000017;Bad Friedrichshall Hbf;Bad Friedrichshall-Jagstfeld;Friedrichshall-Jagstfeld Bad;;;"
];

export const csvData2 = [
  // Add your second CSV data here in the same format
  "9000001;Berlin Hbf;BER;Berlin Central;;;",
  "9000002;München Hbf;M;Munich;;;",
  "9000003;Hamburg Hbf;HH;Hamburg;;;",
  "9000004;Köln Hbf;K;Cologne;;;",
  "9000005;Frankfurt(Main)Hbf;F;Frankfurt;;;",
];

export interface SearchResult {
  id: string;
  data: string[];
  score: number;
  source: 'CSV1' | 'CSV2';
}
