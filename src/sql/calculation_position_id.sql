DELIMITER //

CREATE TABLE IF NOT EXISTS `blg_pos_calculation_id_seed` (
    `id` TINYINT NOT NULL PRIMARY KEY,
    `seed` INT UNSIGNED NOT NULL
) //

SET @calculation_id_sequence_exists = EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema = DATABASE()
      AND table_name = 'blg_pos_calculation_id_sequence'
      AND table_type = 'SEQUENCE'
) //
SET @calculation_id_seed_exists = EXISTS (
    SELECT 1 FROM blg_pos_calculation_id_seed WHERE id = 1
) //
SET @calculation_id_setup = IF(
    @calculation_id_sequence_exists = @calculation_id_seed_exists,
    'DO 0',
    'SIGNAL SQLSTATE ''45000'' SET MESSAGE_TEXT = ''Kalkulations-ID-Sequenz und Seed sind inkonsistent'''
) //
PREPARE stmt FROM @calculation_id_setup //
EXECUTE stmt //
DEALLOCATE PREPARE stmt //

SET @calculation_id_start = (
    SELECT COALESCE((FLOOR((MAX(id) - 1000000000) / 1000) + 1) * 1000, 0)
    FROM blg_pos_calculation
    WHERE id >= 1000000000 AND id < 2000000000
) //
SET @calculation_id_setup = IF(
    @calculation_id_sequence_exists,
    'DO 0',
    IF(
        @calculation_id_start >= 1000000000,
        'SIGNAL SQLSTATE ''45000'' SET MESSAGE_TEXT = ''Kein freier Kalkulations-ID-Bereich nach den vorhandenen IDs''',
        CONCAT(
            'CREATE SEQUENCE `blg_pos_calculation_id_sequence` START WITH ',
            @calculation_id_start,
            ' MINVALUE 0 MAXVALUE 999999999 INCREMENT BY 1 NOCACHE NOCYCLE'
        )
    )
) //
PREPARE stmt FROM @calculation_id_setup //
EXECUTE stmt //
DEALLOCATE PREPARE stmt //

INSERT INTO blg_pos_calculation_id_seed (id, seed)
SELECT 1, FLOOR(RAND() * 4294967296)
WHERE NOT @calculation_id_sequence_exists //

CREATE OR REPLACE FUNCTION getNewCalculationPositionID() RETURNS BIGINT
NOT DETERMINISTIC MODIFIES SQL DATA
BEGIN
    DECLARE sequence_value BIGINT;
    DECLARE generated_id BIGINT;
    DECLARE seed_value INT UNSIGNED;

    SELECT seed INTO seed_value FROM blg_pos_calculation_id_seed WHERE id = 1;
    IF seed_value IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Seed für Kalkulations-IDs fehlt';
    END IF;

    next_id: LOOP
        SET sequence_value = NEXT VALUE FOR blg_pos_calculation_id_sequence;
        SET generated_id = 1000000000 + FLOOR(sequence_value / 1000) * 1000
            + MOD(
                MOD(sequence_value, 1000) * 557
                + CRC32(CONCAT(seed_value, ':', FLOOR(sequence_value / 1000))),
                1000
            );
        IF NOT EXISTS (SELECT 1 FROM blg_pos_calculation WHERE id = generated_id) THEN
            RETURN generated_id;
        END IF;
    END LOOP;
END //

SET @calculation_id_setup = IF(
    EXISTS(SELECT 1 FROM ds_column WHERE table_name = 'blg_pos_calculation' AND column_name = 'id'),
    'DO 0',
    'SIGNAL SQLSTATE ''45000'' SET MESSAGE_TEXT = ''DS-Metadaten für blg_pos_calculation.id fehlen'''
) //
PREPARE stmt FROM @calculation_id_setup //
EXECUTE stmt //
DEALLOCATE PREPARE stmt //
UPDATE ds_column
SET default_value = '{:getNewCalculationPositionID()}'
WHERE table_name = 'blg_pos_calculation' AND column_name = 'id' //
