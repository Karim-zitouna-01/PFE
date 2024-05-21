import { Component, Input, Output, EventEmitter } from '@angular/core';
import { HttpClient } from '@angular/common/http';


interface Statistic {
  mean: number | null;
  median: number | null;
  max: number | null;
  min: number | null;
  mode: string | null;
  n_missing: number;
}

interface DataStats {
  [columnName: string]: Statistic; // Key is column name, value is Statistic object

}
@Component({
  selector: 'app-data-analysis',
  templateUrl: './data-analysis.component.html',
  styleUrls: ['./data-analysis.component.css']
})

export class DataAnalysisComponent {
  @Input()
  selectedColumn!: string; // receive the selected column name from the user component

  @Input()
  datasetId: number | undefined;  //receive the dataset id from the user component.

  @Output() visualizedImage = new EventEmitter<string>(); // Emit event when visualization is requested

  selectedAnalysis: string = ''; // Initial value is empty string
  selectedOption: string = ''; // 'all' or 'column'
  selectedVisType: string = ''; // 'numeric', 'categorical', or 'relationship'
  selectedChartType: string= ''; // 'pie' or 'bar' when selectedVisType==categorical 
  selectedVisColumn: string = '';
  selectedVisFeature1: string = '';
  selectedVisFeature2: string = '';
  columnNames: string[] = []; // List of column names for dropdown menus
  statisticsData: { data_stats: DataStats } | null = null;

  nb_rows=0;
  nb_columns=0;
  visualizationImage: string = '';

  

  constructor(private http: HttpClient) {}

  toggleFunctionality(analysis: string) {
    this.selectedAnalysis = this.selectedAnalysis === analysis ? '' : analysis;
    this.resetVisualizationOptions(); // Reset options when switching functionality
  }

  resetVisualizationOptions() {
    this.selectedVisType = '';
    this.selectedVisColumn = '';
    this.selectedVisFeature1 = '';
    this.selectedVisFeature2 = '';
  }

  // getVisualization() {
  //   if (!this.datasetId) {
  //     alert("Please open a dataset");
  //     return;
  //   }

  //   const requestBody: any = {
  //     dataset_id: this.datasetId
  //   };

  //   if (this.selectedVisType === 'numeric' || this.selectedVisType === 'categorical') {
  //     if (!this.selectedVisColumn) {
  //       alert("Please select a column for visualization");
  //       return;
  //     }
  //     requestBody['column_name'] = this.selectedVisColumn;
  //   } else if (this.selectedVisType === 'relationship') {
  //     if (!this.selectedVisFeature1 || !this.selectedVisFeature2) {
  //       alert("Please select both features for relationship visualization");
  //       return;
  //     }
  //     requestBody['feature1'] = this.selectedVisFeature1;
  //     requestBody['feature2'] = this.selectedVisFeature2;
  //   }

  //   this.visualizeData.emit(requestBody); // Emit event with request data
  // }


private numericDistributionUrl = 'http://localhost:8000/api/analysis/distribution_of_num';
private categoricalDistributionUrl = 'http://localhost:8000/api/analysis/distribution_of_cat';
private relationshipUrl = 'http://localhost:8000/api/analysis/relationship';

// Define the function to get the visualization image
getVisualization() {

  if (!this.datasetId) {
    alert("Please open a dataset");
    return;
  }
  if(!this.selectedVisType){
    alert("please select a visualization type");
    return;
  }
  let url: string = '';
  let params: any;

  // Determine the URL and parameters based on the selected visualization type
  if (this.selectedVisType === 'numeric') {

    if (!this.selectedColumn) {
      alert("Please select a column for visualization");
      return;
    }

    url = this.numericDistributionUrl;
    params = {
      column_name: this.selectedColumn,
      dataset_id: this.datasetId
    };
  } else if (this.selectedVisType === 'categorical') {

    if (!this.selectedColumn) {
      alert("Please select a column for visualization");
      return;
    }

    url = this.categoricalDistributionUrl;
    params = {
      column_name: this.selectedColumn,
      dataset_id: this.datasetId,
      chart_type: this.selectedChartType
    };
  } else if (this.selectedVisType === 'relationship') {


    if (!this.selectedVisFeature1 || !this.selectedVisFeature2) {
      alert("Please select both features for relationship visualization");
      return;
    }
  
    url = this.relationshipUrl;
    params = {
      dataset_id: this.datasetId,
      feature1: this.selectedVisFeature1,
      feature2: this.selectedVisFeature2
    };
  }

  // Send the GET request to the server to retrieve the visualization image
  this.http.get(url, { responseType: 'blob', params }).subscribe(response => {
    // Create a URL for the image and set it as the source of the <img> element
    const url = URL.createObjectURL(response);
    this.visualizationImage = url;
    this.visualizedImage.emit(url);
  });
}




  getStatistics() {
    if (!this.datasetId) {
      alert("Please open a dataset");
      return;
    }

    const requestBody: any = {
      dataset_id: this.datasetId
    };

    if (this.selectedOption === 'column') {
      if (!this.selectedColumn) {
        alert("Please select a column");
        return;
      }
      requestBody['column_name'] = this.selectedColumn;
      const url = 'http://localhost:8000/api/analysis/columnStats'; // Replace with your API endpoint
      this.http.get<any>(url, { params: requestBody })
        .subscribe(data => {
          console.log("Column Statistics:");
          console.log(data);
          this.statisticsData = { data_stats: data };
          console.log(this.statisticsData);
        });
    } else {
      const url = 'http://localhost:8000/api/analysis/datasetStats'; // Replace with your API endpoint
      this.http.get<any>(url, { params: requestBody })
        .subscribe(data => {
          console.log("Dataset Statistics:");
          console.log(data);
          this.statisticsData = data;
          console.log(this.statisticsData);
          this.nb_rows=data.num_rows;
          this.nb_columns=data.num_columns;
          console.log("Number of Rows:", data.num_rows);
        });
    }
  }


  updateFeature1(){
    this.selectedVisFeature1=this.selectedColumn;
    console.log("f1: "+this.selectedVisFeature1 +" f2: "+this.selectedVisFeature2);
  }

  updateFeature2(){
    this.selectedVisFeature2=this.selectedColumn;
    console.log("f1: "+this.selectedVisFeature1 +" f2: "+this.selectedVisFeature2);
  }



  getStatisticKeys(data: any) {
    if (!data) {
      return [];
    }
    console.log("Column Names:", Object.keys(data)); 
    return Object.keys(data);
  }




  // Call an API endpoint to get column names (assuming an endpoint exists)
  // This can be done in ngOnInit or a separate method based on your needs
  getColumnNames() {
    if (this.datasetId) {
      this.http.get<string[]>('http://localhost:8000/api/datasets/' + this.datasetId + '/columns/') // Replace with your API endpoint
        .subscribe(data => {
          this.columnNames = data;
        });
    }
  }
}
