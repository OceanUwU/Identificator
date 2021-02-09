'use strict';
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('Users', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      using: {
        type: Sequelize.STRING
      },
      authString: {
        type: Sequelize.STRING
      },
      username: {
        type: Sequelize.STRING
      },
      dName: {
        type: Sequelize.STRING
      },
      discrim: {
        type: Sequelize.STRING
      },
      name: {
        type: Sequelize.STRING
      },
      bio: {
        type: Sequelize.STRING
      },
      website: {
        type: Sequelize.STRING
      },
      pronouns: {
        type: Sequelize.STRING
      },
      colors: {
        type: Sequelize.STRING
      },
      email: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('Users');
  }
};