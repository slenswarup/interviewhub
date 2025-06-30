import React, { useState } from 'react';
import { InterviewExperience } from '../../types/database';
import { X, Building, Calendar, User, Clock, Star, ExternalLink, Code2, Trophy, Target, ThumbsUp, ThumbsDown, MessageCircle, Send } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../lib/api';

interface ExperienceModalProps {
  experience: InterviewExperience;
  isOpen: boolean;
  onClose: () => void;
}

const ExperienceModal: React.FC<ExperienceModalProps> = ({ experience, isOpen, onClose }) => {
  const { user } = useAuth();
  const [votes, setVotes] = useState(experience.votes || []);
  const [comments, setComments] = useState(experience.comments || []);
  const [newComment, setNewComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isVoting, setIsVoting] = useState(false);

  if (!isOpen) return null;

  const handleVote = async (voteType: 'upvote' | 'downvote') => {
    if (!user || isVoting) return;

    setIsVoting(true);
    try {
      await api.post(`/experiences/${experience.id}/vote`, { vote_type: voteType });
      
      // Refresh experience data to get updated vote counts
      const response = await api.get(`/experiences/${experience.id}`);
      setVotes(response.data.votes || []);
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const handleComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const response = await api.post(`/experiences/${experience.id}/comment`, { 
        content: newComment.trim() 
      });
      
      // Add new comment to the list
      setComments(prev => [response.data.comment, ...prev]);
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getPlatformData = (platform: string) => {
    switch (platform) {
      case 'leetcode':
        return {
          icon: 'https://leetcode.com/favicon.ico',
          name: 'LeetCode',
          color: 'bg-orange-500 hover:bg-orange-600',
          textColor: 'text-orange-600'
        };
      case 'gfg':
        return {
          icon: 'https://media.geeksforgeeks.org/gfg-gg-logo.svg',
          name: 'GeeksforGeeks',
          color: 'bg-green-500 hover:bg-green-600',
          textColor: 'text-green-600'
        };
      case 'codechef':
        return {
          icon: 'https://cdn.codechef.com/sites/all/themes/abessive/cc-logo.png',
          name: 'CodeChef',
          color: 'bg-amber-600 hover:bg-amber-700',
          textColor: 'text-amber-600'
        };
      case 'codeforces':
        return {
          icon: 'https://codeforces.org/favicon.ico',
          name: 'Codeforces',
          color: 'bg-blue-500 hover:bg-blue-600',
          textColor: 'text-blue-600'
        };
      case 'hackerrank':
        return {
          icon: 'https://hrcdn.net/fcore/assets/favicon-ddc852f75a.png',
          name: 'HackerRank',
          color: 'bg-green-600 hover:bg-green-700',
          textColor: 'text-green-600'
        };
      case 'interviewbit':
        return {
          icon: 'https://www.interviewbit.com/favicon.ico',
          name: 'InterviewBit',
          color: 'bg-indigo-500 hover:bg-indigo-600',
          textColor: 'text-indigo-600'
        };
      default:
        return {
          icon: null,
          name: platform.charAt(0).toUpperCase() + platform.slice(1),
          color: 'bg-gray-500 hover:bg-gray-600',
          textColor: 'text-gray-600'
        };
    }
  };

  const getDifficultyData = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return {
          color: 'bg-green-100 text-green-800 border-green-200',
          icon: '🟢',
          bgColor: 'bg-green-50'
        };
      case 'medium':
        return {
          color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
          icon: '🟡',
          bgColor: 'bg-yellow-50'
        };
      case 'hard':
        return {
          color: 'bg-red-100 text-red-800 border-red-200',
          icon: '🔴',
          bgColor: 'bg-red-50'
        };
      default:
        return {
          color: 'bg-gray-100 text-gray-800 border-gray-200',
          icon: '⚪',
          bgColor: 'bg-gray-50'
        };
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

  const logoUrl = experience.company?.logo_url || getCompanyLogo(experience.company?.name || '');

  // Safely handle missing data
  const safeExperience = {
    ...experience,
    company: experience.company || { name: 'Unknown Company', logo_url: '', industry: '', id: '', created_at: '' },
    user: experience.user || { full_name: 'Anonymous', id: '', email: '', verified: false, created_at: '', updated_at: '' },
    rounds: experience.rounds || [],
    votes: votes,
    comments: comments,
    _count: experience._count || { votes: 0, comments: 0, views: 0 }
  };

  const upvoteCount = votes.upvote || 0;
  const downvoteCount = votes.downvote || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
              {logoUrl ? (
                <img
                  src={logoUrl}
                  alt={safeExperience.company.name}
                  className="w-8 h-8 object-contain"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <Building className={`w-5 h-5 text-gray-500 ${logoUrl ? 'hidden' : ''}`} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {safeExperience.company.name}
              </h2>
              <p className="text-sm text-gray-600">{safeExperience.position}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-2 hover:bg-gray-100 rounded-lg"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-8">
          {/* Experience Overview */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {safeExperience.position}
                </h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600">
                  <span className="flex items-center">
                    <Calendar className="w-4 h-4 mr-1" />
                    {format(new Date(safeExperience.interview_date), 'MMM dd, yyyy')}
                  </span>
                  {safeExperience.preparation_time && (
                    <span className="flex items-center">
                      <Clock className="w-4 h-4 mr-1" />
                      {safeExperience.preparation_time} prep
                    </span>
                  )}
                  <span className="flex items-center">
                    <Trophy className="w-4 h-4 mr-1" />
                    {safeExperience.experience_level}
                  </span>
                </div>
              </div>
              <div className="flex flex-col items-end space-y-2">
                <span className={`px-4 py-2 text-sm font-bold rounded-full border-2 ${
                  safeExperience.result === 'selected' ? 'bg-green-100 text-green-800 border-green-300' :
                  safeExperience.result === 'rejected' ? 'bg-red-100 text-red-800 border-red-300' :
                  'bg-yellow-100 text-yellow-800 border-yellow-300'
                }`}>
                  {safeExperience.result.toUpperCase()}
                </span>
                <div className="flex items-center space-x-1 bg-white px-3 py-1 rounded-full border">
                  <Star className="w-4 h-4 text-yellow-400 fill-current" />
                  <span className="text-sm font-bold text-gray-900">{safeExperience.overall_rating}/5</span>
                </div>
              </div>
            </div>

            {/* Candidate Info */}
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                  <span className="text-white font-bold text-lg">
                    {safeExperience.user.full_name.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <p className="font-bold text-gray-900">{safeExperience.user.full_name}</p>
                  <p className="text-sm text-gray-600">
                    {safeExperience.experience_years ? `${safeExperience.experience_years} Years Experience` : 'Fresher'}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Voting and Comments Section */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <h4 className="text-xl font-bold text-gray-900">Community Interaction</h4>
              <div className="flex items-center space-x-4">
                {user && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleVote('upvote')}
                      disabled={isVoting}
                      className="flex items-center space-x-1 px-3 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors disabled:opacity-50"
                    >
                      <ThumbsUp className="w-4 h-4" />
                      <span>{upvoteCount}</span>
                    </button>
                    <button
                      onClick={() => handleVote('downvote')}
                      disabled={isVoting}
                      className="flex items-center space-x-1 px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors disabled:opacity-50"
                    >
                      <ThumbsDown className="w-4 h-4" />
                      <span>{downvoteCount}</span>
                    </button>
                  </div>
                )}
                <div className="flex items-center space-x-1 text-gray-600">
                  <MessageCircle className="w-4 h-4" />
                  <span>{comments.length} comments</span>
                </div>
              </div>
            </div>

            {/* Add Comment Form */}
            {user && (
              <form onSubmit={handleComment} className="mb-6">
                <div className="flex space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {user.full_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <div className="flex justify-end mt-2">
                      <button
                        type="submit"
                        disabled={!newComment.trim() || isSubmittingComment}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isSubmittingComment ? (
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                        <span>{isSubmittingComment ? 'Posting...' : 'Post Comment'}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {comments.map((comment, index) => (
                <div key={comment.id || index} className="flex space-x-3 p-4 bg-gray-50 rounded-lg">
                  <div className="w-8 h-8 bg-gradient-to-r from-gray-400 to-gray-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-bold text-sm">
                      {comment.user_name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-medium text-gray-900">{comment.user_name}</span>
                      <span className="text-xs text-gray-500">
                        {format(new Date(comment.created_at), 'MMM dd, yyyy')}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <p className="text-gray-500 text-center py-4">No comments yet. Be the first to comment!</p>
              )}
            </div>
          </div>

          {/* Interview Process */}
          <div className="bg-white rounded-xl border border-gray-200 p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Target className="w-5 h-5 mr-2 text-blue-600" />
              Interview Process
            </h4>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {safeExperience.interview_process}
              </p>
            </div>
          </div>

          {/* Interview Rounds */}
          {safeExperience.rounds.length > 0 && (
            <div className="space-y-6">
              <h4 className="text-xl font-bold text-gray-900 flex items-center">
                <Code2 className="w-5 h-5 mr-2 text-blue-600" />
                Interview Rounds ({safeExperience.rounds.length})
              </h4>
              
              <div className="space-y-6">
                {safeExperience.rounds.map((round, index) => (
                  <div key={round.id || index} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {/* Round Header */}
                    <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="text-lg font-bold text-gray-900">
                            Round {round.round_number}: {round.round_name}
                          </h5>
                          <p className="text-sm text-gray-600 mt-1">
                            {round.round_type.replace('_', ' ').toUpperCase()}
                            {round.duration && ` • ${round.duration}`}
                          </p>
                        </div>
                        <span className={`px-3 py-1 text-sm font-bold rounded-full ${
                          round.result === 'passed' ? 'bg-green-100 text-green-800' :
                          round.result === 'failed' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {round.result.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    {/* Round Content */}
                    <div className="p-6">
                      <p className="text-gray-700 mb-6 leading-relaxed">{round.description}</p>
                      
                      {/* Coding Questions */}
                      {round.coding_questions && round.coding_questions.length > 0 && (
                        <div>
                          <h6 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                            <Code2 className="w-4 h-4 mr-2" />
                            Coding Questions ({round.coding_questions.length})
                          </h6>
                          
                          <div className="space-y-4">
                            {round.coding_questions.map((question, qIndex) => {
                              const difficultyData = getDifficultyData(question.difficulty);
                              
                              return (
                                <div key={question.id || qIndex} className={`${difficultyData.bgColor} rounded-xl p-6 border-2 border-opacity-20`}>
                                  {/* Question Header */}
                                  <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                      <h7 className="text-xl font-bold text-gray-900 mb-2 block">
                                        {qIndex + 1}. {question.title}
                                      </h7>
                                      <div className="flex items-center space-x-3">
                                        <span className={`inline-flex items-center px-3 py-1 text-sm font-bold rounded-full border-2 ${difficultyData.color}`}>
                                          <span className="mr-1">{difficultyData.icon}</span>
                                          {question.difficulty.charAt(0).toUpperCase() + question.difficulty.slice(1)}
                                        </span>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Question Description */}
                                  <div className="mb-4">
                                    <p className="text-gray-700 leading-relaxed">{question.description}</p>
                                  </div>

                                  {/* Topics */}
                                  {question.topics && question.topics.length > 0 && (
                                    <div className="mb-4">
                                      <h8 className="text-sm font-semibold text-gray-700 mb-2 block">Topics:</h8>
                                      <div className="flex flex-wrap gap-2">
                                        {question.topics.map((topic, i) => (
                                          <span key={i} className="px-3 py-1 text-sm font-medium bg-blue-100 text-blue-800 rounded-full border border-blue-200">
                                            {topic}
                                          </span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Platform Links */}
                                  {question.platform_links && question.platform_links.length > 0 && (
                                    <div>
                                      <h8 className="text-sm font-semibold text-gray-700 mb-3 block">Practice Links:</h8>
                                      <div className="flex flex-wrap gap-3">
                                        {question.platform_links.map((link, lIndex) => {
                                          const platformData = getPlatformData(link.platform);
                                          
                                          return (
                                            <a
                                              key={link.id || lIndex}
                                              href={link.url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className={`inline-flex items-center space-x-2 px-4 py-2 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105 shadow-md hover:shadow-lg ${platformData.color}`}
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
                                              <ExternalLink className="w-4 h-4" />
                                            </a>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Advice Section */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-green-600" />
              Advice for Future Candidates
            </h4>
            <div className="prose prose-gray max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                {safeExperience.advice}
              </p>
            </div>
          </div>

          {/* Salary Information */}
          {safeExperience.salary_offered && (
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
              <h4 className="text-xl font-bold text-gray-900 mb-3 flex items-center">
                💰 Salary Offered
              </h4>
              <p className="text-lg font-semibold text-gray-800">{safeExperience.salary_offered}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperienceModal;