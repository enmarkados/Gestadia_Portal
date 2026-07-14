-- Additive: campos de país, dirección estructurada y datos manuales del canje.
ALTER TABLE `Expediente`
    ADD COLUMN `paisCanje` VARCHAR(191) NULL,
    ADD COLUMN `direccion` JSON NULL,
    ADD COLUMN `datosPais` JSON NULL;
