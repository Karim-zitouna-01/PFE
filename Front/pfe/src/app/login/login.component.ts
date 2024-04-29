import {Component, OnInit} from '@angular/core';
import {FormBuilder, FormGroup} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  form!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
  }

  ngOnInit(): void {
    this.form = this.formBuilder.group({
      email: '',
      password: ''
    });
  }

  submit(): void {
    this.http.post('http://localhost:8000/api/login', this.form.getRawValue(), {
      withCredentials: true
    }).subscribe(() => this.router.navigate(['/user']), 
    (error)=>{
      if (error.error && error.error.detail=='Incorrect password!') {
        // Display an alert message to the user
        alert('Incorrect password');
      }
      if (error.error && error.error.detail=='User not found!') {
        // Display an alert message to the user
        alert('User not found! Verify your email');
      }
    }
  );
  }
}