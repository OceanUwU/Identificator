'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AvailableLoginID extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  };
  AvailableLoginID.init({
    availableID: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'AvailableLoginID',
  });
  return AvailableLoginID;
};