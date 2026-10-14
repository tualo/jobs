DELIMITER ;

CREATE TABLE IF NOT EXISTS `tualo_job_loeschprotokoll` (
  `id` varchar(36) NOT NULL,
  `job_id` varchar(36) NOT NULL,
  `processor_name` varchar(255) DEFAULT NULL,
  `controller_name` varchar(255) DEFAULT NULL,
  `assignment` varchar(255) DEFAULT NULL,
  `assignment_reference` varchar(255) DEFAULT NULL,
  `transfer_sftp` tinyint(1) NOT NULL DEFAULT 0,
  `transfer_smime` tinyint(1) NOT NULL DEFAULT 0,
  `transfer_mobile_media` tinyint(1) NOT NULL DEFAULT 0,
  `transfer_other` tinyint(1) NOT NULL DEFAULT 0,
  `transfer_note` text DEFAULT NULL,
  `deleted_on` date DEFAULT NULL,
  `deletion_time` time DEFAULT NULL,
  `responsible` varchar(255) DEFAULT NULL,
  `department` varchar(255) DEFAULT NULL,
  `procedure` varchar(255) DEFAULT NULL,
  `tool_report_attached` tinyint(1) NOT NULL DEFAULT 0,
  `external_service_protocol_attached` tinyint(1) NOT NULL DEFAULT 0,
  `subcontractor_protocol_attached` tinyint(1) NOT NULL DEFAULT 0,
  `sign_city` varchar(255) DEFAULT NULL,
  `sign_date` date DEFAULT NULL,
  `create_date` datetime NOT NULL DEFAULT current_timestamp(),
  `update_date` datetime NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_tualo_job_loeschprotokoll_job_id` (`job_id`),
  KEY `idx_tualo_job_loeschprotokoll_deleted_on` (`deleted_on`),
  CONSTRAINT `fk_tualo_job_loeschprotokoll_job_id`
    FOREIGN KEY (`job_id`) REFERENCES `tualo_job` (`id`)
    ON DELETE RESTRICT ON UPDATE CASCADE
) ;