const RoomTemplate = require('./roomTemplate.model');
const { AppError } = require('../../core/utils');

class RoomTemplateService {
  static async createTemplate(data) {
    const existing = await RoomTemplate.findOne({ name: data.name });
    if (existing) throw new AppError('Template with this name already exists', 409);
    
    return RoomTemplate.create(data);
  }

  static async getTemplates(query) {
    const filter = {};
    if (query.type) filter.type = query.type;
    if (query.roomCategory) filter.roomCategory = query.roomCategory;
    if (query.activeOnly !== 'false') filter.isActive = true;

    return RoomTemplate.find(filter).sort({ createdAt: -1 });
  }

  static async getTemplateById(id) {
    const template = await RoomTemplate.findById(id);
    if (!template) throw new AppError('Room template not found', 404);
    return template;
  }

  static async updateTemplate(id, data) {
    const template = await RoomTemplate.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!template) throw new AppError('Room template not found', 404);
    return template;
  }

  static async deleteTemplate(id) {
    const template = await RoomTemplate.findByIdAndDelete(id);
    if (!template) throw new AppError('Room template not found', 404);
    return true;
  }
}

module.exports = RoomTemplateService;
