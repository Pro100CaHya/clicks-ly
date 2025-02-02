CREATE TABLE clicks
(
    eventId UUID,
    userId UUID,
    points UInt32 DEFAULT 1,
    createdAt DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (userId, createdAt);

CREATE TABLE leaderboard_mv
(
    userId UUID,
    totalPoints UInt32
)
ENGINE = SummingMergeTree()
ORDER BY userId;

CREATE MATERIALIZED VIEW leaderboard_mv_populate
TO leaderboard_mv AS
SELECT userId, points AS totalPoints
FROM clicks;