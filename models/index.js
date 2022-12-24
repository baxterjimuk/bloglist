const Blog = require('./blog')
const User = require('./user')
const ReadingList = require('./reading_list')
const Session = require('./session')

User.hasMany(Blog)
Blog.belongsTo(User)

Blog.belongsToMany(User, { through: ReadingList, as: 'readinglists' })
User.belongsToMany(Blog, { through: ReadingList, as: 'readings' })

module.exports = {
  Blog, User, ReadingList, Session
}