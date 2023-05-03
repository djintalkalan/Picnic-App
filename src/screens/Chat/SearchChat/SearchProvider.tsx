import React, { FC, useCallback, useContext, useReducer } from "react";

interface IState {
    chats: Array<any>,
    events: Array<any>,
    searchedText: string
}
const initialState: IState = {
    chats: [],
    events: [],
    searchedText: ""
}

const SearchContext = React.createContext<{
    chats: Array<any>,
    events: Array<any>,
    searchedText: string,
    setEvents?: (events: Array<any>) => void,
    setChats?: (chats: Array<any>) => void,
    setSearchedText?: (text: string) => void,
}>(initialState);

const actions = {
    SET_CHATS: "SET_CHATS",
    SET_EVENTS: "SET_EVENTS",
    SET_TEXT: "SET_TEXT",
}
const reducer = (state: IState = initialState, { type, payload }: any): IState => {

    switch (type) {
        case actions.SET_CHATS:
            return { ...state, chats: payload }
        case actions.SET_EVENTS:
            return { ...state, events: payload }
        case actions.SET_TEXT:
            return { ...state, searchedText: payload }
    }
    return state
}


export const SearchProvider: FC<any> = ({ children }) => {
    const [{ chats, events, searchedText }, dispatch] = useReducer(reducer, initialState)

    const setChats = useCallback((chats: Array<any>) => {
        dispatch({ type: actions.SET_CHATS, payload: chats })
    }, [])

    const setEvents = useCallback((events: Array<any>) => {
        dispatch({ type: actions.SET_EVENTS, payload: events })

    }, [])

    const setSearchedText = useCallback((text: string) => {
        dispatch({ type: actions.SET_TEXT, payload: text })

    }, [])

    return (
        <SearchContext.Provider value={{ chats, setChats, events, setEvents, searchedText, setSearchedText }}>
            {children}
        </SearchContext.Provider>
    )
}



export const useSearchState = () => useContext(SearchContext)