import React from 'react'
import { Link , matchPath } from "react-router-dom";
import {NavbarLinks} from "..//../data/navbar-links"
import {useLocation} from "react-router-dom"
const Navbar = () => {
    const location = useLocation();
    const matchRoute = (route)=>{
        return matchPath({path:route} , location.pathname )
    }
  return (
    <div>Navbar</div>
  )
}
export default Navbar;
