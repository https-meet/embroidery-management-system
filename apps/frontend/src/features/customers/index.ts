/**
 * Customers Feature Module Public API
 */
export { CustomersListPage } from './pages/CustomersListPage';
export { CreateCustomerPage } from './pages/CreateCustomerPage';
export { CustomerDetailPage } from './pages/CustomerDetailPage';
export { EditCustomerPage } from './pages/EditCustomerPage';
export { useCustomers, useCustomer } from './hooks/useCustomers';
export type {
  CustomerDto,
  CustomerType,
  CreateCustomerDto,
  UpdateCustomerDto,
  CustomerQueryParams,
} from './types/customer.types';
