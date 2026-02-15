// src/app/models/customer.model.ts
export class Customer {
  customerId: number; // Corresponds to Long in Java
  name: string;
  email: string;
  mobileNumber: string;

  constructor(customerId: number, name: string, email: string, mobileNumber: string) {
    this.customerId = customerId;
    this.name = name;
    this.email = email;
    this.mobileNumber = mobileNumber;
  }
}
