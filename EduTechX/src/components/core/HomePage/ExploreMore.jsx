import React from 'react'
import { HomePageExplore } from '../../../data/homepage-explore';
const tabsName = [
    "Free",
    "New to coding",
    "Most popular",
    "Skill paths",
    "Career paths",
]
export const ExploreMore = () => {
    const [currentTab,setcurrentTab] = React.useState(tabsName[0]);
    const [courses, setCourses] = React.useState(HomePageExplore[0].courses);
    const [currentCard , setcurrentCard] = React.useState(HomePageExplore[0].courses[0].heading);

    const setMycards = (value)=>{
        setcurrentTab(value);
       const result = HomePageExplore.filter((courses) => courses.tag === value)
       setCourses(result[0].courses[0])
       setcurrentCard(result[0].courses.heading);
    }
  return (
    <div>ExploreMore</div>
  )
}
