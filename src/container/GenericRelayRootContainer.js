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

const GraphQLFragmentPointer = require('GraphQLFragmentPointer');
import type {RelayQueryConfigSpec} from 'RelayContainer';
const RelayPropTypes = require('RelayPropTypes');
const RelayStore = require('RelayStore');
const RelayStoreData = require('RelayStoreData');
import type {
  Abortable,
  ComponentReadyState,
  ReadyState,
  RelayContainer,
} from 'RelayTypes';

const getRelayQueries = require('getRelayQueries');
const invariant = require('invariant');
const mapObject = require('mapObject');


class GenericRelayRootContainer{

  constructor({
    Component,
    forceFetch,
    queryConfig
  }){
    this.props = {Component,forceFetch,queryConfig};
  }

  setState(state){
    this.state = state;
  }

  activate(){
    if (this.active){
      return;
    }
    this.state = this._runQueries(this.props);
    this.active = true;
  }

  cleanup(): void {
    if (this.state.pendingRequest) {
      this.state.pendingRequest.abort();
    }
    this.active = false;
  }


  _runQueries(
    {Component, forceFetch, queryConfig}: RelayRendererProps
  ) {
    const querySet = getRelayQueries(Component, queryConfig);
    const onReadyStateChange = readyState => {
      if (!this.active) {
        this._handleReadyStateChange({...readyState, active: false});
        return;
      }
      let {pendingRequest, renderArgs: {props}} = this.state;
      if (request !== pendingRequest) {
        // Ignore (abort) ready state if we have a new pending request.
        return;
      }
      if (readyState.aborted || readyState.done || readyState.error) {
        pendingRequest = null;
      }
      if (readyState.ready && !props) {
        props = {
          ...queryConfig.params,
          ...mapObject(querySet, createFragmentPointerForRoot),
        };
      }
      this.setState({
        activeComponent: Component,
        activeQueryConfig: queryConfig,
        pendingRequest,
        readyState: {...readyState, active: true},
        renderArgs: {
          done: readyState.done,
          error: readyState.error,
          props,
          stale: readyState.stale,
        },
      });
    };

    const request = forceFetch ?
      RelayStore.forceFetch(querySet, onReadyStateChange) :
      RelayStore.primeCache(querySet, onReadyStateChange);

    return {
      activeComponent: this.state ? this.state.activeComponent : null,
      activeQueryConfig: this.state ? this.state.activeQueryConfig : null,
      pendingRequest: request,
      readyState: null,
      renderArgs: {
        done: false,
        error: null,
        props: null,
        stale: false,
      },
    };
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

  /**
   * @private
   */
  _handleReadyStateChange(readyState: ReadyState): void {
    const {onReadyStateChange} = this.props;
    if (onReadyStateChange) {
      onReadyStateChange(readyState);
    }
  }



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
