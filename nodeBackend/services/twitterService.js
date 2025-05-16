const TwitterQueue = require('../models/twitterQueueModel');
const TwitterData = require('../models/twitterDataModel');
const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const Tournament = require('../models/tournamentModel');

const twitterClient = new TwitterApi({
  appKey: process.env.TWITTER_API_KEY,
  appSecret: process.env.TWITTER_API_SECRET,
  accessToken: process.env.TWITTER_ACCESS_TOKEN,
  accessSecret: process.env.TWITTER_ACCESS_SECRET,
});

const fetchTweetsForUser = async (twitterId, team, startTime) => {
  try {
    console.log(new Date(startTime).toISOString());
    const tweets = await twitterClient.v2.userTimeline(twitterId, {
      start_time: new Date(startTime).toISOString(),
      'tweet.fields': ['created_at', 'public_metrics'],
      max_results: 10, // Adjust as needed
    });
    console.log(`Current Twitter id:${twitterId}`);

    console.log('API result :', tweets);

    // console.log('Some data', tweets?._realData);
    console.log(tweets?._realData?.errors);
    console.log(tweets?._requestMaker?.rateLimits);
    console.log(tweets?._requestMaker?.rateLimits?._oauth);

    let userStats = {
      tweetCount: tweets.data?.meta?.result_count || 0,
      likeCount: 0,
      replyCount: 0,
      retweetCount: 0,
      viewCount: 0,
      tweets: [],
    };

    // Process tweet metrics
    if (tweets.data?.data) {
      tweets.data.data.forEach((tweet) => {
        userStats.likeCount += tweet.public_metrics?.like_count || 0;
        userStats.replyCount += tweet.public_metrics?.reply_count || 0;
        userStats.retweetCount += tweet.public_metrics?.retweet_count || 0;
        userStats.viewCount += tweet.public_metrics?.impression_count || 0;

        // Store tweet data
        userStats.tweets.push({
          id: tweet.id,
          content: tweet.text,
          createdAt: tweet.created_at,
          metrics: {
            likeCount: tweet.public_metrics?.like_count || 0,
            replyCount: tweet.public_metrics?.reply_count || 0,
            retweetCount: tweet.public_metrics?.retweet_count || 0,
            viewCount: tweet.public_metrics?.impression_count || 0,
          },
        });
      });
    }

    return userStats;
  } catch (error) {
    console.error(`Error fetching tweets for Twitter ID ${twitterId}:`, error);

    if (error.code === 429) {
      const resetTime = error.rateLimit?.reset
        ? new Date(error.rateLimit.reset * 1000)
        : null;
      throw {
        isRateLimited: true,
        resetTime,
      };
    }

    return {
      tweetCount: 0,
      likeCount: 0,
      replyCount: 0,
      retweetCount: 0,
      viewCount: 0,
      tweets: [],
    };
  }
};

const initializeQueueForTournament = async (
  tournamentId,
  allTeams,
  startDate,
  endDate,
) => {
  try {
    let queue = await TwitterQueue.findOne({ tournamentId });

    if (!queue) {
      queue = new TwitterQueue({
        tournamentId,
        teamsToProcess: allTeams.map((team) => ({
          teamId: team._id,
          twitterId: team.twitterId,
          teamName: team.name,
          teamImage: team.image,
          teamSection: team.section,
          priority: 0,
          lastProcessed: null,
        })),
        isActive: true,
        startDate,
        endDate,
        lastProcessedIndex: 0,
        processingStartTime: null,
      });
    } else {
      const existingTeamsMap = new Map(
        queue.teamsToProcess
          .filter((team) => team.twitterId)
          .map((team) => [team.twitterId, team]),
      );

      const updatedTeamsToProcess = [];

      for (const team of allTeams) {
        if (!team.twitterId) continue;

        if (existingTeamsMap.has(team.twitterId)) {
          // Update existing team but preserve priority and lastProcessed
          const existingTeam = existingTeamsMap.get(team.twitterId);
          updatedTeamsToProcess.push({
            teamId: team._id,
            twitterId: team.twitterId,
            teamName: team.name,
            teamImage: team.image,
            teamSection: team.section,
            priority: existingTeam.priority,
            lastProcessed: existingTeam.lastProcessed,
          });
        } else {
          // Add new team
          updatedTeamsToProcess.push({
            teamId: team._id,
            twitterId: team.twitterId,
            teamName: team.name,
            teamImage: team.image,
            teamSection: team.section,
            priority: 0,
            lastProcessed: null,
          });
        }
      }

      // Replace the entire array rather than just pushing to it
      queue.teamsToProcess = updatedTeamsToProcess;

      // Update dates if needed
      if (startDate) queue.startDate = startDate;
      if (endDate) queue.endDate = endDate;

      const now = new Date();
      if (queue.endDate && now > new Date(queue.endDate)) {
        queue.isActive = false;
      }
    }

    await queue.save();
    return queue;
  } catch (error) {
    console.error('Error initializing queue:', error);
    throw error;
  }
};

