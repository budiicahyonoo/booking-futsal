// Tipe data sesuai kontrak API backend booking futsal

export type SlotStatus = 'KOSONG' | 'TERISI' | 'HOLD' | 'LEWAT';

export interface SlotCell {
  startHour: number;
  endHour: number;
  price: number;
  memberPrice: number | null;
  status: SlotStatus;
  bookingCode?: string;
  holdExpiresAt?: string;
}

export interface CourtAvailability {
  courtId: string;
  courtName: string;
  surfaceType: string;
  slots: SlotCell[];
}

export interface AvailabilityResponse {
  venue: {
    id: string;
    name: string;
    address: string;
    contactWa: string | null;
    openHour: number;
    closeHour: number;
    slotDurationHours: number;
  };
  date: string;
  dayType: 'WEEKDAY' | 'WEEKEND';
  isToday: boolean;
  nowHour: number;
  isMember: boolean;
  courts: CourtAvailability[];
}

export interface Booking {
  id: string;
  code: string;
  courtId: string;
  court: { name: string; surfaceType?: string };
  bookerName: string;
  bookerPhone: string;
  date: string;
  startHour: number;
  endHour: number;
  status: 'HOLD' | 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'REJECTED';
  paymentType: 'DP' | 'LUNAS';
  totalPrice: number;
  dpAmount: number;
  paidAmount: number;
  notes?: string | null;
  isWalkIn: boolean;
  payments?: Payment[];
  user?: { name?: string | null; phone?: string | null } | null;
  createdAt?: string;
}

export interface Payment {
  id: string;
  method: 'TRANSFER' | 'QRIS';
  type: 'DP' | 'LUNAS';
  amount: number;
  proofUrl?: string | null;
  status: 'MENUNGGU' | 'TERKONFIRMASI' | 'DITOLAK';
  rejectionReason?: string | null;
}

export interface Court {
  id: string;
  name: string;
  surfaceType: string;
  photoUrl?: string | null;
  capacity: number;
  status: 'AKTIF' | 'NONAKTIF';
  pricingRules: PricingRule[];
}

export interface PricingRule {
  id: string;
  dayType: 'WEEKDAY' | 'WEEKEND';
  startHour: number;
  endHour: number;
  price: number;
  memberPrice?: number | null;
}

export interface Venue {
  id: string;
  name: string;
  address: string;
  logoUrl?: string | null;
  contactWa?: string | null;
  openHour: number;
  closeHour: number;
  slotDurationHours: number;
  holdDurationMinutes: number;
  defaultDpPercentage: number;
  freeRescheduleHours: number;
  cancellationPenaltyPercentage: number;
  bankName?: string | null;
  bankAccount?: string | null;
  bankAccountName?: string | null;
  qrisImageUrl?: string | null;
  waTemplate?: string | null;
  emailTemplate?: string | null;
}

export interface MemberRow {
  id: string;
  userId: string;
  name?: string | null;
  phone?: string | null;
  email?: string | null;
  type: 'REGULER' | 'BIASA';
  isRegular: boolean;
  totalBooking: number;
  totalSpend: number;
  lastBookingAt?: string | null;
}

export interface DailySummary {
  date: string;
  totalBookings: number;
  revenue: number;
  occupancyPercentage: number;
  bookedHours: number;
  operationalHours: number;
  pendingPayments: number;
  statusBreakdown: { pending: number; confirmed: number; completed: number };
}

export interface UserProfile {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: 'OWNER' | 'ADMIN' | 'MEMBER' | 'USER';
  isRegularMember?: boolean;
  memberProfile?: {
    type: 'REGULER' | 'BIASA';
    totalBooking: number;
    totalSpend: number;
    lastBookingAt?: string | null;
  } | null;
}
