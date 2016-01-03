/**
 * Copyright 2013-2015, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule GenericRelayRootContainer
 * @typechecks
 * @flow
 */

'use strict';

import type {
  Abortable,
  ComponentReadyState,
  ReadyState,
  RelayContainer,
} from 'RelayTypes';
import type {RelayQueryConfigSpec} from 'RelayContainer';

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
const RelayStore = require('RelayStore');
const RelayStoreData = require('RelayStoreData');

const getRelayQueries = require('getRelayQueries');
const mapObject = require('mapObject');

export type ContainerDataState = {
  done: boolean;
  ready: boolean;
  stale: boolean;
  aborted: boolean;
  error?: ?Error;
  data: {[key: string]: mixed}
};
export type ContainerCallback = (state: ContainerDataState) => void;


class GenericRelayRootContainer {
  Component: any;
  queryConfig: RelayQueryConfigSpec;
  forceFetch: boolean;
  callback: ContainerCallback;

  active: boolean;
  pendingRequest: ?Abortable;


  constructor(Component: any, forceFetch: boolean,  queryConfig: RelayQueryConfigSpec) {
    this.Component = Component;
    this.forceFetch = forceFetch;
    this.queryConfig = queryConfig;
  }


  activate(callback: ContainerCallback): void {
    if (this.active) {
      return;
    }
    this.active = true;
    this.callback = callback;
    this._runQueries();
  }
  cleanup(): void {
    if (this.pendingRequest) {
      this.pendingRequest.abort();
    }
    this.active = false;
  }


  _runQueries() {
    const querySet = getRelayQueries(this.Component, this.queryConfig);
    const onReadyStateChange = readyState => {
      if (!this.active) {
        return;
      }
      if (request !== this.pendingRequest) {
        // Ignore (abort) ready state if we have a new pending request.
        return;
      }
      if (readyState.aborted || readyState.done || readyState.error) {
        this.pendingRequest = null;
      }
      if (readyState.ready) {
        const data = {
          route: this.queryConfig,
          ...this.queryConfig.params,
          ...mapObject(querySet, createFragmentPointerForRoot),
        };
        this.callback({data, ...readyState});
      }
    };

    const request = this.forceFetch ?
      RelayStore.forceFetch(querySet, onReadyStateChange) :
      RelayStore.primeCache(querySet, onReadyStateChange);
    this.pendingRequest = request;
  }

  // _shouldUpdate(): boolean {
  //   const {activeComponent, activeQueryConfig} = this.state;
  //   return (
  //     (!activeComponent || this.props.Component === activeComponent) &&
  //     (!activeQueryConfig || this.props.queryConfig === activeQueryConfig)
  //   );
  // }
  //
  // /**
  //  * @private
  //  */
  // _retry(): void {
  //   const {readyState} = this.state;
  //   invariant(
  //     readyState && readyState.error,
  //     'RelayRenderer: You tried to call `retry`, but the last request did ' +
  //     'not fail. You can only call this when the last request has failed.'
  //   );
  //   this.setState(this._runQueries(this.props));
  // }
  //
  // componentWillReceiveProps(nextProps: RelayRendererProps): void {
  //   if (nextProps.Component !== this.props.Component ||
  //       nextProps.queryConfig !== this.props.queryConfig ||
  //       (nextProps.forceFetch && !this.props.forceFetch)) {
  //     if (this.state.pendingRequest) {
  //       this.state.pendingRequest.abort();
  //     }
  //     this.setState(this._runQueries(nextProps));
  //   }
  // }
  //
  // componentDidUpdate(
  //   prevProps: RelayRendererProps,
  //   prevState?: RelayRendererState
  // ): void {
  //   // `prevState` should exist; the truthy check is for Flow soundness.
  //   const {readyState} = this.state;
  //   if (readyState) {
  //     if (!prevState || readyState !== prevState.readyState) {
  //       this._handleReadyStateChange(readyState);
  //     }
  //   }
  // }



}

function createFragmentPointerForRoot(query) {
  return query ?
    GraphQLFragmentPointer.createForRoot(
      RelayStoreData.getDefaultInstance().getQueuedStore(),
      query
    ) :
    null;
}

module.exports = GenericRelayRootContainer;
