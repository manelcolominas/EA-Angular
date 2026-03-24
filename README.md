# AI

//Función: obtener organizaciones de la API
getOrganizations(): Observable<Organization[]> {
return this.http.get<Organization[]>(
`${this.baseUrl}/organizations`
);
}

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
    });
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

# MiniSpa

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 21.2.0.

## Structure

```
src/
├── environments/
│   └── environment.ts
│
└── app/
    ├── app.ts
    ├── app.spec.ts
    ├── app.config.ts
    ├── app.config.server.ts
    ├── app.html
    ├── app.css
    ├── app.routes.ts
    ├── app.routes.server.ts
    │
    ├── models/
    │
    ├── services/
    │   ├── organizacion.service.ts
    │
    ├── organizacion-list/
    │   ├── organizacion-list.css
    │
    ├── usuario-list/
    │   ├── usuario-list.html
    │   └── usuario-list.css
    │
    └── confirm-dialog/
        ├── organizacion-list.css
```

---

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

To generate a new interface (models), run:

```bash
ng generate interface interface-name
```

To generate a new service, run:

```bash
ng generate service service-name
```

To generate a new pipe, run:

```bash
ng generate pipe pipe-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
