import {Component, OnInit} from '@angular/core';
import {AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators} from '@angular/forms';
import {HttpClient} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  form!: FormGroup;
  submitted = false;

  constructor(
    private formBuilder: FormBuilder,
    private http: HttpClient,
    private router: Router
  ) {
    this.form = this.formBuilder.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8), this.customPasswordValidator]]
    });
  }

  ngOnInit(): void {

  }

  customPasswordValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const password = control.value;
      if (!password || password.length === 0) {
        return null;
      }
  
      // Check for uppercase and lowercase letters
      if (!/[a-z]/.test(password) || !/[A-Z]/.test(password)) {
        return { requiresUpperLower: true };
      }
  
      // You can add more checks here, like checking for numbers or special characters
  
      return null;
    };
  }
  customEmailValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const email = control.value;
      if (!email || email.length === 0) {
        return null;
      }
  
      const allowedDomains = ['gmail.com', 'yahoo.com', 'yourdomain.com', 'etc.']; // Add your allowed domains
      const parts = email.split('@');
  
      if (parts.length !== 2 || !allowedDomains.includes(parts[1].split('.').pop().toLowerCase())) {
        return { invalidEmail: true };
      }
  
      return null;
    };
  }

submit(): void {
  this.submitted = true;
  if (this.form.valid){
    this.submitted=false;
    this.http.post('http://localhost:8000/api/register', this.form.getRawValue())
      .subscribe(
        () => this.router.navigate(['/login']),
        (error) => {
          if (error.error && error.error.email) {
            // Display an alert message to the user
            alert('Email already in use. Please choose a different email address.');
          } else {
            // Handle other potential errors
            console.error('Error registering user:', error);
          }
        }
      );
    }
  }
}