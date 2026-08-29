import { OtpPurpose } from '../../../api/types';

export type AuthStackParamList = {
  Launch: undefined;
  Login: undefined;
  Register: undefined;
  OtpVerification: { email: string; purpose: OtpPurpose };
  ForgotPassword: undefined;
  ResetPassword: { email: string; code: string };
  SessionExpired: undefined;
};

export type AppStackParamList = {
  Home: undefined;
};

export type RootStackParamList = {
  Auth: undefined;
  App: undefined;
};
