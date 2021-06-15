import { useContext, useEffect, useState } from "react"
import { pAuth } from "../services/config";
import EditInput from "../components/EditInput";
import { PContext } from "../services/context";
import { useRouter } from "next/router";

export default function Account(){
    const router = useRouter();
    const { loggedIn }= useContext(PContext);
    const [emailInput,setEmailInput] = useState("");
    const [passwordInput,setPasswordInput] = useState("");
    const [errorMessage,setErrorMessage] = useState("");
    const [loading,setLoading] = useState(false);
    const [usernameInput,setUsernameInput] = useState('');
    const login = async () => {
        setErrorMessage("")
        setLoading(true);
       try{ 
            await pAuth.signInWithEmailAndPassword(emailInput,passwordInput);
       }catch(e){
           setErrorMessage(e.message)
       }
       setLoading(false);
    }
    const createAccount = async () =>{
        setErrorMessage("")
        setLoading(true);
        try{ 
            var res = await pAuth.createUserWithEmailAndPassword(emailInput,passwordInput);
            await res.user.updateProfile({displayName: res.user.email.split("@")[0]})
        }catch(e){
            setErrorMessage(e.message)
        }
        setLoading(false);

    }
    const logout = async () =>{
        setErrorMessage("")
        setLoading(true);
        try{ 
             await pAuth.signOut();
        }catch(e){
            setErrorMessage(e.message)
        }
        setLoading(false);
    }
    const setUsername = async ()=>{
        setErrorMessage("")
        setLoading(true);
        try{ 
            await pAuth.currentUser.updateProfile({
                displayName: usernameInput,
            })
        }catch(e){
            setErrorMessage(e.message)
        }
        setLoading(false);
        setUsernameInput("");
        router.push("/account"); //refresh by pushing the same path.
    }

    return <div id="auth-container">
        <div id="auth-container-center">
            {!loggedIn?<div>
                <EditInput val={emailInput} set={setEmailInput} placeholder="Email"></EditInput>
                <EditInput type="password" val={passwordInput} set={setPasswordInput} placeholder={"Password"}></EditInput>
                <button className="sb" onClick={login}>Login</button>
                <button className="gb" style={{marginLeft: "10px"}}onClick={createAccount}>Create Account</button>
            </div>:<div className="loggedIn" style={{marginBottom: "15px"}}>
                <h2>Account</h2>
                <div>
                    <EditInput val={usernameInput} set={setUsernameInput} placeholder={pAuth.currentUser.displayName}></EditInput><button className="gb" onClick={setUsername}>Change Username</button>
                    <p>*Must Refresh to See Changes</p>
                </div>
                <button className="sb" onClick={logout}>Logout</button>
            </div>}
            {loading&&<p>Loading...</p>}
            <span style={{color: "red"}}>{errorMessage || ""}</span>
        </div>
    </div>
}