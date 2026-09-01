import { useState, type FC, type PropsWithChildren } from "react";
import { AuthContext } from "./AuthContext";

const USERNAME_KEY = "username";
const TOKEN_KEY = "token";

const AuthProvider: FC<PropsWithChildren> = ({children}) => {

    const [username,setUsername] = useState<string | null>(localStorage.getItem(USERNAME_KEY));
    const [token,setToken] = useState<string | null>(localStorage.getItem(TOKEN_KEY));

    const isAuthenticated = !!token;
    
    const login = (username: string, authToken: string | null)=> {
       const nextToken = authToken && authToken.trim() ? authToken : null;

       setUsername(username);
       setToken(nextToken);

       localStorage.setItem(USERNAME_KEY, username);
       if (nextToken) localStorage.setItem(TOKEN_KEY, nextToken);
       else localStorage.removeItem(TOKEN_KEY);
    }

    const logout = ()=> {
         localStorage.removeItem(USERNAME_KEY);
         localStorage.removeItem(TOKEN_KEY);
         setUsername(null);
         setToken(null);
    }
    
    return (
        <AuthContext.Provider value={{username,token,isAuthenticated,login,logout}}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthProvider;
