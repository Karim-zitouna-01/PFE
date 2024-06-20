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
  numBins: number=1;
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
      

      this.http.post<any>('http://localhost:8000/api/transformation/convert/', requestBody)
      .subscribe(response => {
        // Handle successful response
        alert("conversion succefully done");
        this.dataUpdated.emit();
      },
      (error) => {
        alert(error.error.error); // User-friendly error message
      });
    }

  }

 

  discretizeData(){
    if(!this.datasetId) alert("please open a dataset ");
    else if(!this.selectedColumn) alert("please select a column")
    else if (this.selectedDiscretization=='') alert(" you should select a dicretization method");
    else if(this.numBins==0) alert("number of labels should be greater than 1");
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

      this.http.post<any>('http://localhost:8000/api/transformation/discretize/', requestBody)
      .subscribe(response => {
        // Handle successful response
        alert("Data descritized successfully ");
        this.dataUpdated.emit();
      },
      (error) => {
        // Handle errors
        //console.error('Error discretizing data:', error);
        alert("Error in discretization data: "+error.error.error); // User-friendly error message
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
    else if(!this.selectedSamplingMethod) alert("please select a sampling method");
    else if(!this.selectedSamplingAlgorithm) alert("No sampling algorithm choosen!");

    else{

      this.dataTransformed.emit();

      const requestBody = {
        dataset_id: this.datasetId, 
        target_column: this.selectedColumn,
        sampling_method: this.selectedSamplingAlgorithm
        };
  
        this.http.post<any>('http://localhost:8000/api/transformation/sample/', requestBody)
        .subscribe(response => {
          // Handle successful response
          alert("Data Sampling successfully done!");
          this.dataUpdated.emit();
        },
        (error) => {
          // Handle errors
          console.error('Error sampling data:', error);
          alert(error.error.error); // User-friendly error message
        });


        //console.log(requestBody);
    }

  }
}
