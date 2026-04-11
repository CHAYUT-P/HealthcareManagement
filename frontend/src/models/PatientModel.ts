/**
 * PatientModel.ts
 * 
 * This class accurately mirrors the Python Pydantic/SQLModel backend class.
 * It is used to hydrate raw JSON data from the API into a proper Object-Oriented Class instance.
 */
export class PatientModel {
  id?: number;
  name: string;
  age: number;
  gender: string;
  contact_info?: string;
  national_id?: string;
  hn?: string;
  blood_type?: string;
  known_allergies?: string;
  chronic_diseases?: string;
  email?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;

  constructor(data: Partial<PatientModel> = {}) {
    this.id = data.id;
    this.name = data.name || 'Unknown Patient';
    this.age = data.age || 0;
    this.gender = data.gender || 'Unknown';
    this.contact_info = data.contact_info;
    this.national_id = data.national_id;
    this.hn = data.hn;
    this.blood_type = data.blood_type;
    this.known_allergies = data.known_allergies;
    this.chronic_diseases = data.chronic_diseases;
    this.email = data.email;
    this.address = data.address;
    this.emergency_contact_name = data.emergency_contact_name;
    this.emergency_contact_phone = data.emergency_contact_phone;
  }

  getAgeDisplay(): string {
    return `${this.age} years old`;
  }

  hasAllergies(): boolean {
    if (!this.known_allergies) {
      return false;
    }
    return this.known_allergies.trim().toLowerCase() !== "none" && this.known_allergies.trim() !== "";
  }
}
