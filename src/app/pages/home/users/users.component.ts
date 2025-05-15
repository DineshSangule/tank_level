import { Component, OnInit } from '@angular/core';
import { NzTableModule, NzTableQueryParams } from 'ng-zorro-antd/table';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzDrawerModule } from 'ng-zorro-antd/drawer';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzInputNumberModule } from 'ng-zorro-antd/input-number'; 
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { UserService } from '../../../services/user.service';
import { FormBuilder,FormsModule, ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { NzMessageService } from 'ng-zorro-antd/message';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-users',
  imports: [NzModalModule, FormsModule,CommonModule ,
    ReactiveFormsModule,
    NzTableModule,
    NzButtonModule,
    NzIconModule,
    NzDrawerModule,
    NzFormModule,
    NzInputModule,
    NzSelectModule,
    NzInputNumberModule,
    NzDividerModule,
    NzTagModule],
  templateUrl: './users.component.html',
  styleUrl: './users.component.css'
})
export class UsersComponent implements OnInit {

  users: any[] = [];
  filteredUsers: any[] = [];
  isVisible = false;
  isEdit = false;
  form!: FormGroup;
  loading = false;
  currentUserId: number | null = null;
  searchText: string = '';
  constructor(private fb: FormBuilder,private userService: UserService,  private message: NzMessageService ) {}

  ngOnInit(): void {
      this.initForm();

  }

  
  initForm(): void {
    this.form = this.fb.group({
      name: ['', [Validators.required]],
      username: ['', [Validators.required]],
      password: ['', [Validators.required]],
      mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });
  }

  loadUsers():void{
    this.userService.getUsers().subscribe(
      {
        next:(data) =>
        {
           this.users = data;
           this.filteredUsers = data;
        },
        error: () => this.message.error("Failed to load users")
      }
    );
  }

  editUser(user: any):void{
    this.form.patchValue(
      {
        name:user.name,
        username: user.username,
        password: '',
        mobile: user.mobile
      }
    );
    this.currentUserId = user.id;
    this.isEdit = true;
    this.isVisible = true;
  }

  submitForm(): void{
    if(this.form.invalid)
    {
      this.message.warning('Please fill all required fields');
      return
    }
    
    this.loading = true;

    if(this.isEdit && this.currentUserId !== null)
    {
          this.updateUser();
    }
    else{
      this.addUser();
    }
  }

  addUser()
  {
    const userData = this.form.value;

    this.userService.addUser(userData).subscribe(
      {
        next: () =>
        {
          this.message.success('User added Successfully');
          this.loadUsers();
          this.close();
          this.loading = false;
        },
        error: () =>
        {
          this.message.error('Error adding user');
          this.loading = false;
        }
      }
    );
  }

  updateUser(): void{
    const userData = this.form.value;

    this.userService.updateUser(this.currentUserId!,userData).subscribe(
      {
        next: () =>
        {
          this.message.success('User updated Successfully');
          this.loadUsers();
          this.close();
          this.loading = false;

        },
        error: () =>
        {
          this.message.error('Error Updating user');
          this.loading = false;
        }
      }
    );
  }

  deleteUser(id: number): void
  {
    this.userService.deleteUser(id).subscribe
    ({
      next: () =>
      {
          this.message.success('user deleted');
          this.loadUsers();
      },
      error: ()=> this.message.error('failed to delete user')
    });
  }

 

  onSearch(): void
  {
    const search = this.searchText.trim().toLowerCase();
    if(search)
    {
      this.filteredUsers = this.users.filter(
        user=>user.name.toLowerCase().includes(search)||
        user.username.toLowerCase().includes(search)||
        user.mobile.includes(search)
      );
    }
    else{
      this.filteredUsers = this.users;
    }

  }


  open(): void {
    this.form.reset();
    this.isEdit = false;
    this.isVisible = true;
    this.currentUserId = null
  }

  close(): void {
    this.isVisible = false;
    this.currentUserId = null;
  }



}