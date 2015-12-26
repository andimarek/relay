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
import angular from 'angular';

angular.module('starWarsShip',[])
.directive('starWarsShip',starWarsShip);

function starWarsShip(){
  return {
    restrict: 'E',
    scope: {
    },
    template: '<div>Ship Name</div>',
    bindToController: true,
    controllerAs: 'vm',
    controller: controllerFn
  };

    function controllerFn($scope) {
      const vm = this;
    }
}


// class StarWarsShip extends React.Component {
//   render() {
//     var {ship} = this.props;
//     return <div>{ship.name}</div>;
//   }
// }
//
// export default Relay.createContainer(StarWarsShip, {
//   fragments: {
//     ship: () => Relay.QL`
//       fragment on Ship {
//         name
//       }
//     `,
//   },
// });
