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

import 'babel/polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import Relay from 'react-relay';
import StarWarsApp from './components/StarWarsApp';
import NgStarWarsApp from './components/NgStarWarsApp';
import StarWarsAppHomeRoute from './routes/StarWarsAppHomeRoute';
import angular from 'angular';

angular.module('ngStarWars', ['starWarsApp'])
.directive('app', app);

function app() {
  return {
    restrict: 'E',
    scope: {
    },
    template: '<div>Hello World<star-wars-app relay-props="vm.relayProps"></star-wars-app></div>',
    bindToController: true,
    controllerAs: 'vm',
    controller: controllerFn
  };

  function controllerFn($scope, $rootScope) {
    const vm = this;
    const route = new StarWarsAppHomeRoute({
      factionNames: ['empire', 'rebels'],
    });
    $rootScope.route = route;


    const rootContainer = new Relay.GenericRootContainer(NgStarWarsApp, false, route);
    rootContainer.activate(({data}) => {
      console.log('activate callback called ');
      $scope.$apply(() => {
        vm.relayProps = data;
      });
    });

  }
}

// ReactDOM.render(
//   <Relay.RootContainer
//     Component={StarWarsApp}
//     route={new StarWarsAppHomeRoute({
//       factionNames: ['empire', 'rebels'],
//     })}
//   />,
//   document.getElementById('root')
// );
