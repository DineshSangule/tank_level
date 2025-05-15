import { Component } from '@angular/core';
import { NzCardModule } from 'ng-zorro-antd/card';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-login',
  imports: [NzCardModule ,CommonModule,ReactiveFormsModule,NzFormModule ,NzInputModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginFrom: FormGroup;

  constructor(
    private fb: FormBuilder,
private authService:AuthService,
    private router :Router
  )
  {
    this.loginFrom = this.fb.group(
      {
        userId:['',Validators.required],
        password:['',Validators.required]
      }
    );
  }
    onsubmit()
    {
      if(this.loginFrom.valid)
      {
        this.authService.login(this.loginFrom.value).subscribe(
          {
            next:(res)=>
            {
              localStorage.setItem('token',res.token);
              this.router.navigate(['/dashboard']);
            },
            error:(err) =>
            {
              if(err.status===401)
              {
                alert('Invalid User Id Or Password');
              }
              else{
              alert('Login Failed');
            }
          }
          }
        );
      }
    }
}


