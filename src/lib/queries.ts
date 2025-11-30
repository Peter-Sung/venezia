import { supabase } from './supabaseClient';

export const fetchWordsForStage = async (stage: number) => {
  const { data, error } = await supabase
    .from('words')
    .select('text')
    .lte('min_level', stage) // min_level <= stage
    .gte('max_level', stage); // max_level >= stage

  if (error) {
    console.error('Error fetching words:', error);
    throw new Error(error.message);
  }

  // The query returns an array of objects like [{ text: 'word1' }, { text: 'word2' }].
  // We want to return an array of strings.
  return data.map(item => item.text);
};

export const getPlayerProfile = async (userId?: string) => {
  let targetId = userId;

  if (!targetId) {
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
    if (sessionError) {
      console.error('Error getting session:', sessionError);
      throw new Error(sessionError.message);
    }
    if (!sessionData.session) {
      return null;
    }
    targetId = sessionData.session.user.id;
  }

  const { data, error } = await supabase
    .from('players')
    .select('id, nickname, level, cumulative_points, drop_point')
    .eq('id', targetId)
    .single();

  if (error) {
    console.error('Error fetching player profile:', error);
    throw new Error(error.message);
  }

  return data;
};

// ... (other functions)

export const logGameResult = async ({ playerId, score, playAt }: { playerId: string; score: number; playAt: string }) => {
  // 1. Calculate Drop (Mileage)
  // 1000 Score = 1 DR, rounded to 1 decimal place
  const earnedDrop = Math.floor((score / 1000) * 10) / 10;

  // 2. Log Game Result (RPC)
  const { data: newDropPoint, error: logError } = await supabase.rpc('log_game_result', {
    p_player_id: playerId,
    p_score: score,
    p_play_at: playAt,
  });

  if (logError) {
    console.error('Error logging game result:', logError);
    throw new Error(logError.message);
  }

  return newDropPoint;
};

export const fetchStageSettings = async (stage: number) => {
  const { data, error } = await supabase
    .from('stage_settings')
    .select('*')
    .eq('stage_level', stage)
    .single(); // stage_level is a primary key, so we expect a single result

  if (error) {
    console.error('Error fetching stage settings:', error);
    throw new Error(error.message);
  }

  return data;
};

export const fetchAllStageSettings = async () => {
  const { data, error } = await supabase
    .from('stage_settings')
    .select('*')
    .order('stage_level', { ascending: true });

  if (error) {
    console.error('Error fetching all stage settings:', error);
    throw new Error(error.message);
  }

  return data;
};

export const updateHighScore = async ({ nickname, play_at, score }: { nickname: string; play_at: string; score: number; }) => {
  const { error } = await supabase.rpc('update_high_score', {
    p_nickname: nickname,
    p_play_at: play_at,
    p_score: score,
  });

  if (error) {
    console.error('Error updating high score:', error);
    throw new Error(error.message);
  }

  return null;
};

export const fetchRankings = async (nickname: string) => {
  // 1. 상위 10명의 랭킹을 가져옵니다.
  const { data: top10, error: top10Error } = await supabase
    .from('scores')
    .select('nickname, play_at, score')
    .order('score', { ascending: false })
    .limit(10);

  if (top10Error) {
    console.error('Error fetching top 10 rankings:', top10Error);
    throw new Error(top10Error.message);
  }

  // 2. 현재 사용자의 최고 기록을 가져옵니다.
  const { data: myBest, error: myBestError } = await supabase
    .from('scores')
    .select('nickname, play_at, score')
    .eq('nickname', nickname)
    .single();

  // myBest는 없을 수도 있으므로 에러를 던지지 않습니다.
  if (myBestError && myBestError.code !== 'PGRST116') { // PGRST116: row not found
    console.error('Error fetching my best score:', myBestError);
    throw new Error(myBestError.message);
  }

  return { top10, myBest };
};

export const fetchWordsPaginated = async (page: number, pageSize: number, searchTerm: string, levelFilter?: number | null) => {
  const { data, error } = await supabase.rpc('get_words_paginated', {
    page_number: page,
    page_size: pageSize,
    search_term: searchTerm,
    level_filter: levelFilter,
  });

  if (error) {
    console.error('Error fetching paginated words:', error);
    throw new Error(error.message);
  }

  return data;
};

export const addWords = async (words: { text: string; min_level: number; max_level: number }[]) => {
  const { error } = await supabase.rpc('add_words', { new_words: words });

  if (error) {
    console.error('Error adding words:', error);
    throw new Error(error.message);
  }

  return null;
};

export const updateWordLevels = async ({ id, min_level, max_level }: { id: bigint; min_level: number; max_level: number }) => {
  const { error } = await supabase.rpc('update_word_levels', {
    word_id: id,
    new_min_level: min_level,
    new_max_level: max_level,
  });

  if (error) {
    console.error('Error updating word levels:', error);
    throw new Error(error.message);
  }

  return null;
};

export const deleteWord = async (id: bigint) => {
  const { error } = await supabase.rpc('delete_word', { word_id: id });

  if (error) {
    console.error('Error deleting word:', error);
    throw new Error(error.message);
  }

  return null;
};




export const fetchRankingsByPeriod = async (period: 'weekly' | 'monthly' | 'all_time') => {
  const { data, error } = await supabase.rpc('get_rankings_by_period', {
    p_period: period,
  });

  if (error) {
    console.error('Error fetching rankings by period:', error);
    throw new Error(error.message);
  }

  return data;
};


export const fetchUserRank = async (period: string, playerId: number) => {
  const { data, error } = await supabase
    .rpc('get_user_rank', { p_period: period, p_player_id: playerId });

  if (error) {
    console.error('Error fetching user rank:', error);
    throw error;
  }

  return data[0]; // Returns { rank, nickname, score, played_at } or undefined
};

export const fetchScoreRank = async (period: string, score: number) => {
  const { data, error } = await supabase
    .rpc('get_score_rank', { p_period: period, p_score: score });

  if (error) {
    console.error('Error fetching score rank:', error);
    return null; // Return null instead of throwing to prevent UI blocking
  }

  return data; // Returns rank (number)
};
