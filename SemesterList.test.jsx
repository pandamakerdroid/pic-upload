/* eslint-disable max-len */
import {createRoot} from 'react-dom/client';
import '@testing-library/jest-dom';
import {screen, act} from '@testing-library/react';
import SemesterList from './SemesterList';
import {configureStore} from '@reduxjs/toolkit';
import {Provider} from 'react-redux';
import userEvent from '@testing-library/user-event';

let container = null;
let root = null;

jest.mock('react-i18next', () => ({
  // this mock makes sure that
  // any components using the translate hook can use it
  // without a warning being shown
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

const initialState = {
  currentSemester: null,
  semesters: [],
};

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'set_current_semester':
      return {
        ...state,
        currentSemester: {
          id: 20222,
          shortTitle: 'WINTER2022',
          title: '2022W',
        },
      };
    case 'set_semesters':
      return {
        ...state,
        semesters: action.payload.semesters,
      };
    default:
      return state;
  }
}

const renderWithProviders = (component, {reduxState}={}) => {
  const store = configureStore({
    reducer: reducer,
    preloadedState: (reduxState || initialState),
  });
  return <Provider store={store}>{component}</Provider>;
};

describe('test semester list', () => {
  // create DOM el before each test
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    global.IS_REACT_ACT_ENVIRONMENT = true;
  });

  // clean up the created mock DOM after each test
  afterEach(() => {
    root = null;
    container.remove();
    container = null;
  });

  it('semester list should be visible, all semester should not present', async ()=>{
    // initialise semester WITHOUT dummy data to test semester component appearance

    act(() => {
      root = createRoot(container);
      root.render(renderWithProviders(<SemesterList/>));
    });
    expect(await screen.findByTestId('current-semester-label')).toBeInTheDocument();
    expect(await screen.findByTestId('current-semester-badge')).toBeInTheDocument();
    expect(await screen.findByTestId('all-semester-selector')).toBeInTheDocument();
    expect(await screen.queryByTestId('all-semester-option')).toBeNull();
    expect(await screen.findByTestId('select-semester-option')).toBeInTheDocument();
  });

  it('semester list should be visible, all semester should present', async () =>{
    // initialise semester with dummy data which contains all semester option
    act(() => {
      root = createRoot(container);
      root.render(renderWithProviders(<SemesterList allSemesters={true}/>,
          {reduxState: {
            currentSemester: {id: -1, title: 'all'},
            semesters: [
              {
                id: 20222,
                shortTitle: 'WINTER2022',
                title: '2022W',
              },
              {
                id: 20222,
                shortTitle: 'SUMMER2022',
                title: '2022S',
              },
            ],
          }}));
    });
    expect(await screen.queryByTestId('all-semester-option')).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'app.exams.all'})).toBeInTheDocument();
    expect(screen.getByRole('option', {name: 'app.course_search.select_semester'}).selected).toBeTruthy();
  });

  it('when select an option, semester list value should change', async () =>{
    // initialise semester with dummy data which contains all semester option
    act(() => {
      root = createRoot(container);
      root.render(renderWithProviders(<SemesterList allSemesters={true}/>,
          {reduxState: {
            currentSemester: {id: -1, title: 'all'},
            semesters: [
              {
                id: 20222,
                shortTitle: 'WINTER2022',
                title: 'WS 2022',
              },
              {
                id: 20221,
                shortTitle: 'SUMMER2022',
                title: 'SS 2022',
              },
            ],
          }}));
    });
    expect(await screen.queryByTestId('all-semester-option')).toBeInTheDocument();
    const selector = screen.queryByTestId('all-semester-selector');
    expect(screen.getByRole('option', {name: 'app.course_search.select_semester'}).selected).toBeTruthy();
    // mock selection to WS 2022
    await userEvent.selectOptions(selector, '20222');
    expect(screen.getByRole('option', {name: 'WS 2022'}).selected).toBeTruthy();
  });
});
