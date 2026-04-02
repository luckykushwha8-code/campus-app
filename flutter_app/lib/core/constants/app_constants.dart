class ApiConstants {
  ApiConstants._();

  // Base URLs - Update to your server IP for production
  static const String baseUrl = 'http://10.0.2.2:3000/api'; // Android emulator
  static const String socketUrl = 'http://10.0.2.2:3000';

  // Auth Endpoints
  static const String register = '/auth/register';
  static const String login = '/auth/login';
  static const String sendOtp = '/auth/send-otp';
  static const String verifyOtp = '/auth/verify-otp';
  static const String refreshToken = '/auth/refresh';

  // User Endpoints
  static const String getUser = '/user';
  static const String updateUser = '/user/update';
  static const String verifyCollegeId = '/user/verify-college';
  static const String uploadAvatar = '/user/avatar';
  static const String followUser = '/user/follow';
  static const String unfollowUser = '/user/unfollow';
  static const String getFollowers = '/user/followers';
  static const String getFollowing = '/user/following';

  // Post Endpoints
  static const String createPost = '/posts/create';
  static const String getFeed = '/posts/feed';
  static const String getPost = '/posts';
  static const String updatePost = '/posts';
  static const String deletePost = '/posts';
  static const String likePost = '/posts/like';
  static const String unlikePost = '/posts/unlike';
  static const String savePost = '/posts/save';
  static const String unsavePost = '/posts/unsave';

  // Comment Endpoints
  static const String createComment = '/comments';
  static const String getComments = '/comments/post';
  static const String deleteComment = '/comments';

  // Story Endpoints
  static const String uploadStory = '/stories/upload';
  static const String getStories = '/stories/feed';
  static const String deleteStory = '/stories';

  // Chat Endpoints
  static const String getConversations = '/chat/conversations';
  static const String getMessages = '/chat/messages';
  static const String createConversation = '/chat/conversation';
  static const String sendMessage = '/chat/send';

  // Room Endpoints
  static const String getRooms = '/rooms';
  static const String getRoom = '/rooms';
  static const String joinRoom = '/rooms/join';
  static const String leaveRoom = '/rooms/leave';
  static const String getRoomPosts = '/rooms/posts';

  // Notes Endpoints
  static const String getNotes = '/notes';
  static const String uploadNote = '/notes';
  static const String deleteNote = '/notes';
  static const String downloadNote = '/notes/download';

  // Events Endpoints
  static const String getEvents = '/events';
  static const String createEvent = '/events';
  static const String updateEvent = '/events';
  static const String deleteEvent = '/events';
  static const String rsvpEvent = '/events/rsvp';

  // Placements Endpoints
  static const String getJobs = '/jobs';
  static const String createJob = '/jobs';
  static const String applyJob = '/jobs/apply';

  // Marketplace Endpoints
  static const String getMarketplaceItems = '/marketplace';
  static const String createMarketplaceItem = '/marketplace';
  static const String deleteMarketplaceItem = '/marketplace';

  // Lost & Found Endpoints
  static const String getLostItems = '/lost-found';
  static const String createLostItem = '/lost-found';
  static const String updateLostItem = '/lost-found';
  static const String deleteLostItem = '/lost-found';

  // Notifications Endpoints
  static const String getNotifications = '/notifications';
  static const String markAsRead = '/notifications/read';
  static const String markAllAsRead = '/notifications/read-all';
}

class AppConstants {
  AppConstants._();

  static const String appName = 'CampusLink';
  static const String appTagline = 'Your Campus Community';

  // Verification Levels
  static const int verificationLevelPending = 0;
  static const int verificationLevelBasic = 1;
  static const int verificationLevelVerified = 2;
  static const int verificationLevelPremium = 3;

  // Feed Types
  static const String feedTypeGlobal = 'global';
  static const String feedTypeCollege = 'college';
  static const String feedTypeBatch = 'batch';
  static const String feedTypeClub = 'club';
  static const String feedTypeEvent = 'event';

  // Room Types
  static const String roomTypeCollege = 'college';
  static const String roomTypeSchool = 'school';
  static const String roomTypeHostel = 'hostel';
  static const String roomTypeDepartment = 'department';
  static const String roomTypeClass = 'class';
  static const String roomTypeEvent = 'event';
  static const String roomTypeClub = 'club';
  static const String roomTypeStudy = 'study';
  static const String roomTypePlacement = 'placement';
  static const String roomTypeInternship = 'internship';
  static const String roomTypeBuysell = 'buysell';

  // Post Types
  static const String postTypePublic = 'public';
  static const String postTypeCollege = 'college';
  static const String postTypeBatch = 'batch';
  static const String postTypeClass = 'class';
  static const String postTypeClub = 'club';
  static const String postTypeAnonymous = 'anonymous';

  // Job Types
  static const String jobTypeInternship = 'internship';
  static const String jobTypeFullTime = 'full-time';
  static const String jobTypePartTime = 'part-time';

  // Lost Item Status
  static const String lostItemStatusLost = 'lost';
  static const String lostItemStatusFound = 'found';
  static const String lostItemStatusClaimed = 'claimed';

  // Marketplace Categories
  static const String marketplaceCategoryBooks = 'books';
  static const String marketplaceCategoryElectronics = 'electronics';
  static const String marketplaceCategoryOthers = 'others';

  // Timeouts
  static const int connectionTimeout = 30000;
  static const int receiveTimeout = 30000;

  // Pagination
  static const int defaultPageSize = 20;

  // Cache Keys
  static const String tokenKey = 'auth_token';
  static const String refreshTokenKey = 'refresh_token';
  static const String userKey = 'current_user';
  static const String institutionsKey = 'institutions';
  static const String themeKey = 'theme_mode';
}
