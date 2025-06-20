'use strict';

module.exports = (sequelize, DataTypes) => {
  const Equipment = sequelize.define('Equipment', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    bandId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Bands',
        key: 'id'
      }
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notEmpty: true
      }
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    serialNumber: {
      type: DataTypes.STRING,
      allowNull: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: true,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('available', 'in-use', 'maintenance', 'unavailable'),
      defaultValue: 'available'
    },
    lastMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    nextMaintenanceDate: {
      type: DataTypes.DATE,
      allowNull: true
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    imageUrl: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Equipment.associate = function(models) {
    // Equipment belongs to Band
    Equipment.belongsTo(models.Band, {
      foreignKey: 'bandId'
    });
    
    // Equipment may belong to User (owner)
    Equipment.belongsTo(models.User, {
      as: 'owner',
      foreignKey: 'ownerId'
    });
    
    // Equipment belongs to many Rehearsals through RehearsalEquipment join table
    Equipment.belongsToMany(models.Rehearsal, {
      through: 'RehearsalEquipment',
      as: 'rehearsals',
      foreignKey: 'equipmentId'
    });
  };

  return Equipment;
};