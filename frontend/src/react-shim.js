// Importmap target for 'react'.
// Explicit named exports — Rollup cannot statically enumerate CJS modules that
// do `module.exports = require(...)`, so `export * from 'react'` yields nothing.
import React from 'react';
export default React;
export const {
  Children, Component, Fragment, Profiler, PureComponent, StrictMode, Suspense,
  cloneElement, createContext, createElement, createRef, forwardRef,
  isValidElement, lazy, memo, startTransition, version,
  useCallback, useContext, useDebugValue, useDeferredValue, useEffect,
  useId, useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo,
  useReducer, useRef, useState, useSyncExternalStore, useTransition,
} = React;
