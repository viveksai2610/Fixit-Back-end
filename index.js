const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const cors = require('cors')

const app = express()
app.use(express.json())
app.use(cors())

const dbPath = path.join(__dirname, 'fixit.db')

let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}
initializeDBAndServer()

app.get('/team', async (request, response) => {
  try {
    const getTeamQuery = `
  SELECT
    *
  FROM
    team;`
    const teamArray = await db.all(getTeamQuery)
    response.send(teamArray)
    response.status(200)
  } catch (error) {
    console.error('Error in Fetching Team:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.post('/team', async (request, response) => {
  const teamMemberDetails = request.body
  const {name, profession, mobileNumber} = teamMemberDetails

  try {
    if (name !== '' && profession !== '' && mobileNumber !== '') {
      const addTeamMemberQuery = `INSERT INTO team (name, profession, mobileNumber)
    VALUES
      (
        '${name}',
        '${profession}',
        '${mobileNumber}'
      );`

      await db.run(addTeamMemberQuery)
      response.status(201)
      response.send('Team Member Added Successfully')
    } else {
      response.status(400)
      response.send('Enter Vaild Details')
    }
  } catch (error) {
    console.error('Error in Adding Team Member:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.put('/team/:teamMemberId', async (request, response) => {
  const {teamMemberId} = request.params

  const teamMemberDetails = request.body
  const {name, profession, mobileNumber} = teamMemberDetails

  try {
    const getTeamMemberQuery = `SELECT
      *
    FROM
      team
    WHERE
      id = ${teamMemberId};`
    const teamMember = await db.get(getTeamMemberQuery)

    if (teamMember !== undefined) {
      const updateTeamMemberQuery = `UPDATE
      team
    SET
      name='${name}',
      profession = '${profession}',
      mobileNumber = '${mobileNumber}' 
    WHERE
      id = ${teamMemberId};`
      await db.run(updateTeamMemberQuery)
      response.status(200)
      response.send('Team Member Details Updated Successfully')
    } else {
      response.status(404)
      response.send({message: 'Given ID Doesnot Exist'})
    }
  } catch (error) {
    console.error('Error in Updating Team Member:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.delete('/team/:teamMemberId', async (request, response) => {
  const {teamMemberId} = request.params
  try {
    const getTeamMemberQuery = `SELECT
      *
    FROM
      team
    WHERE
      id = ${teamMemberId};`
    const teamMember = await db.get(getTeamMemberQuery)

    if (teamMember !== undefined) {
      const deleteTeamMemberQuery = `DELETE
    FROM
      team
    WHERE
      id = ${teamMemberId};`
      db.run(deleteTeamMemberQuery)
      response.status(200)
      response.send('Team Member Deleted Successfully')
    } else {
      response.status(404)
      response.send({message: 'Given ID Doesnot Exist'})
    }
  } catch (error) {
    console.error('Error in Deleting Team Member:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.get('/ratings', async (request, response) => {
  try {
    const getRatingsQuery = `
  SELECT
    *
  FROM
    ratings;`
    const ratingsArray = await db.all(getRatingsQuery)
    response.send(ratingsArray)
    response.status(200)
  } catch (error) {
    console.error('Error in Fetching Ratings:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.post('/ratings', async (request, response) => {
  const ratingDetails = request.body
  const {teamMemberId, rating, review} = ratingDetails

  const today = new Date()

  const day = today.getDate()
  const month = today.getMonth() + 1
  const year = today.getFullYear()

  const ratingDate = `${day}-${month}-${year}`

  try {
    const getTeamMemberQuery = `SELECT
      *
    FROM
      team
    WHERE
      id = ${teamMemberId};`
    const teamMember = await db.get(getTeamMemberQuery)

    if (teamMember !== undefined) {
      if (rating > 0 && rating <= 5 && review !== '') {
        const addRatingQuery = `INSERT INTO ratings (teamMemberId, rating, review, ratingDate)
    VALUES
      (
         ${teamMemberId},
         ${rating},
        '${review}',
        '${ratingDate}'
      );`

        await db.run(addRatingQuery)
        response.status(201)
        response.send('Rating Added Successfully')
      } else {
        response.status(400)
        response.send('Enter Vaild Details')
      }
    } else {
      response.status(404)
      response.send({message: 'Given Team Member ID Doesnot Exist'})
    }
  } catch (error) {
    console.error('Error in Adding Rating:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.put('/ratings/:id', async (request, response) => {
  const {id} = request.params

  const ratingDetails = request.body
  const {teamMemberId, rating, review} = ratingDetails

  const today = new Date()

  const day = today.getDate()
  const month = today.getMonth() + 1
  const year = today.getFullYear()

  const ratingDate = `${day}-${month}-${year}`

  try {
    const getRatingQuery = `SELECT
      *
    FROM
      ratings
    WHERE
      id = ${id};`
    const ratingDetails = await db.get(getRatingQuery)

    const getTeamMemberQuery = `SELECT
      *
    FROM
      team
    WHERE
      id = ${teamMemberId};`
    const teamMember = await db.get(getTeamMemberQuery)

    if (ratingDetails !== undefined && teamMember !== undefined) {
      if (rating > 0 && rating <= 5 && review !== '') {
        const updateTeamMemberQuery = `UPDATE
      ratings
    SET
      teamMemberId = ${teamMemberId},
      rating = ${rating},
      review = '${review}',
      ratingDate = '${ratingDate}' 
    WHERE
      id = ${id};`
        await db.run(updateTeamMemberQuery)
        response.status(200)
        response.send('Rating Details Updated Successfully')
      } else {
        response.status(400)
        response.send('Enter Vaild Details')
      }
    } else {
      response.status(404)
      response.send({message: 'Given ID Doesnot Exist'})
    }
  } catch (error) {
    console.error('Error in Updating Rating:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.delete('/ratings/:id', async (request, response) => {
  const {id} = request.params
  try {
    const getRatingQuery = `SELECT
      *
    FROM
      ratings
    WHERE
      id = ${id};`
    const rating = await db.get(getRatingQuery)

    if (rating !== undefined) {
      const deleteRatingQuery = `DELETE
    FROM
      ratings
    WHERE
      id = ${id};`
      db.run(deleteRatingQuery)
      response.status(200)
      response.send('Rating Deleted Successfully')
    } else {
      response.status(404)
      response.send({message: 'Given ID Doesnot Exist'})
    }
  } catch (error) {
    console.error('Error in Deleting Rating:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.get('/ratings/team/:teamMemberId', async (request, response) => {
  const {teamMemberId} = request.params
  try {
    const getTeamMemberRatingsQuery = `
  SELECT
    *
  FROM
     ratings
    WHERE teamMemberId = ${teamMemberId};`
    const teamMemberRatingsArray = await db.all(getTeamMemberRatingsQuery)
    response.status(200)
    response.send(teamMemberRatingsArray)
  } catch (error) {
    console.error('Error in fetching Team Member ratings:', error)
    response.status(500)
    response.send({error: 'Internal Server Error'})
  }
})

app.get('/averageRating/:teamMemberId', async (request, response) => {
  const {teamMemberId} = request.params
  const getAverageRatingQuery = `
  SELECT
    AVG(rating) AS averageRating
  FROM
    ratings 
  WHERE 
    teamMemberId = ${teamMemberId}
  GROUP BY teamMemberId;`
  const averageRating = await db.all(getAverageRatingQuery)
  response.send(averageRating)
})
