-- Fix script: ensure ML scoring tables exist for admin insights endpoints.
-- Safe to run multiple times.
BEGIN;

CREATE TABLE IF NOT EXISTS public.ml_donor_churn_scores
(
    supporter_id integer NOT NULL,
    churn_score numeric(5, 4) NOT NULL,
    churn_tier text NOT NULL DEFAULT 'Medium',
    model_version text NOT NULL DEFAULT 'pipeline1-v1',
    scored_at_utc timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ml_donor_churn_scores_pkey PRIMARY KEY (supporter_id)
);

CREATE TABLE IF NOT EXISTS public.ml_social_post_scores
(
    post_id integer NOT NULL,
    churn_score numeric(5, 4) NOT NULL,
    uplift_score numeric(5, 4) NOT NULL,
    model_version text NOT NULL DEFAULT 'pipeline2-4-v1',
    scored_at_utc timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ml_social_post_scores_pkey PRIMARY KEY (post_id)
);

CREATE TABLE IF NOT EXISTS public.ml_resident_readiness_scores
(
    resident_id integer NOT NULL,
    readiness_score numeric(5, 4) NOT NULL,
    readiness_tier text NOT NULL DEFAULT 'Developing',
    model_version text NOT NULL DEFAULT 'pipeline3-v1',
    scored_at_utc timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ml_resident_readiness_scores_pkey PRIMARY KEY (resident_id)
);

CREATE TABLE IF NOT EXISTS public.ml_donor_impact_predictions
(
    supporter_id integer NOT NULL,
    impact_score numeric(5, 4) NOT NULL,
    predicted_top_program_area text NOT NULL DEFAULT 'Education',
    predicted_education_share numeric(5, 4) NOT NULL,
    model_version text NOT NULL DEFAULT 'pipeline5-v1',
    scored_at_utc timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT ml_donor_impact_predictions_pkey PRIMARY KEY (supporter_id)
);

-- Ensure FK relationships exist (idempotent pattern via IF NOT EXISTS checks).
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ml_donor_churn_scores_supporter_id_fkey'
    ) THEN
        ALTER TABLE public.ml_donor_churn_scores
            ADD CONSTRAINT ml_donor_churn_scores_supporter_id_fkey
            FOREIGN KEY (supporter_id) REFERENCES public.supporters (supporter_id)
            ON UPDATE NO ACTION ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ml_social_post_scores_post_id_fkey'
    ) THEN
        ALTER TABLE public.ml_social_post_scores
            ADD CONSTRAINT ml_social_post_scores_post_id_fkey
            FOREIGN KEY (post_id) REFERENCES public.social_media_posts (post_id)
            ON UPDATE NO ACTION ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ml_resident_readiness_scores_resident_id_fkey'
    ) THEN
        ALTER TABLE public.ml_resident_readiness_scores
            ADD CONSTRAINT ml_resident_readiness_scores_resident_id_fkey
            FOREIGN KEY (resident_id) REFERENCES public.residents (resident_id)
            ON UPDATE NO ACTION ON DELETE CASCADE;
    END IF;

    IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'ml_donor_impact_predictions_supporter_id_fkey'
    ) THEN
        ALTER TABLE public.ml_donor_impact_predictions
            ADD CONSTRAINT ml_donor_impact_predictions_supporter_id_fkey
            FOREIGN KEY (supporter_id) REFERENCES public.supporters (supporter_id)
            ON UPDATE NO ACTION ON DELETE CASCADE;
    END IF;
END $$;

-- Helpful indexes for FK join lookups.
CREATE INDEX IF NOT EXISTS idx_ml_donor_churn_scores_supporter_id
    ON public.ml_donor_churn_scores (supporter_id);

CREATE INDEX IF NOT EXISTS idx_ml_social_post_scores_post_id
    ON public.ml_social_post_scores (post_id);

CREATE INDEX IF NOT EXISTS idx_ml_resident_readiness_scores_resident_id
    ON public.ml_resident_readiness_scores (resident_id);

CREATE INDEX IF NOT EXISTS idx_ml_donor_impact_predictions_supporter_id
    ON public.ml_donor_impact_predictions (supporter_id);

COMMIT;
