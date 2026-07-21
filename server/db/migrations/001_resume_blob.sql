-- TalentFlow: move resume storage from a URL column to an in-row blob
-- (resume_url pointed at local disk, which doesn't survive on hosts with
-- an ephemeral filesystem; storing the PDF in the row persists with the
-- rest of the data everywhere without needing a separate file store).

IF COL_LENGTH('dbo.candidates', 'resume_url') IS NOT NULL
  ALTER TABLE dbo.candidates DROP COLUMN resume_url;
GO

IF COL_LENGTH('dbo.candidates', 'resume_filename') IS NULL
  ALTER TABLE dbo.candidates ADD resume_filename NVARCHAR(255) NULL;
GO

IF COL_LENGTH('dbo.candidates', 'resume_data') IS NULL
  ALTER TABLE dbo.candidates ADD resume_data VARBINARY(MAX) NULL;
GO
