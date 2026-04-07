export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  avatar?: string | null;
  emailVerified: boolean;
}

export interface AuthContextType {
  user: User | null;
  userProfile: any;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginWithGoogle: () => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: any) => Promise<{ success: boolean; error?: string }>;
  register?: (email: string, password: string, name: string) => Promise<{ success: boolean; error?: string }>;
  registerStakeholder?: (email: string, password: string, name: string, role: string, department: string, position: string) => Promise<{ success: boolean; error?: string }>;
  hasPermission?: (permission: string) => boolean;
  canAccessRoute?: (route: string) => boolean;
  loading: boolean;
}
