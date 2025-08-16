import { Role } from '@prisma/client';
import { Router } from 'express';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CertificationController } from './certification.controller';
import CertificationValidation from './certification.validation';
import { upload } from '../../utils/handelFile';

const router = Router();

// Verify certificate endpoint (public)
router.get('/verify/:sl_no', CertificationController.VerifyCertification);

// Get certifications by agency
router.get(
  '/agency/:agency_id',
  auth(Role.AGENCY),
  CertificationController.GetCertificationsByAgency,
);

// Get my all agencies certifications list
router.get(
  '/my-agencies',
  auth(Role.AGENCY),
  CertificationController.GetMyAgenciesCertifications,
);

router
  .route('/')
  .post(
    auth(Role.AGENCY),
    upload.single('certificate_file'),
    validateRequest(CertificationValidation.CreateCertificationSchema),
    CertificationController.CreateCertification,
  )
  .get(CertificationController.GetAllCertification);

router
  .route('/:id')
  .get(CertificationController.GetSingleCertification)
  .patch(
    auth(Role.AGENCY),
    upload.single('certificate_file'),
    validateRequest(CertificationValidation.UpdateCertificationSchema),
    CertificationController.UpdateCertification,
  )
  .delete(
    auth(Role.SUPER_ADMIN, Role.ADMIN),
    CertificationController.DeleteCertification,
  );

export const CertificationRouter = router;
