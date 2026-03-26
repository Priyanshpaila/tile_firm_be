const express = require('express');
const router = express.Router();
const RoomTemplateService = require('./roomTemplate.service');
const { successResponse } = require('../../core/utils');
const { authenticate, staffOrAdmin } = require('../../core/middlewares/auth.middleware');

// Public routes
router.get('/', async (req, res, next) => {
  try {
    const templates = await RoomTemplateService.getTemplates(req.query);
    successResponse(res, { templates });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', async (req, res, next) => {
  try {
    const template = await RoomTemplateService.getTemplateById(req.params.id);
    successResponse(res, { template });
  } catch (error) {
    next(error);
  }
});

// Admin routes (omitting strict joi validation schemas here for brevity as MVP)
router.use(authenticate, staffOrAdmin);

router.post('/', async (req, res, next) => {
  try {
    const template = await RoomTemplateService.createTemplate(req.body);
    successResponse(res, { template }, 'Template created', 201);
  } catch (error) {
    next(error);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const template = await RoomTemplateService.updateTemplate(req.params.id, req.body);
    successResponse(res, { template }, 'Template updated');
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', async (req, res, next) => {
  try {
    await RoomTemplateService.deleteTemplate(req.params.id);
    successResponse(res, null, 'Template deleted');
  } catch (error) {
    next(error);
  }
});

module.exports = router;
