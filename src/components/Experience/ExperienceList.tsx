import React, { useState, useEffect, useCallback } from 'react';
import api from '../../lib/api';
import { InterviewExperience } from '../../types/database';
import ExperienceCard from './ExperienceCard';
import ExperienceModal from './ExperienceModal';
import { Search, Filter, Users, Plus, AlertCircle, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

const ExperienceList: React.FC = () => {
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<InterviewExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterResult, setFilterResult] = useState<string>('all');
  const [retryCount, setRetryCount] = useState(0);

  // Debounced search function
  const debouncedFetchExperiences = useCallback(
    debounce((search: string, filter: string) => {
      fetchExperiences(search, filter);
    }, 500),
    []
  );

  useEffect(() => {
    // Initial load
    fetchExperiences(searchTerm, filterResult);
  }, []);

  useEffect(() => {
    // Debounced search when searchTerm or filterResult changes
    if (searchTerm || filterResult !== 'all') {
      debouncedFetchExperiences(searchTerm, filterResult);
    } else {
      fetchExperiences('', 'all');
    }
  }, [searchTerm, filterResult, debouncedFetchExperiences]);

  const fetchExperiences = async (search: string = '', filter: string = 'all') => {
    try {
      setLoading(true);
      setError(null);
      
      const params = new URLSearchParams();
      if (search.trim()) params.append('search', search.trim());
      if (filter !== 'all') params.append('result', filter);

      console.log('Fetching experiences with params:', params.toString());
      
      const response = await api.get(`/experiences?${params.toString()}`);
      console.log('API Response:', response.data);
      
      // Handle different response formats
      let experiencesData = [];
      if (response.data.experiences) {
        experiencesData = response.data.experiences;
      } else if (Array.isArray(response.data)) {
        experiencesData = response.data;
      } else {
        console.warn('Unexpected response format:', response.data);
        experiencesData = [];
      }

      // Transform the data to match the expected format
      const experiencesWithCounts = experiencesData.map((exp: any) => ({
        ...exp,
        user: exp.user || {
          id: exp.user_id,
          full_name: exp.user_name || 'Anonymous',
          year_of_passing: exp.year_of_passing,
          branch: exp.branch,
          email: '',
          verified: true,
          created_at: exp.created_at,
          updated_at: exp.updated_at
        },
        company: exp.company || {
          id: exp.company_id,
          name: exp.company_name || 'Unknown Company',
          logo_url: exp.company_logo,
          industry: exp.company_industry,
          created_at: exp.created_at
        },
        _count: {
          votes: parseInt(exp.vote_count) || 0,
          comments: parseInt(exp.comment_count) || 0,
          views: parseInt(exp.view_count) || 0,
        },
        rounds: exp.rounds || [],
      }));

      console.log('Processed experiences:', experiencesWithCounts);
      setExperiences(experiencesWithCounts);
      setRetryCount(0);
    } catch (error: any) {
      console.error('Error fetching experiences:', error);
      setError(error.response?.data?.error || error.message || 'Failed to fetch experiences');
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceClick = async (experience: InterviewExperience) => {
    try {
      console.log('Clicking on experience:', experience.id);
      
      // Try to fetch full experience details including rounds
      const response = await api.get(`/experiences/${experience.id}`);
      console.log('Experience details response:', response.data);
      
      // Ensure we have proper data structure
      const experienceWithDetails = {
        ...response.data,
        company: response.data.company || experience.company,
        user: response.data.user || experience.user,
        rounds: response.data.rounds || [],
        _count: response.data._count || experience._count || { votes: 0, comments: 0, views: 0 }
      };
      
      setSelectedExperience(experienceWithDetails);
    } catch (error) {
      console.error('Error fetching experience details:', error);
      
      // Use the experience data we already have as fallback
      const fallbackExperience = {
        ...experience,
        rounds: experience.rounds || [],
        _count: experience._count || { votes: 0, comments: 0, views: 0 }
      };
      
      setSelectedExperience(fallbackExperience);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    fetchExperiences(searchTerm, filterResult);
  };

  if (loading && experiences.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading interview experiences...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Interview Experiences</h1>
        <p className="text-gray-600">Learn from real interview experiences shared by IIITA students</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <div className="flex-1">
              <h3 className="text-red-800 font-medium">Unable to load experiences</h3>
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

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search by company, position, or candidate name..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {loading && searchTerm && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <select
            value={filterResult}
            onChange={(e) => setFilterResult(e.target.value)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Results</option>
            <option value="selected">Selected</option>
            <option value="rejected">Rejected</option>
            <option value="pending">Pending</option>
          </select>
        </div>
      </div>

      {/* Results Count */}
      {experiences.length > 0 && (
        <div className="text-sm text-gray-600">
          Found {experiences.length} experience{experiences.length !== 1 ? 's' : ''}
          {searchTerm && ` for "${searchTerm}"`}
          {filterResult !== 'all' && ` with result: ${filterResult}`}
        </div>
      )}

      {/* Experiences List */}
      <div className="space-y-4">
        {experiences.map((experience) => (
          <ExperienceCard
            key={experience.id}
            experience={experience}
            onClick={() => handleExperienceClick(experience)}
          />
        ))}
      </div>

      {/* Empty State */}
      {experiences.length === 0 && !loading && !error && (
        <div className="text-center py-12">
          <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences found</h3>
          <p className="text-gray-500 mb-4">
            {searchTerm || filterResult !== 'all' 
              ? 'Try adjusting your search criteria or filters.'
              : 'Be the first to share your interview experience!'
            }
          </p>
          {(!searchTerm && filterResult === 'all') && (
            <Link
              to="/share"
              className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Share Your Experience</span>
            </Link>
          )}
        </div>
      )}

      {/* No Results with Filters */}
      {experiences.length === 0 && !loading && !error && (searchTerm || filterResult !== 'all') && (
        <div className="text-center py-8">
          <div className="bg-gray-50 rounded-lg p-6">
            <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No matching experiences</h3>
            <p className="text-gray-500 mb-4">
              Try adjusting your search terms or filters to find more results.
            </p>
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterResult('all');
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        </div>
      )}

      {/* Experience Modal */}
      {selectedExperience && (
        <ExperienceModal
          experience={selectedExperience}
          isOpen={!!selectedExperience}
          onClose={() => setSelectedExperience(null)}
        />
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

export default ExperienceList;