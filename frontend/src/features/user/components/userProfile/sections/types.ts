export interface UserData {
  _id: string;
  fullName: string;
  email?: string;
  phone: string;
  status: "Active" | "Inactive" | "Blocked";
  defaultAddress?: {
    city: string;
    state: string;
    pincode: string;
    location: { type: "Point"; coordinates: [number, number] };
  };
  isVerified: boolean;
  role: string;
  createdAt: string;
  wallet: { balance: number };
  profilePicture?: string;
  dateOfBirth?: string;
  gender?: string;
}

export interface PersonalInfo {
  fullName: string;
  phoneNumber: string;
  email: string;
  dateOfBirth: string;
  gender: string;
}

export interface PasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface Notification {
  _id: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface Transaction {
  _id: string;
  amount: number;
  status: string;
  type: string;
  createdAt: string;
  description?: string;
  balanceAfter?: number;
  serviceName?: string;
  orderCode?: string;
  paymentProvider?: string;
  metadata?: {
    razorpayOrderId?: string;
    razorpayPaymentId?: string;
    bankAccountId?: string;
    bankName?: string;
    accountNumber?: string;
    method?: string;
  };
}

// If your backend WalletTransaction is different, use a more generic approach
export interface ApiWalletTransaction {
  _id: string;
  amount: number;
  status: string;
  type: "credit" | "debit";
  description: string;
  balanceAfter: number;
  createdAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export interface ApiPaymentTransaction {
  _id: string;
  amount: number;
  status: string;
  type: string;
  serviceName: string;
  orderCode: string;
  paymentProvider: string;
  createdAt: string;
}
