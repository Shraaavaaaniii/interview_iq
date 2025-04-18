import { BrowserRouter as Router, Routes, Route} from "react-router-dom";
import { PublicLayout } from "@/layouts/public-layout";
import { MainLayout } from "@/layouts/main-layout";
import AuthenticationLayout from "./layouts/auth-layout";
import { SignInPage } from "./routes/sign-in";
import {SignUpPage} from "./routes/sign-up";
import ProtectRoutes from "@/layouts/protected-routes";
import HomePage from "./routes/home";

const App = () => {
  return (
    <Router>
      <Routes>
        {/* public routes */}
        <Route element={<PublicLayout/>}>
        <Route index element={<HomePage />}/>
        </Route>

        {/* Authentication layout */}
        <Route element={<AuthenticationLayout/>}>
        <Route path="/signin/*" element={<SignInPage/>}/>
        <Route path="/signup/*" element={<SignUpPage/>}/>
        </Route>

        {/* protected routes */}
        <Route element={<ProtectRoutes><MainLayout/></ProtectRoutes>}>
        
        {/* add all the protect routes */}

        </Route>
      </Routes>
    </Router>
  )
};

export default App;
