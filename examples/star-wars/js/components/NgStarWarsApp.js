/**
 * This file provided by Facebook is for non-commercial testing and evaluation
 * purposes only.  Facebook reserves all rights not expressly granted.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL
 * FACEBOOK BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
 * ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN
 * CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

import Relay from 'react-relay';
import StarWarsShip from './NgStarWarsShip';
import angular from 'angular';
import starWarsShip from './NgStarWarsShip';
import StarWarsAppHomeRoute from '../routes/StarWarsAppHomeRoute';
var mapObject = require('fbjs/lib/mapObject');


angular.module('starWarsApp',['starWarsShip'])
.directive('starWarsApp',starWarsApp);

var Component = {
  name: 'StarWarsApp',
}
const StarWarsAppComponent = Relay.GenericContainer.create(Component, {
  fragments: {
    factions: () => Relay.QL`
      fragment on Faction @relay(plural: true) {
        name,
        ships(first: 10) {
          edges {
            node {
              id
            }
          }
        }
      }
    `,
  },
});





function starWarsApp(){
  return {
    restrict: 'E',
    scope: {
    },
    template: '<ol><li><h1>Faction name</h1><ol><li><star-wars-ship/></li></ol></li></ol>',
    bindToController: true,
    controllerAs: 'vm',
    controller: controllerFn
  };

    function controllerFn($scope) {
      const vm = this;
      console.log('init app');
      var props = {};
      const route = new StarWarsAppHomeRoute({factionNames: ['empire', 'rebels']});
      const rootContainer = new Relay.GenericRootContainer({
        Component: StarWarsAppComponent,
        forceFetch: false,
        queryConfig: route
      });
      rootContainer.activate();
    }
}


// class StarWarsApp extends React.Component {
//   render() {
//     var {factions} = this.props;
//     return (
//       <ol>
//         {factions.map(faction => (
//           <li>
//             <h1>{faction.name}</h1>
//             <ol>
//               {faction.ships.edges.map(edge => (
//                 <li><StarWarsShip ship={edge.node} /></li>
//               ))}
//             </ol>
//           </li>
//         ))}
//       </ol>
//     );
//   }
// }
//
// export default Relay.createContainer(StarWarsApp, {
//   fragments: {
//     factions: () => Relay.QL`
//       fragment on Faction @relay(plural: true) {
//         name,
//         ships(first: 10) {
//           edges {
//             node {
//               ${StarWarsShip.getFragment('ship')}
//             }
//           }
//         }
//       }
//     `,
//   },
// });
