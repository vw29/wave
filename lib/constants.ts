export const AUTH_TEXT = {
  login: {
    title: "Welcome Back",
    description: "Sign in to your account",
    submit: "Sign In",
    submitting: "Signing in...",
    noAccount: "Don't have an account?",
    forgotPassword: "Forgot password?",
  },

  register: {
    title: "Create Account",
    description: "Enter your details to register",
    submit: "Create Account",
    submitting: "Creating...",
    hasAccount: "Already have an account?",
    successTitle: "Account Created",
    successDescription: "Your account has been registered.",
  },

  passwordReset: {
    title: "Forgot Password?",
    description: "Enter your email to receive a reset link",
    submit: "Send Reset Link",
    submitting: "Sending...",
    successTitle: "Check Your Email",
    successDescription: "We've sent a password reset link to your email.",
    rememberPassword: "Remember your password?",
  },

  updatePassword: {
    title: "Update Password",
    invalidTitle: "Invalid Link",
    description: "Enter your new password",
    invalidDescription: "This link is invalid or expired.",
    requestNew: "Request New Link",
    submit: "Update Password",
    submitting: "Updating...",
    successTitle: "Password Updated",
    successDescription: "Your password has been changed.",
  },

  changePassword: {
    title: "Change Password",
    description: "Enter your current and new password",
    submit: "Change Password",
    submitting: "Changing...",
    successTitle: "Password Changed",
    successDescription: "Your password has been updated.",
  },

  myAccount: {
    title: "My Account",
    description: "Manage your account",
    emailLabel: "Email Address",
  },

  twoFactorAuth: {
    activateButton: "Activate Two Factor Authentication",
    activating: "Activating...",
    scanQrCode: "Scan the QR code with your authenticator app",
    confirmButton: "I've Scanned It",
    cancelButton: "Cancel",
    successTitle: "2FA Enabled",
    successDescription: "Two-factor authentication is now active.",
    disableButton: "Disable Two Factor Authentication",
    submitButton: "Verify Code",
    disablePasswordLabel: "Enter your password to continue",
    disableConfirmTitle: "Are you sure?",
    disableConfirmDescription:
      "This action cannot be undone. Your account will no longer be protected by two-factor authentication.",
    disableConfirmButton: "Yes, Disable 2FA",
    disabling: "Disabling...",
    disabledSuccess: "Two-factor authentication has been disabled.",
  },

  common: {
    backToLogin: "Back to Login",
    continueToLogin: "Continue to Login",
    backToAccount: "Back to My Account",
    register: "Register",
    signIn: "Sign In",
  },
} as const;

export const FORM_TEXT = {
  email: {
    label: "Email",
    placeholder: "Enter your email",
  },
  password: {
    label: "Password",
    placeholder: "Enter your password",
  },
  newPassword: {
    label: "New Password",
    placeholder: "Enter your new password",
  },
  confirmPassword: {
    label: "Confirm Password",
    placeholder: "Confirm your password",
  },
  currentPassword: {
    label: "Current Password",
    placeholder: "Enter your current password",
  },
} as const;

export const ERROR_MESSAGES = {
  generic: "An error occurred",
  invalidCredentials: "Incorrect email or password",
  emailExists: "Email already registered",
  userNotFound: "User not found",
  invalidToken: "Invalid token",
  alreadyLoggedIn: "You are already logged in",
  loginRequired: "You must login to continue",
  wrongPassword: "Incorrect current password",
  passwordMismatch: "Passwords must match",
  unauthorized: "Unauthorized access",
  invalidTwoFactorCode: "Invalid 2FA code",
} as const;
