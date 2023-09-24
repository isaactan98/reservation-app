import { Component, OnInit } from '@angular/core';
import { FormControl,FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { AuthenticationService } from '../../../core/services/auth.service';
import { environment } from '../../../../environments/environment';
import { first } from 'rxjs/operators';
import { UserProfileService } from '../../../core/services/user.service';
import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';


@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.scss']

})
export class SignupComponent implements OnInit {

  signupForm: FormGroup;
  submitted = false;
  error = '';
  successmsg = false;
  working = false;
  minDate:String;
  maxDate:String;
  name :'dobdate';
  strongPassword = false;
  password;
  confirm_password;
  show1: boolean = false;
  show2: boolean = false;


  transform(value: string) {
       var datePipe = new DatePipe("en-US");
        value = datePipe.transform(value, 'dd/MM/yyyy');
        return value;
    }

  // set the current year
  year: number = new Date().getFullYear();

  // tslint:disable-next-line: max-line-length
  constructor(private formBuilder: FormBuilder, private route: ActivatedRoute, private router: Router, private authenticationService: AuthenticationService,
    private userService: UserProfileService) {
  }


  ngOnInit() {
    this.password = 'password';
    this.confirm_password = 'password2';
    const today = new Date();
    this.minDate = new Date(this.year - 100, 0, 1).toISOString().split('T')[0];
    this.maxDate = new Date(this.year - 12, 0, 1).toISOString().split('T')[0];
    this.signupForm = this.formBuilder.group({
      username: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8),Validators.pattern(
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/)]],
      confirm_password: ['', [Validators.required, Validators.minLength(8),Validators.pattern(
        /(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[@$!%*#?&^_-]).{8,}/)]],
      dob: ['', Validators.required],
    });
  }

  onPasswordStrengthChanged(event: boolean) {
    this.strongPassword = event;
  }

  // convenience getter for easy access to form fields
  get f() { return this.signupForm.controls; }

  /**
   * On submit form
   */
  onSubmit() {
    this.submitted = true;


    // stop here if form is invalid
    if (this.signupForm.invalid) {
      return;
    } else {
      if (environment.defaultauth === 'firebase') {
        this.authenticationService.register(this.f.email.value, this.f.password.value).then((res: any) => {
          this.successmsg = true;
          if (this.successmsg) {
            this.router.navigate(['/dashboard']);
          }
        })
          .catch(error => {
            this.error = error ? error : '';
          });
      } else {
        this.userService.register(this.signupForm.value)
          .pipe(first())
          .subscribe(
            data => {
              this.successmsg = true;
              if (this.successmsg) {
                this.router.navigate(['/account/login']);
              }
            },
            error => {
              this.error = error ? error : '';
            });
      }
    }

    this.working = true;
    setTimeout(() => {
      this.signupForm.reset();
      this.working = false;
    }, 1000);
  }

  onClick(fieldNumber: number) {
    if (fieldNumber === 1) {
      this.show1 = !this.show1;
    } else if (fieldNumber === 2) {
      this.show2 = !this.show2;
    }
  }

}
