'use strict';

module.exports = (sequelize, DataTypes) => {
  const Band = sequelize.define('Band', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
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
    genre: {
      type: DataTypes.STRING,
      allowNull: true
    },
    logoUrl: {
      type: DataTypes.STRING,
      allowNull: true
    },
    website: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    contactEmail: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    contactPhone: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    ownerId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    defaultReminderHours: {
      type: DataTypes.INTEGER,
      defaultValue: 24,
      validate: {
        min: 1,
        max: 168 // 1 week
      }
    },
    defaultLocation: {
      type: DataTypes.STRING,
      allowNull: true
    }
  });

  Band.associate = function(models) {
    // Band belongs to many Users through UserBand join table
    Band.belongsToMany(models.User, {
      through: 'UserBand',
      as: 'members',
      foreignKey: 'bandId'
    });
    
    // Band belongs to User (owner)
    Band.belongsTo(models.User, {
      as: 'owner',
      foreignKey: 'ownerId'
    });
    
    // Band has many Rehearsals
    Band.hasMany(models.Rehearsal, {
      foreignKey: 'bandId'
    });
    
    // Band has many Equipment items
    Band.hasMany(models.Equipment, {
      foreignKey: 'bandId'
    });
  };

  return Band;
};