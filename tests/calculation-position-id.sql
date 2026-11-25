-- Run only against an empty, isolated test database, from the jobs directory.
CREATE TABLE blg_pos_calculation (id BIGINT PRIMARY KEY);
CREATE TABLE ds_column (table_name VARCHAR(128), column_name VARCHAR(128), default_value VARCHAR(255));
INSERT INTO ds_column VALUES ('blg_pos_calculation', 'id', '{#serial}');
INSERT INTO blg_pos_calculation VALUES (1000000123), (1000001321), (2500000000);

SOURCE src/sql/calculation_position_id.sql;

DELIMITER //
CREATE PROCEDURE assert_calculation_id(IN test_result BOOLEAN, IN message_text VARCHAR(255))
BEGIN
    IF NOT COALESCE(test_result, FALSE) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = message_text;
    END IF;
END //
CREATE PROCEDURE test_calculation_position_id()
BEGIN
    DECLARE i INT DEFAULT 0;
    DECLARE generated BIGINT;
    DECLARE rolled_back BIGINT;
    DECLARE next_id BIGINT;
    CREATE TEMPORARY TABLE generated_ids (id BIGINT PRIMARY KEY);

    CALL assert_calculation_id(
        (SELECT default_value = '{:getNewCalculationPositionID()}' FROM ds_column
         WHERE table_name = 'blg_pos_calculation' AND column_name = 'id'),
        'DSX default was not installed'
    );
    WHILE i < 5000 DO
        SET generated = getNewCalculationPositionID();
        CALL assert_calculation_id(generated >= 1000002000 AND generated < 2000000000, 'Generated ID outside expected range');
        INSERT INTO generated_ids VALUES (generated);
        SET i = i + 1;
    END WHILE;
    CALL assert_calculation_id((SELECT COUNT(DISTINCT MOD(id, 1000)) = 1000 FROM generated_ids), 'Suffixes are not a permutation');

    START TRANSACTION;
    SET rolled_back = getNewCalculationPositionID();
    ROLLBACK;
    SET next_id = getNewCalculationPositionID();
    CALL assert_calculation_id(rolled_back <> next_id, 'Sequence reused an ID after rollback');
END //
DELIMITER ;
CALL test_calculation_position_id();

SOURCE src/sql/calculation_position_id.sql;

DELIMITER //
CREATE PROCEDURE test_calculation_position_id_reinstall()
BEGIN
    DECLARE generated BIGINT;
    DECLARE next_sequence BIGINT;
    DECLARE seed_value INT UNSIGNED;
    DECLARE occupied BIGINT;
    SET generated = getNewCalculationPositionID();
    CALL assert_calculation_id((SELECT COUNT(*) = 0 FROM generated_ids WHERE id = generated), 'Reinstall reused an ID');

    SELECT next_not_cached_value INTO next_sequence FROM blg_pos_calculation_id_sequence;
    SELECT seed INTO seed_value FROM blg_pos_calculation_id_seed WHERE id = 1;
    SET occupied = 1000000000 + FLOOR(next_sequence / 1000) * 1000
        + MOD(MOD(next_sequence, 1000) * 557
            + CRC32(CONCAT(seed_value, ':', FLOOR(next_sequence / 1000))), 1000);
    INSERT INTO blg_pos_calculation VALUES (occupied);
    SET generated = getNewCalculationPositionID();
    CALL assert_calculation_id(generated <> occupied, 'Existing ID was not skipped');
END //
DELIMITER ;
CALL test_calculation_position_id_reinstall();

ALTER SEQUENCE blg_pos_calculation_id_sequence RESTART WITH 999999999;
DELIMITER //
CREATE PROCEDURE test_calculation_id_exhaustion()
BEGIN
    DECLARE generated BIGINT;
    DECLARE exhausted BOOLEAN DEFAULT FALSE;
    SET generated = getNewCalculationPositionID();
    CALL assert_calculation_id(generated >= 1999999000 AND generated < 2000000000, 'Final ID outside range');
    BEGIN
        DECLARE CONTINUE HANDLER FOR SQLEXCEPTION SET exhausted = TRUE;
        SET generated = getNewCalculationPositionID();
    END;
    CALL assert_calculation_id(exhausted, 'Exhaustion did not raise an error');
END //
DELIMITER ;
CALL test_calculation_id_exhaustion();
