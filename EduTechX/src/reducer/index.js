import {combineReducers} from "@reduxjs/toolkit"
import authReducer from "../slice/authSlice"
import cartReducer from "../slice/cartSlice"
import profileReducer from "../slice/profileSlice"
const rootReducer = combineReducers({
    auth:authReducer,
    cart:cartReducer,
    profile:profileReducer,
})
export default rootReducer