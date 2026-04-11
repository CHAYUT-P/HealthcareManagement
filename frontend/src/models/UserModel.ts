/**
 * UserModel.ts
 */
export class UserModel {
  id?: number;
  username: string;
  role: string;
  status: string;
  national_id?: string;

  constructor(data: any = {}) {
    this.id = data.id;
    this.username = data.username || '';
    this.role = data.role || 'PATIENT';
    this.status = data.status || 'ACTIVE';
    this.national_id = data.national_id;
  }

  isStaff(): boolean {
    const r = this.role.toLowerCase();
    return r === 'nurse' || r === 'doctor';
  }

  isAdmin(): boolean {
    return this.role.toUpperCase() === 'ADMIN';
  }

  getDisplayName(): string {
    if (this.username && this.username.includes('@')) {
      const parts = this.username.split('@')[0].replace('_', ' ');
      return parts.charAt(0).toUpperCase() + parts.slice(1);
    }
    return this.username;
  }
}
