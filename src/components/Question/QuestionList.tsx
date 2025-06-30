import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { Search, Filter, Code, ExternalLink, Clock, Zap, Brain, AlertCircle, RefreshCw } from 'lucide-react';

interface QuestionWithDetails {
  id: string;
  round_id: string;
  title: string;
  description: string;
  difficulty: 'easy' | 'medium' | 'hard';
  topics: string[];
  solution_approach?: string;
  time_complexity?: string;
  space_complexity?: string;
  created_at: string;
  company_name: string;
  company_logo?: string;
  position: string;
  round_name: string;
  round_type: string;
  platform_links: Array<{
    id: string;
    platform: string;
    url: string;
    problem_id?: string;
  }>;
}

const QuestionList: React.FC = () => {
  const [questions, setQuestions] = useState<QuestionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all');
  const [topicFilter, setTopicFilter] = useState<string>('all');
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionWithDetails | null>(null);

  // Debounced search function
  const debouncedFetchQuestions = useCallback(
    debounce((search: string, difficulty: string, topic: string, platform: string) => {
      fetchQuestions(search, difficulty, topic, platform);
    }, 500),
    []
  );

  useEffect(() => {
    // Initial load
    fetchQuestions('', 'all', 'all', 'all');
  }, []);

  useEffect(() => {
    // Debounced search when filters change
    debouncedFetchQuestions(searchTerm, difficultyFilter, topicFilter, platformFilter);
  }, [searchTerm, difficultyFilter, topicFilter, platformFilter, debouncedFetchQuestions]);

  const fetchQuestions = async (search: string = '', difficulty: string = 'all', topic: string = 'all', platform: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (difficulty !== 'all') params.append('difficulty', difficulty);
      if (topic !== 'all') params.append('topic', topic);
      if (platform !== 'all') params.append('platform', platform);

      console.log('Fetching questions with params:', params.toString());
      
      const response = await api.get(`/questions?${params.toString()}`);
      console.log('Questions API Response:', response.data);
      
      setQuestions(response.data || []);
    } catch (error: any) {
      console.error('Error fetching questions:', error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch questions');
      
      // Set mock data if API fails
      const mockQuestions: QuestionWithDetails[] = [
        {
          id: '1',
          round_id: '1',
          title: 'Two Sum',
          description: 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.',
          difficulty: 'easy',
          topics: ['Array', 'Hash Table'],
          solution_approach: 'Use a hash map to store the complement of each number and check if it exists.',
          time_complexity: 'O(n)',
          space_complexity: 'O(n)',
          created_at: '2024-01-01',
          company_name: 'Google',
          company_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/272px-Google_2015_logo.svg.png',
          position: 'Software Engineer',
          round_name: 'Technical Round 1',
          round_type: 'technical',
          platform_links: [
            {
              id: '1',
              platform: 'leetcode',
              url: 'https://leetcode.com/problems/two-sum/',
              problem_id: '1'
            }
          ]
        },
        {
          id: '2',
          round_id: '2',
          title: 'Longest Substring Without Repeating Characters',
          description: 'Given a string s, find the length of the longest substring without repeating characters.',
          difficulty: 'medium',
          topics: ['String', 'Sliding Window', 'Hash Table'],
          solution_approach: 'Use sliding window technique with a hash set to track characters.',
          time_complexity: 'O(n)',
          space_complexity: 'O(min(m,n))',
          created_at: '2024-01-02',
          company_name: 'Microsoft',
          company_logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png',
          position: 'SDE II',
          round_name: 'Coding Round',
          round_type: 'coding',
          platform_links: [
            {
              id: '2',
              platform: 'leetcode',
              url: 'https://leetcode.com/problems/longest-substring-without-repeating-characters/',
              problem_id: '3'
            }
          ]
        }
      ];

      // Apply filters to mock data
      let filteredMockData = mockQuestions;
      
      if (search.trim()) {
        filteredMockData = filteredMockData.filter(q =>
          q.title.toLowerCase().includes(search.toLowerCase()) ||
          q.description.toLowerCase().includes(search.toLowerCase()) ||
          q.company_name.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (difficulty !== 'all') {
        filteredMockData = filteredMockData.filter(q => q.difficulty === difficulty);
      }

      if (topic !== 'all') {
        filteredMockData = filteredMockData.filter(q => 
          q.topics.some(t => t.toLowerCase().includes(topic.toLowerCase()))
        );
      }

      setQuestions(filteredMockData);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'hard':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return <Zap className="w-4 h-4" />;
      case 'medium':
        return <Clock className="w-4 h-4" />;
      case 'hard':
        return <Brain className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  const getPlatformData = (platform: string) => {
    switch (platform) {
      case 'leetcode':
        return {
          icon: 'https://leetcode.com/favicon.ico',
          name: 'LeetCode',
          color: 'bg-orange-500 hover:bg-orange-600'
        };
      case 'gfg':
        return {
          icon: 'https://media.geeksforgeeks.org/gfg-gg-logo.svg',
          name: 'GeeksforGeeks',
          color: 'bg-green-500 hover:bg-green-600'
        };
      case 'codechef':
        return {
          icon: 'https://cdn.codechef.com/sites/all/themes/abessive/cc-logo.png',
          name: 'CodeChef',
          color: 'bg-amber-600 hover:bg-amber-700'
        };
      case 'codeforces':
        return {
          icon: 'https://codeforces.org/favicon.ico',
          name: 'Codeforces',
          color: 'bg-blue-500 hover:bg-blue-600'
        };
      case 'hackerrank':
        return {
          icon: 'https://hrcdn.net/fcore/assets/favicon-ddc852f75a.png',
          name: 'HackerRank',
          color: 'bg-green-600 hover:bg-green-700'
        };
      case 'interviewbit':
        return {
          icon: 'https://www.interviewbit.com/favicon.ico',
          name: 'InterviewBit',
          color: 'bg-indigo-500 hover:bg-indigo-600'
        };
      default:
        return {
          icon: null,
          name: platform.charAt(0).toUpperCase() + platform.slice(1),
          color: 'bg-gray-500 hover:bg-gray-600'
        };
    }
  };

  const handleRetry = () => {
    fetchQuestions(searchTerm, difficultyFilter, topicFilter, platformFilter);
  };

  const allTopics = Array.from(new Set(questions.flatMap(q => q.topics)));
  const easyCount = questions.filter(q => q.difficulty === 'easy').length;
  const mediumCount = questions.filter(q => q.difficulty === 'medium').length;
  const hardCount = questions.filter(q => q.difficulty === 'hard').length;

  if (loading && questions.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading coding questions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Coding Questions</h1>
        <p className="text-gray-600">Practice problems from real interview experiences</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <h3 className="text-red-800 font-medium">Unable to load questions</h3>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
            <button
              onClick={handleRetry}
              className="flex items-center space-x-1 px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Retry</span>
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Questions</p>
              <p className="text-2xl font-bold text-gray-900">{questions.length}</p>
            </div>
            <Code className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Easy</p>
              <p className="text-2xl font-bold text-green-900">{easyCount}</p>
            </div>
            <Zap className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-yellow-50 rounded-lg border border-yellow-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-600 text-sm font-medium">Medium</p>
              <p className="text-2xl font-bold text-yellow-900">{mediumCount}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Hard</p>
              <p className="text-2xl font-bold text-red-900">{hardCount}</p>
            </div>
            <Brain className="w-8 h-8 text-red-600" />
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {loading && searchTerm && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        <select
          value={difficultyFilter}
          onChange={(e) => setDifficultyFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Difficulties</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
        <select
          value={topicFilter}
          onChange={(e) => setTopicFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Topics</option>
          {allTopics.map(topic => (
            <option key={topic} value={topic}>{topic}</option>
          ))}
        </select>
        <select
          value={platformFilter}
          onChange={(e) => setPlatformFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="all">All Platforms</option>
          <option value="leetcode">LeetCode</option>
          <option value="gfg">GeeksforGeeks</option>
          <option value="codechef">CodeChef</option>
          <option value="codeforces">Codeforces</option>
          <option value="hackerrank">HackerRank</option>
        </select>
      </div>

      {/* Questions List */}
      <div className="space-y-4">
        {questions.map((question) => (
          <div
            key={question.id}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
            onClick={() => setSelectedQuestion(question)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  <h3 className="text-xl font-bold text-gray-900 hover:text-blue-600 transition-colors">
                    {question.title}
                  </h3>
                  <span className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full border-2 ${getDifficultyColor(question.difficulty)}`}>
                    {getDifficultyIcon(question.difficulty)}
                    <span className="ml-1">{question.difficulty.toUpperCase()}</span>
                  </span>
                </div>
                <p className="text-gray-600 text-sm mb-3 line-clamp-2">{question.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    {question.company_logo && (
                      <img 
                        src={question.company_logo} 
                        alt={question.company_name}
                        className="w-4 h-4 mr-1"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                        }}
                      />
                    )}
                    {question.company_name}
                  </span>
                  <span>•</span>
                  <span>{question.position}</span>
                  <span>•</span>
                  <span>{question.round_name}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex flex-wrap gap-2">
                {question.topics.map((topic, index) => (
                  <span
                    key={index}
                    className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200"
                  >
                    {topic}
                  </span>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                {question.platform_links.map((link) => {
                  const platformData = getPlatformData(link.platform);
                  return (
                    <a
                      key={link.id}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className={`inline-flex items-center space-x-1 px-3 py-1 text-white text-sm font-medium rounded-lg transition-all duration-200 transform hover:scale-105 ${platformData.color}`}
                    >
                      {platformData.icon && (
                        <img 
                          src={platformData.icon} 
                          alt={platformData.name}
                          className="w-4 h-4"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = 'none';
                          }}
                        />
                      )}
                      <span>{platformData.name}</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
        ))}
      </div>

      {questions.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <Code className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">No coding questions found matching your criteria.</p>
        </div>
      )}

      {/* Question Detail Modal */}
      {selectedQuestion && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900">{selectedQuestion.title}</h2>
              <button
                onClick={() => setSelectedQuestion(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center space-x-4">
                <span className={`inline-flex items-center px-3 py-1 text-sm font-medium rounded-full border ${getDifficultyColor(selectedQuestion.difficulty)}`}>
                  {getDifficultyIcon(selectedQuestion.difficulty)}
                  <span className="ml-1">{selectedQuestion.difficulty.toUpperCase()}</span>
                </span>
                <span className="text-sm text-gray-600">
                  {selectedQuestion.company_name} • {selectedQuestion.position} • {selectedQuestion.round_name}
                </span>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Problem Description</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{selectedQuestion.description}</p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {selectedQuestion.topics.map((topic, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full"
                    >
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {selectedQuestion.solution_approach && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Solution Approach</h3>
                  <p className="text-gray-700 whitespace-pre-wrap">{selectedQuestion.solution_approach}</p>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {selectedQuestion.time_complexity && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Complexity</h3>
                    <p className="text-gray-700 font-mono bg-gray-100 px-3 py-2 rounded">
                      {selectedQuestion.time_complexity}
                    </p>
                  </div>
                )}
                {selectedQuestion.space_complexity && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Space Complexity</h3>
                    <p className="text-gray-700 font-mono bg-gray-100 px-3 py-2 rounded">
                      {selectedQuestion.space_complexity}
                    </p>
                  </div>
                )}
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Practice Links</h3>
                <div className="flex flex-wrap gap-3">
                  {selectedQuestion.platform_links.map((link) => {
                    const platformData = getPlatformData(link.platform);
                    return (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`flex items-center space-x-2 px-4 py-2 text-white rounded-lg transition-colors ${platformData.color}`}
                      >
                        {platformData.icon && (
                          <img 
                            src={platformData.icon} 
                            alt={platformData.name}
                            className="w-4 h-4"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.style.display = 'none';
                            }}
                          />
                        )}
                        <span className="capitalize font-medium">{platformData.name}</span>
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Debounce utility function
function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export default QuestionList;
