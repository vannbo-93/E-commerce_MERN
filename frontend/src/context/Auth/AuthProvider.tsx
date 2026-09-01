

import { useState, type FC, type PropsWithChildren } from "react";
import { AuthContext } from "./AuthContext";

const AuthProvider: FC<PropsWithChildren> = ({children}) => {

    const [username,setUsername] = useState<string | null>(localStorage.getItem("username"));
    const [token,setToken] = useState<string | null>(localStorage.getItem("token"));
    
    // const logout = ()=> {
    //     setUsername(null);
    //     setToken(null);
    //     localStorage.removeItem('username');
    //     localStorage.removeItem('token');
    // }
    
    const login = (username: string, isAuthenticated: boolean)=> {
        setUsername(username);
        setToken(isAuthenticated ? username : null);
        localStorage.setItem('username',username);
        if(isAuthenticated) localStorage.setItem('token',username);
        else localStorage.removeItem('token');
    }
    
    return (
        <AuthContext.Provider value={{username,token,isAuthenticated: !!token,login}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
