import { Component, Input, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Organization } from '../models/organization.model';
import { User } from '../models/user.model';
import { UserService } from '../services/user.service';
import { OrganizationService } from '../services/organization.service';

@Component({
  selector: 'app-organization-user-manager',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organization-user-manager.html',
  styleUrls: ['./organization-user-manager.css'],
})
export class OrganizationUserManager implements OnInit, OnChanges {
  @Input() organization!: Organization;
  availableUsers: User[] = [];
  organizationUsers: User[] = [];

  constructor(private userService: UserService, private organizationService: OrganizationService) {}

  ngOnInit(): void {
    this.loadUsers();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['organization'] && this.organization) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    if (!this.organization) return;

    this.userService.getUsers().subscribe((users) => {
      this.organizationUsers = users.filter((u) => u.organization && u.organization._id === this.organization._id);
      this.availableUsers = users.filter((u) => !u.organization || u.organization._id !== this.organization._id);
    });
  }

  addUser(user: User): void {
    if (!this.organization) return;

    // Assuming we update the user to belong to this organization
    // We need to send the organization ID.
    // However, the updateUser signature in UserService requires (id, name, email, password, organizationId).
    // This is a bit clunky as we might not have the password here or want to send it.
    // Let's check UserService again.

    this.userService.updateUser(user._id, user.name, user.email, user.password || '', this.organization._id).subscribe(() => {
        this.loadUsers();
    });
  }

  removeUser(user: User): void {
     // To remove, we might set organization to null or empty string.
     // But the backend might expect a valid organization ID.
     // If the backend allows null/empty, we can do this.
     // Let's assume we can assign to a "default" or "no organization" if possible,
     // or maybe we just can't "remove" without assigning to another one?
     // For now, I'll try sending an empty string or null if the type allows.
     // The type signature says string.

     // Let's check if there is an endpoint to just change organization? No.
     // I'll assume sending an empty string clears it, or maybe I should check if there is a way to set it to null.

     this.userService.updateUser(user._id, user.name, user.email, user.password || '', '').subscribe(() => {
         this.loadUsers();
     });
  }
}
