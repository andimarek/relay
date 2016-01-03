'use strict';

require('configureForRelayOSS');

const Relay = require('Relay');
const RelayRoute = require('RelayRoute');
const RelayTestUtils = require('RelayTestUtils');


describe('GenericRelayContainer', () => {
  var MockComponent;

  var {getNode, getPointer} = RelayTestUtils;

  beforeEach(() => {
    MockComponent = {

    };

    jasmine.addMatchers(RelayTestUtils.matchers);
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
});
