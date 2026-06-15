import { useDispatch, useSelector } from "react-redux";
import "./app.css";
import Arena from "./pages/arena";
import { Route, Routes } from "react-router-dom";
import { useEffect } from "react";
import HomePage from "./pages/home";
import AuthPage from "./pages/auth";
import { getMe } from "./utils/auth";
import { getAllSpacesAndMaps } from "./utils/spaces";
import { logOut, setCurrentUser, setMyId, storeToken } from "./redux/authslice";
import { setMaps, setSpacesState } from "./redux/spaceSlice";
import PrivateRoute from "./components/privateroute";

function App() {
  

  const dispatch = useDispatch();
  const token = useSelector((state:any)=>state.auth.token);
  useEffect(()=>{
    const fetchUser = async () => {
        const {data:{user:res} , status} = await getMe();
        const {spaces,maps}:{spaces:any[],maps:any[]} = await getAllSpacesAndMaps() as {spaces:any[],maps:any[]};
        
        if(status==200){
            dispatch(setCurrentUser({id: res._id, username: res.username}));
            dispatch(setMyId(res._id));
            dispatch(storeToken(localStorage.getItem("token")));
            dispatch(setSpacesState(spaces));
            dispatch(setMaps(maps))
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
          element={token ? <HomePage /> : <AuthPage />}
        />

        <Route element={<PrivateRoute />}>
          <Route path="/spaces/:id" element={<Arena />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
