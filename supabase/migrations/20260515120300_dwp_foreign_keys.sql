-- Wire DWP attempt/progress/etc. tables to the identity tables now that
-- pupils + classes exist on the same project.

ALTER TABLE dwp_progress
  ADD CONSTRAINT dwp_progress_pupil_fk FOREIGN KEY (pupil_id)
    REFERENCES pupils(id) ON DELETE CASCADE;
ALTER TABLE dwp_progress
  ADD CONSTRAINT dwp_progress_class_fk FOREIGN KEY (class_id)
    REFERENCES classes(id) ON DELETE SET NULL;

ALTER TABLE dwp_attempts
  ADD CONSTRAINT dwp_attempts_pupil_fk FOREIGN KEY (pupil_id)
    REFERENCES pupils(id) ON DELETE CASCADE;
ALTER TABLE dwp_attempts
  ADD CONSTRAINT dwp_attempts_class_fk FOREIGN KEY (class_id)
    REFERENCES classes(id) ON DELETE SET NULL;

ALTER TABLE dwp_daily_attempts
  ADD CONSTRAINT dwp_daily_attempts_pupil_fk FOREIGN KEY (pupil_id)
    REFERENCES pupils(id) ON DELETE CASCADE;
ALTER TABLE dwp_daily_attempts
  ADD CONSTRAINT dwp_daily_attempts_class_fk FOREIGN KEY (class_id)
    REFERENCES classes(id) ON DELETE SET NULL;

ALTER TABLE dwp_garden_seeds
  ADD CONSTRAINT dwp_garden_seeds_pupil_fk FOREIGN KEY (pupil_id)
    REFERENCES pupils(id) ON DELETE CASCADE;

ALTER TABLE dwp_certificates
  ADD CONSTRAINT dwp_certificates_pupil_fk FOREIGN KEY (pupil_id)
    REFERENCES pupils(id) ON DELETE CASCADE;
ALTER TABLE dwp_certificates
  ADD CONSTRAINT dwp_certificates_class_fk FOREIGN KEY (class_id)
    REFERENCES classes(id) ON DELETE SET NULL;
