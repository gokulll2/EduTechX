import {combineReducers} from "@reduxjs/toolkit"
import authReducer from "../slice/authSlice"
import cartReducer from "../slice/cartSlice"
import profileReducer from "../slice/profileSlice"
import courseReducer from "../slice/courseSlice"
import viewCourseReducer from "../slice/courseSlice"
const rootReducer = combineReducers({
    auth:authReducer,
    cart:cartReducer,
    profile:profileReducer,
    course:courseReducer,
    viewcourse:viewCourseReducer,
})
export default rootReducer