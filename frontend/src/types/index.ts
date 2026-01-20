// CLAUDE.md의 JSON 템플릿 구조 반영

export interface ChartTemplate {
  id: string;
  name: string;
  layout: LayoutItem[];
  charts: ChartConfig[];
}

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface ChartConfig {
  id: string;
  type: 'bar' | 'line' | 'pie' | 'area';
  title: string;
  dataBinding: {
    xAxis: string;
    yAxis: string[];
    dataSource: string;
  };
  style: {
    colors: string[];
  };
}

export interface ReportData {
  template: ChartTemplate;
  data: Record<string, any[]>;
  report_date: string;
}
