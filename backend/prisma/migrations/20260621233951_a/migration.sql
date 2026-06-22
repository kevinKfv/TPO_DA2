BEGIN TRY

BEGIN TRAN;

-- CreateTable
CREATE TABLE [dbo].[asistentes] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [numeroPostor] INT NOT NULL,
    [cliente] INT NOT NULL,
    [subasta] INT NOT NULL,
    CONSTRAINT [pk_asistentes] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[catalogos] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [descripcion] VARCHAR(250) NOT NULL,
    [subasta] INT,
    [responsable] INT NOT NULL,
    CONSTRAINT [pk_catalogos] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[clientes] (
    [identificador] INT NOT NULL,
    [numeroPais] INT,
    [admitido] VARCHAR(2),
    [categoria] VARCHAR(10),
    [verificador] INT NOT NULL,
    CONSTRAINT [pk_clientes] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[duenios] (
    [identificador] INT NOT NULL,
    [numeroPais] INT,
    [verificacionFinanciera] VARCHAR(2),
    [verificacionJudicial] VARCHAR(2),
    [calificacionRiesgo] INT,
    [verificador] INT NOT NULL,
    CONSTRAINT [pk_duenios] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[empleados] (
    [identificador] INT NOT NULL,
    [cargo] VARCHAR(100),
    [sector] INT,
    CONSTRAINT [pk_empleados] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[extra_credencialesCliente] (
    [cliente] INT NOT NULL,
    [email] VARCHAR(200) NOT NULL,
    [passwordHash] VARCHAR(500) NOT NULL,
    [estadoCredencial] VARCHAR(20) NOT NULL CONSTRAINT [DF__extra_cre__estad__7755B73D] DEFAULT 'pendiente',
    [debeCambiarClave] VARCHAR(2) NOT NULL CONSTRAINT [DF__extra_cre__debeC__793DFFAF] DEFAULT 'si',
    [mailEnviado] BIT NOT NULL CONSTRAINT [DF__extra_cre__mailE__7B264821] DEFAULT 0,
    [fechaRegistro] DATE NOT NULL CONSTRAINT [DF__extra_cre__fecha__7C1A6C5A] DEFAULT CURRENT_TIMESTAMP,
    [identificador] INT NOT NULL IDENTITY(1,1),
    CONSTRAINT [pk_extra_credencialesCliente] PRIMARY KEY CLUSTERED ([cliente]),
    CONSTRAINT [uq_extra_credencialesCliente_email] UNIQUE NONCLUSTERED ([email])
);

-- CreateTable
CREATE TABLE [dbo].[extra_documentosCliente] (
    [cliente] INT NOT NULL,
    [fotoFrente] VARBINARY(max) NOT NULL,
    [fotoDorso] VARBINARY(max) NOT NULL,
    CONSTRAINT [pk_extra_documentosCliente] PRIMARY KEY CLUSTERED ([cliente])
);

-- CreateTable
CREATE TABLE [dbo].[extra_metodosPago] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [cliente] INT NOT NULL,
    [tipo] VARCHAR(20) NOT NULL,
    [numero] VARCHAR(50) NOT NULL,
    [vencimiento] DATE,
    [cvv] VARCHAR(4),
    [estado] VARCHAR(20) NOT NULL CONSTRAINT [DF__extra_met__estad__1EA48E88] DEFAULT 'pendiente',
    [titular] VARCHAR(150),
    [banco] VARCHAR(150),
    [pais] VARCHAR(100),
    [alias] VARCHAR(30),
    [fotoCheque] VARBINARY(max),
    [montoGarantia] DECIMAL(18,2),
    CONSTRAINT [pk_extra_metodosPago] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[extra_subastas] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [subasta] INT NOT NULL,
    [titulo] VARCHAR(200) NOT NULL,
    [descripcion] VARCHAR(500),
    CONSTRAINT [pk_extra_subastas] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[fotos] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [producto] INT NOT NULL,
    [foto] VARBINARY(max) NOT NULL,
    CONSTRAINT [pk_fotos] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[itemsCatalogo] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [catalogo] INT NOT NULL,
    [producto] INT NOT NULL,
    [precioBase] DECIMAL(18,2) NOT NULL,
    [comision] DECIMAL(18,2) NOT NULL,
    [subastado] VARCHAR(2),
    CONSTRAINT [pk_itemsCatalogo] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[paises] (
    [numero] INT NOT NULL,
    [nombre] VARCHAR(250) NOT NULL,
    [nombreCorto] VARCHAR(250),
    [capital] VARCHAR(250) NOT NULL,
    [nacionalidad] VARCHAR(250) NOT NULL,
    [idiomas] VARCHAR(150) NOT NULL,
    CONSTRAINT [pk_paises] PRIMARY KEY CLUSTERED ([numero])
);

-- CreateTable
CREATE TABLE [dbo].[personas] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [documento] VARCHAR(20) NOT NULL,
    [nombre] VARCHAR(150) NOT NULL,
    [direccion] VARCHAR(250),
    [estado] VARCHAR(15),
    [foto] VARBINARY(max),
    CONSTRAINT [pk_personas] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[productos] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [fecha] DATE,
    [disponible] VARCHAR(2),
    [descripcionCatalogo] VARCHAR(500) CONSTRAINT [DF__productos__descr__70DDC3D8] DEFAULT 'No Posee',
    [descripcionCompleta] VARCHAR(300) NOT NULL,
    [revisor] INT NOT NULL,
    [duenio] INT NOT NULL,
    [seguro] VARCHAR(30),
    CONSTRAINT [pk_productos] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[pujos] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [asistente] INT NOT NULL,
    [item] INT NOT NULL,
    [importe] DECIMAL(18,2) NOT NULL,
    [ganador] VARCHAR(2) CONSTRAINT [DF__pujos__ganador__08B54D69] DEFAULT 'no',
    CONSTRAINT [pk_pujos] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[registroDeSubasta] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [subasta] INT NOT NULL,
    [duenio] INT NOT NULL,
    [producto] INT NOT NULL,
    [cliente] INT NOT NULL,
    [importe] DECIMAL(18,2) NOT NULL,
    [comision] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [pk_registroDeSubasta] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[sectores] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [nombreSector] VARCHAR(150) NOT NULL,
    [codigoSector] VARCHAR(10),
    [responsableSector] INT,
    CONSTRAINT [pk_sectores] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[seguros] (
    [nroPoliza] VARCHAR(30) NOT NULL,
    [compania] VARCHAR(150) NOT NULL,
    [polizaCombinada] VARCHAR(2),
    [importe] DECIMAL(18,2) NOT NULL,
    CONSTRAINT [pk_seguro] PRIMARY KEY CLUSTERED ([nroPoliza])
);

-- CreateTable
CREATE TABLE [dbo].[subastadores] (
    [identificador] INT NOT NULL,
    [matricula] VARCHAR(15),
    [region] VARCHAR(50),
    CONSTRAINT [pk_subastadores] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[subastas] (
    [identificador] INT NOT NULL IDENTITY(1,1),
    [fecha] DATE,
    [hora] TIME NOT NULL,
    [estado] VARCHAR(10),
    [subastador] INT,
    [ubicacion] VARCHAR(350),
    [capacidadAsistentes] INT,
    [tieneDeposito] VARCHAR(2),
    [seguridadPropia] VARCHAR(2),
    [categoria] VARCHAR(10),
    CONSTRAINT [pk_subastas] PRIMARY KEY CLUSTERED ([identificador])
);

-- CreateTable
CREATE TABLE [dbo].[notificaciones] (
    [id] INT NOT NULL IDENTITY(1,1),
    [identificadorPersona] INT NOT NULL,
    [mensaje] VARCHAR(500) NOT NULL,
    [leido] BIT NOT NULL CONSTRAINT [notificaciones_leido_df] DEFAULT 0,
    [fecha] DATETIME2 NOT NULL CONSTRAINT [notificaciones_fecha_df] DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT [notificaciones_pkey] PRIMARY KEY CLUSTERED ([id])
);

-- AddForeignKey
ALTER TABLE [dbo].[asistentes] ADD CONSTRAINT [fk_asistentes_clientes] FOREIGN KEY ([cliente]) REFERENCES [dbo].[clientes]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[asistentes] ADD CONSTRAINT [fk_asistentes_subasta] FOREIGN KEY ([subasta]) REFERENCES [dbo].[subastas]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[catalogos] ADD CONSTRAINT [fk_catalogos_empleados] FOREIGN KEY ([responsable]) REFERENCES [dbo].[empleados]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[catalogos] ADD CONSTRAINT [fk_catalogos_subastas] FOREIGN KEY ([subasta]) REFERENCES [dbo].[subastas]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[clientes] ADD CONSTRAINT [fk_clientes_empleados] FOREIGN KEY ([verificador]) REFERENCES [dbo].[empleados]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[clientes] ADD CONSTRAINT [fk_clientes_paises] FOREIGN KEY ([numeroPais]) REFERENCES [dbo].[paises]([numero]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[clientes] ADD CONSTRAINT [fk_clientes_personas] FOREIGN KEY ([identificador]) REFERENCES [dbo].[personas]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[duenios] ADD CONSTRAINT [fk_duenios_empleados] FOREIGN KEY ([verificador]) REFERENCES [dbo].[empleados]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[duenios] ADD CONSTRAINT [fk_duenios_personas] FOREIGN KEY ([identificador]) REFERENCES [dbo].[personas]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[extra_credencialesCliente] ADD CONSTRAINT [fk_extra_credencialesCliente_clientes] FOREIGN KEY ([cliente]) REFERENCES [dbo].[clientes]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[extra_documentosCliente] ADD CONSTRAINT [fk_extra_documentosCliente_clientes] FOREIGN KEY ([cliente]) REFERENCES [dbo].[clientes]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[extra_metodosPago] ADD CONSTRAINT [fk_extra_metodosPago_clientes] FOREIGN KEY ([cliente]) REFERENCES [dbo].[clientes]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[extra_subastas] ADD CONSTRAINT [fk_extra_subastas_subastas] FOREIGN KEY ([subasta]) REFERENCES [dbo].[subastas]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[fotos] ADD CONSTRAINT [fk_fotos_productos] FOREIGN KEY ([producto]) REFERENCES [dbo].[productos]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[itemsCatalogo] ADD CONSTRAINT [fk_itemsCatalogo_catalogos] FOREIGN KEY ([catalogo]) REFERENCES [dbo].[catalogos]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[itemsCatalogo] ADD CONSTRAINT [fk_itemsCatalogo_productos] FOREIGN KEY ([producto]) REFERENCES [dbo].[productos]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[productos] ADD CONSTRAINT [fk_productos_duenios] FOREIGN KEY ([duenio]) REFERENCES [dbo].[duenios]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[productos] ADD CONSTRAINT [fk_productos_empleados] FOREIGN KEY ([revisor]) REFERENCES [dbo].[empleados]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pujos] ADD CONSTRAINT [fk_pujos_asistentes] FOREIGN KEY ([asistente]) REFERENCES [dbo].[asistentes]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[pujos] ADD CONSTRAINT [fk_pujos_itemsCatalogo] FOREIGN KEY ([item]) REFERENCES [dbo].[itemsCatalogo]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[registroDeSubasta] ADD CONSTRAINT [fk_registroDeSubasta_cliente] FOREIGN KEY ([cliente]) REFERENCES [dbo].[clientes]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[registroDeSubasta] ADD CONSTRAINT [fk_registroDeSubasta_duenios] FOREIGN KEY ([duenio]) REFERENCES [dbo].[duenios]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[registroDeSubasta] ADD CONSTRAINT [fk_registroDeSubasta_producto] FOREIGN KEY ([producto]) REFERENCES [dbo].[productos]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[registroDeSubasta] ADD CONSTRAINT [fk_registroDeSubasta_subastas] FOREIGN KEY ([subasta]) REFERENCES [dbo].[subastas]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[sectores] ADD CONSTRAINT [fk_sectores_empleados] FOREIGN KEY ([responsableSector]) REFERENCES [dbo].[empleados]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[subastadores] ADD CONSTRAINT [fk_subastadores_personas] FOREIGN KEY ([identificador]) REFERENCES [dbo].[personas]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[subastas] ADD CONSTRAINT [fk_subastas_subastadores] FOREIGN KEY ([subastador]) REFERENCES [dbo].[subastadores]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE [dbo].[notificaciones] ADD CONSTRAINT [fk_notificaciones_personas] FOREIGN KEY ([identificadorPersona]) REFERENCES [dbo].[personas]([identificador]) ON DELETE NO ACTION ON UPDATE NO ACTION;

COMMIT TRAN;

END TRY
BEGIN CATCH

IF @@TRANCOUNT > 0
BEGIN
    ROLLBACK TRAN;
END;
THROW

END CATCH
