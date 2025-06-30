import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../lib/api';
import { Company } from '../../types/database';
import { Building, Search, Filter, TrendingUp, Users, Star, ExternalLink, Plus } from 'lucide-react';
import AddCompanyModal from './AddCompanyModal';

interface CompanyWithStats extends Company {
  experience_count: number;
  avg_rating: number;
  selection_rate: number;
}

const CompanyList: React.FC = () => {
  const [companies, setCompanies] = useState<CompanyWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'experience_count' | 'avg_rating'>('name');
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    fetchCompanies();
  }, []);

  // Debounced search effect
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm !== '') {
        fetchCompanies();
      }
    }, 500); // 500ms delay

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  const fetchCompanies = async () => {
    try {
      if (searchTerm) {
        setSearchLoading(true);
      } else {
        setLoading(true);
      }
      
      const params = new URLSearchParams();
      if (searchTerm.trim()) params.append('search', searchTerm.trim());

      const response = await api.get(`/companies?${params.toString()}`);
      
      // Add mock stats for now - replace with real data from backend
      const companiesWithStats = response.data.map((company: Company) => ({
        ...company,
        experience_count: Math.floor(Math.random() * 50) + 1,
        avg_rating: Math.round((Math.random() * 2 + 3) * 10) / 10,
        selection_rate: Math.round(Math.random() * 60 + 20),
      }));

      setCompanies(companiesWithStats);
    } catch (error) {
      console.error('Error fetching companies:', error);
      // Set mock data if API fails
      const mockCompanies: CompanyWithStats[] = [
        {
          id: '1',
          name: 'Google',
          industry: 'Technology',
          website: 'https://google.com',
          logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2f/Google_2015_logo.svg/272px-Google_2015_logo.svg.png',
          created_at: '2024-01-01',
          experience_count: 25,
          avg_rating: 4.2,
          selection_rate: 35
        },
        {
          id: '2',
          name: 'Microsoft',
          industry: 'Technology',
          website: 'https://microsoft.com',
          logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/44/Microsoft_logo.svg/512px-Microsoft_logo.svg.png',
          created_at: '2024-01-01',
          experience_count: 18,
          avg_rating: 4.0,
          selection_rate: 42
        },
        {
          id: '3',
          name: 'Amazon',
          industry: 'E-commerce/Cloud',
          website: 'https://amazon.com',
          logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/a/a9/Amazon_logo.svg/603px-Amazon_logo.svg.png',
          created_at: '2024-01-01',
          experience_count: 22,
          avg_rating: 3.8,
          selection_rate: 28
        },
        {
          id: '4',
          name: 'Meta',
          industry: 'Social Media',
          website: 'https://meta.com',
          logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/7/7b/Meta_Platforms_Inc._logo.svg/512px-Meta_Platforms_Inc._logo.svg.png',
          created_at: '2024-01-01',
          experience_count: 15,
          avg_rating: 4.1,
          selection_rate: 31
        },
        {
          id: '5',
          name: 'Apple',
          industry: 'Technology',
          website: 'https://apple.com',
          logo_url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/488px-Apple_logo_black.svg.png',
          created_at: '2024-01-01',
          experience_count: 12,
          avg_rating: 4.3,
          selection_rate: 38
        }
      ];

      // Apply search filter to mock data
      let filteredMockData = mockCompanies;
      if (searchTerm.trim()) {
        filteredMockData = mockCompanies.filter(company =>
          company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (company.industry && company.industry.toLowerCase().includes(searchTerm.toLowerCase()))
        );
      }

      setCompanies(filteredMockData);
    } finally {
      setLoading(false);
      setSearchLoading(false);
    }
  };

  const handleAddCompany = async (companyData: any) => {
    try {
      // In a real app, this would make an API call to add the company
      console.log('Adding company:', companyData);
      
      // Mock API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Add the new company to the list (mock)
      const newCompany: CompanyWithStats = {
        id: Date.now().toString(),
        name: companyData.name,
        industry: companyData.industry,
        website: companyData.website,
        logo_url: companyData.logo_url,
        created_at: new Date().toISOString(),
        experience_count: 0,
        avg_rating: 0,
        selection_rate: 0,
      };
      
      setCompanies(prev => [newCompany, ...prev]);
    } catch (error) {
      console.error('Error adding company:', error);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    
    if (value.trim()) {
      setSearchLoading(true);
    }
  };

  const sortedCompanies = [...companies].sort((a, b) => {
    switch (sortBy) {
      case 'experience_count':
        return b.experience_count - a.experience_count;
      case 'avg_rating':
        return b.avg_rating - a.avg_rating;
      default:
        return a.name.localeCompare(b.name);
    }
  });

  const totalCompanies = companies.length;
  const totalExperiences = companies.reduce((sum, company) => sum + company.experience_count, 0);
  const avgRating = companies.length > 0 
    ? companies.reduce((sum, company) => sum + company.avg_rating, 0) / companies.length 
    : 0;

  // Company logos mapping
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
    };
    return logoMap[companyName] || null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Companies</h1>
        <p className="text-gray-600">Explore interview experiences from top companies</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm">Total Companies</p>
              <p className="text-3xl font-bold">{totalCompanies}</p>
            </div>
            <Building className="w-8 h-8 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm">Total Experiences</p>
              <p className="text-3xl font-bold">{totalExperiences}</p>
            </div>
            <Users className="w-8 h-8 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm">Average Rating</p>
              <p className="text-3xl font-bold">{avgRating.toFixed(1)}</p>
            </div>
            <Star className="w-8 h-8 text-yellow-200" />
          </div>
        </div>
      </div>

      {/* Popular Companies Section */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
        <h2 className="text-xl font-semibold text-gray-900 mb-6">Popular Companies</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
          {['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple'].map((company) => (
            <div key={company} className="flex flex-col items-center p-4 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="w-16 h-16 mb-3 flex items-center justify-center">
                <img
                  src={getCompanyLogo(company)}
                  alt={company}
                  className="w-full h-full object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
                <div className="hidden w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Building className="w-8 h-8 text-gray-500" />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">{company}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search companies by name or industry..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {searchLoading && (
            <div className="absolute right-3 top-3">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
            </div>
          )}
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="name">Sort by Name</option>
            <option value="experience_count">Sort by Experience Count</option>
            <option value="avg_rating">Sort by Rating</option>
          </select>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Company</span>
        </button>
      </div>

      {/* Company Not Found Message */}
      {searchTerm && companies.length === 0 && !searchLoading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center">
          <Building className="w-12 h-12 text-blue-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Can't find "{searchTerm}"?
          </h3>
          <p className="text-blue-700 mb-4">
            Help us grow our database by adding this company!
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add "{searchTerm}" Company</span>
          </button>
        </div>
      )}

      {/* Companies Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedCompanies.map((company) => (
          <Link
            key={company.id}
            to={`/companies/${company.id}`}
            className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
                  {(getCompanyLogo(company.name) || company.logo_url) ? (
                    <img
                      src={getCompanyLogo(company.name) || company.logo_url!}
                      alt={company.name}
                      className="w-10 h-10 object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        target.nextElementSibling?.classList.remove('hidden');
                      }}
                    />
                  ) : null}
                  <Building className={`w-6 h-6 text-gray-500 ${(getCompanyLogo(company.name) || company.logo_url) ? 'hidden' : ''}`} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {company.name}
                  </h3>
                  <p className="text-sm text-gray-600">{company.industry}</p>
                </div>
              </div>
              {company.website && (
                <ExternalLink className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" />
              )}
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Experiences</span>
                <span className="font-medium text-gray-900">{company.experience_count}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Average Rating</span>
                <div className="flex items-center space-x-1">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="font-medium text-gray-900">{company.avg_rating}</span>
                </div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Selection Rate</span>
                <span className="font-medium text-green-600">{company.selection_rate}%</span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="flex items-center text-sm text-blue-600 group-hover:text-blue-700 transition-colors">
                <TrendingUp className="w-4 h-4 mr-1" />
                View Details
              </div>
            </div>
          </Link>
        ))}
      </div>

      {companies.length === 0 && !searchTerm && !loading && (
        <div className="text-center py-12">
          <Building className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No companies found.</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Company</span>
          </button>
        </div>
      )}

      {/* Add Company Modal */}
      <AddCompanyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCompany}
      />
    </div>
  );
};

export default CompanyList;