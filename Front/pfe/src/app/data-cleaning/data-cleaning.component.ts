import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-data-cleaning',
  templateUrl: './data-cleaning.component.html',
  styleUrls: ['./data-cleaning.component.css']
})
export class DataCleaningComponent {
  @Input()
  selectedColumn!: string; // receive the selected column name from the user component

  @Input()
  datasetId: number | undefined;  //receive the dataset id from the user component.

  @Output() dataUpdated = new EventEmitter<void>();
  @Output() dataTransformed =new EventEmitter<void>();

  selectedCleaning: string = ''; // Initial value is empty string

  selectedImputationMethod!: string;
  selectedOutlierMethod!: string;
  outlierThreshold: number = 0; // Optional threshold for outlier removal

  constructor(private http: HttpClient) {}

  toggleFunctionality(functionality: string) {
    this.selectedCleaning = this.selectedCleaning === functionality ? '' : functionality;
    console.log(this.selectedCleaning);
    // Update selectedColumn based on selectedColumnId (implementation needed)
    this.selectedColumn = ''; // Replace with logic to get column name based on ID
    console.log(this.selectedColumn);
  }

  imputeMissingValues() {
    if (!this.datasetId) alert("Please open a dataset");
    else if (!this.selectedColumn) alert("Please select a column");
    else if (!this.selectedImputationMethod) alert("Please choose an imputation method");
    else {
      this.dataTransformed.emit();

      const requestBody = {
        dataset_id: this.datasetId,
        column_name: this.selectedColumn,
        imputation_method: this.selectedImputationMethod
      };

      this.http.post<any>('http://localhost:8000/api/cleaning/impute/', requestBody) // Replace with your API endpoint
        .subscribe(response => {
          if (response.message) {
            // Success
            //alert(response.message); // Display success message as alert
            this.dataUpdated.emit();
          } else if (response.error) {
            // Error
            alert(response.error); // Display error message as alert
          }
        });
    }
  }

  handleOutliers() {
    if (!this.datasetId) alert("Please open a dataset");
    else if (!this.selectedColumn) alert("Please select a column");
    else if (!this.selectedOutlierMethod) alert("Please choose an outlier handling method");
    else {
      this.dataTransformed.emit();

      const requestBody = {
        dataset_id: this.datasetId,
        column_name: this.selectedColumn,
        outlier_handling: this.selectedOutlierMethod,
        threshold: 3
      };

      // if (this.selectedOutlierMethod === 'remove' && this.outlierThreshold > 0) {
      //   requestBody['threshold'] = this.outlierThreshold;
      // }

      this.http.post<any>('http://localhost:8000/api/cleaning/handle-outliers/', requestBody) // Replace with your API endpoint
        .subscribe(response => {
          if (response.message) {
            // Success
            //alert(response.message); // Display success message as alert
            this.dataUpdated.emit();
          } else if (response.error) {
            // Error
            alert(response.error); // Display error message as alert
          }
        });
    }
  }
}
