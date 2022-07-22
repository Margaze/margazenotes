import { createContext, useContext, useState, useEffect } from "react";

import { api } from "../services/api";

export const AuthContext = createContext({});

function AuthProvider({ children }) {
  const [data, setData] = useState({});

  async function signIn({ email, password }) {
    
    try {
      const response = await api.post("/sessions", { email, password });
      const { token, user } = response.data;

      localStorage.setItem("@margazenotes:user", JSON.stringify(user));
      localStorage.setItem("@margazenotes:token", token);

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

        setData({ user, token });
      
    } catch (error) {
      if(error.response){
        alert(error.response.data.message);
      } else {
        alert("Não foi possível entrar");
    }
  }
}

function signOut(){
  localStorage.removeItem("@margazenotes:token");
  localStorage.removeItem("@margazenotes:user");

  setData({});
} 

async function updateProfile({ user, avatarFile }){
  try {

    if(avatarFile){
      const fileUploadForm = new FormData();
      fileUploadForm.append("avatar",avatarFile);

      const response = await api.patch("/users/avatar", fileUploadForm);
      user.avatar = response.data.avatar;
    }

    await api.put("/users", user);
    localStorage.setItem("@margazenotes:user", JSON.stringify(user));

    setData({ user, token: data.token });
    alert("Perfil atualizado!");

  }catch (error) {
      if(error.response){
        alert(error.response.data.message);
      } else {
        alert("Não foi possível atualizar o perfil.");
    }
  }
  }


useEffect(() => {
  const token = localStorage.getItem("@margazenotes:token");
  const user = localStorage.getItem("@margazenotes:user");

  if (token && user) {
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`;


    setData({
      token,
      user: JSON.parse(user)
    });
  }

}, []);

  return(
    <AuthContext.Provider value={{ 
      signIn, 
      signOut,
      updateProfile,
      user: data.user,
      }}
      >
      {children}
    </AuthContext.Provider>
  )
}

function useAuth(){
  const context = useContext(AuthContext);

  return context;
}

export { AuthProvider, useAuth };