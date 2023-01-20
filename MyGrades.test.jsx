/* eslint-disable max-len */
import {createRoot} from 'react-dom/client';
import '@testing-library/jest-dom';
import {act, screen} from '@testing-library/react';
import MyGrades from './MyGrades';
import {configureStore} from '@reduxjs/toolkit';
import {Provider} from 'react-redux';
import {BrowserRouter} from 'react-router-dom';

let container = null;
let root = null;
const mockEmptyGrades ={data: {grades: []}};
const mockGrades =
{grades:
    [
      {
        'note': '1',
        'datum': '2022-08-24',
        'pp_de': 'Gruppen',
        'pp_en': 'Groups',
        'farbe_de': null,
        'farbe_en': null,
        'typ': 'PI',
        'tid': 23280479,
        'fk_studienplanpunkt': 246317,
        'fk_planpunkt': 6317,
        'fk_farbe': null,
        'anktid': null,
        'sortdate': '2022-08-24T00:00:00',
        'lvtitel': 'Gruppen',
        'lvnr': '4515',
        'fk_semester': 20221,
        'fk_veranstaltung': 458815,
        'fk_prf_planpunkt': null,
        'fk_pruefungsprotokoll': 383433,
        'fk_mitarbeiter': null,
        'ects': 4,
        'studium': 'BaWiSo-19',
        'titel': 'Gruppen',
        'description': 'prüfungsimanente LV',
        'erg_ects': null,
        'studies': 384352,
        'teachers': [
          {'tid': 8593,
            'persid': 54512,
            'kurztitel': 'Mag.Dr.',
            'vorname': 'Paul',
            'zuname': 'Rameder',
            'akad_grad_prae': 'Mag.Dr.',
            'akad_grad_post': 'MSc.',
          },
        ]},
      {
        'note': '2',
        'datum': '2022-06-25',
        'pp_de': 'Theorien sozioökonomischer Entwicklung',
        'pp_en': 'Theories of Socioeconomic Development',
        'farbe_de': null,
        'farbe_en': null,
        'typ': 'PI',
        'tid': 23244307,
        'fk_studienplanpunkt': 246476,
        'fk_planpunkt': 6476,
        'fk_farbe': null,
        'anktid': null,
        'sortdate': '2022-06-25T00:00:00',
        'lvtitel': 'Theorien sozioökonomischer Entwicklung',
        'lvnr': '4318',
        'fk_semester': 20221,
        'fk_veranstaltung': 458618,
        'fk_prf_planpunkt': null,
        'fk_pruefungsprotokoll': 383107,
        'fk_mitarbeiter': null,
        'ects': 8,
        'studium': 'BaWiSo-19',
        'titel': 'Theorien sozioökonomischer Entwicklung',
        'description': 'prüfungsimanente LV',
        'erg_ects': null,
        'studies': 384352,
        'teachers': [{
          'tid': 14693,
          'persid': 63016,
          'kurztitel': 'Mag.',
          'vorname': 'Alexander',
          'zuname': 'Reinold',
          'akad_grad_prae': 'Mag.phil.',
          'akad_grad_post': 'B.Sc.',
        }]},
    ],
};

const response = new Response(
    {headers: [{'content-type': 'application/json'}]},
);
const get = jest.spyOn(response.headers, 'get');
get.mockImplementation(()=> '');

jest.mock('react-i18next', () => ({
  // this mock makes sure
  // any components using the translate hook
  // can use it without a warning being shown
  useTranslation: () => {
    return {
      t: (str) => str,
      i18n: {
        changeLanguage: () => new Promise(() => {}),
      },
    };
  },
}));

jest.mock('@util/consts.js', ()=>(
  {
    LANGUAGES: {
      EN: 'en',
      DE: 'de',
    },
    URL_TYPES: {
      GRADES: 'GRADES',
    },
  }
));
const initialState = {
  grades: [],
  filteredGrades: [],
  currentStudy: {id: -1},
  studies: [{id: -1}],
};

const store = configureStore({
  reducer: reducer,
  preloadedState: initialState,
});

function reducer(state = initialState, action) {
  switch (action.type) {
    case 'set_grades':
      return {
        ...state,
        grades: action.grades,
      };
    case 'set_filtered_grades':
      return {
        ...state,
        filteredGrades: action.filteredGrades,
      };
    case 'set_latest_grades':
      return {
        ...state,
        latestGrades: action.latestGrades,
      };
    default:
      return state;
  }
}

const renderWithProviders = (component, {reduxState}={}) => {
  return (
    <BrowserRouter basename="/">
      <Provider store={store}>
        {component}
      </Provider>;
    </BrowserRouter>);
};

describe('test MyGrades component', ()=>{
  beforeEach(()=>{
    container = document.createElement('div');
    document.body.appendChild(container);
    global.IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(()=>{
    root = null;
    container.remove();
    container = null;
  });

  it('with no data present, the container and title should present', async () => {
    act(() => {
      root = createRoot(container);
      root.render(renderWithProviders(<MyGrades/>));
      jest.spyOn(global, 'fetch').mockResolvedValue({
        headers: {
          get: jest.fn(()=> ''), // do what ever `get` should to )
        },
        text: jest.fn().mockResolvedValue(mockEmptyGrades),
      });
    });

    expect(await screen.findByTestId('my-grades-container')).toBeInTheDocument();
    expect(await screen.findByTestId('page-title')).toBeInTheDocument();
    expect(await screen.queryByTestId('latest-grades')).toBeNull();
    expect(await screen.findByTestId('text-no-grades')).toBeInTheDocument();
  });

  it('with data present, grades block and table of grades should present', async () => {
    await act(async () => {
      root = createRoot(container);
      root.render(renderWithProviders(<MyGrades/>));
      jest.spyOn(global, 'fetch').mockResolvedValue({
        data: mockGrades,
      });
      const result = await global.fetch({
        headers: {
          get: jest.fn(()=> ''), // do what ever `get` should to )
        },
      });
      expect(global.fetch).toHaveBeenCalledTimes(1);
      const processedGrades = result.data.grades.map((grade) => ({
        id: grade.tid,
        note: grade.note,
        date: grade.datum,
        sortDate: grade.sortdate,
        studyId: grade.studies,
        studyName: grade.studium,
        semesterId: grade.fk_semester,
        type: grade.typ,
        ects: grade.ects,
        nameDe: grade.pp_de,
        nameEn: grade.pp_en,
        courseId: grade.lvnr,
      }));

      store.dispatch({
        type: 'set_grades',
        grades: processedGrades,
      });
      store.dispatch({
        type: 'set_filtered_grades',
        filteredGrades: processedGrades,
      });
      store.dispatch({
        type: 'set_latest_grades',
        latestGrades: processedGrades,
      });
    });

    expect(await screen.findByTestId('my-grades-container')).toBeInTheDocument();
    expect(await screen.findByTestId('page-title')).toBeInTheDocument();
    expect(await screen.findByTestId('latest-grades')).toBeInTheDocument();
    expect(await screen.queryAllByTestId('latest-grade').length).toEqual(2);
    expect(await screen.queryByTestId('text-no-grades')).toBeNull();
  });
});
