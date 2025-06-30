import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../lib/api';
import { Company, InterviewExperience } from '../../types/database';
import { Building, ExternalLink, Star, Users, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import ExperienceCard from '../Experience/ExperienceCard';
import ExperienceModal from '../Experience/ExperienceModal';

interface CompanyWithStats extends Company {
  experience_count: number;
  avg_rating: number;
  selection_rate: number;
  experiences?: InterviewExperience[];
}

const CompanyDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [company, setCompany] = useState<CompanyWithStats | null>(null);
  const [experiences, setExperiences] = useState<InterviewExperience[]>([]);
  const [selectedExperience, setSelectedExperience] = useState<InterviewExperience | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'experiences' | 'stats'>('experiences');

  useEffect(() => {
    if (id) {
      fetchCompanyDetails();
    }
  }, [id]);

  const fetchCompanyDetails = async () => {
    try {
      setLoading(true);
      console.log('Fetching company details for ID:', id);
      
      const response = await api.get(`/companies/${id}`);
      console.log('Company details response:', response.data);
      
      const companyData = response.data;
      
      // Calculate stats from experiences
      const experiencesData = companyData.experiences || [];
      const selectedCount = experiencesData.filter((exp: any) => exp.result === 'selected').length;
      const totalCount = experiencesData.length;
      const avgRating = totalCount > 0 
        ? experiencesData.reduce((sum: number, exp: any) => sum + (exp.overall_rating || 0), 0) / totalCount
        : 0;
      const selectionRate = totalCount > 0 ? Math.round((selectedCount / totalCount) * 100) : 0;
      
      const companyWithStats = {
        ...companyData,
        avg_rating: Math.round(avgRating * 10) / 10,
        selection_rate: selectionRate,
      };
      
      setCompany(companyWithStats);
      setExperiences(experiencesData);
      
    } catch (error) {
      console.error('Error fetching company details:', error);
      
      // Set mock data if API fails
      const mockCompany: CompanyWithStats = {
        id: id || '1',
        name: 'Microsoft',
        industry: 'Technology',
        website: 'https://microsoft.com',
        logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png',
        created_at: '2024-01-01',
        experience_count: 0,
        avg_rating: 0,
        selection_rate: 0,
        experiences: []
      };
      setCompany(mockCompany);
      setExperiences([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExperienceClick = async (experience: InterviewExperience) => {
    try {
      console.log('Clicking on experience:', experience.id);
      
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading company details...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <p className="text-gray-500">Company not found.</p>
        <Link to="/companies" className="text-blue-600 hover:text-blue-700 mt-2 inline-block">
          Back to Companies
        </Link>
      </div>
    );
  }

  const selectedCount = experiences.filter(exp => exp.result === 'selected').length;
  const rejectedCount = experiences.filter(exp => exp.result === 'rejected').length;
  const pendingCount = experiences.filter(exp => exp.result === 'pending').length;

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

  const logoUrl = company.logo_url || getCompanyLogo(company.name);

  return (
    <div className="space-y-8">
      {/* Back Button */}
      <Link
        to="/companies"
        className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to Companies
      </Link>

      {/* Company Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-6">
            <div className="w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={company.name}
                  className="w-16 h-16 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Building className={`w-10 h-10 text-gray-500 ${logoUrl ? 'hidden' : ''}`} />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{company.name}</h1>
              <p className="text-lg text-gray-600 mb-2">{company.industry}</p>
              {company.website && (
                <a
                  href={company.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-700 transition-colors"
                >
                  <ExternalLink className="w-4 h-4 mr-1" />
                  Visit Website
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-600 text-sm font-medium">Total Experiences</p>
                <p className="text-2xl font-bold text-blue-900">{company.experience_count}</p>
              </div>
              <Users className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-600 text-sm font-medium">Selection Rate</p>
                <p className="text-2xl font-bold text-green-900">{company.selection_rate}%</p>
              </div>
              <TrendingUp className="w-6 h-6 text-green-600" />
            </div>
          </div>
          <div className="bg-yellow-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-yellow-600 text-sm font-medium">Average Rating</p>
                <p className="text-2xl font-bold text-yellow-900">{company.avg_rating || 0}</p>
              </div>
              <Star className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-600 text-sm font-medium">Latest Update</p>
                <p className="text-sm font-medium text-purple-900">This Month</p>
              </div>
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('experiences')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'experiences'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Interview Experiences ({experiences.length})
          </button>
          <button
            onClick={() => setActiveTab('stats')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'stats'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Detailed Statistics
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'experiences' && (
        <div className="space-y-4">
          {experiences.length > 0 ? (
            experiences.map((experience) => (
              <ExperienceCard
                key={experience.id}
                experience={experience}
                onClick={() => handleExperienceClick(experience)}
              />
            ))
          ) : (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No experiences yet</h3>
              <p className="text-gray-500 mb-4">
                No interview experiences have been shared for {company.name} yet.
              </p>
              <Link
                to="/share"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Share Your Experience
              </Link>
            </div>
          )}
        </div>
      )}

      {activeTab === 'stats' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Result Distribution</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-green-600">Selected</span>
                <span className="font-medium">{selectedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-red-600">Rejected</span>
                <span className="font-medium">{rejectedCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-yellow-600">Pending</span>
                <span className="font-medium">{pendingCount}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Experience Levels</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Fresher</span>
                <span className="font-medium">{experiences.filter(exp => exp.experience_level === 'fresher').length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Experienced</span>
                <span className="font-medium">{experiences.filter(exp => exp.experience_level === 'experienced').length}</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Popular Positions</h3>
            <div className="space-y-3">
              {Array.from(new Set(experiences.map(exp => exp.position))).slice(0, 5).map((position, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-gray-600 text-sm">{position}</span>
                  <span className="font-medium">{experiences.filter(exp => exp.position === position).length}</span>
                </div>
              ))}
              {experiences.length === 0 && (
                <p className="text-gray-500 text-sm">No data available</p>
              )}
            </div>
          </div>
        </div>
      )}

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

export default CompanyDetail;
