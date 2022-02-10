import React, { FC, useContext, useState } from "react";

const SearchContext = React.createContext<{
    chats: Array<any>,
    events: Array<any>,
    searchedText: string,
    setEvents: React.Dispatch<React.SetStateAction<Array<any>>>,
    setChats: React.Dispatch<React.SetStateAction<Array<any>>>,
    setSearchedText: React.Dispatch<React.SetStateAction<string>>,
}>({
    chats: [],
    events: [],
    setEvents: null,
    setChats: null,
    searchedText: "",
    setSearchedText: null,
});

export const SearchProvider: FC = ({ children }) => {
    const [chats, setChats] = useState<Array<any>>([])
    const [events, setEvents] = useState<Array<any>>([])
    const [searchedText, setSearchedText] = useState<string>("")

    return (
        <SearchContext.Provider value={{ chats, setChats, events, setEvents, searchedText, setSearchedText }}>
            {children}
        </SearchContext.Provider>
    )
}



export const useSearchState = () => useContext(SearchContext)