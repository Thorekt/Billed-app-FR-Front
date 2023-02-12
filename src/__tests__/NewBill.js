/**
 * @jest-environment jsdom
 */

import { screen, waitFor, fireEvent } from '@testing-library/dom';
import user from '@testing-library/user-event';
import { localStorageMock } from '../__mocks__/localStorage.js';
import NewBillUI from '../views/NewBillUI.js';
import NewBill from '../containers/NewBill.js';
import { ROUTES, ROUTES_PATH } from '../constants/routes';

import mockStore from '../__mocks__/store.js';
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
      const handleChangeFile = jest.fn((e) => newBill.handleChangeFile(e));
      input.addEventListener('change', handleChangeFile);
      user.upload(input, file);

      expect(handleChangeFile).toHaveBeenCalled();
      expect(input.files[0].name).not.toContain('file.wrongext');
    });
  });
});

// test d'intégration GET
describe('Given I am a user connected as Employee on the NewBill Page', () => {
  describe('When I submit a new bill', () => {
    beforeEach(() => {
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
    });
    test('send new bill to mock API POST', async () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = ROUTES({ pathname });
      };

      const newBill = new NewBill({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage,
      });

      const handleSubmit = jest.fn(newBill.handleSubmit);
      const form = screen.getByTestId('form-new-bill');
      form.addEventListener('submit', handleSubmit);

      fireEvent.submit(form);

      expect(handleSubmit).toHaveBeenCalled();
    });
    describe('When an error occurs on API', () => {
      beforeEach(() => {
        jest.spyOn(mockStore, 'bills');
        Object.defineProperty(window, 'localStorage', {
          value: localStorageMock,
        });
        window.localStorage.setItem(
          'user',
          JSON.stringify({
            type: 'Employee',
            email: 'e@e',
          })
        );
        const root = document.createElement('div');
        root.setAttribute('id', 'root');
        document.body.appendChild(root);
        router();
      });
      test('send bills to an API and fails with 404 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 404'));
            },
          };
        });
        window.onNavigate(ROUTES_PATH.Bills);

        await new Promise(process.nextTick);
        const message = await screen.getByText('Erreur');

        expect(message).toBeTruthy();
      });

      test('send bills to an API and fails with 500 message error', async () => {
        mockStore.bills.mockImplementationOnce(() => {
          return {
            list: () => {
              return Promise.reject(new Error('Erreur 500'));
            },
          };
        });

        window.onNavigate(ROUTES_PATH.Bills);

        await new Promise(process.nextTick);
        const message = await screen.getByText('Erreur');

        expect(message).toBeTruthy();
      });
    });
  });
});
