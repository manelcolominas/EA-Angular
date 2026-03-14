import { Organization } from './organization.model';

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  organization: Organization;
  createdAt?: string;
  updatedAt?: string;
}


