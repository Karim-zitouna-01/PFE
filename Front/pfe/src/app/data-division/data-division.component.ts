import { Component, OnInit, Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-data-division',
  templateUrl: './data-division.component.html',
  styleUrls: ['./data-division.component.css']
})
export class DataDivisionComponent implements OnInit {
  @Input() datasetId: number | undefined;  // Receives dataset ID from user component
  testSize: number =20; // Default test size

  constructor(private http: HttpClient) {}

  ngOnInit() {
    

  }

  divideData() {
   
    if (!this.datasetId) {
      console.error('Dataset ID not received from user component!');
      // Handle the case where dataset ID is missing
      alert("you should open a data set");
      return;
    }
    if(this.testSize<0 ||this.testSize>99){
      alert(" the size should be between 0 and 99");
      return;
    }
    const url = `http://localhost:8000/api/divide/`;  // Replace with your actual API endpoint
    const body = {
      dataset_id: this.datasetId,
      test_size: this.testSize/100,
      train_size: 1- this.testSize/100
    };
    console.log(this.datasetId);

    this.http.post(url, body, { responseType: 'blob' })  // Request response as blob
      .subscribe(response => {
        const filename = `split-${Date.now()}.zip`;  // Generate unique filename

        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(response);  // Create temporary URL
        link.setAttribute('download', filename);
        link.click();  // Simulate a click to trigger download

        // Optional: Revoke the temporary URL after download (recommended)
        window.URL.revokeObjectURL(link.href);
      }, error => {
        console.error('Error during data division:', error);
        // Handle errors (e.g., display error message)
      });
  }
}
