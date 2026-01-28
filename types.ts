
export type Availability = 'Full Semester' | 'Q1 Only' | 'Q2 Only';

export interface ShiftSlot {
  id: string;
  name: string;
  capacity: number;
}

export interface SelectedShift {
  shiftId: string;
  availability: Availability;
}

export interface Signup {
  id?: string;
  name: string;
  email: string;
  selectedShifts: SelectedShift[];
  timestamp: any;
}

export enum UserView {
  LOGIN = 'LOGIN',
  STUDENT = 'STUDENT',
  ADMIN = 'ADMIN',
  SUCCESS = 'SUCCESS'
}
