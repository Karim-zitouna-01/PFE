import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';

interface File {
  name: string;
}



@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.css']
})
export class UserComponent implements OnInit {
  uploadedFile: any;
  uploadedFiles: any[]=[];
  modules: string[] = ['Data Cleaning', 'Data Transformation', 'Data Visualization', 'Data Division'];
  selectedModule: string | null = null;
  selectedFile: File | null = null;
  showMore = false;

  openedFileId!: number; // Optional for client-side tracking
  isLoading = false;
  fileContent = '';
  selectedColumn: string = '';


  displayedData: any[][] = []

  selectedDatasetId = new EventEmitter<number>();

  message = '';

  constructor(
    private http: HttpClient
  ) {
    this.uploadedFiles=[];
  }

  ngOnInit(): void {
    // Fetch uploaded files from Django API (replace with your actual logic)
    //this.fetchUploadedFiles();
    this.http.get('http://localhost:8000/api/user', {
      withCredentials: true}).subscribe(
      (res: any) => {
        this.message = `Hi ${res.name}`;
        Emitters.authEmitter.emit(true);
      },
      err => {
        this.message = 'You are not logged in';
        Emitters.authEmitter.emit(false);
      }
    );
    this.fetchUploadedFiles();


  }

  fetchUploadedFiles() {
    this.http.get('http://localhost:8000/api/my-datasets', {
      withCredentials : true
    }).subscribe(
      (data: any) => {
        this.uploadedFiles = data;
      });
  }





  openFile(datasetId: number) {
    // if (this.openedFileId === datasetId) {
    //   return; // Prevent opening the same file again
    // }
  
    this.isLoading = true;
    this.fileContent = '';
    this.openedFileId = datasetId;
    
  
    this.http.get(`http://localhost:8000/api/my-datasets/open/${datasetId}`, { 
      responseType: 'text',
      withCredentials : true
    })
      .subscribe(response => {
        this.processDataAndDisplay(response);
      }, error => {
        this.isLoading = false;
        console.error('Error opening file:', error);
        // Handle potential errors (e.g., display error message)
      });


  }
  re_openFile(){
    this.openFile(this.openedFileId);
  }



  processDataAndDisplay(csvData: string) {
    const rows = csvData.split('\n');
    
    const parsedData = [];
    for (const row of rows) {
      const cells = row.split(',');
      parsedData.push(cells);
    }
  
    this.displayedData = parsedData;
  }


  onHeaderClick(event: MouseEvent) {
    const clickedElement = event.target as HTMLElement;
    if (clickedElement.tagName === 'TH') { // Check if clicked on a table header cell
      this.selectedColumn = clickedElement.innerText;
    }
    
  }
  
 
  downloadFile() {
    if (!this.openedFileId) {
      return; // Prevent download if no dataset is opened
    }
  
    const downloadUrl = `http://localhost:8000/api/my-datasets/export/${this.openedFileId}`;
    const link = document.createElement('a');
  
    link.href = downloadUrl;
    // Set appropriate content type for CSV download (optional)
    link.type = 'text/csv;charset=utf-8';
    link.download = `dataset_${this.openedFileId}.csv`; // Set a default filename
  
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
 
  

  closeFile(datasetId: number) {
    // Implement logic to close the file on the backend (if needed)
    // ... (e.g., call a close endpoint)
  
    this.openedFileId = 0; // Update client-side state
    this.isLoading = false;
    this.fileContent = '';
    this.displayedData=[];
  }

  confirmDelete(fileId: number) {
    if (confirm('Are you sure you want to delete this file?')) {
      this.deleteFile(fileId); // Delete if confirmed
    }
  }

  deleteFile(fileId: number) {
    this.http.delete(`http://localhost:8000/api/my-datasets/${fileId}/delete`,{
      withCredentials : true
    })
      .subscribe(() => {
        this.fetchUploadedFiles(); // Refresh the list
      }, (error) => {
        console.error('File deletion failed:', error);
        // Display error message to the user
      });
  }


  showMoreFiles() {
    this.showMore = !this.showMore; // Toggle "show more" state
  }





  selectModule(module: string) {
    this.selectedModule = module;
    // Implement logic to display functions associated with the selected module
    // (might involve API calls for specific functions)
  }

  


  // drop zone logic **********************************************
  getFile(event: any) {
    this.uploadedFile=event.target.files[0];
    console.log('file', this.uploadedFile);
    }
  

  uploadFile() {
    let formData = new FormData(); 
    //formData.set('file', this.uploadedFile);

    formData.append('uploaded_file', this.uploadedFile);
    formData.append('file_name', this.uploadedFile.name);

    // call API
    this.http.post('http://localhost:8000/api/upload', formData, {
      withCredentials: true
    }).subscribe((response) => {
      this.fetchUploadedFiles();
    });
    this.uploadedFile=null;

  }


  onFileSelected(event: any) {
    const selectedFile = event.target.files[0];
    const existingFile = this.uploadedFiles.find(file => file.file_name === selectedFile.name);
  
    if (existingFile) {
      alert('Error: File with the same name already exists!');
      return; // Prevent further processing if filename exists
    }
  
    this.uploadedFile = selectedFile;
    console.log('file', this.uploadedFile);
    
  }



  

  /********************************** */
}


/*
//old implementation (detect if the user is connected)
export class UserComponent implements OnInit {
  message = '';

  constructor(
    private http: HttpClient
  ) {
  }

  ngOnInit(): void {
    this.http.get('http://localhost:8000/api/user', {withCredentials: true}).subscribe(
      (res: any) => {
        this.message = `Hi ${res.name}`;
        Emitters.authEmitter.emit(true);
      },
      err => {
        this.message = 'You are not logged in';
        Emitters.authEmitter.emit(false);
      }
    );
  }

}

*/

/*
// drop file logic
file: any;
getFile(event: any) (
this.file event.target.files[0];
console.log('file', this.file);
}
uploadFile()
let formData new FormData(); formData.set('file', this.file);
// call API
this.http .post('http://localhost:3001/upload/uploadFiles', formData) subscribe((response) => {});


*/