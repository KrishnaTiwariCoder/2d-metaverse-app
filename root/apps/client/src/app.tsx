import { useDispatch, useSelector } from "react-redux";
import "./app.css";
import Arena from "./pages/arena";
import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/home";
import {AuthPage} from "@repo/ui/authpage";
import { getMe, signin, signup } from "./utils/auth";
import { getAllSpacesAndMaps } from "./utils/spaces";
import { logOut, setCurrentUser, setMyId, storeToken } from "./redux/authslice";
import { setMaps, setSpacesState } from "./redux/spaceSlice";
import PrivateRoute from "./components/privateroute";
import { setElements } from "./redux/elementSlice";

function App() {
  
  const dispatch = useDispatch();
  const token = useSelector((state:any)=>state.auth.token);
  useEffect(()=>{
    const fetchUser = async () => {
        const {data:{user:res} , status} = await getMe();
        const {spaces,maps , elements}:{spaces:any[],maps:any[] , elements:any[]} = await getAllSpacesAndMaps() as {spaces:any[],maps:any[] , elements:any[]};
        
        if(status==200){
            dispatch(setCurrentUser({id: res._id, username: res.username}));
            dispatch(setMyId(res._id));
            dispatch(storeToken(localStorage.getItem("token")));
            dispatch(setSpacesState(spaces));
            dispatch(setMaps(maps));
            dispatch(setElements(elements));
        } else {
          dispatch(logOut())
        }
    }
    if(localStorage.getItem("token")){
      fetchUser();
    }
  },[token])

  return (
    <>
      <Routes>
        <Route
          path="/"
          element={token ? <HomePage /> : 
          <AuthPage 
            dispatch={dispatch} 
            setCurrentUser={setCurrentUser} 
            setMyId={setMyId} 
            storeToken={storeToken} 
            signin={signin} 
            signup={signup} 
          />
        }
        />

        <Route element={<PrivateRoute />}>
          <Route path="/spaces/:id" element={<Arena />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
