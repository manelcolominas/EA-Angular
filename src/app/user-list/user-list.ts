import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';
import { Organization } from '../models/organization.model';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
  FormControl,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';

@Component({
  selector: 'app-user-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './user-list.html',
  styleUrls: ['./user-list.css'],
})
export class UserList implements OnInit {
  users: User[] = [];
  organizations: Organization[] = [];
  filteredUsers: User[] = [];
  searchControl = new FormControl('');
  loading = false;
  errorMsg = '';
  isFormVisible = false;
  userForm!: FormGroup;
  isEditing = false;
  editingUserId: string | null = null;
  expanded: { [key: string]: boolean } = {};
  limit = 10;
  showAllUsers = false;

  constructor(
    private api: UserService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {
    this.userForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required],
      organization: ['', Validators.required],
    });

    this.searchControl = new FormControl('');
  }

  // Function to validate that passwords are identical
  passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    // We only validate if both fields have something written
    if (password && confirmPassword && password !== confirmPassword) {
      control.get('confirmPassword')?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  //Function: read
  ngOnInit(): void {
    this.load();
    this.loadOrganizations();

    this.searchControl.valueChanges.subscribe((value) => {
      const term = value?.toLowerCase() ?? '';

      this.filteredUsers = this.users.filter((user) => user.name.toLowerCase().includes(term));
      this.showAllUsers = false;
      this.cdr.detectChanges();
    });
  }

  //Getter: get visible users based on showAllUsers flag
  get visibleUsers(): User[] {
    if (this.showAllUsers) {
      return this.filteredUsers;
    }
    return this.filteredUsers.slice(0, this.limit);
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.api.getUsers().subscribe({
      next: (res: any) => {
        // Handle response whether it is the array directly or an object with users property
        if (Array.isArray(res)) {
          this.users = res;
        } else if (res && Array.isArray(res.users)) {
          this.users = res.users;
        } else {
           this.users = [];
           console.warn('Unexpected response format from getUsers', res);
        }

        this.filteredUsers = [...this.users];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error(err);
        this.errorMsg = 'Could not load users.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  //Function: trackBy to optimize ngFor
  trackById(_index: number, u: User): string {
    return u._id;
  }

  //Function: get organization name to display in the table
  organizationLabel(u: User): string {
    const org = u.organization;
    if (!org) return '-';
    if (typeof org === 'string') return org;
    return (org as Organization).name ?? '-';
  }

  //Function: show form
  showForm(): void {
    this.isFormVisible = true;
  }

  //Function: load organizations for the form select
  loadOrganizations(): void {
    this.api.getOrganizations().subscribe({
      next: (res) => {
        this.organizations = res;
        console.log('Organizations:', this.organizations);
      },
      error: (err) => console.error(err),
    });
  }

  //Function: show more
  showMore(): void {
    this.showAllUsers = true;
  }

  //Function: show less
  showLess(): void {
    this.showAllUsers = false;
  }


  //Function: save (for both create and update)
  save(): void {
    if (this.userForm.invalid) return;

    const { name, email, password, organization } = this.userForm.value;

    if (this.isEditing && this.editingUserId) {
      // UPDATE: we pass id, name, email, password, organization
      this.api.updateUser(this.editingUserId, name, email, password, organization).subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Could not update user.';
        },
      });
    } else {
      // CREATE: we pass name, email, password, organization
      this.api.createUser(name, email, password, organization).subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: (err) => {
          console.error(err);
          this.errorMsg = 'Could not create user.';
        },
      });
    }
  }

  //Function: expand row to show details
  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  //Function: confirm user deletion
  confirmDelete(id: string, name: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: name,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.delete(id);
      }
    });
  }

  //Function: edit user (shows the form with the data loaded)
  edit(user: User): void {
    this.isFormVisible = true;
    this.isEditing = true;
    this.editingUserId = user._id;

    this.userForm.patchValue({
      name: user.name,
      organization:
        typeof user.organization === 'string'
          ? user.organization
          : (user.organization as Organization)?._id,
    });
  }
  //Function: reset form
  resetForm(): void {
    this.isFormVisible = false;
    this.isEditing = false;
    this.editingUserId = null;
    this.userForm.reset();
  }

  //Function: delete user
  delete(id: string): void {
    this.errorMsg = '';
    this.loading = true;

    this.api.deleteUser(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.errorMsg = 'Error deleting';
        this.loading = false;
      },
    });
  }
}
