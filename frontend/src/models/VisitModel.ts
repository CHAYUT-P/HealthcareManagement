/**
 * VisitModel.ts
 */
export class VisitModel {
  id?: number;
  patient_id: number;
  assigned_doctor_id?: number;
  status: string;
  triage_level: string;
  treatment_fee: number;
  created_at: Date;

  constructor(data: any = {}) {
    this.id = data.id;
    this.patient_id = data.patient_id || 0;
    this.assigned_doctor_id = data.assigned_doctor_id;
    this.status = data.status || 'Waiting for Triage';
    this.triage_level = data.triage_level || 'Green';
    this.treatment_fee = data.treatment_fee || 0.0;
    this.created_at = data.created_at ? new Date(data.created_at) : new Date();
  }

  isEmergency(): boolean {
    return this.triage_level.toLowerCase() === 'red';
  }

  requiresDoctor(): boolean {
    return this.status === 'Waiting for Triage' || this.status === 'Ready for Doctor';
  }
}
