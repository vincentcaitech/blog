import Link from "next/link"
import { useContext, useState } from "react";
import { pAuth } from "../services/config"
import { PContext } from "../services/context";

export default function Header(){
    const { loggedIn }= useContext(PContext);
    return <header>
        <h1><Link href="/"><a>VC BLOG</a></Link></h1>
        <ul id="menu">
            <li>
                <Link href="/posts"><a>Recent</a></Link>
            </li>
            <li>
                <Link href="/featured"><a>Featured</a></Link>
            </li>
            <li>
                <Link href="/topics"><a>Topics</a></Link>
            </li>
            <li>
                <Link href="/about"><a>About</a></Link>
            </li>
        </ul>
        <div className="account-container">
            <Link href="/account">
                <a className="account-section"><div className="usericon"></div>
                <span>{loggedIn&&pAuth.currentUser?pAuth.currentUser.displayName||pAuth.currentUser.email:"Account"}</span>
                </a>
            </Link>
        </div>
    </header>
}