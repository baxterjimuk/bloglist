const { DataTypes } = require('sequelize')

module.exports = {
  up: async ({ context: queryInterface }) => {
    await queryInterface.addColumn('users', 'disabled', {
      type: DataTypes.BOOLEAN,
      default: false
    })
    await queryInterface.createTable('sessions', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false
      }
    })
  },
  down: async ({ context: queryInterface }) => {
    await queryInterface.removeColumn('users', 'disabled')
    await queryInterface.dropTable('sessions')
  }
}