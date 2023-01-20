/* eslint-disable max-len */
import {createRoot} from 'react-dom/client';
import '@testing-library/jest-dom';
// module to be tested
import BrowserDetector from './BrowserDetector';
import {screen, act} from '@testing-library/react';


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

Object.defineProperty(window.navigator, 'userAgent', ((value) => ({
  get() {
    return value;
  },
  set(v) {
    value = v;
  },
}))(window.navigator.userAgent));

describe('determine browser', () => {
  // create DOM el before each test
  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    global.IS_REACT_ACT_ENVIRONMENT = true;
    global.navigator.userAgent='INVALID_USER_AGENT_STRING';
  });

  // clean up the created mock DOM after each test
  afterEach(() => {
    root = null;
    container.remove();
    container = null;
  });

  it('should display no modal', async () => {
    // set userAgent value
    global.navigator.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36';

    expect(global.navigator.userAgent).toBe('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Safari/537.36');
    // render browserDetector component
    act(() => {
      root = createRoot(container);
      root.render(<BrowserDetector/>);
    });


    expect(document.querySelector('[data-testid=\'browser-detector-modal-title\']')).toBeNull();
    expect(document.querySelector('[data-testid=\'browser-detector-browser-info\']')).toBeNull();
    expect(document.querySelector('[data-testid=\'browser-detector-supported-browsers\']')).toBeNull();
    expect(document.querySelectorAll('[data-testid=\'browser-detector-supported-browser\']').length).toEqual(0);
  });

  it('should display a modal for an unsupported browser without browser info', async () => {
    // render browserDetector component
    act(() => {
      root = createRoot(container);
      root.render(<BrowserDetector/>);
    });

    expect(await screen.findByTestId('browser-detector-modal')).toBeInTheDocument();
    expect(await screen.findByTestId('browser-detector-modal-title')).toBeInTheDocument();
    expect(await screen.queryByTestId('browser-detector-browser-info')).toBeNull();
    expect(await screen.findByTestId('browser-detector-supported-browsers')).toBeInTheDocument();
  });


  it('should display a modal for an outdated supported browser with browser info', async () => {
    // set userAgent value
    global.navigator.userAgent = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.0.0 Safari/537.36';

    expect(global.navigator.userAgent).toBe('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/50.0.0.0 Safari/537.36');
    // render browserDetector component
    act(() => {
      root = createRoot(container);
      root.render(<BrowserDetector/>);
    });


    let modal = (await screen.findAllByTestId('browser-detector-modal'));
    modal = modal[modal.length-1];
    expect(modal.querySelector('[data-testid=\'browser-detector-modal-title\']')).toBeInTheDocument();
    expect(modal.querySelector('[data-testid=\'browser-detector-browser-info\']')).toBeInTheDocument();
    expect(modal.querySelector('[data-testid=\'browser-detector-supported-browsers\']')).toBeInTheDocument();
    expect(modal.querySelectorAll('[data-testid=\'browser-detector-supported-browser\']').length).toEqual(4);
  });
});
