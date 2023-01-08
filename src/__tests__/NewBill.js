/**
 * @jest-environment jsdom
 */

import { screen, waitFor } from '@testing-library/dom';
import { localStorageMock } from '../__mocks__/localStorage.js';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';

import router from '../app/Router.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    test('Then, it should show the page', async () => {
      Object.defineProperty(window, 'localStorage', {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        'user',
        JSON.stringify({
          type: 'Employee',
        })
      );

      const root = document.createElement('div');
      root.setAttribute('id', 'root');
      document.body.append(root);
      router();
      window.onNavigate(ROUTES_PATH.NewBill);
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const formNewBill = screen.getByTestId('form-new-bill');
      expect(formNewBill).toBeTruthy();
    });
  });
});
