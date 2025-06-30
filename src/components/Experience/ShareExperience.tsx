import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Company } from '../../types/database';
import { Plus, X, Building, Calendar, Star, Clock, Target, Trophy, Code, Link as LinkIcon, Trash2, AlertCircle } from 'lucide-react';
import AddCompanyModal from '../Company/AddCompanyModal';

interface Round {
  round_number: number;
  round_type: 'technical' | 'hr' | 'managerial' | 'group_discussion' | 'aptitude' | 'coding';
  round_name: string;
  duration: string;
  description: string;
  difficulty: number;
  result: 'passed' | 'failed' | 'pending';
  coding_questions: CodingQuestion[];
}

interface CodingQuestion {
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  solution_approach: string;
  time_complexity: string;
  space_complexity: string;
  platform_links: PlatformLink[];
}

interface PlatformLink {
  platform: 'leetcode' | 'gfg' | 'codechef' | 'codeforces' | 'hackerrank' | 'interviewbit' | 'other';
  url: string;
  problem_id: string;
}

const ShareExperience: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    company_id: '',
    position: '',
    experience_level: 'fresher' as 'fresher' | 'experienced',
    experience_years: 0,
    interview_date: '',
    result: 'pending' as 'selected' | 'rejected' | 'pending',
    overall_rating: 3,
    difficulty_level: 3,
    interview_process: '',
    preparation_time: '',
    advice: '',
    salary_offered: '',
    is_anonymous: false,
  });

  const [rounds, setRounds] = useState<Round[]>([]);
  const [currentTopicInput, setCurrentTopicInput] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCompanies();
  }, [user, navigate]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({
        ...prev,
        [name]: checked
      }));
    } else if (type === 'number') {
      setFormData(prev => ({
        ...prev,
        [name]: parseInt(value) || 0
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const validateDate = (dateString: string) => {
    const selectedDate = new Date(dateString);
    const today = new Date();
    today.setHours(23, 59, 59, 999); // Set to end of today
    
    return selectedDate <= today;
  };

  const addRound = () => {
    const newRound: Round = {
      round_number: rounds.length + 1,
      round_type: 'technical',
      round_name: '',
      duration: '',
      description: '',
      difficulty: 3,
      result: 'pending',
      coding_questions: []
    };
    setRounds([...rounds, newRound]);
  };

  const updateRound = (index: number, field: keyof Round, value: any) => {
    const updatedRounds = [...rounds];
    updatedRounds[index] = { ...updatedRounds[index], [field]: value };
    setRounds(updatedRounds);
  };

  const removeRound = (index: number) => {
    const updatedRounds = rounds.filter((_, i) => i !== index);
    // Renumber rounds
    const renumberedRounds = updatedRounds.map((round, i) => ({
      ...round,
      round_number: i + 1
    }));
    setRounds(renumberedRounds);
  };

  const addCodingQuestion = (roundIndex: number) => {
    const newQuestion: CodingQuestion = {
      title: '',
      description: '',
      difficulty: 'medium',
      topics: [],
      solution_approach: '',
      time_complexity: '',
      space_complexity: '',
      platform_links: []
    };
    
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].coding_questions.push(newQuestion);
    setRounds(updatedRounds);
  };

  const updateCodingQuestion = (roundIndex: number, questionIndex: number, field: keyof CodingQuestion, value: any) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].coding_questions[questionIndex] = {
      ...updatedRounds[roundIndex].coding_questions[questionIndex],
      [field]: value
    };
    setRounds(updatedRounds);
  };

  const removeCodingQuestion = (roundIndex: number, questionIndex: number) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].coding_questions.splice(questionIndex, 1);
    setRounds(updatedRounds);
  };

  const addTopic = (roundIndex: number, questionIndex: number) => {
    const key = `${roundIndex}-${questionIndex}`;
    const topicValue = currentTopicInput[key]?.trim();
    
    if (!topicValue) return;
    
    const updatedRounds = [...rounds];
    const currentTopics = updatedRounds[roundIndex].coding_questions[questionIndex].topics;
    
    if (!currentTopics.includes(topicValue)) {
      updatedRounds[roundIndex].coding_questions[questionIndex].topics = [...currentTopics, topicValue];
      setRounds(updatedRounds);
    }
    
    setCurrentTopicInput(prev => ({ ...prev, [key]: '' }));
  };

  const removeTopic = (roundIndex: number, questionIndex: number, topicIndex: number) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].coding_questions[questionIndex].topics.splice(topicIndex, 1);
    setRounds(updatedRounds);
  };

  const addPlatformLink = (roundIndex: number, questionIndex: number) => {
    const newLink: PlatformLink = {
      platform: 'leetcode',
      url: '',
      problem_id: ''
    };
    
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].coding_questions[questionIndex].platform_links.push(newLink);
    setRounds(updatedRounds);
  };

  const updatePlatformLink = (roundIndex: number, questionIndex: number, linkIndex: number, field: keyof PlatformLink, value: string) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].coding_questions[questionIndex].platform_links[linkIndex] = {
      ...updatedRounds[roundIndex].coding_questions[questionIndex].platform_links[linkIndex],
      [field]: value
    };
    setRounds(updatedRounds);
  };

  const removePlatformLink = (roundIndex: number, questionIndex: number, linkIndex: number) => {
    const updatedRounds = [...rounds];
    updatedRounds[roundIndex].coding_questions[questionIndex].platform_links.splice(linkIndex, 1);
    setRounds(updatedRounds);
  };

  const handleAddCompany = async (companyData: any) => {
    try {
      const response = await api.post('/companies', companyData);
      const newCompany = response.data.company;
      setCompanies(prev => [newCompany, ...prev]);
      setFormData(prev => ({ ...prev, company_id: newCompany.id }));
    } catch (error) {
      console.error('Error adding company:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate required fields
    if (!formData.company_id) {
      setError('Please select a company');
      setLoading(false);
      return;
    }

    if (!formData.position.trim()) {
      setError('Please enter the position');
      setLoading(false);
      return;
    }

    if (!formData.interview_date) {
      setError('Please select the interview date');
      setLoading(false);
      return;
    }

    if (!validateDate(formData.interview_date)) {
      setError('Interview date cannot be in the future');
      setLoading(false);
      return;
    }

    if (!formData.interview_process.trim()) {
      setError('Please describe the interview process');
      setLoading(false);
      return;
    }

    if (!formData.advice.trim()) {
      setError('Please provide advice for future candidates');
      setLoading(false);
      return;
    }

    try {
      const experienceData = {
        ...formData,
        rounds: rounds
      };

      console.log('Submitting experience:', experienceData);
      
      const response = await api.post('/experiences', experienceData);
      console.log('Experience created:', response.data);
      
      // Navigate to the experiences page or show success message
      navigate('/', { 
        state: { 
          message: 'Experience shared successfully! Thank you for contributing to the community.' 
        }
      });
    } catch (error: any) {
      console.error('Error creating experience:', error);
      setError(error.response?.data?.error || 'Failed to create experience. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return null;
  }

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Interview Experience</h1>
        <p className="text-gray-600">Help fellow students by sharing your interview journey</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Basic Information */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Building className="w-5 h-5 mr-2 text-blue-600" />
            Basic Information
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company *
              </label>
              <div className="flex space-x-2">
                <select
                  name="company_id"
                  value={formData.company_id}
                  onChange={handleInputChange}
                  required
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Company</option>
                  {companies.map(company => (
                    <option key={company.id} value={company.id}>{company.name}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Position *
              </label>
              <input
                type="text"
                name="position"
                value={formData.position}
                onChange={handleInputChange}
                required
                placeholder="e.g., Software Engineer, Data Scientist"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience Level
              </label>
              <select
                name="experience_level"
                value={formData.experience_level}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="fresher">Fresher</option>
                <option value="experienced">Experienced</option>
              </select>
            </div>

            {formData.experience_level === 'experienced' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience_years"
                  value={formData.experience_years}
                  onChange={handleInputChange}
                  min="0"
                  max="50"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Interview Date *
              </label>
              <input
                type="date"
                name="interview_date"
                value={formData.interview_date}
                onChange={handleInputChange}
                max={today}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <p className="text-xs text-gray-500 mt-1">Interview date cannot be in the future</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Result
              </label>
              <select
                name="result"
                value={formData.result}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="selected">Selected</option>
                <option value="rejected">Rejected</option>
                <option value="pending">Pending</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Overall Rating (1-5)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  name="overall_rating"
                  value={formData.overall_rating}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  className="flex-1"
                />
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-4 h-4 ${i < formData.overall_rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">{formData.overall_rating}/5</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulty Level (1-5)
              </label>
              <div className="flex items-center space-x-2">
                <input
                  type="range"
                  name="difficulty_level"
                  value={formData.difficulty_level}
                  onChange={handleInputChange}
                  min="1"
                  max="5"
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">{formData.difficulty_level}/5</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Preparation Time
              </label>
              <input
                type="text"
                name="preparation_time"
                value={formData.preparation_time}
                onChange={handleInputChange}
                placeholder="e.g., 2 months, 3 weeks"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Offered
              </label>
              <input
                type="text"
                name="salary_offered"
                value={formData.salary_offered}
                onChange={handleInputChange}
                placeholder="e.g., 12 LPA, $80,000"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  name="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={handleInputChange}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700">Share anonymously (your name will not be shown)</span>
              </label>
            </div>
          </div>
        </div>

        {/* Interview Process */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Target className="w-5 h-5 mr-2 text-blue-600" />
            Interview Process *
          </h2>
          
          <textarea
            name="interview_process"
            value={formData.interview_process}
            onChange={handleInputChange}
            required
            rows={6}
            placeholder="Describe the overall interview process, timeline, and your experience..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Interview Rounds */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Code className="w-5 h-5 mr-2 text-blue-600" />
              Interview Rounds ({rounds.length})
            </h2>
            <button
              type="button"
              onClick={addRound}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Add Round</span>
            </button>
          </div>

          <div className="space-y-6">
            {rounds.map((round, roundIndex) => (
              <div key={roundIndex} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Round {round.round_number}</h3>
                  <button
                    type="button"
                    onClick={() => removeRound(roundIndex)}
                    className="text-red-600 hover:text-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Round Type
                    </label>
                    <select
                      value={round.round_type}
                      onChange={(e) => updateRound(roundIndex, 'round_type', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="technical">Technical</option>
                      <option value="hr">HR</option>
                      <option value="managerial">Managerial</option>
                      <option value="group_discussion">Group Discussion</option>
                      <option value="aptitude">Aptitude</option>
                      <option value="coding">Coding</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Round Name
                    </label>
                    <input
                      type="text"
                      value={round.round_name}
                      onChange={(e) => updateRound(roundIndex, 'round_name', e.target.value)}
                      placeholder="e.g., Technical Round 1, HR Interview"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Duration
                    </label>
                    <input
                      type="text"
                      value={round.duration}
                      onChange={(e) => updateRound(roundIndex, 'duration', e.target.value)}
                      placeholder="e.g., 1 hour, 45 minutes"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Result
                    </label>
                    <select
                      value={round.result}
                      onChange={(e) => updateRound(roundIndex, 'result', e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="passed">Passed</option>
                      <option value="failed">Failed</option>
                      <option value="pending">Pending</option>
                    </select>
                  </div>
                </div>

                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={round.description}
                    onChange={(e) => updateRound(roundIndex, 'description', e.target.value)}
                    rows={3}
                    placeholder="Describe what happened in this round..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>

                {/* Coding Questions */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-md font-semibold text-gray-900">Coding Questions ({round.coding_questions.length})</h4>
                    <button
                      type="button"
                      onClick={() => addCodingQuestion(roundIndex)}
                      className="flex items-center space-x-1 px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Question</span>
                    </button>
                  </div>

                  {round.coding_questions.map((question, questionIndex) => (
                    <div key={questionIndex} className="bg-gray-50 rounded-lg p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h5 className="text-sm font-semibold text-gray-900">Question {questionIndex + 1}</h5>
                        <button
                          type="button"
                          onClick={() => removeCodingQuestion(roundIndex, questionIndex)}
                          className="text-red-600 hover:text-red-700 transition-colors"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Title
                          </label>
                          <input
                            type="text"
                            value={question.title}
                            onChange={(e) => updateCodingQuestion(roundIndex, questionIndex, 'title', e.target.value)}
                            placeholder="e.g., Two Sum, Binary Tree Traversal"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Difficulty
                          </label>
                          <select
                            value={question.difficulty}
                            onChange={(e) => updateCodingQuestion(roundIndex, questionIndex, 'difficulty', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          >
                            <option value="easy">Easy</option>
                            <option value="medium">Medium</option>
                            <option value="hard">Hard</option>
                          </select>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <textarea
                          value={question.description}
                          onChange={(e) => updateCodingQuestion(roundIndex, questionIndex, 'description', e.target.value)}
                          rows={3}
                          placeholder="Describe the problem statement..."
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Topics */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Topics
                        </label>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {question.topics.map((topic, topicIndex) => (
                            <span
                              key={topicIndex}
                              className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                            >
                              {topic}
                              <button
                                type="button"
                                onClick={() => removeTopic(roundIndex, questionIndex, topicIndex)}
                                className="ml-2 text-blue-600 hover:text-blue-800"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          ))}
                        </div>
                        <div className="flex space-x-2">
                          <input
                            type="text"
                            value={currentTopicInput[`${roundIndex}-${questionIndex}`] || ''}
                            onChange={(e) => setCurrentTopicInput(prev => ({
                              ...prev,
                              [`${roundIndex}-${questionIndex}`]: e.target.value
                            }))}
                            placeholder="Add a topic (e.g., Array, Dynamic Programming)"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            onKeyPress={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                addTopic(roundIndex, questionIndex);
                              }
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => addTopic(roundIndex, questionIndex)}
                            className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Time Complexity
                          </label>
                          <input
                            type="text"
                            value={question.time_complexity}
                            onChange={(e) => updateCodingQuestion(roundIndex, questionIndex, 'time_complexity', e.target.value)}
                            placeholder="e.g., O(n), O(log n)"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Space Complexity
                          </label>
                          <input
                            type="text"
                            value={question.space_complexity}
                            onChange={(e) => updateCodingQuestion(roundIndex, questionIndex, 'space_complexity', e.target.value)}
                            placeholder="e.g., O(1), O(n)"
                            className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Solution Approach
                        </label>
                        <textarea
                          value={question.solution_approach}
                          onChange={(e) => updateCodingQuestion(roundIndex, questionIndex, 'solution_approach', e.target.value)}
                          rows={3}
                          placeholder="Describe your approach to solve this problem..."
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>

                      {/* Platform Links */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <label className="block text-sm font-medium text-gray-700">
                            Platform Links
                          </label>
                          <button
                            type="button"
                            onClick={() => addPlatformLink(roundIndex, questionIndex)}
                            className="flex items-center space-x-1 px-2 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 transition-colors"
                          >
                            <LinkIcon className="w-3 h-3" />
                            <span>Add Link</span>
                          </button>
                        </div>

                        {question.platform_links.map((link, linkIndex) => (
                          <div key={linkIndex} className="flex space-x-2 mb-2">
                            <select
                              value={link.platform}
                              onChange={(e) => updatePlatformLink(roundIndex, questionIndex, linkIndex, 'platform', e.target.value)}
                              className="px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="leetcode">LeetCode</option>
                              <option value="gfg">GeeksforGeeks</option>
                              <option value="codechef">CodeChef</option>
                              <option value="codeforces">Codeforces</option>
                              <option value="hackerrank">HackerRank</option>
                              <option value="interviewbit">InterviewBit</option>
                              <option value="other">Other</option>
                            </select>
                            <input
                              type="url"
                              value={link.url}
                              onChange={(e) => updatePlatformLink(roundIndex, questionIndex, linkIndex, 'url', e.target.value)}
                              placeholder="https://..."
                              className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <input
                              type="text"
                              value={link.problem_id}
                              onChange={(e) => updatePlatformLink(roundIndex, questionIndex, linkIndex, 'problem_id', e.target.value)}
                              placeholder="Problem ID"
                              className="w-24 px-3 py-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <button
                              type="button"
                              onClick={() => removePlatformLink(roundIndex, questionIndex, linkIndex)}
                              className="text-red-600 hover:text-red-700 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Advice */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <Trophy className="w-5 h-5 mr-2 text-blue-600" />
            Advice for Future Candidates *
          </h2>
          
          <textarea
            name="advice"
            value={formData.advice}
            onChange={handleInputChange}
            required
            rows={6}
            placeholder="Share your advice, tips, and recommendations for future candidates..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
            <span>{loading ? 'Sharing...' : 'Share Experience'}</span>
          </button>
        </div>
      </form>

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={showAddCompanyModal}
        onClose={() => setShowAddCompanyModal(false)}
        onSubmit={handleAddCompany}
      />
    </div>
  );
};

export default ShareExperience;