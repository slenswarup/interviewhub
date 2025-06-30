import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';
import { Company } from '../../types/database';
import { Plus, Minus, Building, Calendar, User, FileText, Star, DollarSign, CheckCircle, Sparkles, Search, X, EyeOff, Eye } from 'lucide-react';
import AddCompanyModal from '../Company/AddCompanyModal';

interface Round {
  round_number: number;
  round_type: string;
  round_name: string;
  duration: string;
  description: string;
  difficulty: number;
  result: string;
  coding_questions: CodingQuestion[];
}

interface CodingQuestion {
  title: string;
  description: string;
  difficulty: string;
  topics: string[];
  solution_approach: string;
  time_complexity: string;
  space_complexity: string;
  platform_links: PlatformLink[];
}

interface PlatformLink {
  platform: string;
  url: string;
  problem_id: string;
}

const ShareExperience: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [filteredCompanies, setFilteredCompanies] = useState<Company[]>([]);
  const [companySearch, setCompanySearch] = useState('');
  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);
  const [loading, setLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [isAnonymous, setIsAnonymous] = useState(false);

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

  const [rounds, setRounds] = useState<Round[]>([
    {
      round_number: 1,
      round_type: 'technical',
      round_name: '',
      duration: '',
      description: '',
      difficulty: 3,
      result: 'pending',
      coding_questions: [],
    },
  ]);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchCompanies();
  }, [user, navigate]);

  useEffect(() => {
    // Filter companies based on search with debouncing
    const timeoutId = setTimeout(() => {
      if (companySearch.trim()) {
        const filtered = companies.filter(company =>
          company.name.toLowerCase().includes(companySearch.toLowerCase()) ||
          (company.industry && company.industry.toLowerCase().includes(companySearch.toLowerCase()))
        );
        setFilteredCompanies(filtered);
        setShowCompanyDropdown(true);
      } else {
        setFilteredCompanies([]);
        setShowCompanyDropdown(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [companySearch, companies]);

  const fetchCompanies = async () => {
    try {
      const response = await api.get('/companies');
      setCompanies(response.data);
    } catch (error) {
      console.error('Error fetching companies:', error);
    }
  };

  const handleCompanySelect = (company: Company) => {
    setSelectedCompany(company);
    setCompanySearch(company.name);
    setFormData(prev => ({
      ...prev,
      company_id: company.id
    }));
    setShowCompanyDropdown(false);
  };

  const handleCompanySearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCompanySearch(value);
    
    if (!value.trim()) {
      setSelectedCompany(null);
      setFormData(prev => ({
        ...prev,
        company_id: ''
      }));
    }
  };

  const clearCompanySelection = () => {
    setSelectedCompany(null);
    setCompanySearch('');
    setFormData(prev => ({
      ...prev,
      company_id: ''
    }));
    setShowCompanyDropdown(false);
  };

  const handleAddCompany = async (companyData: any) => {
    try {
      console.log('Adding company:', companyData);
      
      // Make actual API call to add company
      const response = await api.post('/companies', companyData);
      const newCompany = response.data.company;
      
      // Add the new company to the list
      setCompanies(prev => [newCompany, ...prev]);
      
      // Auto-select the newly added company
      handleCompanySelect(newCompany);
      
      // Close modal
      setShowAddCompanyModal(false);
      
      // Show success message
      console.log('Company added successfully:', newCompany);
    } catch (error: any) {
      console.error('Error adding company:', error);
      // Handle error - you might want to show an error message to the user
      alert(error.response?.data?.error || 'Failed to add company');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'experience_years' || name === 'overall_rating' || name === 'difficulty_level' 
        ? parseInt(value) 
        : value
    }));
  };

  const addRound = () => {
    setRounds(prev => [
      ...prev,
      {
        round_number: prev.length + 1,
        round_type: 'technical',
        round_name: '',
        duration: '',
        description: '',
        difficulty: 3,
        result: 'pending',
        coding_questions: [],
      },
    ]);
  };

  const removeRound = (index: number) => {
    if (rounds.length > 1) {
      setRounds(prev => prev.filter((_, i) => i !== index));
    }
  };

  const updateRound = (index: number, field: string, value: any) => {
    setRounds(prev => prev.map((round, i) => 
      i === index ? { ...round, [field]: value } : round
    ));
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
      platform_links: [],
    };

    setRounds(prev => prev.map((round, i) => 
      i === roundIndex 
        ? { ...round, coding_questions: [...round.coding_questions, newQuestion] }
        : round
    ));
  };

  const removeCodingQuestion = (roundIndex: number, questionIndex: number) => {
    setRounds(prev => prev.map((round, i) => 
      i === roundIndex 
        ? { ...round, coding_questions: round.coding_questions.filter((_, j) => j !== questionIndex) }
        : round
    ));
  };

  const updateCodingQuestion = (roundIndex: number, questionIndex: number, field: string, value: any) => {
    setRounds(prev => prev.map((round, i) => 
      i === roundIndex 
        ? {
            ...round,
            coding_questions: round.coding_questions.map((question, j) => 
              j === questionIndex ? { ...question, [field]: value } : question
            )
          }
        : round
    ));
  };

  const addTopic = (roundIndex: number, questionIndex: number) => {
    setRounds(prev => prev.map((round, i) => 
      i === roundIndex 
        ? {
            ...round,
            coding_questions: round.coding_questions.map((question, j) => 
              j === questionIndex 
                ? { ...question, topics: [...question.topics, ''] }
                : question
            )
          }
        : round
    ));
  };

  const removeTopic = (roundIndex: number, questionIndex: number, topicIndex: number) => {
    setRounds(prev => prev.map((round, i) => 
      i === roundIndex 
        ? {
            ...round,
            coding_questions: round.coding_questions.map((question, j) => 
              j === questionIndex 
                ? { ...question, topics: question.topics.filter((_, k) => k !== topicIndex) }
                : question
            )
          }
        : round
    ));
  };

  const updateTopic = (roundIndex: number, questionIndex: number, topicIndex: number, value: string) => {
    setRounds(prev => prev.map((round, i) => 
      i === roundIndex 
        ? {
            ...round,
            coding_questions: round.coding_questions.map((question, j) => 
              j === questionIndex 
                ? {
                    ...question,
                    topics: question.topics.map((topic, k) => 
                      k === topicIndex ? value : topic
                    )
                  }
                : question
            )
          }
        : round
    ));
  };

  const addPlatformLink = (roundIndex: number, questionIndex: number) => {
    const newLink: PlatformLink = {
      platform: 'leetcode',
      url: '',
      problem_id: '',
    };

    setRounds(prev => prev.map((round, i) => 
      i === roundIndex 
        ? {
            ...round,
            coding_questions: round.coding_questions.map((question, j) => 
              j === questionIndex 
                ? { ...question, platform_links: [...question.platform_links, newLink] }
                : question
            )
          }
        : round
    ));
  };

  const removePlatformLink = (roundIndex: number, questionIndex: number, linkIndex: number) => {
    setRounds(prev => prev.map((round, i) => 
      i === roundIndex 
        ? {
            ...round,
            coding_questions: round.coding_questions.map((question, j) => 
              j === questionIndex 
                ? { ...question, platform_links: question.platform_links.filter((_, k) => k !== linkIndex) }
                : question
            )
          }
        : round
    ));
  };

  const updatePlatformLink = (roundIndex: number, questionIndex: number, linkIndex: number, field: string, value: string) => {
    setRounds(prev => prev.map((round, i) => 
      i === roundIndex 
        ? {
            ...round,
            coding_questions: round.coding_questions.map((question, j) => 
              j === questionIndex 
                ? {
                    ...question,
                    platform_links: question.platform_links.map((link, k) => 
                      k === linkIndex ? { ...link, [field]: value } : link
                    )
                  }
                : question
            )
          }
        : round
    ));
  };

  const playSuccessSound = () => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
      oscillator.frequency.setValueAtTime(659.25, audioContext.currentTime + 0.1); // E5
      oscillator.frequency.setValueAtTime(783.99, audioContext.currentTime + 0.2); // G5
      
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (error) {
      console.log('Audio not supported');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      console.log('Submitting experience:', { formData, rounds });
      
      // Make actual API call to submit the experience
      const response = await api.post('/experiences', {
        ...formData,
        is_anonymous: isAnonymous,
        rounds
      });
      
      console.log('Experience submitted successfully:', response.data);
      
      // Show success animation and sound
      setShowSuccess(true);
      playSuccessSound();
      
      // Navigate to home after 3 seconds
      setTimeout(() => {
        navigate('/');
      }, 3000);
    } catch (error: any) {
      console.error('Error submitting experience:', error);
      alert(error.response?.data?.error || 'Failed to submit experience');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  // Company logos mapping for fallback
  const getCompanyLogo = (companyName: string) => {
    const logoMap: { [key: string]: string } = {
      'Google': 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/272px-Google_2015_logo.svg.png',
      'Microsoft': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png',
      'Amazon': 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/603px-Amazon_logo.svg.png',
      'Meta': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png',
      'Apple': 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png',
      'Netflix': 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/08/Netflix_2015_logo.svg/512px-Netflix_2015_logo.svg.png',
      'Uber': 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/58/Uber_logo_2018.svg/512px-Uber_logo_2018.svg.png',
      'Airbnb': 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Airbnb_Logo_Bélo.svg/512px-Airbnb_Logo_Bélo.svg.png',
      'Spotify': 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/19/Spotify_logo_without_text.svg/512px-Spotify_logo_without_text.svg.png',
      'Adobe': 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Adobe_Systems_logo_and_wordmark.svg/512px-Adobe_Systems_logo_and_wordmark.svg.png',
      'Flipkart': 'https://logos-world.net/wp-content/uploads/2020/11/Flipkart-Logo.png'
    };
    return logoMap[companyName] || null;
  };

  if (!user) {
    return null;
  }

  // Success Modal
  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center z-50">
        <div className="bg-white rounded-2xl p-12 text-center max-w-md mx-4 shadow-2xl animate-bounce">
          <div className="relative">
            <CheckCircle className="w-24 h-24 text-green-500 mx-auto mb-6 animate-pulse" />
            <Sparkles className="w-8 h-8 text-yellow-400 absolute -top-2 -right-2 animate-spin" />
            <Sparkles className="w-6 h-6 text-pink-400 absolute -bottom-2 -left-2 animate-ping" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Congratulations! 🎉</h2>
          <p className="text-lg text-gray-600 mb-6">
            Your interview experience has been shared successfully!
          </p>
          <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
            <span>Redirecting to home page...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Share Your Interview Experience</h1>
        <p className="text-gray-600">Help fellow students by sharing your interview journey</p>
      </div>

      {/* Anonymous Toggle */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {isAnonymous ? <EyeOff className="w-5 h-5 text-gray-600" /> : <Eye className="w-5 h-5 text-gray-600" />}
            <div>
              <h3 className="text-lg font-medium text-gray-900">Share Anonymously</h3>
              <p className="text-sm text-gray-600">
                {isAnonymous 
                  ? 'Your name will be hidden and shown as "Anonymous"' 
                  : 'Your name will be visible to other users'
                }
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setIsAnonymous(!isAnonymous)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
              isAnonymous ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnonymous ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              step <= currentStep 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-600'
            }`}>
              {step}
            </div>
            {step < 3 && (
              <div className={`w-16 h-1 mx-2 ${
                step < currentStep ? 'bg-blue-600' : 'bg-gray-200'
              }`} />
            )}
          </div>
        ))}
      </div>

      <div className="flex items-center justify-center space-x-8 text-sm">
        <span className={currentStep >= 1 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
          Basic Info
        </span>
        <span className={currentStep >= 2 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
          Interview Process
        </span>
        <span className={currentStep >= 3 ? 'text-blue-600 font-medium' : 'text-gray-500'}>
          Final Details
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <User className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Basic Information</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company *
                </label>
                <div className="relative">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search for a company..."
                      value={companySearch}
                      onChange={handleCompanySearchChange}
                      onFocus={() => companySearch && setShowCompanyDropdown(true)}
                      className="pl-10 pr-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {selectedCompany && (
                      <button
                        type="button"
                        onClick={clearCompanySelection}
                        className="absolute right-3 top-3 h-5 w-5 text-gray-400 hover:text-gray-600"
                      >
                        <X />
                      </button>
                    )}
                  </div>

                  {/* Company Dropdown */}
                  {showCompanyDropdown && (
                    <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company) => {
                          const logoUrl = company.logo_url || getCompanyLogo(company.name);
                          return (
                            <button
                              key={company.id}
                              type="button"
                              onClick={() => handleCompanySelect(company)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center space-x-3 border-b border-gray-100 last:border-b-0"
                            >
                              <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center overflow-hidden">
                                {logoUrl ? (
                                  <img
                                    src={logoUrl}
                                    alt={company.name}
                                    className="w-6 h-6 object-contain"
                                    onError={(e) => {
                                      const target = e.target as HTMLImageElement;
                                      target.style.display = 'none';
                                      target.nextElementSibling?.classList.remove('hidden');
                                    }}
                                  />
                                ) : null}
                                <Building className={`w-4 h-4 text-gray-500 ${logoUrl ? 'hidden' : ''}`} />
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">{company.name}</p>
                                {company.industry && (
                                  <p className="text-sm text-gray-500">{company.industry}</p>
                                )}
                              </div>
                            </button>
                          );
                        })
                      ) : companySearch.trim() ? (
                        <div className="p-4 text-center">
                          <p className="text-gray-500 mb-3">No companies found for "{companySearch}"</p>
                          <button
                            type="button"
                            onClick={() => {
                              setShowAddCompanyModal(true);
                              setShowCompanyDropdown(false);
                            }}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                            <span>Add "{companySearch}"</span>
                          </button>
                        </div>
                      ) : null}
                    </div>
                  )}

                  {/* Selected Company Display */}
                  {selectedCompany && (
                    <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-white rounded flex items-center justify-center overflow-hidden">
                          {(selectedCompany.logo_url || getCompanyLogo(selectedCompany.name)) ? (
                            <img
                              src={selectedCompany.logo_url || getCompanyLogo(selectedCompany.name)!}
                              alt={selectedCompany.name}
                              className="w-8 h-8 object-contain"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.style.display = 'none';
                                target.nextElementSibling?.classList.remove('hidden');
                              }}
                            />
                          ) : null}
                          <Building className={`w-5 h-5 text-gray-500 ${(selectedCompany.logo_url || getCompanyLogo(selectedCompany.name)) ? 'hidden' : ''}`} />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{selectedCompany.name}</p>
                          {selectedCompany.industry && (
                            <p className="text-sm text-gray-600">{selectedCompany.industry}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
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
                  Experience Level *
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
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                  <input
                    type="date"
                    name="interview_date"
                    value={formData.interview_date}
                    onChange={handleInputChange}
                    required
                    className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Result *
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
                  Overall Rating (1-5) *
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
                        className={`w-4 h-4 ${
                          i < formData.overall_rating 
                            ? 'text-yellow-400 fill-current' 
                            : 'text-gray-300'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level (1-5) *
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
                  <span className="text-sm font-medium text-gray-900 w-8">
                    {formData.difficulty_level}
                  </span>
                </div>
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
                placeholder="e.g., 3 months, 6 weeks"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        )}

        {/* Step 2: Interview Process */}
        {currentStep === 2 && (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
              <div className="flex items-center space-x-2 mb-6">
                <FileText className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-semibold text-gray-900">Interview Process</h2>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overall Interview Process *
                </label>
                <textarea
                  name="interview_process"
                  value={formData.interview_process}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  placeholder="Describe the overall interview process, timeline, and structure..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            {/* Interview Rounds */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Interview Rounds</h3>
                <button
                  type="button"
                  onClick={addRound}
                  className="flex items-center space-x-1 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Round</span>
                </button>
              </div>

              {rounds.map((round, roundIndex) => (
                <div key={roundIndex} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Round {round.round_number}</h4>
                    {rounds.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRound(roundIndex)}
                        className="text-red-600 hover:text-red-700 transition-colors"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Round Type
                      </label>
                      <select
                        value={round.round_type}
                        onChange={(e) => updateRound(roundIndex, 'round_type', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Round Name
                      </label>
                      <input
                        type="text"
                        value={round.round_name}
                        onChange={(e) => updateRound(roundIndex, 'round_name', e.target.value)}
                        placeholder="e.g., Technical Round 1"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Duration
                      </label>
                      <input
                        type="text"
                        value={round.duration}
                        onChange={(e) => updateRound(roundIndex, 'duration', e.target.value)}
                        placeholder="e.g., 1 hour"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Description
                    </label>
                    <textarea
                      value={round.description}
                      onChange={(e) => updateRound(roundIndex, 'description', e.target.value)}
                      rows={3}
                      placeholder="Describe what happened in this round..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Difficulty (1-5)
                      </label>
                      <input
                        type="range"
                        value={round.difficulty}
                        onChange={(e) => updateRound(roundIndex, 'difficulty', parseInt(e.target.value))}
                        min="1"
                        max="5"
                        className="w-full"
                      />
                      <div className="text-center text-sm text-gray-600">{round.difficulty}</div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Result
                      </label>
                      <select
                        value={round.result}
                        onChange={(e) => updateRound(roundIndex, 'result', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="passed">Passed</option>
                        <option value="failed">Failed</option>
                        <option value="pending">Pending</option>
                      </select>
                    </div>
                  </div>

                  {/* Coding Questions */}
                  <div className="border-t border-gray-200 pt-4">
                    <div className="flex items-center justify-between mb-3">
                      <h5 className="font-medium text-gray-900">Coding Questions</h5>
                      <button
                        type="button"
                        onClick={() => addCodingQuestion(roundIndex)}
                        className="flex items-center space-x-1 px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                        <span>Add Question</span>
                      </button>
                    </div>

                    {round.coding_questions.map((question, questionIndex) => (
                      <div key={questionIndex} className="bg-gray-50 rounded-lg p-4 mb-3">
                        <div className="flex items-center justify-between mb-3">
                          <h6 className="font-medium text-gray-900">Question {questionIndex + 1}</h6>
                          <button
                            type="button"
                            onClick={() => removeCodingQuestion(roundIndex, questionIndex)}
                            className="text-red-600 hover:text-red-700 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Title
                            </label>
                            <input
                              type="text"
                              value={question.title}
                              onChange={(e) => updateCodingQuestion(roundIndex, questionIndex, 'title', e.target.value)}
                              placeholder="e.g., Two Sum"
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            />
                          </div>

                          <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">
                              Difficulty
                            </label>
                            <select
                              value={question.difficulty}
                              onChange={(e) => updateCodingQuestion(roundIndex, questionIndex, 'difficulty', e.target.value)}
                              className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                            </select>
                          </div>
                        </div>

                        <div className="mb-3">
                          <label className="block text-xs font-medium text-gray-700 mb-1">
                            Description
                          </label>
                          <textarea
                            value={question.description}
                            onChange={(e) => updateCodingQuestion(roundIndex, questionIndex, 'description', e.target.value)}
                            rows={2}
                            placeholder="Describe the problem..."
                            className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                          />
                        </div>

                        {/* Topics with individual boxes */}
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-medium text-gray-700">
                              Topics
                            </label>
                            <button
                              type="button"
                              onClick={() => addTopic(roundIndex, questionIndex)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Topic</span>
                            </button>
                          </div>
                          <div className="space-y-2">
                            {question.topics.map((topic, topicIndex) => (
                              <div key={topicIndex} className="flex items-center space-x-2">
                                <input
                                  type="text"
                                  value={topic}
                                  onChange={(e) => updateTopic(roundIndex, questionIndex, topicIndex, e.target.value)}
                                  placeholder="e.g., Array, Hash Table"
                                  className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => removeTopic(roundIndex, questionIndex, topicIndex)}
                                  className="text-red-600 hover:text-red-700 transition-colors"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                              </div>
                            ))}
                            {question.topics.length === 0 && (
                              <p className="text-xs text-gray-500">No topics added yet. Click "Add Topic" to add one.</p>
                            )}
                          </div>
                        </div>

                        {/* Platform Links */}
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="block text-xs font-medium text-gray-700">
                              Platform Links
                            </label>
                            <button
                              type="button"
                              onClick={() => addPlatformLink(roundIndex, questionIndex)}
                              className="flex items-center space-x-1 px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add Link</span>
                            </button>
                          </div>

                          {question.platform_links.map((link, linkIndex) => (
                            <div key={linkIndex} className="flex items-center space-x-2 mb-2">
                              <select
                                value={link.platform}
                                onChange={(e) => updatePlatformLink(roundIndex, questionIndex, linkIndex, 'platform', e.target.value)}
                                className="px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
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
                                className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                              />
                              <button
                                type="button"
                                onClick={() => removePlatformLink(roundIndex, questionIndex, linkIndex)}
                                className="text-red-600 hover:text-red-700 transition-colors"
                              >
                                <Minus className="w-3 h-3" />
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
        )}

        {/* Step 3: Final Details */}
        {currentStep === 3 && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 space-y-6">
            <div className="flex items-center space-x-2 mb-6">
              <FileText className="w-5 h-5 text-blue-600" />
              <h2 className="text-xl font-semibold text-gray-900">Final Details</h2>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Advice for Future Candidates *
              </label>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Offered (Optional)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="salary_offered"
                  value={formData.salary_offered}
                  onChange={handleInputChange}
                  placeholder="e.g., 12 LPA, $80,000"
                  className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={prevStep}
            disabled={currentStep === 1}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>

          <div className="flex space-x-3">
            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                disabled={currentStep === 1 && !selectedCompany}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                disabled={loading || !selectedCompany}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                <span>{loading ? 'Sharing...' : 'Share Experience'}</span>
              </button>
            )}
          </div>
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