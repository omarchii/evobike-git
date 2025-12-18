-- CreateEnum
CREATE TYPE "RolUsuario" AS ENUM ('ADMIN', 'EMPLEADO');

-- CreateEnum
CREATE TYPE "EstatusTicket" AS ENUM ('PENDIENTE', 'LIQUIDADO');

-- CreateEnum
CREATE TYPE "TipoItem" AS ENUM ('PRODUCTO', 'SERVICIO');

-- CreateEnum
CREATE TYPE "TipoPago" AS ENUM ('ANTICIPO', 'PAGO', 'LIQUIDACION');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'TARJETA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstatusServicio" AS ENUM ('RECIBIDO', 'EN_PROCESO', 'LISTO', 'ENTREGADO');

-- CreateTable
CREATE TABLE "Sucursal" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "codigo" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Usuario" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "rol" "RolUsuario" NOT NULL DEFAULT 'EMPLEADO',
    "sucursalId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT,
    "correo" TEXT,
    "direccion" TEXT,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Ticket" (
    "id" TEXT NOT NULL,
    "folio" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "estatus" "EstatusTicket" NOT NULL DEFAULT 'PENDIENTE',
    "subtotal" DECIMAL(12,2) NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "total" DECIMAL(12,2) NOT NULL,
    "notas" TEXT,
    "sucursalId" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "vendedorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Ticket_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TicketItem" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "tipo" "TipoItem" NOT NULL,
    "categoria" TEXT,
    "modelo" TEXT,
    "voltaje" TEXT,
    "noSerie" TEXT,
    "color" TEXT,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio" DECIMAL(12,2) NOT NULL,
    "importe" DECIMAL(12,2) NOT NULL,
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TicketItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Pago" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "tipo" "TipoPago" NOT NULL DEFAULT 'PAGO',
    "metodo" "MetodoPago" NOT NULL,
    "monto" DECIMAL(12,2) NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "referencia" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Pago_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Promocion" (
    "id" TEXT NOT NULL,
    "ticketId" TEXT NOT NULL,
    "descuento" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "obsequio" TEXT,
    "motivo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Promocion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Servicio" (
    "id" TEXT NOT NULL,
    "clienteId" TEXT NOT NULL,
    "ticketId" TEXT,
    "problema" TEXT NOT NULL,
    "diagnostico" TEXT,
    "solucion" TEXT,
    "estatus" "EstatusServicio" NOT NULL DEFAULT 'RECIBIDO',
    "costo" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Servicio_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FolioCounter" (
    "sucursalId" TEXT NOT NULL,
    "ultimoNumero" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "FolioCounter_pkey" PRIMARY KEY ("sucursalId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Sucursal_codigo_key" ON "Sucursal"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Usuario_email_key" ON "Usuario"("email");

-- CreateIndex
CREATE INDEX "Cliente_nombre_idx" ON "Cliente"("nombre");

-- CreateIndex
CREATE INDEX "Cliente_telefono_idx" ON "Cliente"("telefono");

-- CreateIndex
CREATE UNIQUE INDEX "Ticket_folio_key" ON "Ticket"("folio");

-- CreateIndex
CREATE INDEX "Ticket_clienteId_idx" ON "Ticket"("clienteId");

-- CreateIndex
CREATE INDEX "Ticket_sucursalId_idx" ON "Ticket"("sucursalId");

-- CreateIndex
CREATE INDEX "Ticket_fecha_idx" ON "Ticket"("fecha");

-- CreateIndex
CREATE INDEX "TicketItem_ticketId_idx" ON "TicketItem"("ticketId");

-- CreateIndex
CREATE INDEX "TicketItem_noSerie_idx" ON "TicketItem"("noSerie");

-- CreateIndex
CREATE INDEX "Pago_ticketId_idx" ON "Pago"("ticketId");

-- CreateIndex
CREATE INDEX "Pago_fecha_idx" ON "Pago"("fecha");

-- CreateIndex
CREATE UNIQUE INDEX "Promocion_ticketId_key" ON "Promocion"("ticketId");

-- CreateIndex
CREATE INDEX "Servicio_clienteId_idx" ON "Servicio"("clienteId");

-- CreateIndex
CREATE INDEX "Servicio_ticketId_idx" ON "Servicio"("ticketId");

-- CreateIndex
CREATE INDEX "Servicio_estatus_idx" ON "Servicio"("estatus");

-- AddForeignKey
ALTER TABLE "Usuario" ADD CONSTRAINT "Usuario_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Ticket" ADD CONSTRAINT "Ticket_vendedorId_fkey" FOREIGN KEY ("vendedorId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TicketItem" ADD CONSTRAINT "TicketItem_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Pago" ADD CONSTRAINT "Pago_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Promocion" ADD CONSTRAINT "Promocion_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Servicio" ADD CONSTRAINT "Servicio_ticketId_fkey" FOREIGN KEY ("ticketId") REFERENCES "Ticket"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FolioCounter" ADD CONSTRAINT "FolioCounter_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
