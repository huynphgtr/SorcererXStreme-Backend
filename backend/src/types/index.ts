export interface User {
  id: string;
  email: string;
  name?: string;
  birthDate?: Date;
  birthTime?: string;
  birthPlace?: string;
  createdAt: Date;
}

export interface UserContext {
  name?: string;
  birthDate?: string;
  birthTime?: string;
  birthPlace?: string;
  hasPartner?: boolean;
  isInBreakup?: boolean;
  partnerName?: string;
  partnerData?: {
    name: string;
    birthDate: string;
    birthTime?: string;
    birthPlace?: string;
    relationship: string;
    startDate: string;
  };
  breakupData?: {
    partnerName: string;
    breakupDate: string;
    autoDeleteDate: string;
  };
}
