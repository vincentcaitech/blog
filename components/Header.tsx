import Link from "next/link"
import { useContext, useState } from "react";
import { pAuth } from "../services/config"
import { PContext } from "../services/context";

export default function Header(){
    const { loggedIn,isMobile,isAdmin }= useContext(PContext);
    const [showMenu,setShowMenu] = useState(false);

    return <header>
        <h1><Link href="/"><a>VC BLOG</a></Link></h1>
        <button className="menu-button" onClick={()=>setShowMenu(!showMenu)}>{showMenu?"Hide":"Menu"}</button>
        {(!isMobile||showMenu)&&<div id="dropdown-container">
            <ul id="menu">
                <li key="posts">
                    <Link href="/posts"><a>Recent</a></Link>
                </li>
                <li key="featured">
                    <Link href="/featured"><a>Featured</a></Link>
                </li>
                <li key="topics">
                    <Link href="/topics"><a>Topics</a></Link>
                </li>
                <li key="about">
                    <Link href="/about"><a>About</a></Link>
                </li>
                {isAdmin&&<li key="private">
                    <Link href="/private"><a>Private</a></Link>
                </li>}
            </ul>
            <div className="account-container">
                <Link href="/account">
                    <a className="account-section"><div className="usericon"></div>
                    <span>{loggedIn&&pAuth.currentUser?pAuth.currentUser.displayName||pAuth.currentUser.email:"Account"}</span>
                    </a>
                </Link>
            </div>
        </div>}
    </header>
}