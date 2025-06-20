'use strict';

module.exports = (sequelize, DataTypes) => {
  const Availability = sequelize.define('Availability', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    dayOfWeek: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0, // Sunday
        max: 6  // Saturday
      }
    },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      validate: {
        isAfterStart(value) {
          if (value <= this.startTime) {
            throw new Error('End time must be after start time');
          }
        }
      }
    },
    isRecurring: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    effectiveDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    expiryDate: {
      type: DataTypes.DATE,
      allowNull: true,
      validate: {
        isAfterEffective(value) {
          if (value && new Date(value) <= new Date(this.effectiveDate)) {
            throw new Error('Expiry date must be after effective date');
          }
        }
      }
    },
    priority: {
      type: DataTypes.INTEGER,
      defaultValue: 1,
      comment: 'Higher number means higher priority'
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  });

  Availability.associate = function(models) {
    // Availability belongs to User
    Availability.belongsTo(models.User, {
      foreignKey: 'userId'
    });
  };

  return Availability;
};