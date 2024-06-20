import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Emitters } from '../emitters/emitters';
import { Router } from '@angular/router';

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
  modules: string[] = ['Data Cleaning', 'Data Transformation', 'Data Analysis', 'Data Division'];
  selectedModule: string | null = null;
  selectedFile: File | null = null;
  showMore = false;

  openedFileId!: number; //  for client-side tracking
  isLoading = false;
  fileContent = '';
  selectedColumn: string = '';


  displayedData: any[][] = []

  selectedDatasetId = new EventEmitter<number>();
  

  message = '';
  fileName='';

  undoStack: any[] = []; // Stack to store previous data versions (limited size)
  redoStack: any[] = []; // Stack to store "undone" data versions (limited size)
  initialData: any; // Store initial data before any transformations
  maxUndoSteps = 5; // Maximum number of undo steps allowed
  data="";

visualizationImage: string='';


  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.uploadedFiles=[];
  }

  ngOnInit(): void {
    // Fetch uploaded files from Django API 
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
        this.router.navigate(['/login']);
        
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

    // this.undoStack=[];
    // this.redoStack = [];
    
  
    this.http.get(`http://localhost:8000/api/my-datasets/open/${datasetId}`, { 
      responseType: 'text',
      withCredentials : true
    })
      .subscribe(response => {
        this.processDataAndDisplay(response);
        this.data=response;
        this.initialData=response;
      }, error => {
        this.isLoading = false;
        console.error('Error opening file:', error);
        // Handle potential errors (e.g., display error message)
      });


  }
  re_openFile(){
    
    this.http.get(`http://localhost:8000/api/my-datasets/open/${this.openedFileId}`, { 
      responseType: 'text',
      withCredentials : true
    })
      .subscribe(response => {
        this.processDataAndDisplay(response);
        this.data=response;
        
      }, error => {
        this.isLoading = false;
        console.error('Error opening file:', error);
        // Handle potential errors (e.g., display error message)
      });
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

    if (confirm('All changes will be saved and cannot be undone ! are you sure you want to close the file ')){
  
    this.openedFileId = 0; // Update client-side state
    this.isLoading = false;
    this.fileContent = '';
    this.displayedData=[];
    this.data="";
    this.initialData="";
    this.undoStack=[];
    this.redoStack = [];
  }

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




  /*****************undo / redo / save ********************* */


  // Function to store data in undo stack
  storeDataForUndo() {
    if (this.undoStack.length === this.maxUndoSteps) {
      this.undoStack.shift(); // Remove oldest version if stack is full
    }
    this.undoStack.push(this.data); // Push a copy of the data
    this.redoStack = []; // Clear redo stack when performing undo
  }

  // storeDataForUndo(data: any) {
  //   if (this.undoStack.length === this.maxUndoSteps) {
  //     this.undoStack.shift(); // Remove oldest version if stack is full
  //   }
  //   this.undoStack.push(data.slice()); // Push a copy of the data
  //   this.redoStack = []; // Clear redo stack when performing undo
  // }

  undo() {
    if (this.undoStack.length > 0) {
      const previousData = this.undoStack.pop();
      // ... send previousData to back-end using Overwrite API 
      this.redoStack.push(this.data); // Push current data to redo stack
      
      //create file to send it:
       //this.fileName= 'undo_data.csv'; // Define a filename (optional)
      
      for(let f of this.uploadedFiles.slice(0, this.uploadedFiles.length )){
        if(f.id == this.openedFileId){
          this.fileName=f.file_name;
        }
      }

      const file = new File([previousData], this.fileName, { type: 'text/csv' }); // Create File object

      //update dataset: send the previous one to the abck-end
      let formData = new FormData();
      formData.append('uploaded_file', file);
  
      // call API
      this.http.post(`http://localhost:8000/api/my-datasets/overwrite/${this.openedFileId}/`, formData, {
        withCredentials: true
      }).subscribe((response) => {
        this.fetchUploadedFiles();
        this.re_openFile();
      });
      
      
    } else {
      alert('No more undo steps available!');
    }
  }

  // `http://localhost:8000/api/my-datasets/${fileId}/delete`,{


  // undo() {
  //   if (this.undoStack.length > 0) {
  //     const previousData = this.undoStack.pop();
  //     // ... send previousData to back-end using Overwrite API (replace current data)
  //     this.redoStack.push(this.data.slice()); // Push current data to redo stack
  //     this.data = previousData; // Update data in component
  //     // Update visualizations based on the updated data
  //   } else {
  //     alert('No more undo steps available!');
  //   }
  // }

  redo() {
    if (this.redoStack.length > 0) {
      const redoData = this.redoStack.pop();
      // ... send redoData to back-end using Overwrite API (replace current data)
      this.undoStack.push(this.data); // Push current data to undo stack
      for(let f of this.uploadedFiles.slice(0, this.uploadedFiles.length )){
        if(f.id == this.openedFileId){
          this.fileName=f.file_name;
        }
      }

      const file = new File([redoData], this.fileName, { type: 'text/csv' }); // Create File object

      //update dataset: send the previous one to the abck-end
      let formData = new FormData();
      formData.append('uploaded_file', file);
  
      // call API
      this.http.post(`http://localhost:8000/api/my-datasets/overwrite/${this.openedFileId}/`, formData, {
        withCredentials: true
      }).subscribe((response) => {
        this.fetchUploadedFiles();
        this.re_openFile();
      });
    } else {
      alert('No more redo steps available!');
    }
  }



  // redo() {
  //   if (this.redoStack.length > 0) {
  //     const redoData = this.redoStack.pop();
  //     // ... send redoData to back-end using Overwrite API (replace current data)
  //     this.undoStack.push(this.data.slice()); // Push current data to undo stack
  //     this.data = redoData; // Update data in component
  //     // Update visualizations based on the updated data
  //   } else {
  //     alert('No more redo steps available!');
  //   }
  // }


  resetData() {
    

    for(let f of this.uploadedFiles.slice(0, this.uploadedFiles.length )){
      if(f.id == this.openedFileId){
        this.fileName=f.file_name;
      }
    }
    console.log(this.initialData);

    const file = new File([this.initialData], this.fileName, { type: 'text/csv' }); // Create File object

    //update dataset: send the previous one to the abck-end
    let formData = new FormData();
    formData.append('uploaded_file', file);

    // call API
    this.http.post(`http://localhost:8000/api/my-datasets/overwrite/${this.openedFileId}/`, formData, {
      withCredentials: true
    }).subscribe((response) => {
      this.fetchUploadedFiles();
      this.re_openFile();
    });


    this.undoStack = [];
    this.redoStack = [];
  }




  onImageUrlChange(imageUrl: string) {
    this.visualizationImage = imageUrl;
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