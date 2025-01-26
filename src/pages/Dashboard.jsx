import React, { useState, useEffect, useRef, useMemo } from "react";
import { getDocs, collection, query, where, orderBy, limit } from "firebase/firestore";
import { db } from "../config/firebase";
import Chart from "chart.js/auto";

const AdvancedDashboard = () => {
  // State management
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendanceList, setAttendanceList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState('overview');

  // Chart references
  const mainChartRef = useRef(null);
  const detailChartRef = useRef(null);
  const chartInstanceRef = useRef(null);
  const detailChartInstanceRef = useRef(null);

  // Firebase collections
  const collectionStudents = collection(db, "students");
  const collectionCourses = collection(db, "courses");
  const collectionAttendance = collection(db, "attendance");

  // Data fetching functions
  const getStudent = async () => {
    try {
      const data = await getDocs(collectionStudents);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setStudents(filteredData);
    } catch (error) {
      console.error("Error fetching student data:", error);
    }
  };

  const getCourses = async () => {
    try {
      const data = await getDocs(collectionCourses);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setCourses(filteredData);
    } catch (error) {
      console.error("Error fetching course data:", error);
    }
  };

  const getAttendanceData = async () => {
    try {
      const data = await getDocs(collectionAttendance);
      const filteredData = data.docs.map((doc) => ({
        ...doc.data(),
        id: doc.id,
      }));
      setAttendanceList(filteredData);
    } catch (error) {
      console.error("Error fetching attendance data:", error);
    }
  };

  // Compute advanced statistics
  const computeStatistics = () => {
    const totalStudents = students.length;
    const totalCourses = courses.length;
    const totalAttendance = attendanceList.length;

    // More advanced computations
    const recentStudents = students.filter(student => 
      new Date(student.enrollmentDate) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    );

    const courseCompletion = courses.map(course => ({
      name: course.name,
      completionRate: Math.floor(Math.random() * 100) // Placeholder logic
    }));

    return {
      totalStudents,
      totalCourses,
      totalAttendance,
      recentStudents,
      courseCompletion
    };
  };

  // Create main overview chart
  const createMainChart = () => {
    if (mainChartRef.current) {
      const ctx = mainChartRef.current.getContext("2d");
      const stats = computeStatistics();

      const data = {
        labels: ["Students", "Courses", "Attendance"],
        datasets: [
          {
            label: "Total Numbers",
            data: [stats.totalStudents, stats.totalCourses, stats.totalAttendance],
            backgroundColor: [
              "rgba(255, 99, 132, 0.7)",  // Red for Students
              "rgba(75, 192, 192, 0.7)",  // Green for Courses
              "rgba(54, 162, 235, 0.7)"   // Blue for Attendance
            ],
          }
        ]
      };

      const config = {
        type: "bar",
        data: data,
        options: {
          responsive: true,
          plugins: {
            title: {
              display: true,
              text: 'Educational System Overview'
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Total Count'
              }
            }
          }
        }
      };

      // Destroy existing chart if it exists
      if (chartInstanceRef.current) {
        chartInstanceRef.current.destroy();
      }

      // Create new chart instance
      chartInstanceRef.current = new Chart(ctx, config);
    }
  };

  // Create detailed chart based on view
  const createDetailChart = () => {
    if (detailChartRef.current) {
      const ctx = detailChartRef.current.getContext("2d");
      const stats = computeStatistics();

      let data, config;
      switch(activeView) {
        case 'students':
          data = {
            labels: stats.recentStudents.map(s => s.name),
            datasets: [{
              label: 'Recent Student Enrollments',
              data: stats.recentStudents.map(() => Math.floor(Math.random() * 100)),
              backgroundColor: 'rgba(255, 206, 86, 0.7)'
            }]
          };
          config = {
            type: 'line',
            data: data,
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Recent Student Enrollments'
                }
              }
            }
          };
          break;
        case 'courses':
          data = {
            labels: stats.courseCompletion.map(c => c.name),
            datasets: [{
              label: 'Course Completion Rates',
              data: stats.courseCompletion.map(c => c.completionRate),
              backgroundColor: 'rgba(153, 102, 255, 0.7)'
            }]
          };
          config = {
            type: 'pie',
            data: data,
            options: {
              responsive: true,
              plugins: {
                title: {
                  display: true,
                  text: 'Course Completion Rates'
                }
              }
            }
          };
          break;
        default:
          return;
      }

      // Destroy existing detail chart if it exists
      if (detailChartInstanceRef.current) {
        detailChartInstanceRef.current.destroy();
      }

      // Create new detail chart instance
      detailChartInstanceRef.current = new Chart(ctx, config);
    }
  };

  // Fetch data and create charts
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        await Promise.all([getStudent(), getCourses(), getAttendanceData()]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, []);

  // Create charts when data or view changes
  useEffect(() => {
    createMainChart();
    createDetailChart();
  }, [students, courses, attendanceList, activeView]);

  return (
    <>
      <div className="container-fluid mt-3">
        <div className="row">
          <div className="col-12">
            <h1 className="text-center mb-4">Advanced Educational Dashboard</h1>
            
            {/* Overview Statistics */}
            <table className="table table-bordered table-hover">
              <thead className="thead-dark">
                <tr>
                  <th>Total Students</th>
                  <th>Total Courses</th>
                  <th>Attendance Records</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><h4>{students.length}</h4></td>
                  <td><h4>{courses.length}</h4></td>
                  <td><h4>{attendanceList.length}</h4></td>
                </tr>
              </tbody>
            </table>

            {/* Loading Indicator */}
            {loading && (
              <div className="text-center my-4">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p>Fetching Data...</p>
              </div>
            )}
          </div>
        </div>

        {/* Charts Section */}
        <div className="row mt-4">
          <div className="col-md-8 mx-auto">
            <canvas ref={mainChartRef}></canvas>
          </div>
        </div>

        {/* Detailed View Selector */}
        <div className="row mt-4">
          <div className="col-12 text-center">
            <div className="btn-group" role="group">
              <button 
                className={`btn ${activeView === 'overview' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('overview')}
              >
                Overview
              </button>
              <button 
                className={`btn ${activeView === 'students' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('students')}
              >
                Students
              </button>
              <button 
                className={`btn ${activeView === 'courses' ? 'btn-primary' : 'btn-outline-primary'}`}
                onClick={() => setActiveView('courses')}
              >
                Courses
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Chart */}
        <div className="row mt-4">
          <div className="col-md-8 mx-auto">
            {activeView !== 'overview' && (
              <canvas ref={detailChartRef}></canvas>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default AdvancedDashboard;