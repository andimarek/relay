'use strict';

require('configureForRelayOSS');

jest
  .dontMock('RelayContainerComparators')
  .mock('warning');


const Relay = require('Relay');
const RelayRoute = require('RelayRoute');
const RelayTestUtils = require('RelayTestUtils');
const GraphQLStoreQueryResolver = require('GraphQLStoreQueryResolver');


describe('GenericRelayContainer', () => {
  var MockComponent;
  var MockContainer;

  var mockBarFragment;
  var mockBarPointer;
  var mockFooFragment;
  var mockFooPointer;
  var mockRoute;


  var {getNode, getPointer} = RelayTestUtils;

  beforeEach(() => {
    jest.resetModuleRegistry();
    MockComponent = {

    };

    MockContainer = Relay.GenericContainer.create(MockComponent, {
      fragments: {
        foo: jest.genMockFunction().mockImplementation(
          () => Relay.QL`fragment on Node{id,name}`
        ),
        bar: jest.genMockFunction().mockImplementation(
          () => Relay.QL`fragment on Node @relay(plural:true){id,name}`
        ),
      },
    });

    jasmine.addMatchers(RelayTestUtils.matchers);

    mockRoute = RelayRoute.genMockInstance();
    mockFooFragment = getNode(MockContainer.getFragment('foo').getFragment({}));
    mockFooPointer = getPointer('42', mockFooFragment);
    mockBarFragment = getNode(MockContainer.getFragment('bar').getFragment());
    mockBarPointer = getPointer(['42'], mockBarFragment);

  });

  it('creates resolvers for each query prop with a fragment pointer', () => {
    const updateCallback = jest.genMockFunction();
    const container = new MockContainer({}, updateCallback);
    container.update({foo: mockFooPointer, route:mockRoute});

    expect(GraphQLStoreQueryResolver.mock.instances.length).toBe(1);

    container.update({foo: mockFooPointer, bar: [mockBarPointer], route:mockRoute});
    expect(GraphQLStoreQueryResolver.mock.instances.length).toBe(2);
  });

  it('update calls callback', () => {
    const updateCallback = jest.genMockFunction();
    const container = new MockContainer({}, updateCallback);
    container.update({foo: mockFooPointer, route:mockRoute});

    expect(updateCallback).toBeCalled();
  });

  it('creates query for a container with variables', () => {
    var MockProfilePhoto = Relay.GenericContainer.create(MockComponent, {
      initialVariables: {
        testPhotoSize: '100',
      },
      fragments: {
        photo: () => Relay.QL`
          fragment on Actor {
            profilePicture(size:$testPhotoSize) {
              uri
            }
          }
        `,
      },
    });
    var fragment = getNode(
      MockProfilePhoto.getFragment('photo'),
      {}
    );
    expect(fragment).toEqualQueryNode(getNode(Relay.QL`
      fragment on Actor {
        profilePicture(size: "100") {
          uri
        }
      }
    `));
  });

  it('update variables', () => {
    var Container = Relay.GenericContainer.create(MockComponent, {
      initialVariables: {
        testPhotoSize: '100',
      },
      fragments: {
        photo: () => Relay.QL`
          fragment on Actor {
            profilePicture(size:$testPhotoSize) {
              uri
            }
          }
        `,
      },
    });
    const updateCallback = jest.genMockFunction();
    const container = new Container({}, updateCallback);
    container.update({route: mockRoute});
    container.setVariables({testPhotoSize: 200});
    Relay.Store.primeCache.mock.requests[0].succeed();

    expect(updateCallback.mock.calls.length).toBe(2);
  });
});
