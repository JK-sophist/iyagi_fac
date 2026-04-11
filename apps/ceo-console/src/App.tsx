import { Link, Route, Routes } from 'react-router-dom';
import { DashboardPage } from './pages/DashboardPage';
import { GoalsPage } from './pages/GoalsPage';
import { GoalDetailPage } from './pages/GoalDetailPage';
import { ApprovalsPage } from './pages/ApprovalsPage';
import { TracesPage } from './pages/TracesPage';

export default function App() {
  return (
    <div className='layout'>
      <nav>
        <Link to='/'>Dashboard</Link>
        <Link to='/goals'>Goals</Link>
        <Link to='/approvals'>Approvals</Link>
        <Link to='/traces'>Traces</Link>
      </nav>
      <main>
        <Routes>
          <Route path='/' element={<DashboardPage />} />
          <Route path='/goals' element={<GoalsPage />} />
          <Route path='/goals/:goalId' element={<GoalDetailPage />} />
          <Route path='/approvals' element={<ApprovalsPage />} />
          <Route path='/traces' element={<TracesPage />} />
        </Routes>
      </main>
    </div>
  );
}
