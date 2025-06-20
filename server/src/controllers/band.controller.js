const { Band, User, Rehearsal, Availability } = require('../models');
const logger = require('../utils/logger');
const { Op } = require('sequelize');

/**
 * Get all bands
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAllBands = async (req, res) => {
  try {
    // If user is admin, return all bands, otherwise just the ones they belong to
    const bands = req.user.role === 'admin' 
      ? await Band.findAll()
      : await req.user.getBands();
    
    res.json(bands);
  } catch (error) {
    logger.error(`Error getting all bands: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving bands', error: error.message });
  }
};

/**
 * Get band by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBandById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const band = await Band.findByPk(id, {
      include: [{
        model: User,
        as: 'members',
        attributes: ['id', 'firstName', 'lastName', 'email', 'profileImage'],
        through: { attributes: ['role'] }
      }]
    });
    
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    // Check if user has access to this band
    if (req.user.role !== 'admin') {
      const isMember = await band.hasMember(req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: 'You do not have access to this band' });
      }
    }
    
    res.json(band);
  } catch (error) {
    logger.error(`Error getting band by ID: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving band', error: error.message });
  }
};

/**
 * Create a new band
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createBand = async (req, res) => {
  try {
    const { name, description, genre, location, contactEmail, contactPhone, logoUrl } = req.body;
    
    const band = await Band.create({
      name,
      description,
      genre,
      location,
      contactEmail,
      contactPhone,
      logoUrl,
      createdBy: req.user.id
    });
    
    // Add creator as band admin
    await band.addMember(req.user, { through: { role: 'admin' } });
    
    logger.info(`Band created: ${band.name} by user ${req.user.id}`);
    
    res.status(201).json({
      message: 'Band created successfully',
      band
    });
  } catch (error) {
    logger.error(`Error creating band: ${error.message}`);
    res.status(500).json({ message: 'Error creating band', error: error.message });
  }
};

/**
 * Update band
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateBand = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, genre, location, contactEmail, contactPhone, logoUrl } = req.body;
    
    const band = await Band.findByPk(id);
    
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    // Check if user is band admin or app admin
    if (req.user.role !== 'admin') {
      const membership = await band.getMember(req.user.id);
      if (!membership || membership[0]?.BandMember?.role !== 'admin') {
        return res.status(403).json({ message: 'Only band admins can update band details' });
      }
    }
    
    await band.update({
      name: name || band.name,
      description: description !== undefined ? description : band.description,
      genre: genre || band.genre,
      location: location || band.location,
      contactEmail: contactEmail || band.contactEmail,
      contactPhone: contactPhone || band.contactPhone,
      logoUrl: logoUrl !== undefined ? logoUrl : band.logoUrl
    });
    
    logger.info(`Band updated: ${band.name}`);
    
    res.json({
      message: 'Band updated successfully',
      band
    });
  } catch (error) {
    logger.error(`Error updating band: ${error.message}`);
    res.status(500).json({ message: 'Error updating band', error: error.message });
  }
};

/**
 * Delete band
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.deleteBand = async (req, res) => {
  try {
    const { id } = req.params;
    
    const band = await Band.findByPk(id);
    
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    // Check if user is band admin or app admin
    if (req.user.role !== 'admin') {
      const membership = await band.getMember(req.user.id);
      if (!membership || membership[0]?.BandMember?.role !== 'admin') {
        return res.status(403).json({ message: 'Only band admins can delete the band' });
      }
    }
    
    // Instead of hard delete, set isActive to false
    await band.update({ isActive: false });
    
    logger.info(`Band deactivated: ${band.name}`);
    
    res.json({ message: 'Band deactivated successfully' });
  } catch (error) {
    logger.error(`Error deactivating band: ${error.message}`);
    res.status(500).json({ message: 'Error deactivating band', error: error.message });
  }
};

/**
 * Add member to band
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addMember = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, role } = req.body;
    
    const band = await Band.findByPk(id);
    
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    // Check if user is band admin or app admin
    if (req.user.role !== 'admin') {
      const membership = await band.getMember(req.user.id);
      if (!membership || membership[0]?.BandMember?.role !== 'admin') {
        return res.status(403).json({ message: 'Only band admins can add members' });
      }
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is already a member
    const isMember = await band.hasMember(user);
    
    if (isMember) {
      return res.status(400).json({ message: 'User is already a member of this band' });
    }
    
    await band.addMember(user, { through: { role: role || 'member' } });
    
    logger.info(`User ${userId} added to band ${band.name} with role ${role || 'member'}`);
    
    res.status(201).json({ message: 'Member added to band successfully' });
  } catch (error) {
    logger.error(`Error adding member to band: ${error.message}`);
    res.status(500).json({ message: 'Error adding member to band', error: error.message });
  }
};

/**
 * Remove member from band
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.removeMember = async (req, res) => {
  try {
    const { id, userId } = req.params;
    
    const band = await Band.findByPk(id);
    
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    // Check if user is band admin or app admin or removing themselves
    if (req.user.role !== 'admin' && req.user.id !== userId) {
      const membership = await band.getMember(req.user.id);
      if (!membership || membership[0]?.BandMember?.role !== 'admin') {
        return res.status(403).json({ message: 'Only band admins can remove members' });
      }
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is a member
    const isMember = await band.hasMember(user);
    
    if (!isMember) {
      return res.status(400).json({ message: 'User is not a member of this band' });
    }
    
    // Don't allow removing the last admin
    if (userId !== req.user.id) {
      const memberRole = await band.getMember(userId);
      if (memberRole[0]?.BandMember?.role === 'admin') {
        const admins = await band.getMembers({
          through: {
            where: { role: 'admin' }
          }
        });
        
        if (admins.length <= 1) {
          return res.status(400).json({ message: 'Cannot remove the last admin of the band' });
        }
      }
    }
    
    await band.removeMember(user);
    
    logger.info(`User ${userId} removed from band ${band.name}`);
    
    res.json({ message: 'Member removed from band successfully' });
  } catch (error) {
    logger.error(`Error removing member from band: ${error.message}`);
    res.status(500).json({ message: 'Error removing member from band', error: error.message });
  }
};

/**
 * Update member role in band
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.updateMemberRole = async (req, res) => {
  try {
    const { id, userId } = req.params;
    const { role } = req.body;
    
    if (!role || !['admin', 'member'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Role must be either "admin" or "member"' });
    }
    
    const band = await Band.findByPk(id);
    
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    // Check if user is band admin or app admin
    if (req.user.role !== 'admin') {
      const membership = await band.getMember(req.user.id);
      if (!membership || membership[0]?.BandMember?.role !== 'admin') {
        return res.status(403).json({ message: 'Only band admins can update member roles' });
      }
    }
    
    const user = await User.findByPk(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if user is a member
    const membershipInfo = await band.getMember(userId);
    
    if (!membershipInfo || membershipInfo.length === 0) {
      return res.status(400).json({ message: 'User is not a member of this band' });
    }
    
    // Don't allow removing the last admin
    if (membershipInfo[0]?.BandMember?.role === 'admin' && role === 'member') {
      const admins = await band.getMembers({
        through: {
          where: { role: 'admin' }
        }
      });
      
      if (admins.length <= 1) {
        return res.status(400).json({ message: 'Cannot demote the last admin of the band' });
      }
    }
    
    // Update the role
    await membershipInfo[0].BandMember.update({ role });
    
    logger.info(`User ${userId} role updated to ${role} in band ${band.name}`);
    
    res.json({ message: 'Member role updated successfully' });
  } catch (error) {
    logger.error(`Error updating member role: ${error.message}`);
    res.status(500).json({ message: 'Error updating member role', error: error.message });
  }
};

/**
 * Get band rehearsals
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBandRehearsals = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, status } = req.query;
    
    const band = await Band.findByPk(id);
    
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    // Check if user has access to this band
    if (req.user.role !== 'admin') {
      const isMember = await band.hasMember(req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: 'You do not have access to this band' });
      }
    }
    
    const whereClause = { bandId: id };
    
    // Add date filters if provided
    if (startDate && endDate) {
      whereClause.startTime = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    } else if (startDate) {
      whereClause.startTime = {
        [Op.gte]: new Date(startDate)
      };
    } else if (endDate) {
      whereClause.startTime = {
        [Op.lte]: new Date(endDate)
      };
    }
    
    // Add status filter if provided
    if (status) {
      whereClause.status = status;
    }
    
    const rehearsals = await Rehearsal.findAll({
      where: whereClause,
      include: [{
        model: User,
        as: 'attendees',
        attributes: ['id', 'firstName', 'lastName', 'email'],
        through: { attributes: ['status'] }
      }],
      order: [['startTime', 'ASC']]
    });
    
    res.json(rehearsals);
  } catch (error) {
    logger.error(`Error getting band rehearsals: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving band rehearsals', error: error.message });
  }
};

/**
 * Get band members with availability
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getBandMembersAvailability = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'Start date and end date are required' });
    }
    
    const band = await Band.findByPk(id);
    
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    // Check if user has access to this band
    if (req.user.role !== 'admin') {
      const isMember = await band.hasMember(req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: 'You do not have access to this band' });
      }
    }
    
    // Get all members of the band
    const members = await band.getMembers({
      attributes: ['id', 'firstName', 'lastName', 'email']
    });
    
    // Get availability for each member within the date range
    const result = await Promise.all(members.map(async (member) => {
      const availability = await Availability.findAll({
        where: {
          userId: member.id,
          [Op.or]: [
            {
              // One-time availability within date range
              type: 'one-time',
              startTime: {
                [Op.between]: [new Date(startDate), new Date(endDate)]
              }
            },
            {
              // Recurring availability with effectiveDate before endDate and (expiryDate null or after startDate)
              type: 'recurring',
              effectiveDate: {
                [Op.lte]: new Date(endDate)
              },
              [Op.or]: [
                { expiryDate: null },
                { 
                  expiryDate: {
                    [Op.gte]: new Date(startDate)
                  } 
                }
              ]
            }
          ]
        }
      });
      
      return {
        user: member,
        availability
      };
    }));
    
    res.json(result);
  } catch (error) {
    logger.error(`Error getting band members availability: ${error.message}`);
    res.status(500).json({ message: 'Error retrieving band members availability', error: error.message });
  }
};

/**
 * Find optimal rehearsal times
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.findOptimalRehearsalTimes = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate, duration, minimumMembers } = req.body;
    
    if (!startDate || !endDate || !duration) {
      return res.status(400).json({ 
        message: 'Start date, end date, and rehearsal duration (in minutes) are required' 
      });
    }
    
    const band = await Band.findByPk(id);
    
    if (!band) {
      return res.status(404).json({ message: 'Band not found' });
    }
    
    // Check if user has access to this band
    if (req.user.role !== 'admin') {
      const isMember = await band.hasMember(req.user.id);
      if (!isMember) {
        return res.status(403).json({ message: 'You do not have access to this band' });
      }
    }
    
    // Get all members of the band
    const members = await band.getMembers({
      attributes: ['id', 'firstName', 'lastName', 'email']
    });
    
    // Implementation of finding optimal times would go here
    // This is a complex algorithm that would need to:
    // 1. Collect all member availabilities
    // 2. Find overlapping time slots that fit the duration
    // 3. Rank them by number of available members
    // 4. Return the top options
    
    // Placeholder response for demonstration
    const suggestedTimes = [
      {
        startTime: new Date(startDate),
        endTime: new Date(new Date(startDate).getTime() + duration * 60000),
        availableMembers: members.slice(0, members.length - 1),
        unavailableMembers: members.slice(-1)
      },
      {
        startTime: new Date(new Date(startDate).getTime() + 24 * 60 * 60000), // Next day
        endTime: new Date(new Date(startDate).getTime() + 24 * 60 * 60000 + duration * 60000),
        availableMembers: members,
        unavailableMembers: []
      }
    ];
    
    res.json({
      message: 'Optimal rehearsal times found',
      suggestedTimes
    });
  } catch (error) {
    logger.error(`Error finding optimal rehearsal times: ${error.message}`);
    res.status(500).json({ message: 'Error finding optimal rehearsal times', error: error.message });
  }
};