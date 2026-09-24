import { Equipment } from './equipment.model.js';
import { EquipmentPassport } from './equipment-passport.model.js';
import { MaintenanceRequest } from './maintenance-request.model.js';
import { Site } from './site.model.js';

Site.hasMany(Equipment, {
    foreignKey: 'siteId',
    as: 'equipment',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
});

Equipment.belongsTo(Site, {
    foreignKey: 'siteId',
    as: 'site',
    onUpdate: 'CASCADE',
    onDelete: 'RESTRICT',
});

Equipment.hasOne(EquipmentPassport, {
    foreignKey: 'equipmentId',
    as: 'passport',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

EquipmentPassport.belongsTo(Equipment, {
    foreignKey: 'equipmentId',
    as: 'equipment',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

Equipment.hasMany(MaintenanceRequest, {
    foreignKey: 'equipmentId',
    as: 'maintenanceRequests',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

MaintenanceRequest.belongsTo(Equipment, {
    foreignKey: 'equipmentId',
    as: 'equipment',
    onUpdate: 'CASCADE',
    onDelete: 'CASCADE',
});

export { Site, Equipment, EquipmentPassport, MaintenanceRequest };
