export class Customer {
  customerId: string; // UUID from backend
  name: string;
  email: string;
  mobileNumber: string;

  constructor(customerId: string, name: string, email: string, mobileNumber: string) {
    this.customerId = customerId;
    this.name = name;
    this.email = email;
    this.mobileNumber = mobileNumber;
  }
}
