/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from '@testing-library/dom';
import user from '@testing-library/user-event';
import { localStorageMock } from '../__mocks__/localStorage.js';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';

import router from '../app/Router.js';

describe('Given I am connected as an employee', () => {
  describe('When I am on NewBill Page', () => {
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
        email: 'employee@test.tld',
      })
    );

    const root = document.createElement('div');
    root.setAttribute('id', 'root');
    document.body.append(root);
    router();
    window.onNavigate(ROUTES_PATH.NewBill);
    test('Then, the page sould contain the form', async () => {
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const formNewBill = screen.getByTestId('form-new-bill');
      expect(formNewBill).toBeTruthy();
    });
  });

  describe('When I am on NewBill Page and i upload a file, with a good extension name ', () => {
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
      })
    );
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    document.body.innerHTML = NewBillUI();
    test('it should show the file name', async () => {
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const file = new File(['(file)'], 'file.png', {
        type: 'image/png',
      });
      const mockStore = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
      };
      let newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      document.body.innerHTML = NewBillUI();
      const input = screen.getByTestId('file');
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      input.addEventListener('change', handleChangeFile);
      user.upload(input, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).toContain('file.png');
    });
  });
  describe('When I am on NewBill Page and i upload a file, with a wrong extension name ', () => {
    window.localStorage.setItem(
      'user',
      JSON.stringify({
        type: 'Employee',
      })
    );
    Object.defineProperty(window, 'localStorage', {
      value: localStorageMock,
    });
    document.body.innerHTML = NewBillUI();
    test('it should not show the file name', async () => {
      await waitFor(() => screen.getByTestId('form-new-bill'));
      const file = new File(['(file)'], 'file.txt', {
        type: 'txt',
      });
      const mockStore = {
        bills: jest.fn(() => newBill.store),
        create: jest.fn(() => Promise.resolve({})),
      };
      let newBill = new NewBill({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage,
      });

      const input = screen.getByTestId('file');
      console.log(input);
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      input.addEventListener('change', handleChangeFile);
      user.upload(input, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).not.toContain('file.wrongext');
    });
  });
});
