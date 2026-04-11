/**
 * AppointmentModel.ts
 */
export class AppointmentModel {
  id?: number;
  patient_id: number;
  doctor_id?: number;
  date: string;
  time: string;
  service: string;
  doctor_name: string;
  details?: string;
  status: string;
  is_doctor_scheduled: boolean;
  appointment_note?: string;
  created_by_id?: number;
  visit_id?: number;
  created_at: Date;

  constructor(data: any = {}) {
    this.id = data.id;
    this.patient_id = data.patient_id || 0;
    this.doctor_id = data.doctor_id;
    this.date = data.date || '';
    this.time = data.time || '';
    this.service = data.service || '';
    this.doctor_name = data.doctor_name || 'Pending';
    this.details = data.details;
    this.status = data.status || 'scheduled';
    this.is_doctor_scheduled = !!data.is_doctor_scheduled;
    this.appointment_note = data.appointment_note;
    this.created_by_id = data.created_by_id;
    this.visit_id = data.visit_id;
    this.created_at = data.created_at ? new Date(data.created_at) : new Date();
  }

  isConfirmed(): boolean {
    return this.status.toLowerCase() === 'scheduled';
  }
}
