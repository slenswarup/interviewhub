import React from 'react';
import { InterviewExperience } from '../../types/database';
import { Building, Calendar, Eye, MessageCircle, ThumbsUp, User } from 'lucide-react';
import { format } from 'date-fns';

interface ExperienceCardProps {
  experience: InterviewExperience;
  onClick: () => void;
}

const ExperienceCard: React.FC<ExperienceCardProps> = ({ experience, onClick }) => {
  const getResultBadge = (result: string) => {
    switch (result) {
      case 'selected':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getResultText = (result: string) => {
    switch (result) {
      case 'selected':
        return 'SELECTED';
      case 'rejected':
        return 'REJECTED';
      case 'pending':
        return 'PENDING';
      default:
        return result.toUpperCase();
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

  const logoUrl = experience.company.logo_url || getCompanyLogo(experience.company.name);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow cursor-pointer"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={experience.company.name}
                className="w-10 h-10 object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                  target.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <Building className={`w-6 h-6 text-gray-500 ${logoUrl ? 'hidden' : ''}`} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              {experience.company.name} | {experience.position} | {experience.experience_level}
            </h3>
            <p className="text-sm text-gray-600">
              {experience.rounds?.length || 0} rounds • {experience.rounds?.reduce((acc, round) => acc + (round.coding_questions?.length || 0), 0) || 0} Coding Problems
            </p>
          </div>
        </div>
        <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getResultBadge(experience.result)}`}>
          {getResultText(experience.result)}
        </span>
      </div>

      <div className="text-sm text-gray-600 mb-4">
        Interviewed by {experience.company.name}
      </div>

      <div className="flex items-center space-x-2 mb-4">
        <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
          <User className="w-4 h-4 text-gray-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            {experience.user.full_name === 'Anonymous' ? 'Anonymous' : experience.user.full_name}
          </p>
          <p className="text-xs text-gray-500">
            {experience.experience_years ? `${experience.experience_years} Years` : 'Fresher'} • {format(new Date(experience.interview_date), 'MMM yyyy')} • {experience.position} at {experience.company.name}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500">
        <div className="flex items-center space-x-4">
          <span className="flex items-center">
            <Eye className="w-4 h-4 mr-1" />
            {experience._count?.views || 0} views
          </span>
          <span className="flex items-center">
            <MessageCircle className="w-4 h-4 mr-1" />
            {experience._count?.comments || 0} comments
          </span>
          <span className="flex items-center">
            <ThumbsUp className="w-4 h-4 mr-1" />
            {experience._count?.votes || 0} upvotes
          </span>
        </div>
        <span className="flex items-center">
          <Calendar className="w-4 h-4 mr-1" />
          {format(new Date(experience.created_at), 'MMM d, yyyy')}
        </span>
      </div>
    </div>
  );
};

export default ExperienceCard;