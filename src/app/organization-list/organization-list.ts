import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { OrganizationService } from '../services/organization.service';
import { Organization } from '../models/organization.model';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormGroup,
  Validators,
  FormControl,
} from '@angular/forms';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { ConfirmDialogComponent } from '../confirm-dialog/confirm-dialog';
import { OrganizationUserManager } from '../organization-user-manager/organization-user-manager';

@Component({
  selector: 'app-organization-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MatDialogModule, OrganizationUserManager],
  templateUrl: './organization-list.html',
  styleUrls: ['./organization-list.css'],
})
export class OrganizationList implements OnInit {
  organizations: Organization[] = [];
  filteredOrganizations: Organization[] = [];
  searchControl = new FormControl('');
  loading = true;
  errorMsg = '';
  showForm = false;
  organizationForm!: FormGroup;
  isEditing = false;
  editingOrganizationId: string | null = null;
  expanded: { [key: string]: boolean } = {};
  limit = 10;
  showAllOrganizations = false;
  selectedOrganization: Organization | null = null;

  constructor(
    private api: OrganizationService,
    private fb: FormBuilder,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
  ) {
    this.organizationForm = this.fb.group({
      name: ['', Validators.required],
    });
  }

  // Function: read
  ngOnInit(): void {
    this.load();

    this.searchControl.valueChanges.subscribe((value) => {
      const term = value?.toLowerCase() ?? '';

      this.filteredOrganizations = this.organizations.filter((org) =>
        org.name.toLowerCase().includes(term),
      );
    });
  }

  load(): void {
    this.loading = true;
    this.errorMsg = '';
    this.cdr.detectChanges();

    this.api.getOrganizations().subscribe({
      next: (res) => {
        this.organizations = res as any as Organization[];
        this.filteredOrganizations = [...this.organizations];
        this.loading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.errorMsg = 'Could not load organizations.';
        this.loading = false;
        this.cdr.detectChanges();
      },
    });
  }

  // Function: trackBy to optimize ngFor
  trackById(_index: number, org: Organization): string {
    return org._id;
  }

  // Function: show form
  showFormHandler(): void {
    this.showForm = true;
  }

  // Function: show more organizations
  showMore(): void {
    this.showAllOrganizations = true;
  }

  get visibleOrganizations(): Organization[] {
    if (this.showAllOrganizations) {
      return this.filteredOrganizations;
    }
    return this.filteredOrganizations.slice(0, this.limit);
  }

  // Function: edit organization
  edit(org: Organization): void {
    this.showForm = true;
    this.isEditing = true;
    this.editingOrganizationId = org._id;

    this.organizationForm.patchValue({
      name: org.name,
    });
  }

  // Function: save organization (create or update)
  save(): void {
    if (this.organizationForm.invalid) return;

    const name = this.organizationForm.value.name;

    if (this.isEditing && this.editingOrganizationId) {
      // UPDATE
      this.api.updateOrganization(this.editingOrganizationId, name).subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: () => {
          this.errorMsg = 'Could not update organization.';
        },
      });
    } else {
      // CREATE
      this.api.createOrganization(name).subscribe({
        next: () => {
          this.resetForm();
          this.load();
        },
        error: () => {
          this.errorMsg = 'Could not create organization.';
        },
      });
    }
  }

  // expansion state to show full name
  toggleExpand(id: string): void {
    this.expanded[id] = !this.expanded[id];
  }

  // Function: reset form
  resetForm(): void {
    this.showForm = false;
    this.isEditing = false;
    this.editingOrganizationId = null;
    this.organizationForm.reset();
  }

  // Function: confirm delete
  confirmDelete(id: string, name?: string) {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: name,
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.delete(id);
      }
    });
  }

  // Function: delete organization
  delete(id: string): void {
    this.errorMsg = '';
    this.loading = true;

    this.api.deleteOrganization(id).subscribe({
      next: () => {
        this.load();
      },
      error: () => {
        this.errorMsg = 'Error deleting';
        this.loading = false;
      },
    });
  }

  selectOrganization(org: Organization): void {
    this.selectedOrganization = org;
  }
}
