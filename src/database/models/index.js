import { Equipment } from './equipment.model.js';
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

export { Site, Equipment };
