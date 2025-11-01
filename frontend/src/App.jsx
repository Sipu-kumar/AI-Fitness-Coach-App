import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Instructor from './pages/Instructor'
import Navbar from './components/Navbar'
import Login from './pages/Login'
import Signup from './pages/Signup'
import InstructorLogin from './pages/InstructorLogin'
import InstructorDashboard from './pages/InstructorDashboard'
import MeFitChatbot from './components/meFitChatbot'

export default function App(){
  return (
    <div className='min-h-screen'>
      <Navbar />
      <main className='container mx-auto px-4 py-8'>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path='/instructor' element={<Instructor />} />
          <Route path='/login' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/instructor-login' element={<InstructorLogin />} />
          <Route path='/instructor-dashboard' element={<InstructorDashboard />} />
        </Routes>
      </main>
      <MeFitChatbot />
    </div>
  )
}
