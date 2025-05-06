export const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#+^_=~()[\]{}|\\:;'",.<>/`-])[A-Za-z\d@$!%*?&#+^_=~()[\]{}|\\:;'",.<>/`-]{6,}$/;
export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const pwdMustBeSixCharactersLongAndSpecial =
  "Password must be at least 6 characters and include lowercase, uppercase, number and special character";
export const userMustBeFourCharactersLong =
  "Username must be at least 4 characters long";
export const userOrEmailAndPasswordRequired =
  "Username or email, and password are required";
export const userAlreadyExists = "User already exists";
export const registerSuccess = "Register successfully.";
export const userNotFound = "User not found";
export const pwdIncorrect = "Password incorrect";
export const emailInvalid = "Please enter a valid email address";
export const allFieldsRequired = "All fields are required";
export const verifyCodeIsSent = "Verification code sent";
export const invalidOrExpiredCode = "Invalid or expired code";
