import { ReactNode, createContext, useState } from "react";
import { authService } from "@services/auth";
import { AuthBody, User } from "../types/user";

// Definimos los tipos para los datos manejados en el contexto
interface AuthContextType {
  token: string;
  user: User | null;
  login: (body: AuthBody, callback?: () => void) => Promise<void>;
  logOut: (callback?: () => void) => void;
  error: string | null
}

// Creamos el contexto de autenticación y lo inicializamos con un objeto vacío
export const AuthContext = createContext<AuthContextType>({
  token: "",
  user: null,
  login: async () => {},
  logOut: () => {},
  error: null
});

type Props = {
  children: ReactNode;
}

const AuthProvider = ({ children }:Props) => {
  //State donde se guardan los datos del usuario (email y name)
  const [user, setUser] = useState<User | null>(null);
  //State donde se almacena el token
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  //State donde se almacenará el error en caso de haber uno
  const [error, setError] = useState<string | null>(null)

  //Función encargada de iniciar sesión
  const login = async (body:AuthBody, callback?: ()=> void) => {
    try {
      const res = await authService.login(body)
      
      //Si existe el token:
      if (res.token) {
        //Se guardan los datos del usuario
        setUser(res);
        //Se guarda el token en el state y en el local storage
        setToken(res.token);
        localStorage.setItem("token", res.token);
      }

      //Si existe el callback se ejecutará
      callback && callback()
    } catch (err:any) {
      setError(err.message)
    } 
  };

  //Función encargada de cerrar sesión
  const logOut = (callback?: ()=> void) => {
    //Limpieza de usuario y token
    setUser(null);
    setToken("");
    localStorage.removeItem("site");
    //Si existe el callback se ejecutará
    callback && callback()
  };

  return <AuthContext.Provider value={{ token, user, login, logOut, error }}>{children}</AuthContext.Provider>;
};

export default AuthProvider;