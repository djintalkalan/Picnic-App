import { NavigationContainerRef, Route, StackActions } from '@react-navigation/native';
import * as React from 'react';

export const navigationRef: React.MutableRefObject<NavigationContainerRef | null> =
  React.createRef();

const navigate = (name: string, params: any = {}) => {
  navigationRef?.current?.navigate(name, params);
};

const push = (name: string, params: any = {}) => {
  // console.log("navigationRef?.current??", params, navigationRef?.current?.getCurrentRoute())
  // const currentName = navigationRef?.current?.getCurrentRoute()?.name
  // const type = navigationRef?.current?.getCurrentRoute()?.params?.type
  // if (currentName == name || type == 'notification') {
  //     goBack()
  // }
  navigationRef?.current?.dispatch(StackActions.push(name, params));
};

const getCurrentScreen = (): Route<string, any> | undefined => {
  return navigationRef?.current?.getCurrentRoute();
}

const replace = (name: string, params: any = {}) => {
  const rootState = navigationRef?.current?.getRootState();
  if (rootState?.routes && rootState?.index) {
    if (
      rootState?.routes.length > rootState?.index &&
      rootState?.routes[rootState?.index - 1].name == name
    ) {
      goBack();
      return;
    }
  }
  // console.log("navigationRef?.getCurrentRoute??", navigationRef?.current?.getCurrentRoute())
  // console.log("navigationRef?.getRootState??", navigationRef?.current?.getRootState())
  // console.log("navigationRef?.getState??", navigationRef?.current?.getState())
  navigationRef?.current?.dispatch(StackActions.replace(name, params));
};

const logout = (name: string, params: any = {}) => {
  navigationRef?.current?.dispatch(StackActions.popToTop());
  replace(name);
};
const goBack = () => {
  try {
    navigationRef?.current?.goBack();
  } catch (e) {
    console.log(e);
  }
};
export const NavigationService = { getCurrentScreen, navigate, goBack, push, replace, logout };
