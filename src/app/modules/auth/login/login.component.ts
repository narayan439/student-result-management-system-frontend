import { Component, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';
import { NgForm } from '@angular/forms';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {

  @ViewChild('loginForm', { static: false }) loginForm!: NgForm;

  loginData = {
    email: '',
    password: ''
  };

  isLoading: boolean = false;
  showPassword: boolean = false;

  constructor(private auth: AuthService, private router: Router) {}

  onLogin() {
    // Check if form is valid
    if (this.loginForm && this.loginForm.invalid) {
      // Mark all fields as touched to show validation errors
      Object.keys(this.loginForm.controls).forEach(key => {
        const control = this.loginForm.controls[key];
        control.markAsTouched();
      });
      return;
    }

    // If no form reference, do basic validation
    if (!this.loginData.email || !this.loginData.password) {
      alert("Please enter both email and password");
      return;
    }

    this.isLoading = true;
    
    // Simulate API delay
    setTimeout(() => {
      const role = this.auth.fakeLogin(this.loginData.email, this.loginData.password);

      if (role) {
        // Save user session
        this.auth.saveUserSession(this.loginData.email, role);
        
        // Navigate based on role
        if (role === 'ADMIN') {
          this.router.navigate(['/admin']);
        }
        else if (role === 'TEACHER') {
          this.router.navigate(['/teacher']);
        }
        else if (role === 'STUDENT') {
          this.router.navigate(['/student']);
        }
      }
      else {
        alert("❌ Invalid email or password");
      }
      
      this.isLoading = false;
    }, 1000);
  }

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  goBack() {
    this.router.navigate(['/']);
  }

  // Helper method to check form validity
  isFormValid(): boolean {
    if (this.loginForm) {
      return !!this.loginForm.valid;
    }
    return !!(this.loginData.email && this.loginData.password);
  }
}