SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO

-- Written by: Fredrik Eriksson
-- Created: 2015-11-05

-- Splits a string separated by a delimiter into a table.

CREATE FUNCTION [dbo].[cfn_gettablefromstring]
(
	@@string NVARCHAR(MAX)
	, @@delimiter NVARCHAR(1)
)
RETURNS @result TABLE
(
	value NVARCHAR(128)
)
AS
BEGIN
	
	-- Check parameters
	IF ISNULL(@@delimiter, N'') = N''
		OR ISNULL(@@string, N'') = N''
	BEGIN
		RETURN
	END
	
	-- Add delimiter at the end of the string
	IF SUBSTRING(@@string, LEN(@@string), 1) <> @@delimiter
	BEGIN
		SET @@string += @@delimiter
	END

	-- Go through the string
	DECLARE @lastpos INT
	SET @lastpos = 0
	
	WHILE @lastpos < LEN(@@string)
	BEGIN
		INSERT INTO @result(value)
		VALUES (SUBSTRING(@@string, @lastpos, CHARINDEX(@@delimiter,@@string, @lastpos) - @lastpos))
		
		SET @lastpos = CHARINDEX(@@delimiter,@@string, @lastpos) + 1
	END
	
	RETURN
END
