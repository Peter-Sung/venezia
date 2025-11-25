-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.players (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  nickname text NOT NULL UNIQUE,
  hashed_password text NOT NULL,
  cumulative_points integer NOT NULL DEFAULT 0,
  level text NOT NULL DEFAULT '해골'::text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT players_pkey PRIMARY KEY (id)
);
CREATE TABLE public.scores (
  nickname text NOT NULL,
  play_at text,
  score integer NOT NULL,
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT scores_pkey PRIMARY KEY (nickname)
);
CREATE TABLE public.stage_settings (
  stage_level integer NOT NULL,
  fall_duration_seconds double precision NOT NULL,
  spawn_interval_seconds double precision NOT NULL,
  clear_duration_seconds integer NOT NULL DEFAULT 60,
  clear_word_count integer NOT NULL DEFAULT 20,
  CONSTRAINT stage_settings_pkey PRIMARY KEY (stage_level)
);
CREATE TABLE public.words (
  id bigint GENERATED ALWAYS AS IDENTITY NOT NULL,
  text text NOT NULL UNIQUE,
  min_level integer NOT NULL,
  max_level integer NOT NULL,
  CONSTRAINT words_pkey PRIMARY KEY (id)
);