const SpotifyWebApi = require('spotify-web-api-node');

exports.handler = async (event, context) => {
  // Get the keys from Netlify's environment variables
  const { SPOTIFY_CLIENT_ID, SPOTIFY_CLIENT_SECRET } = process.env;

  const spotifyApi = new SpotifyWebApi({
    clientId: SPOTIFY_CLIENT_ID,
    clientSecret: SPOTIFY_CLIENT_SECRET,
    // You will need to get a refresh token after the initial authorization flow
    // For now, this is a placeholder.
    refreshToken: 'YOUR_REFRESH_TOKEN_HERE',
  });

  try {
    // This part of the code handles getting a new access token
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body.access_token;
    spotifyApi.setAccessToken(accessToken);

    // Call the Spotify API to get the "Now Playing" track
    const nowPlayingData = await spotifyApi.getMyCurrentPlayingTrack();

    // Call the Spotify API to get the "Recently Played" tracks
    const recentlyPlayedData = await spotifyApi.getMyRecentlyPlayedTracks({ limit: 3 });

    // Format the data to match what the React app expects
    const responseData = {
      nowPlaying: nowPlayingData.body && nowPlayingData.body.is_playing ? {
        albumArt: nowPlayingData.body.item.album.images[0].url,
        trackName: nowPlayingData.body.item.name,
        artistName: nowPlayingData.body.item.artists[0].name,
        isPlaying: nowPlayingData.body.is_playing,
      } : {
        albumArt: '',
        trackName: 'Nothing is currently playing',
        artistName: '',
        isPlaying: false,
      },
      recentlyPlayed: recentlyPlayedData.body.items.map(item => ({
        track: item.track.name,
        artist: item.track.artists[0].name,
        albumArt: item.track.album.images[0].url,
      }))
    };

    return {
      statusCode: 200,
      body: JSON.stringify(responseData),
    };

  } catch (error) {
    console.error("Error fetching Spotify data:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
