'use strict';

module.exports = (sequelize, DataTypes) => {
  const Rehearsal = sequelize.define('Rehearsal', {
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
    title: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'Band Rehearsal'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    startTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true
      }
    },
    endTime: {
      type: DataTypes.DATE,
      allowNull: false,
      validate: {
        isDate: true,
        isAfterStart(value) {
          if (new Date(value) <= new Date(this.startTime)) {
            throw new Error('End time must be after start time');
          }
        }
      }
    },
    location: {
      type: DataTypes.STRING,
      allowNull: true
    },
    locationDetails: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    locationUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      validate: {
        isUrl: true
      }
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    recurringPattern: {
      type: DataTypes.JSON,
      allowNull: true,
      // Can store frequency (daily, weekly, monthly), interval, and days of week
    },
    reminderSent: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    reminderTime: {
      type: DataTypes.DATE,
      allowNull: true
    },
    status: {
      type: DataTypes.ENUM('scheduled', 'in-progress', 'completed', 'cancelled'),
      defaultValue: 'scheduled'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    createdBy: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  });

  Rehearsal.associate = function(models) {
    // Rehearsal belongs to Band
    Rehearsal.belongsTo(models.Band, {
      foreignKey: 'bandId'
    });
    
    // Rehearsal belongs to User (creator)
    Rehearsal.belongsTo(models.User, {
      as: 'creator',
      foreignKey: 'createdBy'
    });
    
    // Rehearsal belongs to many Users through UserRehearsal join table
    Rehearsal.belongsToMany(models.User, {
      through: 'UserRehearsal',
      as: 'attendees',
      foreignKey: 'rehearsalId'
    });
    
    // Rehearsal has many Equipment items through RehearsalEquipment join table
    Rehearsal.belongsToMany(models.Equipment, {
      through: 'RehearsalEquipment',
      as: 'equipment',
      foreignKey: 'rehearsalId'
    });
  };

  return Rehearsal;
};