// Function to process the next team in the queue
const processNextTeamInQueue = async () => {
  try {
    const now = new Date();

    const queue = await TwitterQueue.findOne({
      isActive: true,
      // $or: [
      //   { processingStartTime: null },
      //   { processingStartTime: { $lt: new Date(now - 20 * 60 * 1000) } },
      // ],
    }).sort({ 'teamsToProcess.lastProcessed': 1 });

    if (!queue) {
      console.log(
        'No active queues to process or all queues are currently being processed',
      );
      return;
    }

    const tournament = await Tournament.findById(queue.tournamentId);

    if (!tournament || !tournament.isActive || !tournament.isOngoing) {
      console.log(
        'Tournament is not active or ongoing. Skipping queue processing.',
      );
      queue.isActive = false;
      await queue.save();
      return;
    }

    queue.processingStartTime = now;
    await queue.save();

    queue.teamsToProcess.sort((a, b) => {
      if (!a.lastProcessed && b.lastProcessed) return -1;
      if (a.lastProcessed && !b.lastProcessed) return 1;
      // If both have never been processed or both have been processed,
      // sort by priority (higher first) then by lastProcessed time
      if (b.priority !== a.priority) return b.priority - a.priority;
      return a.lastProcessed?.getTime() - b.lastProcessed?.getTime();
    });

    const teamToProcess = queue.teamsToProcess[0];
    console.log('Team to process', teamToProcess);

    if (!teamToProcess || !teamToProcess.twitterId) {
      console.log('No teams with Twitter IDs to process in queue', queue._id);
      queue.processingStartTime = null;
      await queue.save();
      return;
    }

    console.log(
      `Processing Twitter data for team: ${teamToProcess.teamName} (${teamToProcess.twitterId})`,
    );

    try {
      const twitterStats = await fetchTweetsForUser(
        teamToProcess.twitterId,
        {
          name: teamToProcess.teamName,
          image: teamToProcess.teamImage,
          section: teamToProcess.teamSection,
        },
        queue.startDate,
      );

      await TwitterData.findOneAndUpdate(
        {
          tournamentId: queue.tournamentId,
          teamId: teamToProcess.teamId,
          twitterId: teamToProcess.twitterId,
        },
        {
          $set: {
            teamName: teamToProcess.teamName,
            teamImage: teamToProcess.teamImage,
            teamSection: teamToProcess.teamSection,
            lastUpdated: now,
            stats: {
              tweetCount: twitterStats.tweetCount,
              likeCount: twitterStats.likeCount,
              replyCount: twitterStats.replyCount,
              retweetCount: twitterStats.retweetCount,
              viewCount: twitterStats.viewCount,
            },
            tweets: twitterStats.tweets,
          },
        },
        { upsert: true, new: true },
      );

      teamToProcess.lastProcessed = now;

      queue.processingStartTime = null;
      await queue.save();

      console.log(
        `Successfully processed Twitter data for team: ${teamToProcess.teamName}`,
      );
    } catch (error) {
      if (error.isRateLimited) {
        console.log(
          `Rate limited when processing team ${teamToProcess.teamName}. Will retry after reset.`,
        );
      } else {
        console.error(
          `Error processing Twitter data for team ${teamToProcess.teamName}:`,
          error,
        );
      }

      queue.processingStartTime = null;
      await queue.save();
    }
  } catch (error) {
    console.error('Error in processNextTeamInQueue:', error);
  }
};

