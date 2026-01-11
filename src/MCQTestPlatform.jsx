import React, { useState } from 'react';
import { Settings, BookOpen, Clock, CheckCircle, AlertCircle, LogOut, ChevronRight, ChevronLeft, CreditCard, Lock, User } from 'lucide-react';

const MCQTestPlatform = () => {
  // State for View Management
  const [view, setView] = useState('landing'); // landing, payment, test, result, admin
  
  // State for Admin Data (Questions, Users, Results)
  const [adminData, setAdminData] = useState({
    questions: [
      { id: 1, question: "What is the primary purpose of React?", options: ["Database Management", "Building User Interfaces", "Operating System", "Network Routing"], correct: 1 },
      { id: 2, question: "Which hook is used for side effects?", options: ["useState", "useEffect", "useContext", "useReducer"], correct: 1 },
      { id: 3, question: "What is JSX?", options: ["Java Syntax Extension", "JavaScript XML", "JSON XML", "Java Serialized XML"], correct: 1 },
      { id: 4, question: "How is data passed to components?", options: ["State", "Props", "Render", "Events"], correct: 1 },
      { id: 5, question: "What is the virtual DOM?", options: ["A direct copy of the HTML", "A lightweight copy of the DOM", "A browser plugin", "A database"], correct: 1 },
      { id: 6, question: "What is the default local host port that a React development server uses?", options: ["3000", "8080", "5000", "3030"], correct: 0 },
      { id: 7, question: "Which command is used to create a new React app?", options: ["npm install react", "npx create-react-app my-app", "npm start react", "react new my-app"], correct: 1 },
      { id: 8, question: "What is the use of 'keys' in React lists?", options: ["To style elements", "To identify unique elements", "To sort elements", "To filter elements"], correct: 1 },
      { id: 9, question: "Which hook is used to manage state in a functional component?", options: ["useEffect", "useContext", "useState", "useReducer"], correct: 2 },
      { id: 10, question: "What is the children prop?", options: ["A property that lets you pass components as data to other components", "A method to update state", "A way to pass data from child to parent", "A lifecycle method"], correct: 0 }
    ],
    users: [],
    results: []
  });

  // Test & User State
  const [currentUser, setCurrentUser] = useState({ name: '', email: '' });
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  
  // Admin Auth State
  const [adminPass, setAdminPass] = useState('');
  const [isAdmin, setIsAdmin] = useState(false);

  // Handlers
  const handleStart = () => setView('payment');
  
  const handlePayment = (e) => {
    e.preventDefault();
    if (currentUser.name && currentUser.email) {
      setAdminData(prev => ({ ...prev, users: [...prev.users, currentUser] }));
      setView('test');
    }
  };

  const handleAnswer = (idx) => {
    setAnswers({ ...answers, [currentQuestion]: idx });
  };

  const handleSubmitTest = () => {
    const score = adminData.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    const result = { ...currentUser, score, date: new Date().toLocaleString() };
    setAdminData(prev => ({ ...prev, results: [...prev.results, result] }));
    setView('result');
  };

  const handleAdminLogin = (e) => {
    e.preventDefault();
    if (adminPass === 'admin123') {
      setIsAdmin(true);
    }
  };

  // Views
  const LandingView = () => (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 text-white p-4">
      <BookOpen size={64} className="mb-6" />
      <h1 className="text-4xl font-bold mb-4">React Mastery MCQ Platform</h1>
      <p className="text-xl mb-8 text-indigo-100">Test your knowledge with our premium assessment.</p>
      <div className="flex gap-4">
        <button onClick={handleStart} className="bg-white text-indigo-600 px-8 py-3 rounded-full font-bold hover:bg-indigo-50 transition flex items-center gap-2">
          Start Test <ChevronRight size={20} />
        </button>
        <button onClick={() => setView('admin')} className="bg-indigo-700 text-white px-8 py-3 rounded-full font-bold hover:bg-indigo-800 transition flex items-center gap-2">
          <Settings size={20} /> Admin
        </button>
      </div>
    </div>
  );

  const PaymentView = () => (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full">
        <div className="flex items-center gap-2 mb-6 text-indigo-600">
          <CreditCard size={24} />
          <h2 className="text-2xl font-bold">Secure Payment</h2>
        </div>
        <form onSubmit={handlePayment} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-3 text-gray-400" size={18} />
              <input required type="text" className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
                value={currentUser.name} onChange={e => setCurrentUser({...currentUser, name: e.target.value})} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input required type="email" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500" 
              value={currentUser.email} onChange={e => setCurrentUser({...currentUser, email: e.target.value})} />
          </div>
          <div className="bg-gray-100 p-4 rounded-lg flex justify-between items-center">
            <span className="font-medium">Total Amount</span>
            <span className="text-xl font-bold text-indigo-600">$19.99</span>
          </div>
          <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
            Pay & Start Test
          </button>
        </form>
        <button onClick={() => setView('landing')} className="mt-4 text-gray-500 hover:text-gray-700 text-sm w-full text-center">Cancel</button>
      </div>
    </div>
  );

  const TestView = () => (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-lg overflow-hidden">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold">Question {currentQuestion + 1}/{adminData.questions.length}</h2>
          <div className="flex items-center gap-2 bg-indigo-500 px-3 py-1 rounded-full">
            <Clock size={18} /> <span>15:00</span>
          </div>
        </div>
        <div className="p-8">
          <h3 className="text-xl font-medium mb-6">{adminData.questions[currentQuestion].question}</h3>
          <div className="space-y-3">
            {adminData.questions[currentQuestion].options.map((opt, idx) => (
              <button key={idx} onClick={() => handleAnswer(idx)}
                className={`w-full text-left p-4 rounded-xl border-2 transition flex justify-between items-center
                  ${answers[currentQuestion] === idx ? 'border-indigo-600 bg-indigo-50 text-indigo-700' : 'border-gray-200 hover:border-indigo-200'}`}>
                {opt}
                {answers[currentQuestion] === idx && <CheckCircle size={20} className="text-indigo-600" />}
              </button>
            ))}
          </div>
          <div className="flex justify-between mt-8 pt-6 border-t">
            <button disabled={currentQuestion === 0} onClick={() => setCurrentQuestion(c => c - 1)}
              className="flex items-center gap-2 px-6 py-2 text-gray-600 hover:bg-gray-100 rounded-lg disabled:opacity-50">
              <ChevronLeft size={20} /> Previous
            </button>
            {currentQuestion === adminData.questions.length - 1 ? (
              <button onClick={handleSubmitTest} className="flex items-center gap-2 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                Submit Test <CheckCircle size={20} />
              </button>
            ) : (
              <button onClick={() => setCurrentQuestion(c => c + 1)} className="flex items-center gap-2 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
                Next <ChevronRight size={20} />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const ResultView = () => {
    const score = adminData.questions.reduce((acc, q, i) => acc + (answers[i] === q.correct ? 1 : 0), 0);
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-lg w-full">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle size={40} className="text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Test Completed!</h2>
          <p className="text-gray-600 mb-6">Thank you for participating, {currentUser.name}.</p>
          <div className="text-5xl font-bold text-indigo-600 mb-2">{score}/{adminData.questions.length}</div>
          <p className="text-gray-500 mb-8">Your Score</p>
          <button onClick={() => { setView('landing'); setAnswers({}); setCurrentQuestion(0); }} 
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold hover:bg-indigo-700 transition">
            Back to Home
          </button>
        </div>
      </div>
    );
  };

  const AdminView = () => (
    <div className="min-h-screen bg-gray-100">
      {!isAdmin ? (
        <div className="flex items-center justify-center min-h-screen p-4">
          <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
            <div className="flex justify-center mb-6"><Lock size={40} className="text-indigo-600" /></div>
            <h2 className="text-2xl font-bold text-center mb-6">Admin Login</h2>
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <input type="password" placeholder="Enter Password (admin123)" className="w-full p-3 border rounded-lg"
                value={adminPass} onChange={e => setAdminPass(e.target.value)} />
              <button type="submit" className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold">Login</button>
            </form>
            <button onClick={() => setView('landing')} className="mt-4 w-full text-center text-gray-500">Back</button>
          </div>
        </div>
      ) : (
        <div className="p-6 max-w-6xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <button onClick={() => { setIsAdmin(false); setView('landing'); }} className="flex items-center gap-2 text-red-600 bg-white px-4 py-2 rounded-lg shadow-sm hover:bg-red-50">
              <LogOut size={20} /> Logout
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-indigo-500">
              <div className="text-gray-500 mb-1">Total Users</div>
              <div className="text-3xl font-bold">{adminData.users.length}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-green-500">
              <div className="text-gray-500 mb-1">Tests Completed</div>
              <div className="text-3xl font-bold">{adminData.results.length}</div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border-l-4 border-purple-500">
              <div className="text-gray-500 mb-1">Questions Active</div>
              <div className="text-3xl font-bold">{adminData.questions.length}</div>
            </div>
          </div>
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b"><h3 className="text-xl font-bold">Recent Results</h3></div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="p-4">Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {adminData.results.length === 0 ? (
                    <tr><td colSpan="4" className="p-8 text-center text-gray-500"><AlertCircle className="inline mr-2" />No results yet</td></tr>
                  ) : (
                    adminData.results.map((r, i) => (
                      <tr key={i} className="border-t hover:bg-gray-50">
                        <td className="p-4 font-medium">{r.name}</td>
                        <td className="p-4 text-gray-600">{r.email}</td>
                        <td className="p-4"><span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm font-bold">{r.score}</span></td>
                        <td className="p-4 text-gray-500 text-sm">{r.date}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <>
      {view === 'landing' && LandingView()}
      {view === 'payment' && PaymentView()}
      {view === 'test' && TestView()}
      {view === 'result' && ResultView()}
      {view === 'admin' && AdminView()}
    </>
  );
};

export default MCQTestPlatform;