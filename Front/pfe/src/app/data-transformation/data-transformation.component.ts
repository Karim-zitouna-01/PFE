import { HttpClient } from '@angular/common/http';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-data-transformation',
  templateUrl: './data-transformation.component.html',
  styleUrls: ['./data-transformation.component.css']
})
export class DataTransformationComponent {
  @Input()
  selectedColumn!: string; // receive the selected column name from the user component

  @Input() datasetId: number | undefined;  //receive the dataset id from the user component.

  @Output() dataUpdated = new EventEmitter<void>();
  @Output() dataTransformed =new EventEmitter<void>();


  selectedTransformation: string = ''; // Initial value is empty string
  
  selectedConversionType!: string;
  
  selectedDiscretization:string='';
  selectedSampling: string='';
  binLabels:any[]=[];
  numBins: number=0;
  trackByFn() {}
  selectedSamplingMethod='';
  selectedSamplingAlgorithm='';

  constructor(private http: HttpClient) {}

  toggleFunctionality(functionality: string) {
    this.selectedTransformation = this.selectedTransformation === functionality ? '' : functionality;
 // Update single variable
    console.log(this.selectedTransformation);

    // Update selectedColumn based on selectedColumnId (implementation needed)
    this.selectedColumn = ''; // Replace with logic to get column name based on ID
    console.log(this.selectedColumn);
  }

  toggleDiscretization(dis: string){
    this.selectedDiscretization=dis;

  }

  convertData() {
    if(!this.datasetId) alert("please open a dataset ");
    else if(!this.selectedColumn) alert("please select a column")
    else 
    {
      this.dataTransformed.emit();

    const requestBody = {
      dataset_id: this.datasetId, 
      column_name: this.selectedColumn,
      target_type: this.selectedConversionType
    };
    

    this.http.post<any>('http://localhost:8000/api/transformation/convert/', requestBody) // Replace with your API endpoint
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

  // Implement functions for discretization and sampling functionalities here

  discretizeData(){
    if(!this.datasetId) alert("please open a dataset ");
    else if(!this.selectedColumn) alert("please select a column")
    else if (this.selectedDiscretization=='') alert(" you should select a dicretization method");
    else if (this.binLabels.some(label => label === '')) {
      alert("You should label all the bins");
    }
    else{

    this.dataTransformed.emit();
  
    const requestBody = {
      dataset_id: this.datasetId, 
      column_name: this.selectedColumn,
      bins: this.numBins,
      names: this.binLabels,
      strategy: this.selectedDiscretization === 'equal-width' ? 'cut' : 'qcut'
      };

    this.http.post<any>('http://localhost:8000/api/transformation/discretize/', requestBody) // Replace with your API endpoint
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

    console.log(this.binLabels);

  }


  }
  updateBinLabel(index: number, value: string) {
    this.binLabels[index] = value;
  }
  
  updateBinLabels() {
    this.binLabels = new Array(this.numBins).fill(''); // Create array with size numBins and fill with empty strings
  }

  sampleData(){
    if(!this.datasetId) alert("please open a dataset ");
    else if(!this.selectedColumn) alert("please select a column");
    else if(!this.selectedSamplingMethod) alert("please a sampling method");
    else if(!this.selectedSamplingAlgorithm) alert("No sampling algorithm choosen!");

    else{

      this.dataTransformed.emit();

      const requestBody = {
        dataset_id: this.datasetId, 
        target_column: this.selectedColumn,
        sampling_method: this.selectedSamplingAlgorithm
        };
  
      this.http.post<any>('http://localhost:8000/api/transformation/sample/', requestBody) // Replace with your API endpoint
        .subscribe(response => {
          if (response.message) {
            // Success
            alert(response.message); // Display success message as alert
            this.dataUpdated.emit();
          } else {
            // Error
            alert("error in sampling");
            console.log(response.error);
            alert(response.error); // Display error message as alert
            
          }
        });


        //console.log(requestBody);
    }

  }
}
