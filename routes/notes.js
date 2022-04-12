const express = require('express')
const router = express.Router()
const fetchUser = require('../middleware/fetchUser')
const Notes = require('../models/Notes')
const { body, validationResult } = require('express-validator');

//Route 4 : Fetch notes of a logged in user using GET "/api/notes/fetchNotes" Login : Required
router.get('/fetchNotes', fetchUser, async (req, res)=>{
    try{
        const notes = await Notes.find({user: req.user.id})
        res.status(200).json(notes)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("An internal error occured")
    }
})

//Route 5 : Add notes as per user's request using POST "/api/notes/addNote" Login : Required
router.post('/addNote', fetchUser, [
    body('title', 'Enter a valid title').isLength({min: 1}),
    body('content', 'Content has to be more than 5 characters').isLength({min: 5}),
], async (req, res)=>{
    try{
        const { title, content, tag } = req.body;
        //In case of an error, return bad request and the error
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const note = new Notes({
            title, content, tag, user: req.user.id
        })

        const savedNote = await note.save()
        res.status(200).json(savedNote)
    } catch (error) {
        console.error(error.message)
        res.status(500).send("An internal error occured")
    }
})

//Route 6 : Update an existing note of the logged in user using: PUT "api/notes/updateNote" Login : Required
router.put('/updateNote/:id', fetchUser, async (req, res)=>{
    try{
        const {title, content, tag} = req.body
        //Create the modified note
        const modifiedNote = {}
        if(title){modifiedNote.title = title}
        if(content){modifiedNote.content = content}
        if(tag){modifiedNote.tag = tag}

        //Find the note by id and then update it
        let note = await Notes.findById(req.params.id)

        if(!note){res.status(404).send("Note not found")}

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not allowed")
        }

        note = await Notes.findByIdAndUpdate(req.params.id, {$set: modifiedNote}, {new: true})
        res.status(200).json({note})
    } catch (error) {
        console.error(error.message)
        res.status(500).send("An internal error occured")
    }
})

//Route 7 : Delete an existing note of the logged in user using: DELETE "api/notes/deleteNote" Login : Required
router.delete('/deleteNote/:id', fetchUser, async (req, res)=>{
    try{
        //Find the note by id and then delete it
        let note = await Notes.findById(req.params.id)

        if(!note){res.status(404).send("Note not found")}

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not allowed")
        }

        note = await Notes.findByIdAndDelete(req.params.id)
        res.status(200).json({"Success" : "Note has been deleted", note})
    } catch (error) {
        console.error(error.message)
        res.status(500).send("An internal error occured")
    }
})

module.exports = router