const getAggregatedTwitterStats = async (tournamentId) => {
  try {
    const allTwitterData = await TwitterData.find({ tournamentId });

    if (!allTwitterData.length) {
      return generateFallbackData();
    }

    // console.log('ALL Twitter aggregation:', allTwitterData);

    const aggregatedStats = {
      posts: 0,
      likes: 0,
      comments: 0,
      retweets: 0,
      views: 0,
      recentTweets: [],
    };

    // Combine stats from all teams
    allTwitterData.forEach((data) => {
      aggregatedStats.posts += data.stats.tweetCount;
      aggregatedStats.likes += data.stats.likeCount;
      aggregatedStats.comments += data.stats.replyCount;
      aggregatedStats.retweets += data.stats.retweetCount;
      aggregatedStats.views += data.stats.viewCount;

      // Add team data to tweets
      const teamTweets = data.tweets.map((tweet) => ({
        id: tweet.id,
        content: tweet.content,
        createdAt: tweet.createdAt,
        author: {
          name: data.teamName,
          image: data.teamImage,
          section: data.teamSection,
        },
        metrics: tweet.metrics,
      }));

      //   console.log('Team tweets aggregation:', teamTweets);

      aggregatedStats.recentTweets.push(...teamTweets);
    });

    // recent tweets by date (newest first)
    aggregatedStats.recentTweets.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
    );

    // most recent tweets (e.g., top 5)
    aggregatedStats.recentTweets = aggregatedStats.recentTweets.slice(0, 5);

    return aggregatedStats;
  } catch (error) {
    console.error(
      `Error getting aggregated Twitter stats for tournament ${tournamentId}:`,
      error,
    );
    return generateFallbackData();
  }
};

const generateFallbackData = (allTeams = []) => {
  const teamCount = Math.max(allTeams.length, 1);

  const fallbackStats = {
    posts: 0,
    likes: 0,
    comments: 0,
    retweets: 0,
    views: 0,
    recentTweets: [],
  };

  for (let i = 0; i < teamCount; i++) {
    fallbackStats.posts += Math.floor(Math.random() * 20) + 5;
    fallbackStats.likes += Math.floor(Math.random() * 2000) + 200;
    fallbackStats.comments += Math.floor(Math.random() * 500) + 50;
    fallbackStats.retweets += Math.floor(Math.random() * 300) + 30;
    fallbackStats.views += Math.floor(Math.random() * 5000) + 500;
  }

  const fallbackTweets = Array.from({ length: 3 }).map((_, i) => ({
    id: `fallback-${i}`,
    author:
      allTeams.length > 0
        ? allTeams[Math.floor(Math.random() * allTeams.length)]
        : {
            name: 'Example Team',
            image: '/default-team.png',
            section: 'Default Section',
          },
    content: [
      'Exciting news about the tournament! Stay tuned for more updates coming soon.',
      "We've reached a new milestone in our engagement. Thanks to all the teams for their hard work!",
      'Congratulations to all the teams that have reached the top tier. Keep pushing the boundaries!',
    ][i],
    createdAt: new Date(
      Date.now() - Math.floor(Math.random() * 24) * 3600000,
    ).toISOString(),
    metrics: {
      likeCount: Math.floor(Math.random() * 1000) + 100,
      replyCount: Math.floor(Math.random() * 100) + 10,
      retweetCount: Math.floor(Math.random() * 50) + 5,
      viewCount: Math.floor(Math.random() * 10000) + 1000,
    },
  }));

  fallbackStats.recentTweets = fallbackTweets;
  return fallbackStats;
};

const cleanupInactiveTournamentData = async () => {
  try {
    const inactiveQueues = await TwitterQueue.find({ isActive: false });
    console.log(inactiveQueues);

    if (inactiveQueues.length > 0) {
      for (const queue of inactiveQueues) {
        await TwitterData.deleteMany({ tournamentId: queue.tournamentId });

        await TwitterQueue.findByIdAndDelete(queue._id);

        console.log(
          `Cleaned up data for inactive tournament: ${queue.tournamentId}`,
        );
      }
    }
  } catch (error) {
    console.error('Error cleaning up inactive tournament data:', error);
  }
};

const setupCronJobs = () => {
  cron.schedule('*/30 * * * *', async () => {
    console.log('Running scheduled Twitter data processing...');
    await processNextTeamInQueue();
  });

  cron.schedule('*/20 * * * *', async () => {
    console.log('Running inactive tournament data cleanup...');
    await cleanupInactiveTournamentData();
  });

  console.log('Cron jobs scheduled for Twitter data processing');
};

setupCronJobs();

module.exports = {
  initializeQueueForTournament,
  processNextTeamInQueue,
  getAggregatedTwitterStats,
  cleanupInactiveTournamentData,
  generateFallbackData,
};
