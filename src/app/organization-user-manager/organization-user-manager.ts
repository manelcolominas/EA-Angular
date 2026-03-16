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
    this.userService.updateUserOrganization(user._id, this.organization._id).subscribe(() => {
        this.loadUsers();
    });
  }

  removeUser(user: User): void {
    if (!this.organization) return;
    this.organizationService.removeUserFromOrganization(this.organization._id, user._id).subscribe({
      next: () => {
        this.loadUsers();
      },
      error: (error) => {
        console.error('Error removing user from organization:', error);
        // Aquí podrías mostrar un mensaje de error al usuario
      }
    });
  }
}
