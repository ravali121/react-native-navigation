import * as  _ from 'lodash';
import { LayoutTreeParser } from './LayoutTreeParser';
import { LayoutType } from './LayoutType';

describe('LayoutTreeParser', () => {
  let uut;

  beforeEach(() => {
    uut = new LayoutTreeParser();
  });

  describe('parses into { type, data, children }', () => {
    it('unknown type', () => {
      expect(() => uut.parse({ wut: {} })).toThrowError('unknown LayoutType "wut"');
    });

    it('single component', () => {
      expect(uut.parse(LayoutExamples.singleComponent)).toEqual({
        type: LayoutType.Component,
        data: { name: 'MyReactComponent', options: LayoutExamples.options, passProps: LayoutExamples.passProps },
        children: []
      });
    });

    it('pass props', () => {
      const result = uut.parse({
        component: {
          name: 'MyScreen',
          passProps: LayoutExamples.passProps
        }
      });
      expect(result).toEqual({
        type: LayoutType.Component,
        data: { name: 'MyScreen', passProps: LayoutExamples.passProps },
        children: []
      });
      expect(result.data.passProps).toBe(LayoutExamples.passProps);
      expect(result.data.passProps.fnProp()).toEqual('Hello from a function');
    });

    it('stack of components with top bar', () => {
      expect(uut.parse(LayoutExamples.stackWithTopBar)).toEqual({
        type: LayoutType.Stack,
        data: {
          options: LayoutExamples.options
        },
        children: [
          {
            type: LayoutType.Component,
            data: { name: 'MyReactComponent1' },
            children: []
          },
          {
            type: LayoutType.Component,
            data: { name: 'MyReactComponent2', options: LayoutExamples.options },
            children: []
          }
        ]
      });
    });

    it('bottom tabs', () => {
      const result = uut.parse(LayoutExamples.bottomTabs);
      expect(_.keys(result)).toEqual(['type', 'data', 'children']);
      expect(result.type).toEqual(LayoutType.BottomTabs);
      expect(result.data).toEqual({});
      expect(result.children.length).toEqual(3);
      expect(result.children[0].type).toEqual(LayoutType.Stack);
      expect(result.children[1].type).toEqual(LayoutType.Stack);
      expect(result.children[2].type).toEqual(LayoutType.Component);
    });

    it('side menus', () => {
      const result = uut.parse(LayoutExamples.sideMenu);
      expect(_.keys(result)).toEqual(['type', 'data', 'children']);
      expect(result.type).toEqual(LayoutType.SideMenuRoot);
      expect(result.data).toEqual({});
      expect(result.children.length).toEqual(3);
      expect(result.children[0].type).toEqual(LayoutType.SideMenuLeft);
      expect(result.children[1].type).toEqual(LayoutType.SideMenuCenter);
      expect(result.children[2].type).toEqual(LayoutType.SideMenuRight);
      expect(result.children[0].children.length).toEqual(1);
      expect(result.children[0].children[0].type).toEqual(LayoutType.Component);
      expect(result.children[1].children.length).toEqual(1);
      expect(result.children[1].children[0].type).toEqual(LayoutType.Stack);
      expect(result.children[2].children.length).toEqual(1);
      expect(result.children[2].children[0].type).toEqual(LayoutType.Component);
    });

    it('side menu center is require', () => {
      expect(() => uut.parse({ sideMenu: {} })).toThrowError('sideMenu.center is required');
    });

    it('top tabs', () => {
      const result = uut.parse(LayoutExamples.topTabs);
      expect(_.keys(result)).toEqual(['type', 'data', 'children']);
      expect(result.type).toEqual(LayoutType.TopTabs);
      expect(result.data).toEqual({ options: LayoutExamples.options });
      expect(result.children.length).toEqual(5);
      expect(result.children[0].type).toEqual(LayoutType.Component);
      expect(result.children[1].type).toEqual(LayoutType.Component);
      expect(result.children[2].type).toEqual(LayoutType.Component);
      expect(result.children[3].type).toEqual(LayoutType.Component);
      expect(result.children[4].type).toEqual(LayoutType.Stack);
    });

    it('complex layout example', () => {
      const result = uut.parse(LayoutExamples.complexLayout);
      expect(result.type).toEqual('SideMenuRoot');
      expect(result.children[1].type).toEqual('SideMenuCenter');
      expect(result.children[1].children[0].type).toEqual('BottomTabs');
      expect(result.children[1].children[0].children[2].type).toEqual('Stack');
      expect(result.children[1].children[0].children[2].children[0].type).toEqual('TopTabs');
      expect(result.children[1].children[0].children[2].children[0].children[2].type).toEqual('TopTabs');
      expect(result.children[1].children[0].children[2].children[0].children[2].children[4].type).toEqual('Stack');
      expect(result.children[1].children[0].children[2].children[0].children[2].data).toEqual({ options: { topBar: { title: 'Hello1' } } });
    });
  });

  it('options for all containing types', () => {
    const options = {};
    expect(uut.parse({ component: { options } }).data.options).toBe(options);
    expect(uut.parse({ stack: { options } }).data.options).toBe(options);
    expect(uut.parse({ bottomTabs: { options } }).data.options).toBe(options);
    expect(uut.parse({ topTabs: { options } }).data.options).toBe(options);
    expect(uut.parse({ sideMenu: { options, center: { component: {} } } }).data.options).toBe(options);
  });
});

/* Layout Examples: */

const passProps = {
  strProp: 'string prop',
  numProp: 12345,
  objProp: { inner: { foo: 'bar' } },
  fnProp: () => 'Hello from a function'
};

const options = {
  topBar: {
    title: 'Hello1'
  }
};

const singleComponent = {
  component: {
    name: 'MyReactComponent',
    options,
    passProps
  }
};

const stackWithTopBar = {
  stack: {
    children: [
      {
        component: {
          name: 'MyReactComponent1'
        }
      },
      {
        component: {
          name: 'MyReactComponent2',
          options
        }
      }
    ],
    options
  }
};

const bottomTabs = {
  bottomTabs: {
    children: [
      stackWithTopBar,
      stackWithTopBar,
      {
        component: {
          name: 'MyReactComponent1'
        }
      }
    ]
  }
};

const sideMenu = {
  sideMenu: {
    left: singleComponent,
    center: stackWithTopBar,
    right: singleComponent
  }
};

const topTabs = {
  topTabs: {
    children: [
      singleComponent,
      singleComponent,
      singleComponent,
      singleComponent,
      stackWithTopBar
    ],
    options
  }
};

const complexLayout = {
  sideMenu: {
    left: singleComponent,
    center: {
      bottomTabs: {
        children: [
          stackWithTopBar,
          stackWithTopBar,
          {
            stack: {
              children: [
                {
                  topTabs: {
                    children: [
                      stackWithTopBar,
                      stackWithTopBar,
                      {
                        topTabs: {
                          options,
                          children: [
                            singleComponent,
                            singleComponent,
                            singleComponent,
                            singleComponent,
                            stackWithTopBar
                          ]
                        }
                      }
                    ]
                  }
                }
              ]
            }
          }
        ]
      }
    }
  }
};

const LayoutExamples = {
  passProps,
  options,
  singleComponent,
  stackWithTopBar,
  bottomTabs,
  sideMenu,
  topTabs,
  complexLayout
};