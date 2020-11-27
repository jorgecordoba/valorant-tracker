export function getKda(profile, dateOffset) {
    const date = new Date(new Date().setDate(new Date().getDate()+dateOffset)).toISOString().slice(0,10);
    const profilePlayers = profile.players.filter(p => p !== undefined && p.matches !== undefined);
    let profileMatches = profilePlayers.map(p => p.matches).flat().filter(m => m !== undefined && m.metadata.modeName == "Competitive");
  
    profileMatches = profileMatches.filter(match => match.metadata.timestamp.slice(0,10) == date)
    const sumKda = profileMatches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
    const avgKda = sumKda / profileMatches.length
    return avgKda;
  }
  
  export function getAvg(profile) {
  
    const name = profile.name;
    const rgb = profile.rgb;
  
    const profilePlayers = profile.players.filter(p => p !== undefined && p.matches !== undefined);
    const profileMatches = profilePlayers.map(p => p.matches).flat().filter(m => m !== undefined && m.metadata.modeName == "Competitive");
      
    const sumKda = profileMatches.reduce((current, match) => match.segments[0].stats.kdRatio.value + current, 0);
    const avgKda = sumKda / profileMatches.length
  
    const sumScore = profileMatches.reduce((current, match) => match.segments[0].stats.score.value + current, 0);
    const avgScore = sumScore / profileMatches.length;
  
    const econRating = profileMatches.reduce((current, match) => match.segments[0].stats.econRating.value + current, 0);
    const avgEconRating = econRating / profileMatches.length;
   
    const sumScorePerRound = profileMatches.reduce((current, match) => match.segments[0].stats.scorePerRound.value + current, 0);
    const avgScorePerRound = sumScorePerRound / profileMatches.length;
  
    const nmatches = profileMatches.length;  
  
    return {name, rgb, avgKda, avgScore, avgEconRating, avgScorePerRound, nmatches};
  }