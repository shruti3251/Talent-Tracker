-- TalentFlow: MSSQL schema for the candidates table + updated_at trigger

IF OBJECT_ID(N'dbo.candidates', N'U') IS NULL
BEGIN
  CREATE TABLE dbo.candidates (
    id              UNIQUEIDENTIFIER NOT NULL DEFAULT NEWID() PRIMARY KEY,
    name            NVARCHAR(255) NOT NULL,
    current_ctc     DECIMAL(6, 2) NOT NULL,
    expected_ctc    DECIMAL(6, 2) NOT NULL,
    experience_yrs  DECIMAL(4, 1) NOT NULL,
    availability    NVARCHAR(30) NOT NULL DEFAULT 'immediately'
      CHECK (availability IN ('immediately', '15_days', '1_month', '2_months', 'more_than_2_months')),
    notes           NVARCHAR(MAX) NULL,
    resume_url      NVARCHAR(500) NULL,
    status          NVARCHAR(30) NOT NULL DEFAULT 'shortlisted'
      CHECK (status IN ('shortlisted', 'interview_scheduled', 'interviewed', 'selected', 'rejected')),
    created_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME(),
    updated_at      DATETIME2 NOT NULL DEFAULT SYSUTCDATETIME()
  );

  CREATE INDEX IX_candidates_status ON dbo.candidates (status);
  CREATE INDEX IX_candidates_created_at ON dbo.candidates (created_at DESC);
END
GO

IF OBJECT_ID(N'dbo.trg_candidates_set_updated_at', N'TR') IS NOT NULL
  DROP TRIGGER dbo.trg_candidates_set_updated_at;
GO

CREATE TRIGGER dbo.trg_candidates_set_updated_at
ON dbo.candidates
AFTER UPDATE
AS
BEGIN
  SET NOCOUNT ON;
  UPDATE c
  SET updated_at = SYSUTCDATETIME()
  FROM dbo.candidates c
  INNER JOIN inserted i ON c.id = i.id;
END
GO
