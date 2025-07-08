IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[users]') AND type in (N'U'))
BEGIN
    CREATE TABLE [dbo].[users] (
        [Id] INT IDENTITY(1,1) PRIMARY KEY,
        [NombreCompleto] NVARCHAR(100) NOT NULL,
        [DNI] BIGINT NOT NULL,
        [Estado] VARCHAR(10) NOT NULL,
        [FechaIngreso] DATE NOT NULL,
        [EsPEP] BIT NOT NULL,
        [EsSujetoObligado] BIT NULL,
        [FechaCreacion] DATETIME NOT NULL DEFAULT GETDATE()
    );
    CREATE INDEX [IX_Users_DNI] ON [dbo].[users]([DNI]);
    PRINT 'Users table created successfully';
END
ELSE
BEGIN
    PRINT 'Users table already exists';
END