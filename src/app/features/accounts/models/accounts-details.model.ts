export interface AccountDetails {
  name: string;
  email: string;
  mobileNumber: string;
  accountsDto: {
    accountNumber: number;
    branchAddress: string;
    accountType: string;
    accountStatus: string;
    accountCategory: string;
  };
}
