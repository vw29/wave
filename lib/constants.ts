export const AUTH_TEXT = {
  login: {
    title: "Welcome back",
    description: "Enter your credentials to continue",
    submit: "Sign in",
    submitting: "Signing in...",
    verify: "Verify",
    verifying: "Verifying...",
    success: "Signed in successfully",
    noAccount: "Don't have an account?",
    forgotPassword: "Forgot password?",
    twoFactorTitle: "Two-factor authentication",
    twoFactorDescription: "Enter the 6-digit code from your authenticator app",
    twoFactorLabel: "Authenticator code",
  },

  register: {
    title: "Create your account",
    description: "Get started in just a few seconds",
    submit: "Create account",
    submitting: "Creating account...",
    hasAccount: "Already have an account?",
    successTitle: "You're all set",
    successDescription:
      "Your account has been created. Check your email to verify.",
    step2Title: "Complete your profile",
    step2Description: "Tell us a bit about yourself",
    step2Submit: "Save profile",
    step2Submitting: "Saving...",
    skip: "Skip for now",
    loggingIn: "Logging you in...",
  },

  passwordReset: {
    title: "Forgot your password?",
    description: "No worries — we'll send you a reset link",
    submit: "Send reset link",
    submitting: "Sending...",
    successTitle: "Check your inbox",
    successDescription:
      "If an account exists with that email, you'll receive a reset link shortly.",
    rememberPassword: "Remember your password?",
  },

  updatePassword: {
    title: "Set a new password",
    description: "Choose a strong password for your account",
    invalidTitle: "Link expired",
    invalidDescription:
      "This reset link is no longer valid. Please request a new one.",
    requestNew: "Request a new link",
    submit: "Update password",
    submitting: "Updating...",
    successTitle: "Password updated",
    successDescription: "Your password has been changed. You can now sign in.",
  },

  changePassword: {
    title: "Change password",
    description: "Update your current password",
    submit: "Change password",
    submitting: "Changing...",
    successTitle: "Password changed",
    successDescription: "Your password has been updated successfully.",
  },

  myAccount: {
    title: "My account",
    description: "Manage your profile and security settings",
    emailLabel: "Email address",
  },

  twoFactorAuth: {
    activateButton: "Enable two-factor authentication",
    activating: "Setting up...",
    scanQrCode: "Scan this QR code with your authenticator app",
    enterCode: "Enter the 6-digit code to confirm setup",
    confirmButton: "Confirm setup",
    cancelButton: "Cancel",
    successTitle: "2FA enabled",
    successDescription:
      "Your account is now protected with two-factor authentication.",
    disableButton: "Disable two-factor authentication",
    submitButton: "Verify code",
    disablePasswordLabel: "Enter your password to continue",
    disableConfirmTitle: "Disable 2FA?",
    disableConfirmDescription:
      "Your account will no longer be protected by two-factor authentication. You can re-enable it at any time.",
    disableConfirmButton: "Yes, disable 2FA",
    disabling: "Disabling...",
    disabledSuccess: "Two-factor authentication has been disabled.",
  },

  common: {
    backToLogin: "Back to sign in",
    continueToLogin: "Continue to sign in",
    backToAccount: "Back to my account",
    register: "Sign up",
    signIn: "Sign in",
    resetPassword: "Reset password",
    or: "or",
  },
} as const;

export const FORM_TEXT = {
  email: {
    label: "Email",
    placeholder: "you@example.com",
  },
  password: {
    label: "Password",
    placeholder: "Enter your password",
  },
  newPassword: {
    label: "New password",
    placeholder: "Enter a new password",
  },
  confirmPassword: {
    label: "Confirm password",
    placeholder: "Re-enter your password",
  },
  currentPassword: {
    label: "Current password",
    placeholder: "Enter your current password",
  },
  username: {
    label: "Username",
    placeholder: "your_username",
  },
  name: {
    label: "Display name",
    placeholder: "Your name",
  },
  bio: {
    label: "Bio",
    placeholder: "Tell us about yourself",
  },
  profileImage: {
    label: "Profile image",
  },
  website: {
    label: "Website",
    placeholder: "https://example.com",
  },
} as const;

export const ERROR_MESSAGES = {
  generic: "Something went wrong. Please try again.",
  invalidCredentials: "Incorrect email or password",
  emailExists: "An account with this email already exists",
  userNotFound: "No account found with that email",
  invalidToken: "This link is invalid or has expired",
  alreadyLoggedIn: "You're already signed in",
  loginRequired: "Please sign in to continue",
  wrongPassword: "Current password is incorrect",
  passwordMismatch: "Passwords don't match",
  unauthorized: "You don't have permission to do this",
  invalidTwoFactorCode: "Invalid authenticator code",
  rateLimited: "Too many attempts. Please try again later.",
  networkError: "Unable to connect. Check your internet and try again.",
  usernameTaken: "This username is already taken",
} as const;

export const EMAIL_TEXT = {
  passwordReset: {
    subject: "Reset your password",
    heading: "Reset your password",
    greeting: (name: string) => `Hi ${name},`,
    body: "We received a request to reset your password. Tap the button below to choose a new one.",
    cta: "Reset password",
    expiry: "This link expires in 15 minutes.",
    fallback: "Button not working? Copy and paste this link into your browser:",
    disclaimer:
      "If you didn't request this, you can safely ignore this email. Your password won't be changed.",
  },
  common: {
    brand: "Wave",
    copyright: (year: number) => `${year} Wave. All rights reserved.`,
  },
} as const;

export const TOAST_MESSAGES = {
  loginSuccess: "Signed in successfully",
  registerSuccess: "Account created successfully",
  passwordResetSent: "Reset link sent to your email",
  passwordUpdated: "Password updated successfully",
  passwordChanged: "Password changed successfully",
  twoFactorEnabled: "Two-factor authentication enabled",
  twoFactorDisabled: "Two-factor authentication disabled",
  profileUpdated: "Profile saved successfully",
  genericError: "Something went wrong",
} as const;
