const getUserByEmail = (email, database) => { // this function was created to ckeck if the user is in the data
  for (let userId in database){
    if (database[userId].email === email){
      return database[userId].id
    }
  }
}


module.exports = { getUserByEmail }