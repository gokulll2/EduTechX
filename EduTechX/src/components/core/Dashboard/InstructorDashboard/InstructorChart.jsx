import React from 'react'
import {Chart , registrables} from "chart.js"
import {Pie} from "react-chartjs-2"

Chart.register(...registrables);

export const InstructorChart = ({props}) => {
    const courses = props.courses;
    const[currChart , setcurrChart] = React.useState("students");

    //function to generate random colors
    const getRandomColors = (numColors)=>{
        const colors = [];
        for(let i=0;i<numColors;i++)
        {
            const color = `rgb(${Math.floor(Math.random() * 256)} , ${Math.floor(Math.random() * 256)} , 
            ${Math.floor(Math.random()*256)})`
            colors.push(color);
        }
    }
    //create data for Chart displaying student info
    const chartDataforStudents = {
        labels:courses.map((course)=> course.courseName),
        dataSets:[
            {
                data:courses.map((course)=>course.totalStudentsEnrolled),
                backgroundColor:getRandomColors(courses.length),
            }
        ]     
    }
    //create Data for Chart displaying Income info
    const chartDataforIncome = {
        labels:courses.map((course)=>course.courseName),
        dataSets:[
            {
                data:courses.map((course)=>course.totalAmountGenerated),
                backgroundColor:getRandomColors(courses.length),
            }
        ]
    }
    const options = {
        maintainAspectRatio:false,
    }
  return (
    <div className="flex flex-1 flex-col gap-y-4 rounded-md bg-richblack-800 p-6">
      <p className="text-lg font-bold text-richblack-5">Visualize</p>
      <div className="space-x-4 font-semibold">
        {/* Button to switch to the "students" chart */}
        <button
          onClick={() => setCurrChart("students")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "students"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Students
        </button>
        {/* Button to switch to the "income" chart */}
        <button
          onClick={() => setCurrChart("income")}
          className={`rounded-sm p-1 px-3 transition-all duration-200 ${
            currChart === "income"
              ? "bg-richblack-700 text-yellow-50"
              : "text-yellow-400"
          }`}
        >
          Income
        </button>
      </div>
      <div className="relative mx-auto aspect-square h-full w-full">
        {/* Render the Pie chart based on the selected chart */}
        <Pie
          data={currChart === "students" ? chartDataStudents : chartIncomeData}
          options={options}
        />
      </div>
    </div>
  )
}
