import { Customer } from './customer.model';

describe('User', () => {
  it('should create an instance', () => {
    // Provide sample values for id, username, and email
    const id = 1;
    const username = 'john_doe';
    const email = 'john@example.com';
    const mobileNumber="123456781";
    // Create an instance of User with the provided values
    const user = new Customer(id, username, email,mobileNumber);
    
    // Verify that the instance is created successfully
    expect(user).toBeTruthy();
  });
});