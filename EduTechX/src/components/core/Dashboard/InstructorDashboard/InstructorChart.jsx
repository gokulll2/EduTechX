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
  return (
    <div>
    <p>Visualise</p>
    <div className='flex gap-x-5'>
      <button
      onClick={() => setCurrChart("students")}
      >
          Student
      </button>

      <button
      onClick={() => setCurrChart("income")}
      >
          Income
      </button>
    </div>
    <div>
      <Pie 
          data={currChart === "students" ? chartDataForStudents : chartDataForIncome}
          options={options}
      />
    </div>
  </div>
  )
}
