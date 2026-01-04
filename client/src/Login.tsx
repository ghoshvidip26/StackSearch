import GoogleButton from "react-google-button";
import Navbar from "./components/Navbar";
import { auth, provider } from "./hooks/firebase";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router";
import { useDispatch } from "react-redux";
import { login } from "./redux/slice";

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const signIn = () => {
    signInWithPopup(auth, provider)
      .then((res) => {
        const credential = GoogleAuthProvider.credentialFromResult(res);
        console.log(credential);
        const user = res.user;
        dispatch(
          login({
            name: user.displayName,
            email: user.email,
            photo: user.photoURL,
            uid: user.uid,
          })
        );
        navigate("/home");
      })
      .catch((err) => {
        console.log(err);
      });
    console.log(auth);
  };
  return (
    <>
      <Navbar />
      <div className="flex justify-center items-center h-screen bg-slate-950">
        <GoogleButton type="light" onClick={signIn} />
      </div>
    </>
  );
};

export default Login;
