import { NavigationContainerRef, Route, StackActions } from '@react-navigation/native';
import * as React from 'react';

const navigationRef: React.MutableRefObject<NavigationContainerRef<any> | null> =
  React.createRef();

const setNavigationRef = (ref: any) => navigationRef.current = ref

const navigate = (name: string, params: any = {}, merge: boolean = true) => {
  navigationRef?.current?.navigate({ name, params, merge });
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

const closeAndPush = (name: string, params: any = {}) => {
  // console.log("navigationRef?.current??", params, navigationRef?.current?.getCurrentRoute())
  const currentName = navigationRef?.current?.getCurrentRoute()?.name

  if (((currentName == "PersonChat" || currentName == "GroupChatScreen" || currentName == 'EventChats' || currentName == "Chats" || currentName == 'UpcomingEventsChat') && (name == "PersonChat" || name == "GroupChatScreen" || name == "EventChats"))
  ) {
    goBack()
  }
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

const getNavigation = () => {
  return navigationRef?.current
};
export const NavigationService = { getNavigation, setNavigationRef, getCurrentScreen, navigate, goBack, push, replace, logout, closeAndPush };
